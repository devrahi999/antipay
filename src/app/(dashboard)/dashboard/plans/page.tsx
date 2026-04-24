'use client';

import { useState } from 'react';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, Zap, Loader2, Sparkles, Clock, AlertCircle, Infinity as InfinityIcon, RefreshCcw, ArrowUpCircle, Lock, Terminal, X } from "lucide-react"
import { useToast } from '@/hooks/use-toast';
import { createPlanPaymentSession } from '@/app/actions/payment';

export default function BrowsePlansPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isProcessing, setIsSubmitting] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [debug, setDebug] = useState("");

  // Fetch current user profile to see active plan ID
  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);
  const { data: profile } = useDoc(profileRef);

  // Fetch all available plans
  const plansQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'subscriptionPlans'), orderBy('price', 'asc'));
  }, [db]);
  const { data: plans, isLoading } = useCollection(plansQuery);

  const handleSelectPlan = async (plan: any) => {
    if (!user || !db) return;
    setIsSubmitting(plan.id);
    setDebug("Initiating request...");

    try {
      const response = await createPlanPaymentSession(user.uid, plan.id, plan.price);
      
      setDebug(response.debug || "No debug info returned.");

      if (!response.success) {
        throw new Error(response.error || "Could not initiate payment.");
      }

      if (!response.paymentUrl) {
        throw new Error("No redirection URL received from gateway.");
      }

      toast({ title: "Redirecting...", description: "Connecting to secure payment gateway." });
      window.location.replace(response.paymentUrl);
    } catch (error: any) {
      console.error('PAYMENT INITIATION FAILED:', error);
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: error.message || "Could not initiate payment session."
      });
      setIsSubmitting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse font-bold tracking-widest uppercase">Initializing Payment Vault...</p>
      </div>
    );
  }

  const currentPlanId = profile?.subscriptionPlanId;
  const expiryDate = profile?.subscriptionExpiresAt?.toDate ? profile.subscriptionExpiresAt.toDate() : null;
  const isExpired = expiryDate ? expiryDate < new Date() : true;
  
  const filteredPlans = plans?.filter(p => p.billingCycle === billingCycle);

  return (
    <div className="space-y-10 max-w-6xl mx-auto py-6 font-body pb-32">
      <div className="flex flex-col items-center text-center space-y-4">
        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-4 py-1 font-bold">
          INFRASTRUCTURE UPGRADE
        </Badge>
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground tracking-tight">Scale Your Operations</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Choose the plan that fits your business volume. All plans include 99.9% uptime and automated verification.
        </p>

        <Tabs defaultValue="monthly" className="w-[450px] mt-8" onValueChange={setBillingCycle}>
          <TabsList className="grid w-full grid-cols-3 bg-[#162129] border border-border/10 p-1 rounded-full h-12">
            <TabsTrigger value="monthly" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white font-bold transition-all">Monthly</TabsTrigger>
            <TabsTrigger value="yearly" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white font-bold transition-all">Yearly</TabsTrigger>
            <TabsTrigger value="lifetime" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white font-bold transition-all">Lifetime</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPlans && filteredPlans.length > 0 ? (
          filteredPlans.map((plan) => {
            const isCurrent = currentPlanId === plan.id;
            const hasOtherPlan = currentPlanId && !isCurrent;
            const isTrial = plan.isFreeTrialAvailable;
            const isLifetime = plan.billingCycle === 'lifetime';
            const isRenewDisabled = isCurrent && (!isExpired || isLifetime);
            
            return (
              <Card key={plan.id} className={`relative shadow-2xl border-2 transition-all duration-300 hover:-translate-y-2 flex flex-col overflow-hidden ${isCurrent ? "border-primary bg-primary/5 ring-8 ring-primary/5" : "border-border/40 bg-card/40"}`}>
                {isCurrent && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-5 py-1.5 rounded-bl-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl flex items-center gap-1.5">
                    <Check className="h-3 w-3" /> {isExpired ? "Expired Instance" : "Active Instance"}
                  </div>
                )}
                
                {isTrial && !currentPlanId && (
                  <div className="absolute top-4 right-4 animate-pulse">
                     <Badge className="bg-amber-500 hover:bg-amber-500 text-[9px] uppercase font-black px-2 py-0.5 shadow-lg shadow-amber-500/20">
                       <Clock className="h-2 w-2 mr-1" /> 1 Month Free
                     </Badge>
                  </div>
                )}

                <CardHeader className="pb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                       {plan.billingCycle === 'lifetime' ? <InfinityIcon className="h-7 w-7" /> : <Zap className="h-7 w-7" />}
                    </div>
                    {plan.price > 2000 && <Sparkles className="h-6 w-6 text-amber-500" />}
                  </div>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    {plan.billingCycle} {plan.billingCycle === 'lifetime' ? 'Access' : 'Recurring'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 space-y-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">৳{plan.price}</span>
                    <span className="text-muted-foreground text-sm font-medium">/{plan.billingCycle === 'monthly' ? 'month' : plan.billingCycle === 'yearly' ? 'year' : 'lifetime'}</span>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] uppercase font-black text-primary/70 tracking-widest">Included Features</p>
                    <ul className="space-y-3">
                      {plan.benefits && plan.benefits.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3 text-sm">
                          <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 border border-primary/10">
                            <Check className="h-3 w-3 text-primary" />
                          </div>
                          <span className="text-foreground/80 leading-snug">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>

                <CardFooter className="bg-secondary/10 p-6">
                  <Button 
                    variant={isCurrent ? "outline" : "default"} 
                    className={`w-full font-black h-12 text-md transition-all ${isCurrent ? "border-primary text-primary hover:bg-primary/5" : "bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20"}`}
                    disabled={isProcessing === plan.id || isRenewDisabled}
                    onClick={() => handleSelectPlan(plan)}
                  >
                    {isProcessing === plan.id ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : isCurrent ? (
                      isRenewDisabled ? (
                        <span className="flex items-center gap-2"><Lock className="h-4 w-4" /> Plan is Active</span>
                      ) : (
                        <span className="flex items-center gap-2"><RefreshCcw className="h-4 w-4" /> Renew This Plan</span>
                      )
                    ) : hasOtherPlan ? (
                      <span className="flex items-center gap-2"><ArrowUpCircle className="h-4 w-4" /> Upgrade to {plan.name}</span>
                    ) : (
                      `Activate ${plan.name}`
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full text-center py-24 bg-[#0b141a] rounded-[2.5rem] border-2 border-dashed border-border/20 shadow-inner">
            <Zap className="mx-auto h-16 w-16 text-muted-foreground/10 mb-4" />
            <h3 className="text-xl font-bold text-slate-100 uppercase tracking-tighter">Financial Signal Missing</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2 text-xs">
              No plans available for this cycle yet. Please check other options.
            </p>
          </div>
        )}
      </div>

      <div className="bg-[#162129] p-8 rounded-2xl border border-border/10 flex flex-col md:flex-row items-center gap-6 justify-between shadow-xl">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
             <AlertCircle size={28} />
          </div>
          <div>
            <h4 className="font-bold text-slate-100">Merchant Safety Promise</h4>
            <p className="text-xs text-muted-foreground">All data is encrypted. Cancel your subscription anytime from the portal.</p>
          </div>
        </div>
        <Button variant="link" className="text-primary font-bold">Need custom limits? Contact Enterprise Billing →</Button>
      </div>

      {/* Debug Console */}
      {debug && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0b141a] border-t border-primary/20 shadow-2xl p-4 animate-in slide-in-from-bottom duration-300">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[10px] font-black uppercase text-primary flex items-center gap-2">
                <Terminal className="h-3 w-3" /> Gateway Debug Console
              </h4>
              <button onClick={() => setDebug("")} className="text-muted-foreground hover:text-white p-1">
                <X className="h-4 w-4" />
              </button>
            </div>
            <pre className="bg-black/50 p-4 rounded-xl text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-[150px] border border-white/5">
              {debug}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
