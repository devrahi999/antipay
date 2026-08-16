'use client';

import { useState } from 'react';
import { useFirestore, useUser, useDoc, useMemoFirebase, useCollection } from '@/firebase';
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
  Loader2,
  Trash2,
  Infinity as InfinityIcon,
  SmartphoneNfc,
  Tags,
  RefreshCcw,
  ShieldAlert
} from "lucide-react"
import { doc, deleteField, serverTimestamp, query, collection, where, writeBatch, limit } from 'firebase/firestore';
import Link from 'next/link';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  getDaysRemaining,
  getPlanExpiry,
  getPlanState,
  isExpiringSoon,
  isLifetimePlan,
  toDate
} from '@/lib/plan';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function MySubscriptionPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isCanceling, setIsCanceling] = useState(false);

  // Fetch real plan details from user_plans (This is the source of truth for quotas)
  const activePlanRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'user_plans', user.uid);
  }, [db, user?.uid]);
  
  const { data: activePlan, isLoading: isPlanLoading } = useDoc(activePlanRef);

  // Fetch real-time count of brands/stores
  // (`limit(100)` keeps this within the `stores` list rule: request.query.limit <= 100)
  const storesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'stores'), where('userId', '==', user.uid), limit(100));
  }, [db, user?.uid]);
  const { data: stores } = useCollection(storesQuery);

  // Fetch real-time count of connected devices
  const devicesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'devices'), where('userId', '==', user.uid));
  }, [db, user?.uid]);
  const { data: devices } = useCollection(devicesQuery);

  const handleCancelSubscription = async () => {
    if (!user || !db) return;
    setIsCanceling(true);
    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'user_plans', user.uid));
      batch.update(doc(db, 'users', user.uid), {
        subscriptionPlanId: deleteField(),
        subscriptionStartedAt: deleteField(),
        subscriptionExpiresAt: deleteField(),
        updatedAt: serverTimestamp()
      });
      // Deactivate stores when subscription canceled.
      // `status` is the field the payment gateway checks, so both must be set —
      // flipping only `isActive` would leave the API keys live.
      if (stores) {
        stores.forEach((store) => {
          batch.update(doc(db, 'stores', store.id), {
            status: 'inactive',
            isActive: false,
            deactivatedReason: 'subscription_canceled',
            updatedAt: serverTimestamp()
          });
        });
      }
      await batch.commit();
      toast({ title: "Subscription Canceled", description: "Plan removed. All API brand slots deactivated." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Cancellation Failed", description: error.message });
    } finally {
      setIsCanceling(false);
    }
  };

  if (isPlanLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="text-sm font-bold text-muted-foreground animate-pulse tracking-widest uppercase">Fetching Vault Access...</p>
      </div>
    );
  }

  // Validity is derived from `expiresAt` + `billingCycle`, never from `!!activePlan`.
  // An expired plan is treated exactly like no plan at all.
  const planState = getPlanState(activePlan);
  const hasActivePlan = planState === 'active';
  const isExpired = planState === 'expired';
  const isLifetime = isLifetimePlan(activePlan);
  const startDate = toDate(activePlan?.activatedAt);
  const expiryDate = getPlanExpiry(activePlan); // null for lifetime — no renew date
  const daysLeft = getDaysRemaining(activePlan) ?? 0;
  const expiringSoon = isExpiringSoon(activePlan);

  // Real Quota Calculations based on database results
  const brandsCount = stores?.length || 0;
  const devicesCount = devices?.length || 0;
  const maxBrands = activePlan?.maxApiKeys || 1;
  const maxDevices = activePlan?.maxDevices || 1;
  
  const brandsPercent = Math.min(100, (brandsCount / maxBrands) * 100);
  const devicesPercent = Math.min(100, (devicesCount / maxDevices) * 100);

  return (
    <div className="space-y-8 py-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground">My Subscription</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your AntiPay API quotas and billing timeline.</p>
        </div>
        <Button asChild className="bg-[#16a34a] hover:bg-[#15803d] font-bold shadow-lg shadow-[#16a34a]/20">
          <Link href="/dashboard/plans">
            {isExpired ? (
              <><RefreshCcw className="mr-2 h-4 w-4" /> Renew Plan</>
            ) : (
              <><ArrowUpCircle className="mr-2 h-4 w-4" /> {hasActivePlan ? "Upgrade Plan" : "Get a Plan"}</>
            )}
          </Link>
        </Button>
      </div>

      {expiringSoon && (
        <Card className="bg-amber-500/5 border-amber-500/30 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
            <Clock size={20} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-black text-amber-400 uppercase tracking-tight">
              Expiring in {daysLeft} {daysLeft === 1 ? 'Day' : 'Days'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Renew before {expiryDate ? format(expiryDate, 'MMM dd, yyyy') : 'expiry'} to keep your brands live — access is
              revoked automatically when the validity ends.
            </p>
          </div>
          <Button asChild size="sm" variant="outline" className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 font-bold h-9 px-5 rounded-xl">
            <Link href="/dashboard/plans">Renew Now</Link>
          </Button>
        </Card>
      )}

      {isExpired ? (
        <Card className="bg-[#0b141a] border-2 border-dashed border-rose-500/30 p-12 text-center flex flex-col items-center gap-6 shadow-2xl rounded-3xl">
          <div className="h-20 w-20 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 shadow-inner">
            <ShieldAlert size={40} />
          </div>
          <div className="space-y-3">
            <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-[10px] uppercase font-bold px-3 py-1">
              Subscription Expired
            </Badge>
            <h3 className="text-2xl font-black text-slate-100 uppercase tracking-tight">Access Revoked</h3>
            <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
              Your <span className="font-bold text-slate-200">{activePlan?.planName || 'subscription'}</span> plan validity
              ended{expiryDate ? ` on ${format(expiryDate, 'MMM dd, yyyy')}` : ''}. All brands have been deactivated and your
              API keys will no longer verify payments. Renew to restore everything instantly.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button asChild className="bg-[#16a34a] hover:bg-[#15803d] h-12 px-10 font-black rounded-xl shadow-xl shadow-[#16a34a]/20">
              <Link href="/dashboard/plans"><RefreshCcw className="mr-2 h-4 w-4" /> Renew Subscription</Link>
            </Button>
            <Button asChild variant="outline" className="h-12 px-8 font-bold rounded-xl border-border/20">
              <Link href="/dashboard/brands">Review My Brands</Link>
            </Button>
          </div>
          {(brandsCount > 0 || devicesCount > 0) && (
            <p className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest pt-2">
              {brandsCount} brand(s) · {devicesCount} device node(s) currently suspended
            </p>
          )}
        </Card>
      ) : !hasActivePlan ? (
        <Card className="bg-[#0b141a] border-2 border-dashed border-primary/20 p-12 text-center flex flex-col items-center gap-6 shadow-2xl rounded-3xl">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <Zap size={40} className="animate-pulse" />
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-black text-slate-100 uppercase tracking-tight">Access Locked</h3>
            <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
              You haven't activated an AntiPay subscription yet. To start verifying payments, please select a plan.
            </p>
          </div>
          <Button asChild className="mt-4 bg-[#16a34a] hover:bg-[#15803d] h-12 px-10 font-black rounded-xl shadow-xl shadow-[#16a34a]/20">
             <Link href="/dashboard/plans">Browse Available Plans</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                   <p className="text-2xl font-black text-[#16a34a]">৳{activePlan.price}<span className="text-xs font-medium text-muted-foreground">/{activePlan.billingCycle === 'monthly' ? 'mo' : activePlan.billingCycle === 'yearly' ? 'yr' : 'lifetime'}</span></p>
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
                   <p className="font-bold text-slate-100">{isLifetime ? "Never" : (expiryDate ? format(expiryDate, 'MMM dd, yyyy') : "—")}</p>
                </div>
                <div className="space-y-1.5 p-4 bg-[#162129] rounded-xl border border-border/10">
                   <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                     {isLifetime ? <InfinityIcon className="h-3 w-3 text-[#16a34a]" /> : <Zap className="h-3 w-3 text-[#16a34a]" />} Access Left
                   </p>
                   <Badge variant="secondary" className="bg-[#16a34a]/20 text-[#16a34a] text-xs font-black px-3">
                     {isLifetime ? "Unlimited" : `${daysLeft} Days Remaining`}
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
               <p className="text-[10px] text-muted-foreground font-medium italic">
                 {isLifetime ? "One-time purchase, no recurring billing." : "Auto-renewal is active."}
               </p>
               
               <AlertDialog>
                 <AlertDialogTrigger asChild>
                    <button className="text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors">
                      Request Cancellation
                    </button>
                 </AlertDialogTrigger>
                 <AlertDialogContent className="bg-[#0b141a] border-border/20 text-white">
                   <AlertDialogHeader>
                     <AlertDialogTitle className="text-xl font-bold flex items-center gap-2">
                       <AlertCircle className="text-rose-500" /> Cancel Subscription?
                     </AlertDialogTitle>
                     <AlertDialogDescription className="text-muted-foreground">
                       This will immediately revoke your API brand slots and deactivate all processing nodes.
                     </AlertDialogDescription>
                   </AlertDialogHeader>
                   <AlertDialogFooter>
                     <AlertDialogCancel className="bg-secondary/10 hover:bg-secondary/20 border-none text-white">Keep My Plan</AlertDialogCancel>
                     <AlertDialogAction 
                       className="bg-rose-500 hover:bg-rose-600 text-white font-bold"
                       onClick={handleCancelSubscription}
                       disabled={isCanceling}
                     >
                       {isCanceling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />} Yes, Cancel Access
                     </AlertDialogAction>
                   </AlertDialogFooter>
                 </AlertDialogContent>
               </AlertDialog>
            </CardFooter>
          </Card>

          <div className="space-y-6">
            <Card className="bg-[#0b141a] border-border/40 p-6 shadow-2xl rounded-2xl">
               <CardHeader className="p-0 pb-6 flex flex-row items-center justify-between space-y-0">
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">System Quotas</p>
                  <CreditCard className="h-4 w-4 text-primary" />
               </CardHeader>
               <CardContent className="p-0 space-y-8">
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs mb-1 items-end">
                      <span className="text-slate-400 font-bold uppercase tracking-tighter flex items-center gap-1.5">
                        <Tags size={12} className="text-primary" /> Brand Slots
                      </span>
                      <span className="text-white font-black text-lg">{brandsCount}/{maxBrands}</span>
                    </div>
                    <div className="h-2 w-full bg-secondary/20 rounded-full overflow-hidden p-[1px] border border-border/5">
                       <div 
                         className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(22,163,74,0.5)] transition-all duration-1000" 
                         style={{ width: `${brandsPercent}%` }} 
                       />
                    </div>
                    <p className="text-[9px] text-muted-foreground text-right font-bold uppercase">Identity Monitoring Active</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-xs mb-1 items-end">
                      <span className="text-slate-400 font-bold uppercase tracking-tighter flex items-center gap-1.5">
                        <SmartphoneNfc size={12} className="text-amber-500" /> Device Nodes
                      </span>
                      <span className="text-white font-black text-lg">{devicesCount}/{maxDevices}</span>
                    </div>
                    <div className="h-2 w-full bg-secondary/20 rounded-full overflow-hidden p-[1px] border border-border/5">
                       <div 
                         className="h-full bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)] transition-all duration-1000" 
                         style={{ width: `${devicesPercent}%` }} 
                       />
                    </div>
                    <p className="text-[9px] text-muted-foreground text-right font-bold uppercase">Node Synchronization Ready</p>
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
