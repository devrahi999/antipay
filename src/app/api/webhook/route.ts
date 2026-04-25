import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

/**
 * Initializes Firebase for the API Route using the provided config.
 * Uses a singleton pattern to prevent multiple initializations.
 */
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export async function POST(req: NextRequest) {
  try {
    console.log("🔥 WEBHOOK HIT");
    
    const body = await req.json();
    console.log("📦 Webhook Body received:", body);

    const { status, amount, val_id } = body;
    // Support both sessionId and session_id from gateway response
    const sessionId = body.sessionId || body.session_id;

    if (!sessionId || !val_id) {
      console.error("❌ MISSING FIELDS IN PAYLOAD:", { sessionId, val_id });
      return NextResponse.json({ error: "Missing session or identifier" }, { status: 400 });
    }

    // Only process if status is verified
    if (status !== 'verified') {
      console.log("ℹ️ Ignoring non-verified status:", status);
      return NextResponse.json({ message: "Status ignored" }, { status: 200 });
    }

    // Parse val_id which contains "userId|planId"
    if (!val_id.includes('|')) {
      console.error("❌ INVALID val_id format:", val_id);
      return NextResponse.json({ error: "Format mismatch" }, { status: 400 });
    }

    const [userId, planId] = val_id.split('|');

    if (!userId || !planId) {
      console.error("❌ PARSE ERROR - Empty values:", { userId, planId });
      return NextResponse.json({ error: "Incomplete identifier" }, { status: 400 });
    }

    // Write directly to plan_transactions collection
    // This is the source of truth for the success page
    const docRef = doc(db, 'plan_transactions', sessionId);
    
    await setDoc(docRef, {
      sessionId,
      userId,
      planId,
      amount: Number(amount),
      status: "verified",
      isActivated: false, // Will be flipped by Success page or Admin
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    console.log("✅ Transaction successfully logged in Firestore:", sessionId);
    
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("❌ WEBHOOK CRITICAL ERROR:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
