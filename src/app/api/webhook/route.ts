import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

if (!getApps().length) {
  initializeApp(firebaseConfig);
}
const db = getFirestore();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Gateway returns sessionId (or session_id), amount, val_id, and status
    const sessionId = body.sessionId || body.session_id;
    const amount = body.amount;
    const val_id = body.val_id;
    const status = body.status;

    console.log('--- INBOUND WEBHOOK (PLAN TRANSACTION) ---', { status, val_id, sessionId });

    if (status !== 'verified') {
      return NextResponse.json({ message: "Ignoring non-verified status" }, { status: 200 });
    }

    if (!val_id || !val_id.includes('|') || !sessionId) {
      console.error('WEBHOOK ERROR: Invalid payload structure');
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const [userId, planId] = val_id.split('|');

    // OBJECTIVE 1: Store verified transaction in plan_transactions root collection
    // Document ID is the sessionId from the gateway
    await setDoc(doc(db, 'plan_transactions', sessionId), {
      sessionId,
      userId,
      planId,
      amount: Number(amount),
      status: "verified",
      isActivated: false, // Will be flipped by Success Page
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    console.log(`WEBHOOK SUCCESS: Transaction ${sessionId} recorded for user ${userId}.`);
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('WEBHOOK CRITICAL ERROR:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
