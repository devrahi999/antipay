import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// Initialize Firebase for the API route
if (!getApps().length) {
  initializeApp(firebaseConfig);
}
const db = getFirestore();

export async function POST(req: NextRequest) {
  try {
    console.log("🔥 WEBHOOK HIT");
    
    const body = await req.json();
    console.log("📦 Webhook Body:", body);

    const { status, amount, val_id } = body;
    // Support both sessionId and session_id from gateway
    const sessionId = body.sessionId || body.session_id;

    if (!sessionId || !val_id) {
      console.error("❌ MISSING FIELDS:", { sessionId, val_id });
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (status !== 'verified') {
      console.log("ℹ️ Ignoring non-verified status:", status);
      return NextResponse.json({ message: "Ignoring non-verified status" }, { status: 200 });
    }

    if (!val_id.includes('|')) {
      console.error("❌ INVALID val_id format:", val_id);
      return NextResponse.json({ error: "Invalid val_id format" }, { status: 400 });
    }

    const [userId, planId] = val_id.split('|');

    if (!userId || !planId) {
      console.error("❌ PARSE ERROR:", { userId, planId });
      return NextResponse.json({ error: "Invalid val_id content" }, { status: 400 });
    }

    // Write to plan_transactions collection
    // Document ID is the sessionId
    await setDoc(doc(db, 'plan_transactions', sessionId), {
      sessionId,
      userId,
      planId,
      amount: Number(amount),
      status: "verified",
      isActivated: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    console.log("✅ Document created in plan_transactions:", sessionId);
    
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("❌ WEBHOOK CRITICAL ERROR:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
