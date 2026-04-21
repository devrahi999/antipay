'use client';

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { collection, query, orderBy, getDocs } from "firebase/firestore"
import { useFirestore, useUser } from "@/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ShieldCheck, 
  Zap, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  Globe,
  Code2,
  Terminal,
  Cpu,
  BarChart3,
  Loader2,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Footer } from "@/components/landing/footer"
import { SupportFAB } from "@/components/landing/support-fab"

function RevealOnScroll({ children, className, style }: { children: React.ReactNode, className?: string, style?: React.CSSProperties }) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => setIsVisible(entry.isIntersecting));
    });
    const current = domRef.current;
    if (current) observer.observe(current);
    return () => {
      if (current) observer.unobserve(current);
    };
  }, []);

  return (
    <div
      ref={domRef}
      style={style}
      className={cn(
        "transition-all duration-1000 ease-out transform",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12",
        className
      )}
    >
      {children}
    </div>
  );
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [plans, setPlans] = useState<any[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    async function fetchPlans() {
      if (!db) return;
      try {
        const q = query(collection(db, 'subscriptionPlans'), orderBy('price', 'asc'));
        const snap = await getDocs(q);
        const plansData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPlans(plansData);
      } catch (error) {
        console.error("Failed to fetch plans:", error);
      } finally {
        setPlansLoading(false);
      }
    }
    fetchPlans();
  }, [db]);

  const handlePlanClick = () => {
    if (user) {
      router.push('/dashboard/plans');
    } else {
      router.push('/login');
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background font-body selection:bg-primary/20">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg text-primary-foreground">
              <ShieldCheck size={24} />
            </div>
            <span className="text-2xl font-headline font-bold tracking-tight text-primary">AntiPay</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-primary transition-colors">How it Works</Link>
            <Link href="/docs" className="hover:text-primary transition-colors">Docs</Link>
            <Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block text-sm font-medium hover:text-primary transition-colors">
              Login
            </Link>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href="/signup">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 lg:py-24 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,rgba(22,163,74,0.05)_0,rgba(255,255,255,0)_100%)]" />
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <RevealOnScroll className="flex flex-col space-y-8">
                <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary w-fit">
                  <Badge variant="outline" className="mr-2 border-primary/20 bg-primary/10 text-primary">New</Badge>
                  v2.0 Developer API is live
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold tracking-tight text-foreground leading-[1.1]">
                  Automate Your <span className="text-primary">Payment</span> Verification Instantly
                </h1>
                <p className="text-lg text-muted-foreground max-w-[600px] leading-relaxed">
                  Verify bKash, Nagad, and Rocket payments in real-time using our powerful API. Built for the high-speed Bangladesh economy.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button onClick={handlePlanClick} size="lg" className="h-12 px-8 text-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 group cursor-pointer">
                    Get Started Free <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button asChild size="lg" variant="outline" className="h-12 px-8 text-lg hover:bg-accent/50 cursor-pointer">
                    <Link href="/docs">View Docs</Link>
                  </Button>
                </div>
              </RevealOnScroll>
              
              <div className="flex justify-center items-center">
                <RevealOnScroll className="relative w-full max-w-[340px] aspect-square bg-card rounded-2xl border shadow-xl flex items-center justify-center overflow-hidden p-6">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(22,163,74,0.05)_0,transparent_70%)]" />
                  <div className="relative z-10 flex flex-col items-center gap-6">
                    <div className="bg-primary text-white p-4 rounded-2xl shadow-xl shadow-primary/30 animate-bounce">
                      <ShieldCheck size={40} />
                    </div>
                    <div className="flex gap-4">
                      <div className="bg-white border p-2.5 rounded-xl shadow-md transform -rotate-12 translate-y-2">
                        <Badge className="bg-[#e2136e] hover:bg-[#e2136e] text-[9px] px-2 text-white">bKash</Badge>
                      </div>
                      <div className="bg-white border p-2.5 rounded-xl shadow-md transform rotate-6">
                        <Badge className="bg-[#f7941d] hover:bg-[#f7941d] text-[9px] px-2 text-white">Nagad</Badge>
                      </div>
                    </div>
                    <div className="bg-accent/20 text-primary px-4 py-1.5 rounded-full text-[10px] font-bold shadow-sm flex items-center gap-2 border border-primary/10">
                      <CheckCircle2 className="text-primary h-3.5 w-3.5" /> Verified API Call
                    </div>
                  </div>
                </RevealOnScroll>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-secondary/5">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-[800px] mx-auto mb-16 space-y-4">
              <RevealOnScroll>
                <h2 className="text-3xl md:text-5xl font-headline font-bold">Simple, Transparent <span className="text-primary">Pricing</span></h2>
                <p className="text-lg text-muted-foreground">Scale your payment infrastructure as your business grows.</p>
              </RevealOnScroll>
            </div>

            {plansLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {plans.map((plan, idx) => (
                  <RevealOnScroll key={plan.id} style={{ transitionDelay: `${idx * 150}ms` }}>
                    <Card className="relative h-full flex flex-col border-2 border-border/50 bg-card hover:border-primary/50 transition-all duration-300">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                           <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                           {plan.price > 2000 && <Sparkles className="h-5 w-5 text-amber-500" />}
                        </div>
                        <CardDescription className="text-xs uppercase font-bold tracking-widest text-primary/70">
                          {plan.billingCycle} billing
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 space-y-6">
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold">৳{plan.price}</span>
                          <span className="text-muted-foreground text-sm">/{plan.billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                        </div>
                        <ul className="space-y-3">
                          {plan.benefits?.map((benefit: string, i: number) => (
                            <li key={i} className="flex items-start gap-3 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                              <span className="text-muted-foreground">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button onClick={handlePlanClick} className="w-full bg-primary hover:bg-primary/90 font-bold h-11">
                          {user ? "View in Console" : "Start with " + plan.name}
                        </Button>
                      </CardFooter>
                    </Card>
                  </RevealOnScroll>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-[800px] mx-auto mb-16 space-y-4">
              <RevealOnScroll>
                <h2 className="text-3xl md:text-5xl font-headline font-bold">Everything you need for <span className="text-primary">seamless</span> payments</h2>
                <p className="text-lg text-muted-foreground">Our platform handles the complexity so you can focus on growing your business.</p>
              </RevealOnScroll>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Zap,
                  title: "Instant Verification",
                  description: "Verify transactions in seconds using trxId and amount with 99.9% accuracy."
                },
                {
                  icon: BarChart3,
                  title: "Detailed Analytics",
                  description: "Monitor your business growth with comprehensive payment reports and data."
                },
                {
                  icon: Lock,
                  title: "Secure API",
                  description: "Enterprise-grade API security with rolling keys and IP whitelisting capabilities."
                },
                {
                  icon: Globe,
                  title: "Smart Redirect",
                  description: "Auto-redirect users back to your site instantly after successful verification."
                }
              ].map((feature, idx) => (
                <RevealOnScroll key={idx} style={{ transitionDelay: `${idx * 150}ms` }}>
                  <Card className="border-none shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group h-full">
                    <CardHeader>
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-2 group-hover:bg-primary group-hover:text-white transition-colors">
                        <feature.icon size={24} />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed text-sm">{feature.description}</p>
                    </CardContent>
                  </Card>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <SupportFAB />
    </div>
  )
}
