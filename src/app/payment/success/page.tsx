'use client';

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { doc, getDoc, writeBatch, serverTimestamp, Timestamp, collection } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ArrowRight, ShieldCheck, Zap, Sparkles, Loader2, AlertCircle, LogIn, RefreshCcw } from "lucide-react";
import { useUser, useFirestore } from "@/firebase";
import { verifyPaymentSession } from "@/app/actions/payment";

function PaymentSuccessContent() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const searchParams = useSearchParams();

  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planName, setPlanName] = useState("");

  // Get params directly from URL as fallback if searchParams is empty
  const sessionId = searchParams.get('sessionId');
  const trxId = searchParams.get('trxId');

  useEffect(() => {
    async function activatePlan() {
      // 1. Wait for Auth and Params to be ready
      if (isUserLoading) return;
      
      // Give the router a moment to populate params if they are missing
      if (!sessionId || !trxId) {
        const timeout = setTimeout(() => {
          if (!sessionId || !trxId) {
            setError("MISSING PARAMETERS");
            setIsVerifying(false);
          }
        }, 2000);
        return () => clearTimeout(timeout);
      }

      if (!user) {
        // If params are here but user isn't, it might be a sync issue. Wait a bit.
        const authTimeout = setTimeout(() => {
          if (!user) {
            setError("AUTH_REQUIRED");
            setIsVerifying(false);
          }
        }, 1500);
        return () => clearTimeout(authTimeout);
      }

      // 2. Start Verification
      setIsVerifying(true);
      setError(null);

      try {
        const verifyRes = await verifyPaymentSession(sessionId, trxId);
        
        if (!verifyRes.success) {
          throw new Error(verifyRes.error || "Gateway verification failed.");
        }

        const gatewayData = verifyRes.data;
        const [targetUserId, planId] = (gatewayData.val_id || '').split('|');
        
        if (!planId) throw new Error("Could not identify plan from gateway data.");

        // 3. Update Firestore
        const planSnap = await getDoc(doc(db, 'subscriptionPlans', planId));
        if (!planSnap.exists()) throw new Error(`Plan configuration '${planId}' not found.`);
        
        const planData = planSnap.data();
        setPlanName(planData.name);

        const batch = writeBatch(db);
        const now = new Date();
        let expiry = new Date();
        if (planData.billingCycle === 'lifetime') {
          expiry = new Date(2099, 11, 31);
        } else if (planData.billingCycle === 'yearly') {
          expiry.setDate(now.getDate() + 365);
        } else {
          expiry.setDate(now.getDate() + 30);
        }

        // Update quotas
        batch.set(doc(db, 'user_plans', user.uid), {
          userId: user.uid,
          planId: planId,
          planName: planData.name,
          price: planData.price,
          billingCycle: planData.billingCycle,
          maxApiKeys: planData.maxApiKeys,
          maxDevices: planData.maxDevices,
          benefits: planData.benefits || [],
          activatedAt: serverTimestamp(),
          expiresAt: Timestamp.fromDate(expiry),
          updatedAt: serverTimestamp()
        }, { merge: true });

        // Update profile
        batch.update(doc(db, 'users', user.uid), {
          subscriptionPlanId: planId,
          subscriptionStartedAt: serverTimestamp(),
          subscriptionExpiresAt: Timestamp.fromDate(expiry),
          updatedAt: serverTimestamp()
        });

        // Log Transaction
        const txRef = doc(collection(db, 'plan_transactions'));
        batch.set(txRef, {
          id: txRef.id,
          userId: user.uid,
          userEmail: user.email,
          gatewaySessionId: sessionId,
          gatewayTrxId: trxId,
          planId,
          planName: planData.name,
          amount: Number(gatewayData.amount || planData.price),
          status: 'verified',
          createdAt: serverTimestamp()
        });

        await batch.commit();
        setIsSuccess(true);
      } catch (err: any) {
        console.error("ACTIVATION ERROR:", err);
        setError(err.message || "Failed to activate plan.");
      } finally {
        setIsVerifying(false);
      }
    }

    activatePlan();
  }, [user, isUserLoading, db, sessionId, trxId]);

  if (isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Establishing Secure Connection...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xs w-full bg-[#162129] border border-border/10 rounded-[2rem] p-8 text-center space-y-6 shadow-2xl">
        <div className="h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mx-auto">
           <AlertCircle size={24} />
        </div>
        <div className="space-y-1">
           <h2 className="text-lg font-black text-white uppercase tracking-tight">Activation Halted</h2>
           <p className="text-muted-foreground text-[9px] uppercase font-bold tracking-widest">
             {error === "AUTH_REQUIRED" ? "Please sign in to link payment" : error}
           </p>
        </div>
        <div className="space-y-3">
          {error === "AUTH_REQUIRED" ? (
            <Button asChild className="ios-btn bg-primary w-full h-11 font-bold">
               <Link href="/login"><LogIn className="mr-2 h-4 w-4" /> Sign In Now</Link>
            </Button>
          ) : (
            <Button onClick={() => window.location.reload()} className="ios-btn bg-white text-black w-full h-11 font-bold">
               <RefreshCcw className="mr-2 h-4 w-4" /> Retry Verification
            </Button>
          )}
          <Button asChild variant="ghost" className="w-full text-muted-foreground text-[10px] font-bold">
             <Link href="/dashboard/subscription">Return to Subscription</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xs w-full space-y-6 text-center animate-in zoom-in-95 duration-500">
      <div className="relative inline-block">
        <div className="absolute inset-0 bg-[#16a34a] blur-2xl opacity-20 rounded-full" />
        <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-[#16a34a] to-emerald-700 border border-white/10 flex items-center justify-center mx-auto shadow-2xl">
           <CheckCircle2 size={32} className="text-white" />
           <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-amber-500 animate-pulse" />
        </div>
      </div>

      <div className="space-y-1 px-4">
        <h1 className="text-xl font-black text-white tracking-tight uppercase">Payment <span className="text-[#16a34a]">Verified!</span></h1>
        <p className="text-slate-300 text-xs font-bold leading-tight">
          Congratulations! Your <span className="text-[#16a34a]">{planName || 'New'}</span> plan is now fully active on your account.
        </p>
      </div>

      <Card className="bg-[#162129]/60 backdrop-blur-xl border-border/10 shadow-2xl overflow-hidden rounded-[1.5rem] border mx-4">
        <CardContent className="p-5 space-y-6">
          <div className="flex items-center justify-between p-3 bg-[#0b141a]/50 rounded-xl border border-white/5">
             <div className="flex items-center gap-3">
                <Zap size={16} className="text-[#16a34a] animate-pulse" />
                <div className="text-left">
                   <p className="text-[6px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Instance Status</p>
                   <p className="font-black text-white text-[10px] tracking-tight uppercase">Active & Secured</p>
                </div>
             </div>
             <div className="h-1.5 w-1.5 rounded-full bg-[#16a34a] shadow-[0_0_8px_rgba(22,163,74,0.8)]" />
          </div>

          <div className="grid grid-cols-1 gap-2.5">
             <Button asChild className="ios-btn bg-[#16a34a] hover:bg-[#15803d] w-full h-10 text-[11px] font-black rounded-xl border-none">
                <Link href="/dashboard" className="flex items-center justify-center gap-2">
                   Go to Dashboard <ArrowRight className="h-3.5 w-3.5" />
                </Link>
             </Button>
             
             <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" asChild className="h-9 text-[9px] font-bold rounded-xl border-white/5 bg-white/5 text-muted-foreground">
                    <Link href="/dashboard/subscription">View Limits</Link>
                </Button>
                <Button variant="outline" asChild className="h-9 text-[9px] font-bold rounded-xl border-white/5 bg-white/5 text-muted-foreground">
                    <Link href="/dashboard/invoices">Receipts</Link>
                </Button>
             </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-2 text-[8px] text-muted-foreground font-black uppercase tracking-[0.2em] pt-4">
         <ShieldCheck size={10} className="text-[#16a34a]" /> AntiPay Infrastructure
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-[#0b141a] flex flex-col font-body selection:bg-primary/20">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />
      </div>

      <header className="border-b border-white/5 bg-[#162129]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="https://i.imgur.com/18owxBD.png" alt="AntiPay" className="h-8 w-auto" />
            <span className="text-lg font-headline font-bold tracking-tight text-[#16a34a]">AntiPay</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <Suspense fallback={<Loader2 className="animate-spin text-primary h-8 w-8" />}>
          <PaymentSuccessContent />
        </Suspense>
      </main>
    </div>
  );
}
