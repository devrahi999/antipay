'use client';

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { doc, getDoc, updateDoc, setDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ArrowRight, ShieldCheck, Zap, Sparkles, Loader2, RefreshCcw } from "lucide-react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { useSearchParams } from "next/navigation";

function PaymentSuccessContent() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const searchParams = useSearchParams();
  
  const sessionId = searchParams.get('sessionId');
  const [activationStatus, setActivationStatus] = useState<'waiting' | 'activating' | 'success' | 'error'>('waiting');
  const [activePlanName, setActivePlanName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Monitor the session document for the "verified" status from Webhook
  const sessionRef = useMemoFirebase(() => {
    if (!db || !user || !sessionId) return null;
    return doc(db, 'payment_sessions', user.uid, 'sessions', sessionId);
  }, [db, user?.uid, sessionId]);

  const { data: sessionData } = useDoc(sessionRef);

  useEffect(() => {
    async function performActivation() {
      if (!db || !user || !sessionData || activationStatus !== 'waiting') return;

      if (sessionData.status === 'verified' && !sessionData.isActivated) {
        setActivationStatus('activating');
        try {
          const planId = sessionData.planId;
          
          // A. Fetch Plan Details
          const planRef = doc(db, 'subscriptionPlans', planId);
          const planSnap = await getDoc(planRef);
          
          if (!planSnap.exists()) throw new Error("Plan definition missing.");
          const plan = planSnap.data();
          setActivePlanName(plan.name);

          // B. Calculate Expiry
          const now = new Date();
          let expiry = new Date();
          if (plan.billingCycle === 'lifetime') expiry = new Date(2099, 11, 31);
          else if (plan.billingCycle === 'yearly') expiry.setDate(now.getDate() + 365);
          else expiry.setDate(now.getDate() + 30);

          // C. Update Database (Atomic sequence)
          // Update session first to prevent double activation
          await updateDoc(sessionRef, { isActivated: true });

          // Update user plans
          await setDoc(doc(db, 'user_plans', user.uid), {
            userId: user.uid,
            planId: planId,
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

          // Update user profile
          await updateDoc(doc(db, 'users', user.uid), {
            subscriptionPlanId: planId,
            subscriptionStartedAt: serverTimestamp(),
            subscriptionExpiresAt: Timestamp.fromDate(expiry),
            updatedAt: serverTimestamp()
          });

          setActivationStatus('success');
        } catch (err: any) {
          console.error("Activation Error:", err);
          setErrorMessage(err.message);
          setActivationStatus('error');
        }
      } else if (sessionData.isActivated) {
        setActivationStatus('success');
        setActivePlanName(sessionData.planId === 'pro' ? 'Pro Merchant' : 'Active Plan');
      }
    }

    performActivation();
  }, [sessionData, user, db, sessionRef, activationStatus]);

  if (isUserLoading || activationStatus === 'waiting' || activationStatus === 'activating') {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] animate-pulse">
          {activationStatus === 'activating' ? 'Activating Plan...' : 'Verifying Signal...'}
        </p>
      </div>
    );
  }

  if (activationStatus === 'error') {
    return (
      <Card className="max-w-xs w-full bg-rose-500/5 border-rose-500/20 p-6 text-center">
        <p className="text-rose-500 font-bold text-sm mb-2">Activation Failed</p>
        <p className="text-[10px] text-muted-foreground mb-4">{errorMessage}</p>
        <Button onClick={() => window.location.reload()} variant="outline" size="sm" className="h-9 rounded-xl">
           <RefreshCcw className="mr-2 h-3 w-3" /> Retry
        </Button>
      </Card>
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
          Congratulations! Your <span className="text-[#16a34a]">{activePlanName}</span> plan is now active.
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
        <Suspense fallback={<Loader2 className="h-10 w-10 text-primary animate-spin" />}>
          <PaymentSuccessContent />
        </Suspense>
      </main>
    </div>
  );
}
