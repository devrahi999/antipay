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

// Initialize Firebase for the server environment (Webhook)
if (!getApps().length) {
  initializeApp(firebaseConfig);
}
const db = getFirestore();

/**
 * Webhook handler for the AntiPay Gateway.
 * Strictly updates limits and status while preserving existing merchant data.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { status, val_id, amount, method, trxId, sessionId } = body;

    // Log the inbound request for server-side monitoring
    console.log('--- INBOUND WEBHOOK ---');
    console.log('Payload:', JSON.stringify(body, null, 2));

    // Only process 'verified' status from the gateway
    if (status !== 'verified') {
      console.log(`WEBHOOK IGNORED: Status is '${status}'.`);
      return NextResponse.json({ message: "Not a verification signal." }, { status: 200 });
    }

    // Parse val_id to identify user and intended plan
    const [userId, planId] = (val_id || '').split('|');

    if (!userId || !planId) {
      console.error('WEBHOOK ERROR: Invalid val_id mapping:', val_id);
      return NextResponse.json({ error: 'Malformed val_id' }, { status: 400 });
    }

    // 1. Fetch the official plan definitions to get new limits
    const planRef = doc(db, 'subscriptionPlans', planId);
    const planSnap = await getDoc(planRef);

    if (!planSnap.exists()) {
      console.error('WEBHOOK ERROR: Plan ID not found in system:', planId);
      return NextResponse.json({ error: 'Plan definition missing' }, { status: 404 });
    }

    const plan = planSnap.data();

    // 2. Calculate Expiry Date
    const now = new Date();
    let expiry = new Date();
    if (plan.billingCycle === 'lifetime') {
      expiry = new Date(2099, 11, 31);
    } else if (plan.billingCycle === 'yearly') {
      expiry.setDate(now.getDate() + 365);
    } else {
      expiry.setDate(now.getDate() + 30);
    }

    // 3. ATOMIC UPDATE: Preserve data, increase limits
    const batch = writeBatch(db);

    // Update 'user_plans' (this stores current limits)
    // merge: true ensures we don't delete other user-specific stats like 'created_brands_count'
    const userPlanRef = doc(db, 'user_plans', userId);
    batch.set(userPlanRef, {
      userId,
      planId,
      planName: plan.name,
      price: plan.price,
      billingCycle: plan.billingCycle,
      maxApiKeys: plan.maxApiKeys, // Update to new higher limit
      maxDevices: plan.maxDevices, // Update to new higher limit
      benefits: plan.benefits || [],
      activatedAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(expiry),
      updatedAt: serverTimestamp()
    }, { merge: true });

    // Sync status to user profile
    const userRef = doc(db, 'users', userId);
    batch.set(userRef, {
      subscriptionPlanId: planId,
      subscriptionStartedAt: serverTimestamp(),
      subscriptionExpiresAt: Timestamp.fromDate(expiry),
      updatedAt: serverTimestamp()
    }, { merge: true });

    // Log the transaction for historical records
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

    // Reactivate all merchant brands (stores) if they were suspended
    // This ONLY updates 'isActive', leaving name, logo, website, and methods untouched.
    const storesQuery = query(collection(db, 'stores'), where('userId', '==', userId));
    const storesSnap = await getDocs(storesQuery);
    storesSnap.forEach((storeDoc) => {
      batch.update(storeDoc.ref, { 
        isActive: true, 
        updatedAt: serverTimestamp() 
      });
    });

    await batch.commit();
    
    console.log(`WEBHOOK SUCCESS: User ${userId} upgraded to ${plan.name}. Limits expanded.`);
    return NextResponse.json({ success: true, message: 'Limits updated successfully' });

  } catch (error: any) {
    console.error('WEBHOOK CRITICAL ERROR:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
