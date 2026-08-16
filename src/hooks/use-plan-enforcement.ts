'use client';

import { useEffect, useRef } from 'react';
import {
  collection,
  deleteField,
  doc,
  limit,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { BILLING_DEACTIVATION_REASONS, isPlanExpired } from '@/lib/plan';

/**
 * Keeps the merchant's live access in sync with their subscription window.
 *
 * Mounted once from the dashboard layout, so it runs on whatever page the
 * merchant opens first.
 *
 * When `expiresAt` has passed it flips every brand this user owns to
 * `status: 'inactive'` + `isActive: false`. The `status` field is the one the
 * payment gateway reads (`antipay-verify-main` rejects any API key whose store
 * is not `status === 'active'`), so this is what actually stops verification —
 * not just the dashboard badge.
 *
 * When a plan is valid again (renewal / upgrade) it restores the brands that
 * billing had switched off, leaving brands the merchant disabled by hand alone.
 *
 * Lifetime plans are never touched — `isPlanExpired()` returns false for them.
 */
export function usePlanEnforcement() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const isWriting = useRef(false);

  const planRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'user_plans', user.uid);
  }, [db, user?.uid]);
  const { data: plan } = useDoc(planRef);

  const storesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'stores'), where('userId', '==', user.uid), limit(100));
  }, [db, user?.uid]);
  const { data: stores } = useCollection(storesQuery);

  useEffect(() => {
    // `stores` is `[]` (not null) once the listener has delivered a snapshot.
    if (!db || !user || !plan || !stores || isWriting.current) return;

    const userId = user.uid;
    const commit = async (build: (batch: ReturnType<typeof writeBatch>) => void, onDone?: () => void) => {
      isWriting.current = true;
      try {
        const batch = writeBatch(db);
        build(batch);
        await batch.commit();
        onDone?.();
      } catch (error) {
        console.error('PLAN ENFORCEMENT FAILED:', error);
      } finally {
        isWriting.current = false;
      }
    };

    if (isPlanExpired(plan)) {
      // Anything still serving traffic has to come down.
      const liveStores = stores.filter((s) => s.status === 'active' || s.isActive !== false);
      const alreadyMarked = plan.status === 'expired';
      if (alreadyMarked && liveStores.length === 0) return;

      commit(
        (batch) => {
          batch.set(
            doc(db, 'user_plans', userId),
            {
              status: 'expired',
              isExpired: true,
              expiredAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );

          batch.set(
            doc(db, 'users', userId),
            { subscriptionStatus: 'expired', updatedAt: serverTimestamp() },
            { merge: true }
          );

          liveStores.forEach((store) => {
            batch.update(doc(db, 'stores', store.id), {
              status: 'inactive',
              isActive: false,
              deactivatedReason: 'plan_expired',
              updatedAt: serverTimestamp(),
            });
          });
        },
        () => {
          if (!alreadyMarked) {
            toast({
              variant: 'destructive',
              title: 'Subscription Expired',
              description: `Your plan validity has ended.${
                liveStores.length ? ` ${liveStores.length} brand(s) deactivated.` : ''
              } Renew to resume payment verification.`,
            });
          }
        }
      );
      return;
    }

    // Plan is valid: undo a previous expiry/cancellation lockout.
    const revokedStores = stores.filter((s) =>
      BILLING_DEACTIVATION_REASONS.includes(s.deactivatedReason)
    );
    const hasStaleExpiryFlag = plan.status === 'expired' || plan.isExpired === true;
    if (!revokedStores.length && !hasStaleExpiryFlag) return;

    commit((batch) => {
      if (hasStaleExpiryFlag) {
        batch.set(
          doc(db, 'user_plans', userId),
          {
            status: 'active',
            isExpired: false,
            expiredAt: deleteField(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        batch.set(
          doc(db, 'users', userId),
          { subscriptionStatus: 'active', updatedAt: serverTimestamp() },
          { merge: true }
        );
      }

      revokedStores.forEach((store) => {
        batch.update(doc(db, 'stores', store.id), {
          status: 'active',
          isActive: true,
          deactivatedReason: deleteField(),
          updatedAt: serverTimestamp(),
        });
      });
    });
  }, [db, user?.uid, plan, stores, toast]);
}
