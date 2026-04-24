
'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ArrowRight, ShieldCheck, Zap, Sparkles, Loader2 } from "lucide-react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

export default function PaymentSuccessPage() {
  const { user } = useUser();
  const db = useFirestore();

  // Fetch user profile to get the plan name
  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);
  const { data: profile, isLoading } = useDoc(profileRef);

  return (
    <div className="min-h-screen bg-[#0b141a] flex flex-col font-body selection:bg-primary/20">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[30%] h-[30%] bg-primary/10 blur-[100px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-emerald-500/10 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <header className="border-b border-white/5 bg-[#162129]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 group transition-transform active:scale-95">
            <img src="https://i.imgur.com/18owxBD.png" alt="AntiPay" className="h-8 w-auto" />
            <span className="text-xl font-headline font-bold tracking-tight text-[#16a34a]">AntiPay</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 py-12 relative z-10">
        <div className="max-w-md w-full space-y-8 text-center">
          
          {/* Hero Icon */}
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-[#16a34a] blur-2xl opacity-30 rounded-full animate-pulse" />
            <div className="relative h-24 w-24 rounded-3xl bg-gradient-to-br from-[#16a34a] to-emerald-700 border-2 border-white/10 flex items-center justify-center mx-auto shadow-2xl rotate-3">
               <CheckCircle2 size={48} className="text-white animate-in zoom-in duration-500" />
               <div className="absolute -top-3 -right-3 bg-amber-500 p-1.5 rounded-lg shadow-lg animate-bounce">
                 <Sparkles size={14} className="text-white" />
               </div>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
              Payment <span className="text-[#16a34a]">Verified!</span>
            </h1>
            <div className="flex flex-col items-center gap-1">
               {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
               ) : (
                  <>
                    <p className="text-slate-200 text-lg font-bold tracking-tight">
                      Your <span className="text-[#16a34a]">{profile?.subscriptionPlanId?.toUpperCase() || 'New'}</span> plan is now activated.
                    </p>
                    <p className="text-muted-foreground text-sm font-medium">Congratulations! Your account limits have been expanded.</p>
                  </>
               )}
            </div>
          </div>

          <Card className="bg-[#162129]/60 backdrop-blur-xl border-border/10 shadow-2xl overflow-hidden rounded-[2rem] border">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center justify-between p-4 bg-[#0b141a]/50 rounded-2xl border border-white/5 relative overflow-hidden group">
                 <div className="flex items-center gap-3 relative z-10">
                    <div className="h-10 w-10 rounded-xl bg-[#16a34a]/20 flex items-center justify-center text-[#16a34a]">
                       <Zap size={20} className="animate-pulse" />
                    </div>
                    <div className="text-left">
                       <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Instance Status</p>
                       <p className="font-black text-white text-md tracking-tight uppercase italic">Active & Secured</p>
                    </div>
                 </div>
                 <div className="h-2 w-2 rounded-full bg-[#16a34a] shadow-[0_0_10px_rgba(22,163,74,0.8)] animate-pulse" />
              </div>

              <div className="grid grid-cols-1 gap-3">
                 <Button asChild className="ios-btn bg-[#16a34a] hover:bg-[#15803d] w-full h-12 text-md font-black rounded-xl border-none shadow-xl">
                    <Link href="/dashboard" className="flex items-center justify-center gap-2">
                       Enter Merchant Console <ArrowRight className="h-4 w-4" />
                    </Link>
                 </Button>
                 
                 <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" asChild className="h-10 text-xs font-bold rounded-xl border-white/5 hover:bg-white/5 text-muted-foreground">
                        <Link href="/dashboard/subscription">View Quotas</Link>
                    </Button>
                    <Button variant="outline" asChild className="h-10 text-xs font-bold rounded-xl border-white/5 hover:bg-white/5 text-muted-foreground">
                        <Link href="/dashboard/invoices">My Ledger</Link>
                    </Button>
                 </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">
               <ShieldCheck size={12} className="text-[#16a34a]" /> AntiPay Infrastructure Secure
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
