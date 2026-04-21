
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
  Layers,
  Smartphone,
  Cpu,
  MessageCircle,
  BarChart3,
  HelpCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Footer } from "@/components/landing/footer"
import { SupportFAB } from "@/components/landing/support-fab"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

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
            <img src="https://i.imgur.com/18owxBD.png" alt="AntiPay" className="h-12 w-auto" />
            <span className="text-2xl font-headline font-bold tracking-tight text-primary">AntiPay</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-primary transition-colors">How it Works</Link>
            <Link href="/docs" className="hover:text-primary transition-colors">Docs</Link>
            <Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link>
          </nav>
          <div className="flex items-center gap-4">
            {user ? (
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Link href="/login" className="hidden sm:block text-sm font-medium hover:text-primary transition-colors">
                  Login
                </Link>
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <Link href="/signup">Get Started Free</Link>
                </Button>
              </>
            )}
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
                  v2.1 Infrastructure is live
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
                  The most reliable verification API for bKash, Nagad, and Rocket in Bangladesh. Stop manual verification and start scaling your business with AntiPay.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button onClick={handlePlanClick} size="lg" className="h-14 px-10 text-lg bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 group cursor-pointer font-bold rounded-xl">
                    Start Your Trial <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button asChild size="lg" variant="outline" className="h-14 px-10 text-lg hover:bg-accent/50 cursor-pointer font-bold rounded-xl border-border/60">
                    <Link href="/docs">API Reference</Link>
                  </Button>
                </div>
                <div className="flex items-center gap-6 pt-4">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-10 w-10 rounded-full border-2 border-background bg-secondary flex items-center justify-center overflow-hidden">
                        <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="Merchant" />
                      </div>
                    ))}
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    <span className="text-foreground font-bold">500+</span> Merchants Automated
                  </p>
                </div>
              </RevealOnScroll>
              
              <div className="flex justify-center items-center">
                <RevealOnScroll className="relative w-full max-w-[450px] aspect-square bg-card rounded-[2.5rem] border shadow-[0_40px_100px_-15px_rgba(0,0,0,0.1)] flex items-center justify-center overflow-hidden p-10">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(22,163,74,0.1)_0,transparent_70%)]" />
                  <div className="relative z-10 flex flex-col items-center gap-8 w-full">
                    <div className="bg-primary text-white p-6 rounded-3xl shadow-2xl shadow-primary/40 animate-bounce transition-all">
                      <ShieldCheck size={60} />
                    </div>
                    <div className="grid grid-cols-1 gap-4 w-full">
                      <div className="bg-white dark:bg-slate-900 border border-border/40 p-5 rounded-2xl shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                           <Badge className="bg-[#e2136e] text-white">bKash Verified</Badge>
                           <span className="text-[10px] font-bold text-emerald-500">REAL-TIME</span>
                        </div>
                        <div className="space-y-2">
                           <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                              <div className="h-full bg-primary animate-progress" style={{ width: '100%' }} />
                           </div>
                           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Transaction 8J9A1X7K Verified in 0.2s</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </RevealOnScroll>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-background relative">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-[800px] mx-auto mb-20 space-y-4">
              <RevealOnScroll>
                <Badge className="bg-primary/20 text-primary border-primary/10 mb-4 px-4 py-1 font-bold">CORE CAPABILITIES</Badge>
                <h2 className="text-4xl md:text-5xl font-headline font-bold">Why Merchants Choose <span className="text-primary">AntiPay</span></h2>
                <p className="text-lg text-muted-foreground">Built for reliability, speed, and effortless integration.</p>
              </RevealOnScroll>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Zap,
                  title: "Instant Verification",
                  desc: "Our engine processes transaction SMS in milliseconds, providing instant verification results to your application."
                },
                {
                  icon: Smartphone,
                  title: "Android Node Sync",
                  desc: "Use our dedicated Android APK to securely sync incoming payment SMS directly to our cloud infrastructure."
                },
                {
                  icon: Code2,
                  title: "Developer First API",
                  desc: "Clean JSON APIs and SDKs designed to be integrated in less than 30 minutes for any tech stack."
                },
                {
                  icon: BarChart3,
                  title: "Real-time Analytics",
                  desc: "Monitor your transaction volume, success rates, and customer behavior with our intuitive dashboard."
                },
                {
                  icon: Lock,
                  title: "Enterprise Security",
                  desc: "Bank-grade encryption for all API calls and sensitive data storage. Your transaction privacy is our priority."
                },
                {
                  icon: MessageCircle,
                  title: "Dedicated Support",
                  desc: "Access our expert support team via WhatsApp or Email whenever you need assistance with integration."
                }
              ].map((feature, idx) => (
                <RevealOnScroll key={idx} className="group">
                  <div className="p-8 rounded-[2rem] bg-card border border-border/40 hover:border-primary/30 transition-all hover:shadow-xl h-full">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                      <feature.icon size={28} />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 bg-secondary/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-20 opacity-5 -z-10"><Cpu size={400} /></div>
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-[800px] mx-auto mb-16 space-y-4">
              <RevealOnScroll>
                <Badge className="bg-primary/20 text-primary border-primary/10 mb-4 px-4 py-1">INTEGRATION FLOW</Badge>
                <h2 className="text-4xl md:text-5xl font-headline font-bold">Setup in 3 Simple Steps</h2>
                <p className="text-lg text-muted-foreground">Go live and start accepting automated payments today.</p>
              </RevealOnScroll>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  step: "01",
                  icon: Layers,
                  title: "Create Brand Profile",
                  description: "Sign up and create your brand identity. You'll get a unique API key instantly to authenticate your requests."
                },
                {
                  step: "02",
                  icon: Smartphone,
                  title: "Link Mobile Node",
                  description: "Install the AntiPay Sync app on your Android phone and scan your merchant QR to link your accounts."
                },
                {
                  step: "03",
                  icon: CheckCircle2,
                  title: "Auto-Verify Sales",
                  description: "Integrate our 2-step API. Every payment is now verified automatically without you lifting a finger."
                }
              ].map((item, idx) => (
                <RevealOnScroll key={idx} className="relative group">
                  <div className="bg-card border border-border/40 p-8 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all h-full flex flex-col items-center text-center">
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

        {/* FAQ Section */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl">
            <RevealOnScroll className="text-center mb-16 space-y-4">
              <Badge className="bg-primary/20 text-primary border-primary/10 mb-4 px-4 py-1 font-bold">QUESTIONS</Badge>
              <h2 className="text-4xl font-headline font-bold">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">Everything you need to know about the AntiPay platform.</p>
            </RevealOnScroll>

            <Accordion type="single" collapsible className="w-full space-y-4">
              {[
                {
                  q: "How secure is the Android SMS syncing?",
                  a: "Extremely secure. Our app only monitors SMS from verified banking shortcodes (like bKash, Nagad). All data is encrypted with TLS 1.3 before being sent to our servers and is never shared with third parties."
                },
                {
                  q: "Which payment methods are supported?",
                  a: "We currently support bKash, Nagad, Rocket, Upay, CellFin, and Tap. We are constantly adding new local providers based on merchant requests."
                },
                {
                  q: "Do I need a merchant account with bKash/Nagad?",
                  a: "No! AntiPay works with both Personal and Merchant accounts. You just need an Android phone to receive the SMS, and we handle the rest."
                },
                {
                  q: "Can I use AntiPay for high-volume transactions?",
                  a: "Yes. Our infrastructure is built on Google Cloud and auto-scales to handle thousands of concurrent verification requests. Enterprise plans include custom node architecture for extreme volumes."
                }
              ].map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="bg-card border border-border/40 rounded-2xl px-6">
                  <AccordionTrigger className="text-left font-bold hover:no-underline text-foreground py-6">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="container mx-auto px-4 md:px-6">
            <RevealOnScroll className="relative overflow-hidden rounded-[3rem] bg-emerald-950 p-8 md:p-20 text-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(22,163,74,0.15)_0,transparent_70%)]" />
              <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                <h2 className="text-4xl md:text-6xl font-headline font-bold text-white tracking-tight">Ready to Automate Your Business?</h2>
                <p className="text-emerald-100/70 text-lg">Join hundreds of merchants who save hours every day with AntiPay automated verification.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={handlePlanClick} size="lg" className="h-14 px-10 text-lg bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-2xl shadow-primary/20">
                    Get Started Now
                  </Button>
                  <Button asChild size="lg" variant="outline" className="h-14 px-10 text-lg border-white/20 text-white hover:bg-white/10 font-bold rounded-2xl">
                    <Link href="/contact">Talk to an Expert</Link>
                  </Button>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </section>
      </main>

      <Footer />
      <SupportFAB />
    </div>
  )
}
