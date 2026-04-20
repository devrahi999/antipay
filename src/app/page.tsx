import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  ExternalLink,
  ChevronRight
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
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
              <div className="flex flex-col space-y-8 animate-in fade-in slide-in-from-left duration-1000">
                <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary w-fit">
                  <Badge variant="outline" className="mr-2 border-primary/20 bg-primary/10 text-primary">New</Badge>
                  v2.0 SMS Automation is live
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-headline font-bold tracking-tight text-foreground leading-[1.1]">
                  Automate Your <span className="text-primary">Payment</span> Verification Instantly
                </h1>
                <p className="text-xl text-muted-foreground max-w-[600px] leading-relaxed">
                  Verify bKash, Nagad, and Rocket payments in real-time using our powerful API and SMS automation system. Built for the Bangladesh ecosystem.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="h-14 px-8 text-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 group">
                    Get Started Free <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg hover:bg-accent/50">
                    View Demo
                  </Button>
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground pt-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-secondary" />
                    ))}
                  </div>
                  <p>Trusted by <span className="font-bold text-foreground">500+</span> merchants across Bangladesh</p>
                </div>
              </div>
              <div className="relative animate-in fade-in zoom-in duration-1000 delay-200">
                <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-full" />
                <div className="relative bg-card rounded-2xl border shadow-2xl overflow-hidden aspect-square flex items-center justify-center p-8 lg:p-12">
                   {/* Abstract illustration concept */}
                   <div className="w-full h-full relative flex items-center justify-center">
                      <div className="absolute w-4/5 h-4/5 bg-secondary rounded-full animate-pulse opacity-50" />
                      <div className="z-10 flex flex-col items-center gap-6">
                        <div className="bg-primary text-white p-6 rounded-3xl shadow-xl shadow-primary/30 animate-bounce">
                          <Smartphone size={64} />
                        </div>
                        <div className="flex gap-4">
                          <div className="bg-white border p-4 rounded-xl shadow-md transform -rotate-12 translate-y-4">
                            <Badge className="bg-[#e2136e]">bKash</Badge>
                          </div>
                          <div className="bg-white border p-4 rounded-xl shadow-md transform rotate-6">
                            <Badge className="bg-[#f7941d]">Nagad</Badge>
                          </div>
                        </div>
                        <div className="bg-accent text-accent-foreground px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2">
                          <CheckCircle2 className="text-primary" /> Payment Verified
                        </div>
                      </div>
                      {/* Floating dots represent data flow */}
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
            <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-8">Supports all major mobile banking providers</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
              <span className="text-2xl font-bold">bKash</span>
              <span className="text-2xl font-bold">Nagad</span>
              <span className="text-2xl font-bold">Rocket</span>
              <span className="text-2xl font-bold">Upay</span>
              <span className="text-2xl font-bold">Cellfin</span>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-[800px] mx-auto mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-headline font-bold">Everything you need for <span className="text-primary">seamless</span> payments</h2>
              <p className="text-lg text-muted-foreground">Our platform handles the complexity so you can focus on growing your business.</p>
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
                  description: "Automatically capture payment SMS and sync to your system with our mobile sync app."
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
                <Card key={idx} className="border-none shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
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
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="py-24 bg-secondary/10 overflow-hidden">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-12">
                <div className="space-y-4">
                  <h2 className="text-3xl md:text-5xl font-headline font-bold">Simple Integration <span className="text-primary">Step-by-Step</span></h2>
                  <p className="text-lg text-muted-foreground">Go live in less than 30 minutes with our easy setup process.</p>
                </div>
                <div className="space-y-8 relative">
                  {/* Vertical line connecting steps */}
                  <div className="absolute left-6 top-8 bottom-8 w-[2px] bg-primary/20 hidden md:block" />
                  {[
                    { step: "01", title: "Create API Key & Store", desc: "Sign up and create your first store identity to get your unique API secret key." },
                    { step: "02", title: "Setup Sync App", desc: "Install our Android app to sync incoming payment SMS to your dashboard in real-time." },
                    { step: "03", title: "Integrate API", desc: "Use our simple REST API to verify transactions directly from your backend or frontend." },
                    { step: "04", title: "Automate Business", desc: "Sit back as AntiPay handles everything from verification to customer notification." }
                  ].map((step, idx) => (
                    <div key={idx} className="flex gap-6 relative z-10">
                      <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0 shadow-lg shadow-primary/20">
                        {step.step}
                      </div>
                      <div className="space-y-1 pt-1">
                        <h3 className="text-xl font-bold">{step.title}</h3>
                        <p className="text-muted-foreground">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="bg-card rounded-2xl border p-6 shadow-2xl">
                   <div className="space-y-4">
                      <div className="flex items-center justify-between border-b pb-4">
                        <span className="font-bold flex items-center gap-2"><Smartphone className="h-4 w-4 text-primary" /> AntiPay Sync</span>
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Active</Badge>
                      </div>
                      <div className="space-y-3">
                        <div className="p-3 bg-secondary/50 rounded-lg text-xs font-mono">
                          <p className="text-muted-foreground mb-1">Incoming SMS Detected:</p>
                          <p className="text-foreground">"bKash: You have received Tk 1200 from 01712xxxxxx. TrxID: 8J9A1X7K..."</p>
                        </div>
                        <div className="flex justify-center">
                          <ArrowRight className="h-6 w-6 text-primary rotate-90" />
                        </div>
                        <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-xs font-mono text-primary">
                          <p className="font-bold">Syncing to Dashboard...</p>
                          <p>Transaction 8J9A1X7K verified successfully.</p>
                        </div>
                      </div>
                   </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-10 -right-10 h-32 w-32 bg-accent/20 rounded-full blur-2xl -z-10" />
                <div className="absolute -bottom-10 -left-10 h-32 w-32 bg-primary/10 rounded-full blur-2xl -z-10" />
              </div>
            </div>
          </div>
        </section>

        {/* Live Preview / Stats */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: "Transactions Verified", value: "1.2M+", icon: MousePointerClick },
                { label: "Average Sync Time", value: "< 2s", icon: Zap },
                { label: "System Uptime", value: "99.99%", icon: BarChart3 }
              ].map((stat, idx) => (
                <div key={idx} className="flex flex-col items-center p-8 rounded-2xl bg-secondary/20 border border-secondary text-center space-y-2">
                  <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-primary shadow-sm mb-2">
                    <stat.icon size={24} />
                  </div>
                  <div className="text-4xl font-headline font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-[800px] mx-auto mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-headline font-bold">Simple, transparent <span className="text-primary">pricing</span></h2>
              <p className="text-lg text-muted-foreground">Choose the plan that fits your business needs.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-8">
              {/* Free Plan */}
              <Card className="flex flex-col border-2 border-secondary shadow-sm">
                <CardHeader>
                  <CardTitle className="text-2xl">Starter</CardTitle>
                  <CardDescription>Perfect for small projects & testing.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-6">
                  <div className="text-4xl font-bold">৳0 <span className="text-base font-normal text-muted-foreground">/ month</span></div>
                  <ul className="space-y-3 text-sm">
                    {["1 Active Store", "Basic Analytics", "Standard Support", "3% Transaction Fee", "Community Access"].map((f) => (
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

              {/* Pro Plan */}
              <Card className="flex flex-col border-2 border-primary shadow-xl relative scale-105">
                <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase">Best Value</div>
                <CardHeader>
                  <CardTitle className="text-2xl">Professional</CardTitle>
                  <CardDescription>For growing businesses needing power.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-6">
                  <div className="text-4xl font-bold text-primary">৳2,500 <span className="text-base font-normal text-muted-foreground">/ month</span></div>
                  <ul className="space-y-3 text-sm">
                    {["Unlimited Stores", "Priority Support", "Advanced Monitoring", "1% Transaction Fee", "Custom Webhooks", "API Rate Limit Increases"].map((f) => (
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
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="bg-primary rounded-3xl p-12 text-center text-primary-foreground relative overflow-hidden shadow-2xl shadow-primary/20">
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
                    Create API Key
                  </Button>
                </div>
              </div>
            </div>
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
