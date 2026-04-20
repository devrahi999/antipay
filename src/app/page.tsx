
'use client';

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { 
  ShieldCheck, 
  Zap, 
  Smartphone, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  MousePointerClick, 
  BarChart3,
  Globe,
  Code2,
  Terminal,
  Cpu,
  Layers,
  HelpCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

// --- Components for Animation ---

function CountUp({ end, suffix = "" }: { end: number, suffix?: string }) {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (countRef.current) observer.observe(countRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const duration = 2000;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isVisible, end]);

  return <span ref={countRef}>{count.toLocaleString()}{suffix}</span>;
}

function RevealOnScroll({ children, className }: { children: React.ReactNode, className?: string }) {
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

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background font-body selection:bg-primary/20">
      {/* Navigation */}
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
            <Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link>
            <Link href="/docs" className="hover:text-primary transition-colors">Docs</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hidden sm:block text-sm font-medium hover:text-primary transition-colors">
              Login
            </Link>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href="/dashboard">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,rgba(22,163,74,0.05)_0,rgba(255,255,255,0)_100%)]" />
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <RevealOnScroll className="flex flex-col space-y-8">
                <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary w-fit">
                  <Badge variant="outline" className="mr-2 border-primary/20 bg-primary/10 text-primary">New</Badge>
                  v2.0 Developer API is live
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-headline font-bold tracking-tight text-foreground leading-[1.1]">
                  Automate Your <span className="text-primary">Payment</span> Verification Instantly
                </h1>
                <p className="text-xl text-muted-foreground max-w-[600px] leading-relaxed">
                  Verify bKash, Nagad, and Rocket payments in real-time using our powerful API. Built for the high-speed Bangladesh economy.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="h-14 px-8 text-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 group">
                    Get Started Free <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg hover:bg-accent/50">
                    View Docs
                  </Button>
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground pt-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-secondary/50 flex items-center justify-center text-[10px] font-bold">U{i}</div>
                    ))}
                  </div>
                  <p>Trusted by <span className="font-bold text-foreground">500+</span> merchants across Bangladesh</p>
                </div>
              </RevealOnScroll>
              <div className="relative animate-in fade-in zoom-in duration-1000 delay-200">
                <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-full" />
                <div className="relative bg-card rounded-2xl border shadow-2xl overflow-hidden aspect-square flex items-center justify-center p-8 lg:p-12">
                   <div className="w-full h-full relative flex items-center justify-center">
                      <div className="absolute w-4/5 h-4/5 bg-secondary rounded-full animate-pulse opacity-50" />
                      <div className="z-10 flex flex-col items-center gap-6">
                        <div className="bg-primary text-white p-6 rounded-3xl shadow-xl shadow-primary/30 animate-bounce">
                          <ShieldCheck size={64} />
                        </div>
                        <div className="flex gap-4">
                          <div className="bg-white border p-4 rounded-xl shadow-md transform -rotate-12 translate-y-4">
                            <Badge className="bg-[#e2136e] hover:bg-[#e2136e]">bKash</Badge>
                          </div>
                          <div className="bg-white border p-4 rounded-xl shadow-md transform rotate-6">
                            <Badge className="bg-[#f7941d] hover:bg-[#f7941d]">Nagad</Badge>
                          </div>
                        </div>
                        <div className="bg-accent text-accent-foreground px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2">
                          <CheckCircle2 className="text-primary" /> Verified API Call
                        </div>
                      </div>
                      <div className="absolute top-1/4 left-1/4 h-3 w-3 bg-primary rounded-full animate-ping" />
                      <div className="absolute bottom-1/4 right-1/4 h-2 w-2 bg-primary rounded-full animate-ping delay-300" />
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-12 border-y bg-secondary/20">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-8">Supports major mobile banking providers</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
              <span className="text-2xl font-bold">bKash</span>
              <span className="text-2xl font-bold">Nagad</span>
              <span className="text-2xl font-bold">Rocket</span>
              <span className="text-2xl font-bold">Upay</span>
            </div>
          </div>
        </section>

        {/* Stats Section with Animated Counters */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <RevealOnScroll className="flex flex-col items-center p-8 rounded-2xl bg-secondary/20 border border-secondary text-center space-y-2">
                <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-primary shadow-sm mb-2">
                  <MousePointerClick size={24} />
                </div>
                <div className="text-5xl font-headline font-bold text-foreground">
                  <CountUp end={1200000} suffix="+" />
                </div>
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Transactions Verified</div>
              </RevealOnScroll>
              <RevealOnScroll className="flex flex-col items-center p-8 rounded-2xl bg-secondary/20 border border-secondary text-center space-y-2" style={{ transitionDelay: '200ms' }}>
                <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-primary shadow-sm mb-2">
                  <Zap size={24} />
                </div>
                <div className="text-5xl font-headline font-bold text-foreground">
                  <CountUp end={99} suffix=".9%" />
                </div>
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Uptime Accuracy</div>
              </RevealOnScroll>
              <RevealOnScroll className="flex flex-col items-center p-8 rounded-2xl bg-secondary/20 border border-secondary text-center space-y-2" style={{ transitionDelay: '400ms' }}>
                <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-primary shadow-sm mb-2">
                  <BarChart3 size={24} />
                </div>
                <div className="text-5xl font-headline font-bold text-foreground">
                  <CountUp end={2} suffix="s" />
                </div>
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Avg. Sync Speed</div>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-secondary/5">
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
                  icon: Smartphone,
                  title: "SMS Automation",
                  description: "Automatically capture payment SMS and sync to your system with our enterprise app."
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
                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Code Preview Section */}
        <section className="py-24 bg-background overflow-hidden">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <RevealOnScroll className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-3xl md:text-5xl font-headline font-bold">Built for <span className="text-primary">Developers</span></h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Integrate our REST API with just a few lines of code. Whether you use Node.js, PHP, or Python, we have you covered.
                  </p>
                </div>
                <ul className="space-y-4">
                  {[
                    { icon: Code2, title: "Simple REST API", desc: "Easy to use JSON endpoints." },
                    { icon: Terminal, title: "Webhooks", desc: "Get notified instantly on new payments." },
                    { icon: Cpu, title: "Scalable", desc: "Handles thousands of requests per second." }
                  ].map((item, i) => (
                    <li key={i} className="flex gap-4">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <item.icon size={14} />
                      </div>
                      <div>
                        <p className="font-bold">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </RevealOnScroll>
              <RevealOnScroll className="relative" style={{ transitionDelay: '300ms' }}>
                <div className="bg-slate-900 rounded-2xl p-1 shadow-2xl overflow-hidden border border-slate-800">
                  <div className="bg-slate-800 px-4 py-2 flex items-center gap-2 border-b border-slate-700">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <span className="text-xs text-slate-400 font-mono ml-2">verify_payment.js</span>
                  </div>
                  <pre className="p-6 text-sm font-mono text-slate-300 overflow-x-auto">
                    <code>{`// Post verification request
const response = await fetch('https://api.antipay.io/v1/verify', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_SECRET_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    trxId: '8J9A1X7K',
    amount: '1200',
    method: 'bkash'
  })
});

const result = await response.json();
if (result.status === 'verified') {
  console.log('Payment Confirmed!');
}`}</code>
                  </pre>
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        {/* How it Works Step-by-Step */}
        <section id="how-it-works" className="py-24 bg-secondary/10">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-[800px] mx-auto mb-16 space-y-4">
              <RevealOnScroll>
                <h2 className="text-3xl md:text-5xl font-headline font-bold">Go Live in <span className="text-primary">4 Steps</span></h2>
                <p className="text-lg text-muted-foreground">Our process is streamlined for maximum efficiency.</p>
              </RevealOnScroll>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { step: "01", title: "API Key Setup", desc: "Register your business and generate your unique API secret keys." },
                { step: "02", title: "Store Identity", desc: "Create a store identity for each of your platforms (Web, App, etc)." },
                { step: "03", title: "Integration", desc: "Use our documentation to integrate the verification logic." },
                { step: "04", title: "Automation", desc: "Watch your payments get verified automatically 24/7." }
              ].map((item, idx) => (
                <RevealOnScroll key={idx} style={{ transitionDelay: `${idx * 200}ms` }} className="text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mx-auto shadow-lg shadow-primary/20 ring-4 ring-primary/10">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold">{item.title}</h3>
                  <p className="text-muted-foreground text-sm px-4">{item.desc}</p>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6 max-w-4xl">
            <RevealOnScroll className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-headline font-bold">Got <span className="text-primary">Questions?</span></h2>
              <p className="text-lg text-muted-foreground">Find answers to the most common questions from our users.</p>
            </RevealOnScroll>
            <RevealOnScroll style={{ transitionDelay: '300ms' }}>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="border-secondary hover:border-primary transition-colors px-4">
                  <AccordionTrigger className="text-left font-bold text-lg hover:no-underline">Is my data secure?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Yes, AntiPay uses military-grade encryption for all API calls and data storage. We never store your customer's sensitive financial details.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2" className="border-secondary hover:border-primary transition-colors px-4">
                  <AccordionTrigger className="text-left font-bold text-lg hover:no-underline">What mobile banks are supported?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    We currently support bKash, Nagad, Rocket, and Upay. We are constantly adding new providers to our ecosystem.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3" className="border-secondary hover:border-primary transition-colors px-4">
                  <AccordionTrigger className="text-left font-bold text-lg hover:no-underline">How fast is the verification?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Verification typically happens within 1-2 seconds of the payment being received and synced to our system.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4" className="border-secondary hover:border-primary transition-colors px-4">
                  <AccordionTrigger className="text-left font-bold text-lg hover:no-underline">Can I use it for free?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Absolutely! Our Starter plan is free forever and includes 1 active store with basic analytics.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </RevealOnScroll>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-secondary/5">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-[800px] mx-auto mb-16 space-y-4">
              <RevealOnScroll>
                <h2 className="text-3xl md:text-5xl font-headline font-bold">Simple, transparent <span className="text-primary">pricing</span></h2>
                <p className="text-lg text-muted-foreground">Choose the plan that fits your business needs.</p>
              </RevealOnScroll>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-8">
              <RevealOnScroll>
                <Card className="flex flex-col border-2 border-secondary shadow-sm h-full">
                  <CardHeader>
                    <CardTitle className="text-2xl">Starter</CardTitle>
                    <CardDescription>Perfect for small projects & testing.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-6">
                    <div className="text-4xl font-bold">৳0 <span className="text-base font-normal text-muted-foreground">/ month</span></div>
                    <ul className="space-y-3 text-sm">
                      {["1 Active Store", "Basic Analytics", "Standard Support", "3% Transaction Fee"].map((f) => (
                        <li key={f} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary" /> {f}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full h-12">Get Started</Button>
                  </CardFooter>
                </Card>
              </RevealOnScroll>

              <RevealOnScroll style={{ transitionDelay: '300ms' }}>
                <Card className="flex flex-col border-2 border-primary shadow-xl relative scale-105 h-full bg-card">
                  <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase">Best Value</div>
                  <CardHeader>
                    <CardTitle className="text-2xl">Professional</CardTitle>
                    <CardDescription>For growing businesses needing power.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-6">
                    <div className="text-4xl font-bold text-primary">৳2,500 <span className="text-base font-normal text-muted-foreground">/ month</span></div>
                    <ul className="space-y-3 text-sm">
                      {["Unlimited Stores", "Priority Support", "Advanced Monitoring", "1% Transaction Fee", "Custom Webhooks"].map((f) => (
                        <li key={f} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary" /> {f}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full h-12 bg-primary hover:bg-primary/90">Upgrade to Pro</Button>
                  </CardFooter>
                </Card>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <RevealOnScroll className="bg-primary rounded-3xl p-12 text-center text-primary-foreground relative overflow-hidden shadow-2xl shadow-primary/20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
              
              <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                <h2 className="text-4xl md:text-5xl font-headline font-bold">Start Verifying Payments the Smart Way</h2>
                <p className="text-xl text-primary-foreground/80">Join hundreds of businesses automating their payment collection with AntiPay.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="h-14 px-8 bg-white text-primary hover:bg-white/90 font-bold text-lg">
                    Get Started Now
                  </Button>
                  <Button size="lg" variant="outline" className="h-14 px-8 border-white/30 text-white hover:bg-white/10 font-bold text-lg">
                    View API Reference
                  </Button>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-secondary/10 border-t py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            <div className="col-span-2 space-y-6">
              <Link href="/" className="flex items-center gap-2">
                <div className="bg-primary p-1.5 rounded-lg text-primary-foreground">
                  <ShieldCheck size={24} />
                </div>
                <span className="text-2xl font-headline font-bold tracking-tight text-primary">AntiPay</span>
              </Link>
              <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
                Empowering businesses across Bangladesh with automated payment verification systems. Reliable, secure, and fast.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-primary">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-primary">Pricing</Link></li>
                <li><Link href="/docs" className="hover:text-primary">Documentation</Link></li>
                <li><Link href="/api-ref" className="hover:text-primary">API Reference</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-primary">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold">Social</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">Twitter</Link></li>
                <li><Link href="#" className="hover:text-primary">Facebook</Link></li>
                <li><Link href="#" className="hover:text-primary">LinkedIn</Link></li>
                <li><Link href="#" className="hover:text-primary">GitHub</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
            <p>© 2024 AntiPay. All rights reserved.</p>
            <p className="flex items-center gap-2">Built with ❤️ in Bangladesh <Globe className="h-3 w-3" /></p>
          </div>
        </div>
      </footer>
    </div>
  )
}
