'use client';

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { doc, getDoc, writeBatch, serverTimestamp, Timestamp, collection } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ArrowRight, ShieldCheck, Zap, Sparkles, Loader2, AlertCircle, LogIn } from "lucide-react";
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

  const sessionId = searchParams.get('sessionId');
  const trxId = searchParams.get('trxId');

  useEffect(() => {
    async function activatePlan() {
      if (isUserLoading) return;

      if (!sessionId || !trxId) {
        setError("Missing payment parameters.");
        setIsVerifying(false);
        return;
      }

      if (!user) {
        // If user is null but we are not loading, it means user is genuinely logged out
        // However, external redirects can be tricky. We wait 1 second to be sure.
        await new Promise(r => setTimeout(r, 1000));
        if (!user) {
            setError("Session authentication timed out. Please sign in.");
            setIsVerifying(false);
            return;
        }
      }

      try {
        const verifyRes = await verifyPaymentSession(sessionId, trxId);
        
        if (!verifyRes.success) {
          setError(verifyRes.error || "Verification failed at gateway.");
          setIsVerifying(false);
          return;
        }

        const gatewayData = verifyRes.data;
        const planId = (gatewayData.val_id || '').split('|')[1];
        
        if (!planId) throw new Error("Plan identification failed.");

        const planSnap = await getDoc(doc(db, 'subscriptionPlans', planId));
        if (!planSnap.exists()) throw new Error("Plan definition missing.");
        
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

        batch.update(doc(db, 'users', user.uid), {
          subscriptionPlanId: planId,
          subscriptionStartedAt: serverTimestamp(),
          subscriptionExpiresAt: Timestamp.fromDate(expiry),
          updatedAt: serverTimestamp()
        });

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
        setError(err.message || "Activation interrupted.");
      } finally {
        setIsVerifying(false);
      }
    }

    activatePlan();
  }, [user, isUserLoading, db, sessionId, trxId]);

  if (isVerifying || isUserLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-6 animate-in fade-in duration-500">
        <div className="h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
           <AlertCircle size={24} />
        </div>
        <div className="space-y-1 text-center">
           <h2 className="text-lg font-black text-white uppercase tracking-tight">Activation Halted</h2>
           <p className="text-muted-foreground max-w-xs mx-auto text-[10px] uppercase font-bold tracking-widest">{error}</p>
        </div>
        {!user ? (
          <Button asChild className="ios-btn bg-primary hover:bg-primary/90 font-bold px-8 h-10 text-xs">
             <Link href="/login"><LogIn className="mr-2 h-4 w-4" /> Sign In to Retry</Link>
          </Button>
        ) : (
          <Button asChild variant="outline" className="border-white/10 text-white rounded-xl h-9 text-[10px] px-6">
             <Link href="/dashboard/subscription">Go to Dashboard</Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-xs w-full space-y-6 text-center animate-in zoom-in-95 fade-in duration-700">
      <div className="relative inline-block">
        <div className="absolute inset-0 bg-[#16a34a] blur-2xl opacity-20 rounded-full animate-pulse" />
        <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-[#16a34a] to-emerald-700 border border-white/10 flex items-center justify-center mx-auto shadow-2xl">
           <CheckCircle2 size={28} className="text-white" />
           <div className="absolute -top-1 -right-1 bg-amber-500 p-0.5 rounded shadow-lg">
             <Sparkles size={8} className="text-white" />
           </div>
        </div>
      </div>

      <div className="space-y-1">
        <h1 className="text-xl font-black text-white tracking-tighter uppercase italic">
          Payment <span className="text-[#16a34a]">Verified!</span>
        </h1>
        <p className="text-slate-300 text-xs font-bold tracking-tight">
          Congratulations! Your <span className="text-[#16a34a]">{planName || 'New'}</span> plan is now active.
        </p>
      </div>

      <Card className="bg-[#162129]/60 backdrop-blur-xl border-border/10 shadow-2xl overflow-hidden rounded-[1.25rem] border">
        <CardContent className="p-4 space-y-5">
          <div className="flex items-center justify-between p-2.5 bg-[#0b141a]/50 rounded-lg border border-white/5">
             <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-[#16a34a]/20 flex items-center justify-center text-[#16a34a]">
                   <Zap size={14} className="animate-pulse" />
                </div>
                <div className="text-left">
                   <p className="text-[6px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Account Status</p>
                   <p className="font-black text-white text-[10px] tracking-tight uppercase italic">Active & Secured</p>
                </div>
             </div>
             <div className="h-1 w-1 rounded-full bg-[#16a34a] shadow-[0_0_8px_rgba(22,163,74,0.8)] animate-pulse" />
          </div>

          <div className="grid grid-cols-1 gap-2">
             <Button asChild className="ios-btn bg-[#16a34a] hover:bg-[#15803d] w-full h-9 text-[10px] font-black rounded-lg border-none shadow-xl">
                <Link href="/dashboard" className="flex items-center justify-center gap-2">
                   Go to Console <ArrowRight className="h-3 w-3" />
                </Link>
             </Button>
             
             <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" asChild className="h-8 text-[8px] font-bold rounded-lg border-white/5 hover:bg-white/5 text-muted-foreground">
                    <Link href="/dashboard/subscription">View Quotas</Link>
                </Button>
                <Button variant="outline" asChild className="h-8 text-[8px] font-bold rounded-lg border-white/5 hover:bg-white/5 text-muted-foreground">
                    <Link href="/dashboard/invoices">History</Link>
                </Button>
             </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-1.5 text-[7px] text-muted-foreground font-black uppercase tracking-[0.2em]">
         <ShieldCheck size={8} className="text-[#16a34a]" /> AntiPay Secure Payment System
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-[#0b141a] flex flex-col font-body selection:bg-primary/20">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[30%] h-[30%] bg-primary/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-emerald-500/10 blur-[100px] rounded-full" />
      </div>

      <header className="border-b border-white/5 bg-[#162129]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto flex h-12 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="https://i.imgur.com/18owxBD.png" alt="AntiPay" className="h-7 w-auto" />
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
