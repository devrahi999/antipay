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
  Loader2,
  Sparkles,
  Clock,
  Layers
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

  const supportedMethods = [
    { name: "bKash", color: "bg-[#e2136e]", icon: "BK" },
    { name: "Nagad", color: "bg-[#f7941d]", icon: "NG" },
    { name: "Rocket", color: "bg-[#8c3494]", icon: "RK" },
    { name: "Upay", color: "bg-[#111111]", icon: "UP" },
    { name: "CellFin", color: "bg-[#16a34a]", icon: "CF" },
    { name: "Tap", color: "bg-[#0ea5e9]", icon: "TP" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background font-body selection:bg-primary/20">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <img src="https://i.imgur.com/18owxBD.png" alt="AntiPay" className="h-9 w-auto" />
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
        <section className="relative py-16 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,rgba(22,163,74,0.08)_0,rgba(255,255,255,0)_100%)]" />
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <RevealOnScroll className="flex flex-col space-y-8">
                <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary w-fit">
                  <Badge variant="outline" className="mr-2 border-primary/20 bg-primary/10 text-primary font-bold">NEW</Badge>
                  v2.0 Developer Engine is live
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-headline font-bold tracking-tight text-foreground leading-[1.05]">
                  Automate Your <span className="text-primary">Payment</span> Verification <span className="relative">
                    Instantly
                    <svg className="absolute -bottom-2 left-0 w-full h-2 text-primary/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                      <path d="M0 5 Q 25 0 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="4" />
                    </svg>
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-[600px] leading-relaxed">
                  The most reliable verification API for bKash, Nagad, and Rocket. Scale your merchant operations without manual verification delays.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button onClick={handlePlanClick} size="lg" className="h-14 px-10 text-lg bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 group cursor-pointer font-bold rounded-xl">
                    Get Started Free <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button asChild size="lg" variant="outline" className="h-14 px-10 text-lg hover:bg-accent/50 cursor-pointer font-bold rounded-xl border-border/60">
                    <Link href="/docs">View API Docs</Link>
                  </Button>
                </div>
              </RevealOnScroll>
              
              <div className="flex justify-center items-center">
                <RevealOnScroll className="relative w-full max-w-[450px] aspect-square bg-card rounded-[2.5rem] border shadow-[0_40px_100px_-15px_rgba(0,0,0,0.1)] flex items-center justify-center overflow-hidden p-10">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(22,163,74,0.1)_0,transparent_70%)]" />
                  <div className="relative z-10 flex flex-col items-center gap-8 w-full">
                    <div className="bg-primary text-white p-6 rounded-3xl shadow-2xl shadow-primary/40 animate-bounce transition-all">
                      <ShieldCheck size={60} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 w-full">
                      <div className="bg-white border border-border/40 p-4 rounded-2xl shadow-lg transform -rotate-6 hover:rotate-0 transition-transform">
                        <Badge className="bg-[#e2136e] hover:bg-[#e2136e] text-[10px] px-3 py-1 text-white rounded-lg">bKash Verified</Badge>
                        <p className="mt-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Success Rate: 100%</p>
                      </div>
                      <div className="bg-white border border-border/40 p-4 rounded-2xl shadow-lg transform rotate-6 hover:rotate-0 transition-transform">
                        <Badge className="bg-[#f7941d] hover:bg-[#f7941d] text-[10px] px-3 py-1 text-white rounded-lg">Nagad Verified</Badge>
                        <p className="mt-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Time: 0.2s</p>
                      </div>
                    </div>
                  </div>
                </RevealOnScroll>
              </div>
            </div>
          </div>
        </section>

        {/* Other sections unchanged... */}
        
        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 bg-secondary/5 relative">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-[800px] mx-auto mb-16 space-y-4">
              <RevealOnScroll>
                <Badge className="bg-primary/20 text-primary border-primary/10 mb-4 px-4 py-1">Integration</Badge>
                <h2 className="text-4xl md:text-5xl font-headline font-bold">How <span className="text-primary">AntiPay</span> Works</h2>
                <p className="text-lg text-muted-foreground">Setup your automated gateway in 3 simple steps.</p>
              </RevealOnScroll>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  step: "01",
                  icon: Layers,
                  title: "Register Brand Identity",
                  description: "Register your store in the dashboard to generate your unique AntiPay API Key."
                },
                {
                  step: "02",
                  icon: Code2,
                  title: "Connect Payment Gateway",
                  description: "Link your receiver numbers to our system via our secure cloud handshake."
                },
                {
                  step: "03",
                  icon: CheckCircle2,
                  title: "Automate Business Sales",
                  description: "Every payment is verified instantly. Your system clears orders without human touch."
                }
              ].map((item, idx) => (
                <RevealOnScroll key={idx} className="relative group">
                  <div className="bg-card border border-border/40 p-8 rounded-[2rem] shadow-sm hover:shadow-2xl transition-all h-full flex flex-col items-center text-center">
                    <span className="absolute -top-4 -left-4 h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-xl shadow-lg shadow-primary/20">
                      {item.step}
                    </span>
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                      <item.icon size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* Supported Methods Marquee Section */}
        <section className="py-20 bg-background overflow-hidden border-b border-border/10">
          <div className="container mx-auto px-4 mb-10 text-center">
            <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-muted-foreground/60">Supported Payment Gateways</h3>
          </div>
          <div className="relative flex overflow-x-hidden">
            <div className="animate-marquee whitespace-nowrap flex items-center py-4">
              {[...supportedMethods, ...supportedMethods, ...supportedMethods].map((method, idx) => (
                <div key={idx} className="mx-8 flex items-center gap-4 bg-secondary/30 px-8 py-4 rounded-2xl border border-border/20 grayscale hover:grayscale-0 hover:border-primary/40 transition-all cursor-default">
                  <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-lg", method.color)}>
                    {method.icon}
                  </div>
                  <span className="text-xl font-black text-foreground/80">{method.name}</span>
                </div>
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