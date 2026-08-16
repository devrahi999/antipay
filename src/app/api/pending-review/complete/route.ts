import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, updateDoc, runTransaction } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

/**
 * Settles a manual review request approved by the merchant.
 *
 * This has to run on the server: the merchant's webhook lives on another origin,
 * so a browser fetch would be blocked by CORS. The webhook URL is never taken
 * from the request body — it is read back from the stored review document, so a
 * caller cannot point our server at an arbitrary host.
 */
function getDb() {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return getFirestore(app);
}

/** Same delivery semantics as the gateway's verify route: 3 attempts, awaited. */
async function callWebhook(url: string, payload: any): Promise<boolean> {
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const text = await res.text();
      console.log('🚀 Manual settle webhook attempt:', i + 1, res.status, text);
      if (res.ok) return true;
    } catch (e) {
      console.error('❌ Manual settle webhook error attempt:', i + 1, e);
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  return false;
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
      // A completed request may only be re-run when the webhook failed last time.
      if (data.status === 'completed' && data.webhookDelivered !== false) {
        throw new Error('This payment is already completed');
      }

      tx.update(pendingRef, { status: 'processing', updatedAt: new Date().toISOString() });
      return data;
    });

    claimedRef = pendingRef;

    const trxId = String(review.trxId || '').trim().toUpperCase();
    const amount = Number(review.amount);

    const payload = {
      status: 'verified',
      trxId,
      amount,
      sessionId: review.sessionId,
      val_id: review.val_id ?? null
    };

    let webhookDelivered: boolean | null = null;
    if (review.webhook_url) {
      webhookDelivered = await callWebhook(review.webhook_url, payload);
    }

    const now = new Date().toISOString();
    const warnings: string[] = [];

    // Close the checkout session so the payment link cannot be reused.
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

    await updateDoc(pendingRef, {
      status: 'completed',
      reviewedAt: now,
      updatedAt: now,
      webhookDelivered,
      webhookPayload: payload,
      warnings: warnings.length ? warnings : null
    });

    return NextResponse.json({
      status: 'completed',
      webhookDelivered,
      webhookSkipped: !review.webhook_url,
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
