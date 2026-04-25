'use client';

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { doc, getDoc, updateDoc, setDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, ShieldCheck, Sparkles, Loader2, RefreshCcw } from "lucide-react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { useSearchParams, useRouter } from "next/navigation";
import { notifyPlanActivation } from "@/app/actions/notifications";

function PaymentSuccessContent() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const sessionId = searchParams.get('sessionId');
  const [activationStatus, setActivationStatus] = useState<'waiting' | 'activating' | 'success' | 'error'>('waiting');
  const [activePlanName, setActivePlanName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Protect from direct access without sessionId
  useEffect(() => {
    if (!isUserLoading && !sessionId) {
      router.replace('/dashboard');
    }
  }, [sessionId, isUserLoading, router]);

  // Read from plan_transactions as the source of truth
  const txRef = useMemoFirebase(() => {
    if (!db || !sessionId) return null;
    return doc(db, 'plan_transactions', sessionId);
  }, [db, sessionId]);

  const { data: txData, isLoading: isTxLoading } = useDoc(txRef);

  useEffect(() => {
    async function performActivation() {
      if (!db || !user || !txData || activationStatus !== 'waiting') return;

      if (txData.isActivated) {
        setActivationStatus('success');
        setActivePlanName(txData.planName || 'Active Plan');
        return;
      }

      if (txData.status === 'verified') {
        setActivationStatus('activating');
        try {
          const planId = txData.planId;
          const planRef = doc(db, 'subscriptionPlans', planId);
          const planSnap = await getDoc(planRef);
          
          if (!planSnap.exists()) throw new Error(`Plan definition missing.`);
          const plan = planSnap.data();
          setActivePlanName(plan.name);

          const now = new Date();
          let expiry = new Date();
          if (plan.billingCycle === 'lifetime') expiry = new Date(2099, 11, 31);
          else if (plan.billingCycle === 'yearly') expiry.setDate(now.getDate() + 365);
          else expiry.setDate(now.getDate() + 30);

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

          await updateDoc(doc(db, 'users', user.uid), {
            subscriptionPlanId: planId,
            subscriptionStartedAt: serverTimestamp(),
            subscriptionExpiresAt: Timestamp.fromDate(expiry),
            updatedAt: serverTimestamp()
          });

          await updateDoc(txRef!, { 
            isActivated: true, 
            activatedAt: serverTimestamp(),
            planName: plan.name // Cache plan name for display
          });

          // TRIGGER EMAIL NOTIFICATION
          if (user.email) {
            notifyPlanActivation(user.email, plan.name).catch(e => console.error("Activation email failed:", e));
          }

          setActivationStatus('success');
        } catch (err: any) {
          setErrorMessage(err.message);
          setActivationStatus('error');
        }
      }
    }

    performActivation();
  }, [txData, user, db, txRef, activationStatus]);

  if (isUserLoading || isTxLoading || (sessionId && !txData) || activationStatus === 'activating') {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <div className="h-1.5 w-24 bg-secondary rounded-full overflow-hidden">
           <div className="h-full bg-primary animate-pulse" />
        </div>
      </div>
    );
  }

  if (activationStatus === 'error') {
    return (
      <div className="max-w-xs w-full p-8 text-center space-y-6">
        <RefreshCcw className="h-12 w-12 text-rose-500 mx-auto mb-4 opacity-50" />
        <p className="text-rose-500 font-bold text-sm uppercase">Activation Error</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{errorMessage}</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="w-full rounded-xl border-rose-500/20">
           Retry Connection
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-xs w-full space-y-10 text-center animate-in zoom-in-95 duration-500 px-4">
      <div className="relative inline-block">
        <div className="absolute inset-0 bg-[#16a34a] blur-2xl opacity-20 rounded-full" />
        <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-[#16a34a] to-emerald-700 border border-white/10 flex items-center justify-center mx-auto shadow-2xl">
           <CheckCircle2 size={48} className="text-white" />
           <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-amber-500 animate-pulse" />
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-black text-white tracking-tight uppercase">Payment Verified!</h1>
        <p className="text-slate-300 text-[13px] font-bold leading-tight">
          Congratulations! Your plan is now active.
        </p>
      </div>

      <Button asChild className="ios-btn bg-[#16a34a] hover:bg-[#15803d] w-full h-14 text-sm font-black rounded-2xl border-none shadow-xl shadow-[#16a34a]/20">
        <Link href="/dashboard" className="flex items-center justify-center gap-3">
            Go to Dashboard <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>

      <div className="flex items-center justify-center gap-2 text-[9px] text-muted-foreground font-black uppercase tracking-[0.3em] pt-4">
         <ShieldCheck size={12} className="text-[#16a34a]" /> AntiPay Infrastructure
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-[#0b141a] flex flex-col font-body">
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
