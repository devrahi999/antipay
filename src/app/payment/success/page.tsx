'use client';

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { doc, getDoc, writeBatch, serverTimestamp, Timestamp, collection } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ArrowRight, ShieldCheck, Zap, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { useUser, useFirestore } from "@/firebase";
import { verifyPaymentSession } from "@/app/actions/payment";
import { useToast } from "@/hooks/use-toast";

function PaymentSuccessContent() {
  const { user } = useUser();
  const db = useFirestore();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planName, setPlanName] = useState("");

  const sessionId = searchParams.get('sessionId');
  const trxId = searchParams.get('trxId');

  useEffect(() => {
    async function activatePlan() {
      if (!user || !db || !sessionId || !trxId) {
        setIsVerifying(false);
        return;
      }

      try {
        // 1. Verify with Gateway
        const verifyRes = await verifyPaymentSession(sessionId, trxId);
        
        if (!verifyRes.success) {
          setError(verifyRes.error || "Verification failed");
          setIsVerifying(false);
          return;
        }

        const gatewayData = verifyRes.data;
        // val_id format: userId|planId
        const planId = (gatewayData.val_id || '').split('|')[1];
        
        if (!planId) throw new Error("Plan information missing from payment");

        // 2. Fetch Plan Definition
        const planSnap = await getDoc(doc(db, 'subscriptionPlans', planId));
        if (!planSnap.exists()) throw new Error("Target plan not found in system");
        
        const planData = planSnap.data();
        setPlanName(planData.name);

        // 3. Update Firestore (Client-side update works because user is logged in)
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

        // Update user_plans
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

        // Update user profile
        batch.update(doc(db, 'users', user.uid), {
          subscriptionPlanId: planId,
          subscriptionStartedAt: serverTimestamp(),
          subscriptionExpiresAt: Timestamp.fromDate(expiry),
          updatedAt: serverTimestamp()
        });

        // Log transaction
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
        setError(err.message || "Failed to activate plan");
      } finally {
        setIsVerifying(false);
      }
    }

    activatePlan();
  }, [user, db, sessionId, trxId]);

  if (isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <h2 className="text-xl font-bold text-white uppercase tracking-widest">Verifying Payment...</h2>
        <p className="text-muted-foreground text-sm">Please do not refresh this page.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6">
        <div className="h-20 w-20 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
           <AlertCircle size={40} />
        </div>
        <div className="space-y-2 text-center">
           <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Activation Halted</h2>
           <p className="text-muted-foreground max-w-xs mx-auto text-sm">{error}</p>
        </div>
        <Button asChild variant="outline" className="border-white/10 text-white">
           <Link href="/dashboard/subscription">Go to Subscription</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full space-y-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="relative inline-block">
        <div className="absolute inset-0 bg-[#16a34a] blur-2xl opacity-30 rounded-full animate-pulse" />
        <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-[#16a34a] to-emerald-700 border-2 border-white/10 flex items-center justify-center mx-auto shadow-2xl rotate-3">
           <CheckCircle2 size={40} className="text-white" />
           <div className="absolute -top-2 -right-2 bg-amber-500 p-1 rounded-lg shadow-lg">
             <Sparkles size={12} className="text-white" />
           </div>
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
          Payment <span className="text-[#16a34a]">Verified!</span>
        </h1>
        <div className="space-y-1">
          <p className="text-slate-200 text-lg font-bold tracking-tight">
            Your <span className="text-[#16a34a]">{planName || 'New'}</span> plan is now activated.
          </p>
          <p className="text-muted-foreground text-sm font-medium">Congratulations! Your account limits have been expanded.</p>
        </div>
      </div>

      <Card className="bg-[#162129]/60 backdrop-blur-xl border-border/10 shadow-2xl overflow-hidden rounded-[2rem] border">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between p-4 bg-[#0b141a]/50 rounded-2xl border border-white/5">
             <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-[#16a34a]/20 flex items-center justify-center text-[#16a34a]">
                   <Zap size={18} className="animate-pulse" />
                </div>
                <div className="text-left">
                   <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Instance Status</p>
                   <p className="font-black text-white text-sm tracking-tight uppercase italic">Active & Secured</p>
                </div>
             </div>
             <div className="h-2 w-2 rounded-full bg-[#16a34a] shadow-[0_0_10px_rgba(22,163,74,0.8)] animate-pulse" />
          </div>

          <div className="grid grid-cols-1 gap-3">
             <Button asChild className="ios-btn bg-[#16a34a] hover:bg-[#15803d] w-full h-11 text-sm font-black rounded-xl border-none shadow-xl">
                <Link href="/dashboard" className="flex items-center justify-center gap-2">
                   Enter Merchant Console <ArrowRight className="h-4 w-4" />
                </Link>
             </Button>
             
             <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" asChild className="h-9 text-[10px] font-bold rounded-xl border-white/5 hover:bg-white/5 text-muted-foreground">
                    <Link href="/dashboard/subscription">View Quotas</Link>
                </Button>
                <Button variant="outline" asChild className="h-9 text-[10px] font-bold rounded-xl border-white/5 hover:bg-white/5 text-muted-foreground">
                    <Link href="/dashboard/invoices">My Ledger</Link>
                </Button>
             </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-2 text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em]">
         <ShieldCheck size={10} className="text-[#16a34a]" /> AntiPay Infrastructure Secure
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
        <div className="container mx-auto flex h-14 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <img src="https://i.imgur.com/18owxBD.png" alt="AntiPay" className="h-8 w-auto" />
            <span className="text-xl font-headline font-bold tracking-tight text-[#16a34a]">AntiPay</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <Suspense fallback={<Loader2 className="animate-spin text-primary h-10 w-10" />}>
          <PaymentSuccessContent />
        </Suspense>
      </main>
    </div>
  );
}
