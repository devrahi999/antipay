
'use client';

import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle2, 
  CreditCard, 
  Clock, 
  Zap, 
  ArrowUpCircle,
  HelpCircle,
  Calendar,
  AlertCircle,
  Loader2
} from "lucide-react"
import { doc } from 'firebase/firestore';
import Link from 'next/link';
import { format } from 'date-fns';

export default function MySubscriptionPage() {
  const { user } = useUser();
  const db = useFirestore();

  // Fetch real plan details from the dedicated user_plans collection (Root Level)
  const activePlanRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'user_plans', user.uid);
  }, [db, user?.uid]);
  
  const { data: activePlan, isLoading } = useDoc(activePlanRef);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="relative">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="h-4 w-4 text-primary" />
          </div>
        </div>
        <p className="text-sm font-bold text-muted-foreground animate-pulse tracking-widest uppercase">Fetching Vault Access...</p>
      </div>
    );
  }

  const hasActivePlan = !!activePlan;

  // Real timestamps from Firestore
  const startDate = activePlan?.activatedAt?.toDate ? activePlan.activatedAt.toDate() : null;
  const expiryDate = activePlan?.expiresAt?.toDate ? activePlan.expiresAt.toDate() : null;
  const daysLeft = expiryDate ? Math.max(0, Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0;

  return (
    <div className="space-y-8 py-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground">My Subscription</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your AntiPay API quotas and billing timeline.</p>
        </div>
        <Button asChild className="bg-[#16a34a] hover:bg-[#15803d] font-bold shadow-lg shadow-[#16a34a]/20">
          <Link href="/dashboard/plans">
            <ArrowUpCircle className="mr-2 h-4 w-4" /> {hasActivePlan ? "Upgrade Plan" : "Get a Plan"}
          </Link>
        </Button>
      </div>

      {!hasActivePlan ? (
        <Card className="bg-[#0b141a] border-2 border-dashed border-primary/20 p-12 text-center flex flex-col items-center gap-6 shadow-2xl rounded-3xl">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <Zap size={40} className="animate-pulse" />
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-black text-slate-100 uppercase tracking-tight">Access Locked</h3>
            <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
              You haven't activated an AntiPay subscription yet. To start verifying payments and using the API, please select a plan from our growth center.
            </p>
          </div>
          <Button asChild className="mt-4 bg-[#16a34a] hover:bg-[#15803d] h-12 px-10 font-black rounded-xl shadow-xl shadow-[#16a34a]/20">
             <Link href="/dashboard/plans">Browse Available Plans</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Plan Card */}
          <Card className="lg:col-span-2 bg-[#0b141a] border-border/40 shadow-2xl overflow-hidden flex flex-col rounded-2xl">
            <div className="h-2 bg-gradient-to-r from-primary via-emerald-400 to-primary w-full" />
            <CardHeader className="bg-[#162129] p-8 border-b border-border/10">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                   <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] uppercase font-bold px-3 py-1">Secure Active Instance</Badge>
                   <CardTitle className="text-4xl font-black text-white mt-4">{activePlan.planName}</CardTitle>
                </div>
                <div className="text-right">
                   <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Billing Rate</p>
                   <p className="text-2xl font-black text-[#16a34a]">৳{activePlan.price}<span className="text-xs font-medium text-muted-foreground">/{activePlan.billingCycle === 'monthly' ? 'mo' : 'yr'}</span></p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-10 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-1.5 p-4 bg-[#162129] rounded-xl border border-border/10">
                   <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                     <Calendar className="h-3 w-3 text-primary" /> Started
                   </p>
                   <p className="font-bold text-slate-100">{startDate ? format(startDate, 'MMM dd, yyyy') : "—"}</p>
                </div>
                <div className="space-y-1.5 p-4 bg-[#162129] rounded-xl border border-border/10">
                   <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                     <Clock className="h-3 w-3 text-amber-500" /> Renew Date
                   </p>
                   <p className="font-bold text-slate-100">{expiryDate ? format(expiryDate, 'MMM dd, yyyy') : "—"}</p>
                </div>
                <div className="space-y-1.5 p-4 bg-[#162129] rounded-xl border border-border/10">
                   <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                     <Zap className="h-3 w-3 text-[#16a34a]" /> Access Left
                   </p>
                   <Badge variant="secondary" className="bg-[#16a34a]/20 text-[#16a34a] text-xs font-black px-3">
                     {daysLeft} Days Remaining
                   </Badge>
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex items-center gap-2">
                   <div className="h-px flex-1 bg-border/10" />
                   <p className="text-[10px] uppercase font-black text-muted-foreground tracking-[0.2em]">Active Subscription Benefits</p>
                   <div className="h-px flex-1 bg-border/10" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activePlan.benefits?.map((benefit: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-slate-300 font-medium">
                      <div className="h-5 w-5 rounded-full bg-[#16a34a]/10 flex items-center justify-center">
                        <CheckCircle2 size={12} className="text-[#16a34a]" />
                      </div>
                      {benefit}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-[#162129]/50 p-6 border-t border-border/10 flex justify-between items-center">
               <p className="text-[10px] text-muted-foreground font-medium italic">Auto-renewal is active via linked payment method.</p>
               <Button variant="ghost" className="text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10">
                 Request Cancellation
               </Button>
            </CardFooter>
          </Card>

          {/* Real-time Limits */}
          <div className="space-y-6">
            <Card className="bg-[#0b141a] border-border/40 p-6 shadow-2xl rounded-2xl">
               <CardHeader className="p-0 pb-6 flex flex-row items-center justify-between space-y-0">
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">System Quotas</p>
                  <CreditCard className="h-4 w-4 text-primary" />
               </CardHeader>
               <CardContent className="p-0 space-y-8">
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs mb-1 items-end">
                      <span className="text-slate-400 font-bold uppercase tracking-tighter">Brand Slots</span>
                      <span className="text-white font-black text-lg">{activePlan.maxApiKeys} Max</span>
                    </div>
                    <div className="h-2 w-full bg-secondary/20 rounded-full overflow-hidden p-[1px] border border-border/5">
                       <div className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(22,163,74,0.5)]" style={{ width: '20%' }} />
                    </div>
                    <p className="text-[9px] text-muted-foreground text-right font-bold uppercase">1 Identity Registered</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-xs mb-1 items-end">
                      <span className="text-slate-400 font-bold uppercase tracking-tighter">Device Nodes</span>
                      <span className="text-white font-black text-lg">{activePlan.maxDevices} Max</span>
                    </div>
                    <div className="h-2 w-full bg-secondary/20 rounded-full overflow-hidden p-[1px] border border-border/5">
                       <div className="h-full bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" style={{ width: '0%' }} />
                    </div>
                    <p className="text-[9px] text-muted-foreground text-right font-bold uppercase">0 Connected Nodes</p>
                  </div>
               </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#162129] to-[#0b141a] border-border/20 p-6 shadow-2xl relative overflow-hidden group rounded-2xl">
               <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                  <HelpCircle size={100} />
               </div>
               <h4 className="font-black text-slate-100 text-sm mb-2 uppercase tracking-tight">Enterprise Scaling?</h4>
               <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
                 Hitting your plan limits? We provide custom node architecture for merchants processing 10k+ daily transactions.
               </p>
               <Button variant="link" className="p-0 h-auto text-[10px] font-black text-primary mt-6 uppercase tracking-widest hover:no-underline hover:text-emerald-400 transition-colors">
                 Talk to Account Manager →
               </Button>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
