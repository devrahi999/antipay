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
    const { status, val_id, sessionId } = body;

    console.log('--- INBOUND WEBHOOK ---', { status, val_id, sessionId });

    // We only care about verified status
    if (status !== 'verified') {
      return NextResponse.json({ message: "Ignoring non-verified status" }, { status: 200 });
    }

    if (!val_id || !val_id.includes('|') || !sessionId) {
      console.error('WEBHOOK ERROR: Missing val_id or sessionId');
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const [userId, planId] = val_id.split('|');

    // Use setDoc with merge:true instead of updateDoc to ensure it works even if doc doesn't exist
    const sessionRef = doc(db, 'payment_sessions', userId, 'sessions', sessionId);
    
    await setDoc(sessionRef, {
      status: 'verified',
      planId: planId,
      userId: userId,
      updatedAt: serverTimestamp()
    }, { merge: true });

    console.log(`WEBHOOK SUCCESS: Session ${sessionId} for user ${userId} marked as verified.`);
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('WEBHOOK CRITICAL ERROR:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
