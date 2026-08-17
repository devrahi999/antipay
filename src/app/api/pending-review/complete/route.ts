import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, updateDoc, runTransaction } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// Three webhook attempts with back-off can take a while; make sure the platform
// does not kill the function halfway through and leave the review on `processing`.
export const maxDuration = 60;

/**
 * Settles a manual review request approved by the merchant.
 *
 * This has to run on the server: the merchant's webhook lives on another origin,
 * so a browser fetch would be blocked by CORS. The webhook URL is never taken
 * from the request body — it is read back from the stored review document, so a
 * caller cannot point our server at an arbitrary host.
 *
 * ORDER MATTERS. The automatic gateway (antipay-verify `/api/v1/verify`) commits
 * the session as `verified` + `isUsed` and burns the TrxID *inside* its
 * transaction, and only calls the webhook after that commit. This route used to
 * do it backwards — webhook first, settle after — which meant that for the whole
 * duration of the webhook call the session was still unsettled. Any merchant
 * that re-reads the session (or its own order) when the webhook lands saw a
 * payment that was not verified yet and rejected the notification, so delivery
 * "failed" even though nothing was wrong with the URL. We now mirror the
 * gateway exactly: settle first, notify second.
 */
function getDb() {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return getFirestore(app);
}

interface WebhookAttempt {
  attempt: number;
  status: number | null;
  ok: boolean;
  body: string | null;
  error: string | null;
}

interface WebhookResult {
  delivered: boolean;
  attempts: WebhookAttempt[];
  /** Short human-readable reason for the last failure, or null on success. */
  error: string | null;
}

/**
 * Same delivery semantics as the gateway's verify route (3 attempts, awaited),
 * but every attempt is recorded so the merchant can actually see *why* their
 * endpoint refused us instead of a bare "failed after 3 attempts".
 */
async function callWebhook(url: string, payload: any): Promise<WebhookResult> {
  const attempts: WebhookAttempt[] = [];

  for (let i = 0; i < 3; i++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      const text = await res.text();
      const body = text ? text.slice(0, 500) : null;

      console.log('🚀 Manual settle webhook attempt:', i + 1, res.status, text);
      attempts.push({ attempt: i + 1, status: res.status, ok: res.ok, body, error: null });

      if (res.ok) return { delivered: true, attempts, error: null };
    } catch (e: any) {
      const reason = e?.name === 'AbortError'
        ? 'No response within 12 seconds (timed out)'
        : e?.message || 'Network request failed';
      console.error('❌ Manual settle webhook error attempt:', i + 1, reason);
      attempts.push({ attempt: i + 1, status: null, ok: false, body: null, error: reason });
    } finally {
      clearTimeout(timer);
    }

    // No point sleeping after the final attempt.
    if (i < 2) await new Promise((r) => setTimeout(r, 2000));
  }

  return { delivered: false, attempts, error: describeFailure(attempts) };
}

/** Turns the attempt log into one line a human can act on. */
function describeFailure(attempts: WebhookAttempt[]): string {
  const last = attempts[attempts.length - 1];
  if (!last) return 'The webhook was never attempted.';
  if (last.error) return last.error;
  const body = last.body ? ` — ${last.body.slice(0, 200)}` : '';
  return `Your server answered HTTP ${last.status}${body}`;
}

export async function POST(req: NextRequest) {
  let claimedRef: any = null;
  try {
    const { pendingId } = await req.json();

    if (!pendingId) {
      return NextResponse.json({ status: false, message: 'pendingId is required' }, { status: 400 });
    }

    const db = getDb();
    const pendingRef = doc(db, 'pending_transactions', pendingId);

    // Claim the request atomically so a double-click cannot fire the webhook twice.
    const review = await runTransaction(db, async (tx) => {
      const snap = await tx.get(pendingRef);
      if (!snap.exists()) throw new Error('Review request not found');

      const data = snap.data();

      if (data.status === 'processing') throw new Error('This request is already being processed');
      if (data.status === 'rejected') throw new Error('This request was rejected');
      // `webhook_failed` means the money side is settled but the merchant was
      // never notified — that is always re-runnable. `completed` is only
      // re-runnable for legacy documents written before that status existed.
      if (data.status === 'completed' && data.webhookDelivered !== false) {
        throw new Error('This payment is already completed');
      }

      tx.update(pendingRef, { status: 'processing', updatedAt: new Date().toISOString() });
      return data;
    });

    claimedRef = pendingRef;

    const trxId = String(review.trxId || '').trim().toUpperCase();
    const amount = Number(review.amount);
    const now = new Date().toISOString();
    const warnings: string[] = [];

    // ------------------------------------------------------------------
    // 1. SETTLE FIRST (exactly what the automatic gateway does)
    // ------------------------------------------------------------------

    // Close the checkout session so the payment link cannot be reused, and so
    // the merchant sees a verified payment the moment our webhook reaches them.
    try {
      await updateDoc(doc(db, 'payment_sessions', review.userId, 'sessions', review.sessionId), {
        status: 'verified',
        isUsed: true,
        method: review.method ?? null,
        trxId,
        sender: review.sender ?? 'N/A',
        verifiedAt: now,
        verifiedVia: 'manual_review',
        reviewStatus: 'completed'
      });
    } catch (e: any) {
      warnings.push('Session could not be updated: ' + e.message);
    }

    // Burn the claimed TrxID so the same ID cannot be reused on another session.
    try {
      const trxRef = doc(db, 'transactions', trxId);
      const trxSnap = await getDoc(trxRef);
      if (!trxSnap.exists()) {
        await setDoc(trxRef, {
          trxId,
          userId: review.userId,
          sender: review.sender ?? null,
          amount,
          source: review.method ?? null,
          status: 'used',
          createdAt: now,
          createdVia: 'manual_review',
          sessionId: review.sessionId
        });
      } else if (trxSnap.data().status !== 'used') {
        await updateDoc(trxRef, { status: 'used', updatedAt: now });
      }
    } catch (e: any) {
      warnings.push('Transaction record could not be written: ' + e.message);
    }

    // ------------------------------------------------------------------
    // 2. NOTIFY SECOND
    // ------------------------------------------------------------------

    const payload = {
      status: 'verified',
      trxId,
      amount,
      sessionId: review.sessionId,
      val_id: review.val_id ?? null
    };

    const skipped = !review.webhook_url;
    const webhook: WebhookResult = skipped
      ? { delivered: false, attempts: [], error: null }
      : await callWebhook(review.webhook_url, payload);

    // A payment nobody told the merchant about is not "completed". Give it its
    // own status so the badge never claims success the merchant never received.
    const finalStatus = skipped || webhook.delivered ? 'completed' : 'webhook_failed';

    await updateDoc(pendingRef, {
      status: finalStatus,
      settledAt: now,
      reviewedAt: now,
      updatedAt: now,
      webhookDelivered: skipped ? null : webhook.delivered,
      webhookPayload: payload,
      webhookAttempts: webhook.attempts.length ? webhook.attempts : null,
      webhookError: webhook.error,
      webhookLastTriedAt: skipped ? null : now,
      warnings: warnings.length ? warnings : null
    });

    return NextResponse.json({
      status: finalStatus,
      settled: true,
      webhookDelivered: skipped ? null : webhook.delivered,
      webhookSkipped: skipped,
      webhookError: webhook.error,
      webhookAttempts: webhook.attempts,
      warnings
    });

  } catch (error: any) {
    console.error('❌ MANUAL SETTLE ERROR:', error);

    // Never leave a claimed request stuck on `processing` — release it so the
    // merchant can try again.
    if (claimedRef) {
      await updateDoc(claimedRef, {
        status: 'pending',
        updatedAt: new Date().toISOString(),
        lastError: error.message || 'Settlement failed'
      }).catch((e) => console.error('Rollback failed:', e));
    }

    return NextResponse.json(
      { status: false, message: error.message || 'Could not complete this payment' },
      { status: 400 }
    );
  }
}
