
'use client';

import { useState } from 'react';
import { collection, query, orderBy, doc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, Zap, Loader2, Sparkles, Clock, AlertCircle } from "lucide-react"
import { useToast } from '@/hooks/use-toast';

export default function BrowsePlansPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isProcessing, setIsSubmitting] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState('monthly');

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

    try {
      // Calculate expiry (30 days from now)
      const now = new Date();
      const expiry = new Date();
      expiry.setDate(now.getDate() + 30);

      // 1. Update/Create user_plans/{userId} document
      const userPlanRef = doc(db, 'user_plans', user.uid);
      await setDoc(userPlanRef, {
        userId: user.uid,
        planId: plan.id,
        planName: plan.name,
        price: plan.price,
        billingCycle: plan.billingCycle,
        maxApiKeys: plan.maxApiKeys,
        maxDevices: plan.maxDevices,
        benefits: plan.benefits || [],
        activatedAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(expiry),
        updatedAt: serverTimestamp()
      });

      // 2. Sync profile subscription ID
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        subscriptionPlanId: plan.id,
        subscriptionStartedAt: serverTimestamp(),
        subscriptionExpiresAt: Timestamp.fromDate(expiry),
        updatedAt: serverTimestamp()
      }, { merge: true });

      toast({
        title: "Plan Activated!",
        description: `You are now subscribed to the ${plan.name}.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Activation Failed",
        description: error.message || "Please try again later."
      });
    } finally {
      setIsSubmitting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse">Loading secure payment gateway...</p>
      </div>
    );
  }

  const currentPlanId = profile?.subscriptionPlanId;
  const filteredPlans = plans?.filter(p => p.billingCycle === billingCycle);

  return (
    <div className="space-y-10 max-w-6xl mx-auto py-6">
      <div className="flex flex-col items-center text-center space-y-4">
        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-4 py-1 font-bold">
          Upgrade Center
        </Badge>
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground">Scale Your Business</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Select the infrastructure that fits your transaction volume. All plans include automated SMS verification.
        </p>

        <Tabs defaultValue="monthly" className="w-[300px] mt-8" onValueChange={setBillingCycle}>
          <TabsList className="grid w-full grid-cols-2 bg-[#162129] border border-border/10 p-1 rounded-full h-12">
            <TabsTrigger value="monthly" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white font-bold transition-all">Monthly</TabsTrigger>
            <TabsTrigger value="yearly" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white font-bold transition-all">Yearly</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPlans && filteredPlans.length > 0 ? (
          filteredPlans.map((plan) => {
            const isCurrent = currentPlanId === plan.id;
            const isTrial = plan.isFreeTrialAvailable;
            
            return (
              <Card key={plan.id} className={`relative shadow-2xl border-2 transition-all duration-300 hover:-translate-y-2 flex flex-col overflow-hidden ${isCurrent ? "border-primary bg-primary/5 ring-8 ring-primary/5" : "border-border/40 bg-card/40"}`}>
                {isCurrent && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-5 py-1.5 rounded-bl-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl flex items-center gap-1.5">
                    <Check className="h-3 w-3" /> Active Plan
                  </div>
                )}
                
                {isTrial && !isCurrent && (
                  <div className="absolute top-4 right-4 animate-pulse">
                     <Badge className="bg-amber-500 hover:bg-amber-500 text-[9px] uppercase font-black px-2 py-0.5 shadow-lg shadow-amber-500/20">
                       <Clock className="h-2 w-2 mr-1" /> 1 Month Free
                     </Badge>
                  </div>
                )}

                <CardHeader className="pb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                       <Zap className="h-7 w-7" />
                    </div>
                    {plan.price > 2000 && <Sparkles className="h-6 w-6 text-amber-500" />}
                  </div>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    {plan.billingCycle} Recurring
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 space-y-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">৳{plan.price}</span>
                    <span className="text-muted-foreground text-sm font-medium">/{plan.billingCycle === 'monthly' ? 'month' : 'year'}</span>
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
                      <div className="pt-4 mt-4 border-t border-border/10 space-y-3">
                        <li className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Brand Limit</span>
                          <Badge variant="outline" className="font-bold border-primary/20 bg-primary/5 text-primary">
                            {plan.maxApiKeys} Identit{plan.maxApiKeys > 1 ? 'ies' : 'y'}
                          </Badge>
                        </li>
                        <li className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Device Limit</span>
                          <Badge variant="outline" className="font-bold border-primary/20 bg-primary/5 text-primary">
                            {plan.maxDevices} Active Device{plan.maxDevices > 1 ? 's' : ''}
                          </Badge>
                        </li>
                      </div>
                    </ul>
                  </div>
                </CardContent>

                <CardFooter className="bg-secondary/10 p-6">
                  <Button 
                    variant={isCurrent ? "outline" : "default"} 
                    className={`w-full font-black h-12 text-md transition-all ${!isCurrent ? "bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20" : "border-primary/20 text-primary"}`}
                    disabled={isCurrent || isProcessing === plan.id}
                    onClick={() => handleSelectPlan(plan)}
                  >
                    {isProcessing === plan.id ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : isCurrent ? (
                      "Stay on this Plan"
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
            <h3 className="text-xl font-bold text-slate-100">No {billingCycle} plans found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2">
              Please check back later or switch the billing cycle.
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
            <h4 className="font-bold text-slate-100">Safe Billing Promise</h4>
            <p className="text-xs text-muted-foreground">All transactions are encrypted. Cancel your subscription at any time.</p>
          </div>
        </div>
        <Button variant="link" className="text-primary font-bold">Contact Support for Enterprise Billing →</Button>
      </div>
    </div>
  )
}
