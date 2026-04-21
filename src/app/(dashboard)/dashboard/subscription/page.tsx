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
  AlertCircle
} from "lucide-react"
import { doc, getDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MySubscriptionPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [activePlan, setActivePlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch real profile data from Firestore
  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);
  const { data: profile } = useDoc(profileRef);

  useEffect(() => {
    async function fetchPlanDetails() {
      if (!db || !profile?.subscriptionPlanId) {
        setLoading(false);
        return;
      }
      const planRef = doc(db, 'subscriptionPlans', profile.subscriptionPlanId);
      const planSnap = await getDoc(planRef);
      if (planSnap.exists()) {
        setActivePlan({ id: planSnap.id, ...planSnap.data() });
      }
      setLoading(false);
    }
    fetchPlanDetails();
  }, [db, profile?.subscriptionPlanId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading subscription details...</p>
      </div>
    );
  }

  const hasActivePlan = !!profile?.subscriptionPlanId && activePlan;

  // Mock dates for display
  const startDate = profile?.subscriptionStartedAt?.toDate ? profile.subscriptionStartedAt.toDate() : new Date();
  const expiryDate = profile?.subscriptionExpiresAt?.toDate ? profile.subscriptionExpiresAt.toDate() : new Date(new Date().setDate(new Date().getDate() + 30));
  const daysLeft = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-8 py-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground">My Subscription</h1>
          <p className="text-muted-foreground text-sm mt-1">Monitor and manage your billing cycle and account limits.</p>
        </div>
        <Button asChild className="bg-[#16a34a] hover:bg-[#15803d] font-bold">
          <Link href="/dashboard/plans">
            <ArrowUpCircle className="mr-2 h-4 w-4" /> Change Plan
          </Link>
        </Button>
      </div>

      {!hasActivePlan ? (
        <Card className="bg-amber-500/5 border-amber-500/20 p-8 text-center flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
            <AlertCircle size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-100">No Active Plan Found</h3>
            <p className="text-muted-foreground max-w-md">
              You haven't subscribed to any plan yet. Subscribe now to start using AntiPay API for your business.
            </p>
          </div>
          <Button asChild className="mt-4 bg-[#16a34a] hover:bg-[#15803d]">
             <Link href="/dashboard/plans">Explore Plans</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Plan Card */}
          <Card className="lg:col-span-2 bg-[#0b141a] border-border/40 shadow-2xl overflow-hidden flex flex-col">
            <div className="h-2 bg-primary w-full" />
            <CardHeader className="bg-[#162129] p-8 border-b border-border/10">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                   <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] uppercase font-bold px-3">Active Now</Badge>
                   <CardTitle className="text-3xl font-bold text-white mt-3">{activePlan.name}</CardTitle>
                </div>
                <div className="text-right">
                   <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Pricing</p>
                   <p className="text-2xl font-bold text-[#16a34a]">৳{activePlan.price}<span className="text-xs text-muted-foreground">/{activePlan.billingCycle === 'monthly' ? 'mo' : 'yr'}</span></p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-1">
                   <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                     <Calendar className="h-3 w-3" /> Started On
                   </p>
                   <p className="font-medium text-slate-200">{startDate.toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                     <Clock className="h-3 w-3" /> Next Billing
                   </p>
                   <p className="font-medium text-slate-200">{expiryDate.toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                     <Zap className="h-3 w-3" /> Time Left
                   </p>
                   <Badge variant="secondary" className="bg-primary/10 text-primary text-xs font-bold">
                     {daysLeft} Days Remaining
                   </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Active Benefits</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activePlan.benefits?.map((benefit: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-[#16a34a]" />
                      {benefit}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-[#162129]/50 p-6 border-t border-border/10 flex justify-between items-center">
               <p className="text-[10px] text-muted-foreground italic">Manage your billing method in account settings.</p>
               <Button variant="ghost" className="text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10">
                 Cancel Subscription
               </Button>
            </CardFooter>
          </Card>

          {/* Quick Stats / Limits */}
          <div className="space-y-6">
            <Card className="bg-[#0b141a] border-border/40 p-6 shadow-xl">
               <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between space-y-0">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Resource Usage</p>
                  <CreditCard className="h-4 w-4 text-primary" />
               </CardHeader>
               <CardContent className="p-0 space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Brand Identities</span>
                      <span className="text-white font-bold">1 / {activePlan.maxApiKeys}</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary/20 rounded-full overflow-hidden">
                       <div className="h-full bg-primary" style={{ width: `${(1/activePlan.maxApiKeys)*100}%` }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Connected Devices</span>
                      <span className="text-white font-bold">0 / {activePlan.maxDevices}</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary/20 rounded-full overflow-hidden">
                       <div className="h-full bg-amber-500" style={{ width: '0%' }} />
                    </div>
                  </div>
               </CardContent>
            </Card>

            <Card className="bg-[#162129] border-none p-6 shadow-xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <HelpCircle size={80} />
               </div>
               <h4 className="font-bold text-slate-100 text-sm mb-2">Need a custom plan?</h4>
               <p className="text-[10px] text-muted-foreground leading-relaxed">
                 High volume merchant? We offer tailored solutions with enterprise SLA.
               </p>
               <Button variant="link" className="p-0 h-auto text-[10px] font-bold text-primary mt-4">
                 Contact Account Manager →
               </Button>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
