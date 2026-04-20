import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Zap, CreditCard, Clock } from "lucide-react"

export default function SubscriptionPage() {
  const plans = [
    {
      name: "Starter",
      price: "৳0",
      period: "/month",
      description: "Perfect for testing and small side projects.",
      features: ["1 Active Store", "Basic Analytics", "Standard Support", "3% Transaction Fee"],
      current: false,
      cta: "Switch to Starter"
    },
    {
      name: "Professional",
      price: "৳2,500",
      period: "/month",
      description: "For growing businesses needing more power.",
      features: ["Unlimited Stores", "Priority Payouts", "Advanced Monitoring", "1% Transaction Fee"],
      current: true,
      cta: "Current Plan"
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "Large scale operations with custom needs.",
      features: ["Dedicated Support", "API Rate Limit Increases", "SLA Guarantee", "Custom Volume Pricing"],
      current: false,
      cta: "Contact Sales"
    }
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold text-foreground">Subscription</h1>
        <p className="text-muted-foreground">Manage your billing and account access levels.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card key={plan.name} className={`shadow-sm border-2 ${plan.current ? "border-primary" : "border-transparent"} flex flex-col`}>
            {plan.current && (
              <div className="bg-primary text-primary-foreground text-center py-1 text-xs font-bold uppercase tracking-widest">
                Active Plan
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                variant={plan.current ? "outline" : "default"} 
                className={`w-full ${!plan.current && "bg-primary hover:bg-primary/90"}`}
                disabled={plan.current}
              >
                {plan.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card className="shadow-sm border-none bg-secondary/30">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" /> Billing Details
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Payment Method</p>
            <p className="font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-accent" /> bKash Auto-pay
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Next Billing Date</p>
            <p className="font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Oct 12, 2024
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Estimated Amount</p>
            <p className="font-medium">৳2,500.00</p>
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          <Button variant="link" className="text-primary p-0">View Billing History</Button>
        </CardFooter>
      </Card>
    </div>
  )
}