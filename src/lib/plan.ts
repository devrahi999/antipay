/**
 * Single source of truth for subscription validity.
 *
 * A plan lives at `user_plans/{userId}` and is written by the checkout flow
 * (`/payment/success`), the free-trial flow (`/dashboard/plans`) and the admin
 * panel. All of those writers store `billingCycle` + `expiresAt`, but nothing
 * used to *enforce* `expiresAt` — so an expired plan kept unlocking the
 * dashboard forever and just showed "0 Days Remaining". Every access check now
 * goes through these helpers instead of `!!plan`.
 */

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** A brand switched off by billing — safe to switch back on once paid again. */
export const BILLING_DEACTIVATION_REASONS = ['plan_expired', 'subscription_canceled'];

export type PlanState = 'none' | 'active' | 'expired';

/** Firestore Timestamp | Date | ISO string | millis -> Date | null */
export function toDate(value: any): Date | null {
  if (!value) return null;
  try {
    const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value);
    return isNaN(date.getTime()) ? null : date;
  } catch (e) {
    return null;
  }
}

/**
 * Lifetime plans never run out, whatever `expiresAt` happens to say.
 *
 * A free trial is always time-boxed, even when it is a trial *of* a lifetime
 * plan — otherwise the trial would hand out permanent free access.
 */
export function isLifetimePlan(plan: any): boolean {
  return plan?.billingCycle === 'lifetime' && plan?.isTrial !== true;
}

/** Expiry date, or `null` for lifetime plans (they have no renew date). */
export function getPlanExpiry(plan: any): Date | null {
  if (!plan || isLifetimePlan(plan)) return null;
  return toDate(plan.expiresAt);
}

export function isPlanExpired(plan: any, now: Date = new Date()): boolean {
  if (!plan) return false; // no plan at all is "none", not "expired"
  if (isLifetimePlan(plan)) return false; // lifetime access
  const expiry = toDate(plan.expiresAt);
  if (!expiry) return false; // malformed doc: never revoke access on a guess
  return expiry.getTime() <= now.getTime();
}

/** The gate for every paid feature: true only while the plan still grants access. */
export function isPlanActive(plan: any): boolean {
  return !!plan && !isPlanExpired(plan);
}

export function getPlanState(plan: any): PlanState {
  if (!plan) return 'none';
  return isPlanExpired(plan) ? 'expired' : 'active';
}

/** Whole days of access left. `null` for lifetime / missing expiry, 0 once expired. */
export function getDaysRemaining(plan: any, now: Date = new Date()): number | null {
  const expiry = getPlanExpiry(plan);
  if (!expiry) return null;
  return Math.max(0, Math.ceil((expiry.getTime() - now.getTime()) / MS_PER_DAY));
}

/** True in the final stretch of a paid plan, so the UI can nudge for a renewal. */
export function isExpiringSoon(plan: any, withinDays: number = 7): boolean {
  const daysLeft = getDaysRemaining(plan);
  if (daysLeft === null || !isPlanActive(plan)) return false;
  return daysLeft <= withinDays;
}
