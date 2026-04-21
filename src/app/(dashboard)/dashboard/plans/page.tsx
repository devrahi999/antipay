'use client';

import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Zap, Loader2, Sparkles, Clock } from "lucide-react"
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function BrowsePlansPage() {
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
      description: "This is a payment simulation. In production, you would be redirected to a payment gateway.",
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

  const currentPlanId = profile?.subscriptionPlanId;

  return (
    <div className="space-y-10 max-w-6xl mx-auto py-6">
      <div className="flex flex-col items-center text-center space-y-4">
        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-4 py-1">
          Growth & Scaling
        </Badge>
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground">Choose Your Plan</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Select the infrastructure that fits your business volume. Upgrade or downgrade anytime as your requirements change.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans && plans.length > 0 ? (
          plans.map((plan) => {
            const isCurrent = currentPlanId === plan.id;
            return (
              <Card key={plan.id} className={`relative shadow-xl border-2 transition-all duration-300 hover:-translate-y-1 flex flex-col overflow-hidden ${isCurrent ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "border-border/50 bg-card/50"}`}>
                {isCurrent && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 rounded-bl-xl text-[10px] font-bold uppercase tracking-widest shadow-lg">
                    Current Selection
                  </div>
                )}
                <CardHeader className="pb-8">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                       <Zap className="h-6 w-6" />
                    </div>
                    {plan.price > 2000 && <Sparkles className="h-5 w-5 text-amber-500" />}
                  </div>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-xs font-bold uppercase tracking-tighter text-muted-foreground">
                    {plan.billingCycle} BILLING CYCLE
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">৳{plan.price}</span>
                    <span className="text-muted-foreground text-sm">/{plan.billingCycle === 'monthly' ? 'month' : 'year'}</span>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Included Features</p>
                    <ul className="space-y-3">
                      {plan.benefits && plan.benefits.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3 text-sm">
                          <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="h-3 w-3 text-primary" />
                          </div>
                          <span className="text-foreground/80">{feature}</span>
                        </li>
                      ))}
                      <li className="flex items-start gap-3 text-sm pt-4 border-t border-border/10">
                        <Badge variant="outline" className="text-[9px] uppercase border-primary/20 text-primary">Limit</Badge>
                        <span className="font-semibold">{plan.maxApiKeys} Brand Identit{plan.maxApiKeys > 1 ? 'ies' : 'y'}</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm">
                         <Badge variant="outline" className="text-[9px] uppercase border-primary/20 text-primary">Limit</Badge>
                        <span className="font-semibold">{plan.maxDevices} Connected Device{plan.maxDevices > 1 ? 's' : ''}</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="bg-secondary/10 p-6">
                  <Button 
                    variant={isCurrent ? "outline" : "default"} 
                    className={`w-full font-bold h-12 text-md ${!isCurrent && "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"}`}
                    disabled={isCurrent}
                    onClick={() => handleSelectPlan(plan)}
                  >
                    {isCurrent ? "Already Active" : `Select ${plan.name}`}
                  </Button>
                </CardFooter>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full text-center py-24 bg-[#162129] rounded-[2rem] border-2 border-dashed border-border/20">
            <Sparkles className="mx-auto h-16 w-16 text-muted-foreground/20 mb-4" />
            <h3 className="text-xl font-bold text-slate-100">No Plans Available</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2">
              The billing engine is currently being updated. Please check back later.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
