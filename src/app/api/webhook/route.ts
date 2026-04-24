import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
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

    if (status !== 'verified') {
      return NextResponse.json({ message: "Ignoring non-verified status" }, { status: 200 });
    }

    if (!val_id || !val_id.includes('|') || !sessionId) {
      console.error('WEBHOOK ERROR: Missing val_id or sessionId');
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const [userId, planId] = val_id.split('|');

    // ONLY UPDATE THE SESSION DOCUMENT
    // This marks it as verified so the Success Page can see it and do the rest
    const sessionRef = doc(db, 'payment_sessions', userId, 'sessions', sessionId);
    
    await updateDoc(sessionRef, {
      status: 'verified',
      planId: planId,
      updatedAt: serverTimestamp()
    });

    console.log(`WEBHOOK SUCCESS: Session ${sessionId} marked as verified for user ${userId}`);
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('WEBHOOK CRITICAL ERROR:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
