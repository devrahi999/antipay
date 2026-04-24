import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp, 
  Timestamp, 
  writeBatch, 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// Initialize Firebase for the server environment
if (!getApps().length) {
  initializeApp(firebaseConfig);
}
const db = getFirestore();

/**
 * Webhook handler for the AntiPay Gateway.
 * This route is called by the gateway when a plan payment is verified.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { status, val_id, amount, method, trxId, sessionId } = body;

    console.log('WEBHOOK RECEIVED:', { status, val_id, trxId });

    if (status !== 'verified') {
      return NextResponse.json({ message: 'Status not verified, ignoring.' }, { status: 200 });
    }

    // Parse the userId and planId from the val_id we created in the action
    const [userId, planId] = (val_id || '').split('|');

    if (!userId || !planId) {
      return NextResponse.json({ error: 'Invalid val_id mapping' }, { status: 400 });
    }

    // 1. Fetch Plan Details from Firestore
    const planRef = doc(db, 'subscriptionPlans', planId);
    const planSnap = await getDoc(planRef);

    if (!planSnap.exists()) {
      return NextResponse.json({ error: 'Subscription plan not found' }, { status: 404 });
    }

    const plan = planSnap.data();

    // 2. Calculate Expiry
    const now = new Date();
    let expiry = new Date();
    if (plan.billingCycle === 'lifetime') {
      expiry = new Date(2099, 11, 31);
    } else if (plan.billingCycle === 'yearly') {
      expiry.setDate(now.getDate() + 365);
    } else {
      expiry.setDate(now.getDate() + 30);
    }

    // 3. Perform Atomic Batch Update
    const batch = writeBatch(db);

    // Update user_plans
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
    });

    // Sync User Profile
    const userRef = doc(db, 'users', userId);
    batch.set(userRef, {
      subscriptionPlanId: planId,
      subscriptionStartedAt: serverTimestamp(),
      subscriptionExpiresAt: Timestamp.fromDate(expiry),
      updatedAt: serverTimestamp()
    }, { merge: true });

    // Log the transaction
    const txRef = doc(collection(db, 'plan_transactions'));
    batch.set(txRef, {
      id: txRef.id,
      userId,
      gatewaySessionId: sessionId,
      gatewayTrxId: trxId,
      planId,
      planName: plan.name,
      amount: Number(amount),
      paymentMethod: method,
      status: 'verified',
      createdAt: serverTimestamp()
    });

    // Reactivate all user brands
    const storesQuery = query(collection(db, 'stores'), where('userId', '==', userId));
    const storesSnap = await getDocs(storesQuery);
    storesSnap.forEach((storeDoc) => {
      batch.update(storeDoc.ref, { isActive: true, updatedAt: serverTimestamp() });
    });

    await batch.commit();
    console.log('WEBHOOK SUCCESS: Account upgraded for user', userId);

    return NextResponse.json({ success: true, message: 'Plan activated successfully' });
  } catch (error: any) {
    console.error('WEBHOOK ERROR:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
