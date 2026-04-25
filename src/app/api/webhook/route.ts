import { NextRequest, NextResponse } from 'next/server';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// ✅ Initialize Firebase Admin (singleton)
const app = !getApps().length
  ? initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      }),
    })
  : getApps()[0];

const db = getFirestore(app);

export async function POST(req: NextRequest) {
  try {
    console.log("🔥 WEBHOOK HIT");

    const body = await req.json();
    console.log("📦 BODY:", body);

    const { status, amount, val_id } = body;
    const sessionId = body.sessionId || body.session_id;

    // 🔴 Validation
    if (!sessionId || !val_id) {
      console.error("❌ Missing fields:", { sessionId, val_id });
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // 🔴 Only process verified
    if (status !== "verified") {
      console.log("ℹ️ Ignored status:", status);
      return NextResponse.json({ message: "Ignored" });
    }

    // 🔴 Parse val_id → userId|planId
    if (!val_id.includes("|")) {
      console.error("❌ Invalid val_id:", val_id);
      return NextResponse.json({ error: "Invalid val_id" }, { status: 400 });
    }

    const [userId, planId] = val_id.split("|");

    if (!userId || !planId) {
      console.error("❌ Parse failed:", { userId, planId });
      return NextResponse.json({ error: "Parse error" }, { status: 400 });
    }

    console.log("👤 userId:", userId);
    console.log("📦 planId:", planId);

    // ✅ Write to Firestore (plan_transactions)
    await db.collection("plan_transactions").doc(sessionId).set({
      sessionId,
      userId,
      planId,
      amount: Number(amount),
      status: "verified",
      isActivated: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("✅ FIRESTORE WRITE SUCCESS:", sessionId);

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("❌ WEBHOOK ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}
