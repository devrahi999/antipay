'use client';

import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Zap, CreditCard, Clock, Loader2, Sparkles } from "lucide-react"
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function SubscriptionPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  // Fetch current user subscription state
  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);
  const { data: profile } = useDoc(profileRef);

  // Fetch all plans
  const plansQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'subscriptionPlans'), orderBy('price', 'asc'));
  }, [db]);

  const { data: plans, isLoading } = useCollection(plansQuery);

  const handleSelectPlan = (plan: any) => {
    toast({
      title: `Plan Selected: ${plan.name}`,
      description: "Redirecting to checkout... (Simulation)",
    });
  };

  const handleStartTrial = (plan: any) => {
    toast({
      title: "Free Trial Initiated",
      description: `You now have 30 days of ${plan.name} access.`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse">Fetching latest plans...</p>
      </div>
    );
  }

  const currentPlanId = profile?.subscriptionPlanId || 'starter';

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-headline font-bold text-foreground">Plans & Pricing</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose the right plan to power your business payments. Every plan includes our 99.9% uptime guarantee.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans && plans.length > 0 ? (
          plans.map((plan) => {
            const isCurrent = currentPlanId === plan.id;
            return (
              <Card key={plan.id} className={`relative shadow-xl border-2 transition-all duration-300 hover:-translate-y-1 flex flex-col ${isCurrent ? "border-primary bg-primary/5" : "border-border/50 bg-card/50"}`}>
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">
                    Active Plan
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl font-bold flex items-center justify-between">
                    {plan.name}
                    {plan.price > 2000 && <Sparkles className="h-5 w-5 text-amber-500" />}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-tight">
                      {plan.billingCycle}
                    </Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">৳{plan.price}</span>
                    <span className="text-muted-foreground text-sm">/{plan.billingCycle === 'monthly' ? 'month' : 'year'}</span>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">What's Included</p>
                    <ul className="space-y-3">
                      {plan.benefits && plan.benefits.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3 text-sm">
                          <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="h-3 w-3 text-primary" />
                          </div>
                          <span className="text-foreground/80">{feature}</span>
                        </li>
                      ))}
                      <li className="flex items-start gap-3 text-sm pt-2 border-t border-border/10">
                        <Zap className="h-4 w-4 text-amber-500 shrink-0" />
                        <span className="font-semibold">{plan.maxApiKeys} Store Identit{plan.maxApiKeys > 1 ? 'ies' : 'y'}</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm">
                        <Zap className="h-4 w-4 text-amber-500 shrink-0" />
                        <span className="font-semibold">{plan.maxDevices} Active Device{plan.maxDevices > 1 ? 's' : ''}</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                  <Button 
                    variant={isCurrent ? "outline" : "default"} 
                    className={`w-full font-bold h-11 ${!isCurrent && "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"}`}
                    disabled={isCurrent}
                    onClick={() => handleSelectPlan(plan)}
                  >
                    {isCurrent ? "Current Selection" : `Upgrade to ${plan.name}`}
                  </Button>
                  
                  {!isCurrent && plan.isFreeTrialAvailable && (
                    <Button 
                      variant="ghost" 
                      className="w-full text-xs text-primary hover:bg-primary/5 h-8"
                      onClick={() => handleStartTrial(plan)}
                    >
                      <Clock className="mr-2 h-3.5 w-3.5" /> Start 30-Day Free Trial
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full text-center py-20 bg-secondary/10 rounded-3xl border-2 border-dashed border-border/40">
            <Sparkles className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-bold">No Plans Available</h3>
            <p className="text-muted-foreground">The system administrator is currently updating our tiers.</p>
          </div>
        )}
      </div>

      <Card className="shadow-sm border-none bg-secondary/30 rounded-3xl p-2">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" /> Active Billing Details
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Default Payment</p>
            <p className="font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" /> bKash Auto-pay
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Billing Date</p>
            <p className="font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" /> Next: {new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString()}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Plan Status</p>
            <p className="font-medium flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" /> Fully Managed
            </p>
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          <Button variant="link" className="text-primary text-xs font-bold p-0">Request Full Billing History</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
