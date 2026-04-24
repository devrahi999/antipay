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

// Initialize Firebase for the server environment if not already active
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

    // Log the inbound request for monitoring
    console.log('--- WEBHOOK INBOUND ---');
    console.log('Payload:', JSON.stringify(body, null, 2));

    // Only process if status is 'verified' as confirmed by the gateway
    if (status !== 'verified') {
      console.log(`WEBHOOK IGNORED: Status is '${status}', not 'verified'.`);
      return NextResponse.json({ message: `Status '${status}' not processed.` }, { status: 200 });
    }

    // Parse the userId and planId from the val_id sent during initiation
    const [userId, planId] = (val_id || '').split('|');

    if (!userId || !planId) {
      console.error('WEBHOOK ERROR: Malformed val_id. Received:', val_id);
      return NextResponse.json({ error: 'Invalid val_id mapping' }, { status: 400 });
    }

    console.log(`PROCESSING ACTIVATION: User ${userId} -> Plan ${planId}`);

    // 1. Fetch Plan Details from Firestore
    const planRef = doc(db, 'subscriptionPlans', planId);
    const planSnap = await getDoc(planRef);

    if (!planSnap.exists()) {
      console.error('WEBHOOK ERROR: Plan ID not found:', planId);
      return NextResponse.json({ error: 'Subscription plan not found' }, { status: 404 });
    }

    const plan = planSnap.data();

    // 2. Calculate Expiry Date based on billing cycle
    const now = new Date();
    let expiry = new Date();
    if (plan.billingCycle === 'lifetime') {
      expiry = new Date(2099, 11, 31); // Far future for lifetime
    } else if (plan.billingCycle === 'yearly') {
      expiry.setDate(now.getDate() + 365);
    } else {
      expiry.setDate(now.getDate() + 30); // Default to 30 days
    }

    // 3. Perform Atomic Batch Update to ensure data consistency
    const batch = writeBatch(db);

    // Update active user limits and quotas
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

    // Sync status back to user profile for dashboard display
    const userRef = doc(db, 'users', userId);
    batch.set(userRef, {
      subscriptionPlanId: planId,
      subscriptionStartedAt: serverTimestamp(),
      subscriptionExpiresAt: Timestamp.fromDate(expiry),
      updatedAt: serverTimestamp()
    }, { merge: true });

    // Record the transaction history in the central log
    const txRef = doc(collection(db, 'plan_transactions'));
    batch.set(txRef, {
      id: txRef.id,
      userId,
      gatewaySessionId: sessionId || 'unknown',
      gatewayTrxId: trxId || 'unknown',
      planId,
      planName: plan.name,
      amount: Number(amount || plan.price),
      paymentMethod: method || 'unknown',
      status: 'verified',
      createdAt: serverTimestamp()
    });

    // Reactivate all merchant brands (stores) if they were previously suspended
    const storesQuery = query(collection(db, 'stores'), where('userId', '==', userId));
    const storesSnap = await getDocs(storesQuery);
    storesSnap.forEach((storeDoc) => {
      batch.update(storeDoc.ref, { isActive: true, updatedAt: serverTimestamp() });
    });

    // Execute all updates simultaneously
    await batch.commit();
    
    console.log('WEBHOOK SUCCESS: Infrastructure upgraded for user', userId);
    return NextResponse.json({ success: true, message: 'Plan activated successfully' });

  } catch (error: any) {
    console.error('WEBHOOK CRITICAL FAILURE:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
