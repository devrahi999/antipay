import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  serverTimestamp, 
  Timestamp, 
  writeBatch, 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// Initialize Firebase for the server environment (Webhook)
if (!getApps().length) {
  initializeApp(firebaseConfig);
}
const db = getFirestore();

/**
 * Webhook handler for the AntiPay Gateway.
 * Strictly handles verification and account provisioning.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { status, val_id, amount, trxId, sessionId } = body;

    console.log('--- INBOUND WEBHOOK RECEIVED ---');
    console.log('Payload:', JSON.stringify(body, null, 2));

    // Process only 'verified' status as per gateway docs
    if (status !== 'verified') {
      console.log('Webhook Status not "verified". Skipping processing.');
      return NextResponse.json({ message: "Not a verification signal." }, { status: 200 });
    }

    // val_id format expected: "userId|planId" (e.g. "mEr7Toz...|pro")
    if (!val_id || !val_id.includes('|')) {
      console.error('WEBHOOK ERROR: Invalid val_id format:', val_id);
      return NextResponse.json({ error: 'Malformed val_id' }, { status: 400 });
    }

    const [userId, planId] = val_id.split('|');

    if (!userId || !planId) {
      console.error('WEBHOOK ERROR: Missing userId or planId in val_id');
      return NextResponse.json({ error: 'Incomplete val_id parts' }, { status: 400 });
    }

    // 1. Fetch Plan Definition from subscriptionPlans collection
    const planRef = doc(db, 'subscriptionPlans', planId);
    const planSnap = await getDoc(planRef);

    if (!planSnap.exists()) {
      console.error('WEBHOOK ERROR: Plan definition missing in Firestore:', planId);
      return NextResponse.json({ error: 'Plan definition missing in database' }, { status: 404 });
    }

    const plan = planSnap.data();

    // 2. Calculate Expiry based on billing cycle
    const now = new Date();
    let expiry = new Date();
    if (plan.billingCycle === 'lifetime') {
      expiry = new Date(2099, 11, 31);
    } else if (plan.billingCycle === 'yearly') {
      expiry.setDate(now.getDate() + 365);
    } else {
      expiry.setDate(now.getDate() + 30);
    }

    // 3. Batch Update Firestore to ensure atomic changes
    const batch = writeBatch(db);

    // A. Update user_plans (The source of truth for quotas)
    const userPlanRef = doc(db, 'user_plans', userId);
    batch.set(userPlanRef, {
      userId,
      planId,
      planName: plan.name,
      price: plan.price,
      billingCycle: plan.billingCycle,
      maxApiKeys: plan.maxApiKeys,
      maxDevices: plan.maxDevices,
      benefits: plan.benefits || [],
      activatedAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(expiry),
      updatedAt: serverTimestamp()
    }, { merge: true });

    // B. Sync user profile for quick dashboard checks
    const userRef = doc(db, 'users', userId);
    batch.set(userRef, {
      subscriptionPlanId: planId,
      subscriptionStartedAt: serverTimestamp(),
      subscriptionExpiresAt: Timestamp.fromDate(expiry),
      updatedAt: serverTimestamp()
    }, { merge: true });

    // C. Record the revenue transaction for admin audit
    const txRef = doc(collection(db, 'plan_transactions'));
    batch.set(txRef, {
      id: txRef.id,
      userId,
      gatewaySessionId: sessionId || 'unknown',
      gatewayTrxId: trxId || 'unknown',
      planId,
      planName: plan.name,
      amount: Number(amount || plan.price),
      status: 'verified',
      createdAt: serverTimestamp()
    });

    // D. Reactivate all existing merchant brands for this user
    const storesQuery = query(collection(db, 'stores'), where('userId', '==', userId));
    const storesSnap = await getDocs(storesQuery);
    storesSnap.forEach((storeDoc) => {
      batch.update(storeDoc.ref, { 
        isActive: true, 
        updatedAt: serverTimestamp() 
      });
    });

    // Commit all updates
    await batch.commit();
    
    console.log(`WEBHOOK SUCCESS: User ${userId} upgraded to ${plan.name} (${planId}).`);
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('WEBHOOK CRITICAL ERROR:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
