'use client';

import {
  collection,
  deleteField,
  getDocs,
  limit,
  query,
  serverTimestamp,
  where,
  writeBatch,
  type Firestore,
} from 'firebase/firestore';
import { BILLING_DEACTIVATION_REASONS } from '@/lib/plan';

/**
 * Fields every plan-granting flow must merge into `user_plans/{userId}` so a
 * renewal clears the markers left behind by a previous expiry.
 */
export function planActivationFlags() {
  return {
    status: 'active',
    isExpired: false,
    expiredAt: deleteField(),
  };
}

/**
 * Re-arms the brands that billing switched off (expiry or cancellation), so a
 * merchant who pays again can accept payments immediately. Brands the merchant
 * disabled by hand carry no `deactivatedReason` and are deliberately left alone.
 *
 * Idempotent — returns how many brands were restored.
 */
export async function restoreBillingSuspendedBrands(db: Firestore, userId: string): Promise<number> {
  const snapshot = await getDocs(
    query(collection(db, 'stores'), where('userId', '==', userId), limit(100))
  );

  const suspended = snapshot.docs.filter((d) =>
    BILLING_DEACTIVATION_REASONS.includes(d.data().deactivatedReason)
  );
  if (!suspended.length) return 0;

  const batch = writeBatch(db);
  suspended.forEach((d) => {
    batch.update(d.ref, {
      status: 'active',
      isActive: true,
      deactivatedReason: deleteField(),
      updatedAt: serverTimestamp(),
    });
  });
  await batch.commit();

  return suspended.length;
}
