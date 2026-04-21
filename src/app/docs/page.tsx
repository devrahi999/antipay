'use client';

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ShieldCheck, 
  ArrowLeft, 
  BookOpen, 
  Terminal, 
  Code2, 
  Cpu, 
  CheckCircle2, 
  Globe, 
  Link as LinkIcon, 
  Key, 
  AlertCircle,
  Hash,
  ChevronRight
} from "lucide-react"
import { Footer } from "@/components/landing/footer"

export default function DocsPage() {
  const sections = [
    { id: "introduction", title: "Introduction" },
    { id: "base-url", title: "Base URL" },
    { id: "create-session", title: "1. Create Session" },
    { id: "verify-payment", title: "2. Verify Payment" },
    { id: "authentication", title: "Authentication" },
    { id: "error-handling", title: "Error Handling" },
    { id: "webhooks", title: "Webhooks" },
    { id: "workflow", title: "Example Workflow" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-body">
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg text-primary-foreground">
              <ShieldCheck size={24} />
            </div>
            <span className="text-2xl font-headline font-bold tracking-tight text-primary">AntiPay</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" className="hidden sm:flex">
              <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/90 font-bold">
              <Link href="/login">Merchant Console</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 md:px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-28 space-y-6">
              <div>
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Documentation</h4>
                <nav className="flex flex-col gap-2">
                  {sections.map((section) => (
                    <a 
                      key={section.id} 
                      href={`#${section.id}`}
                      className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center group transition-colors"
                    >
                      <ChevronRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                      {section.title}
                    </a>
                  ))}
                </nav>
              </div>
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 text-center">Version 2.0</p>
                <p className="text-[9px] text-muted-foreground text-center">Latest stable release of the AntiPay Verification Engine.</p>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 max-w-4xl">
            <div className="space-y-16 pb-20">
              
              {/* Introduction */}
              <section id="introduction" className="scroll-mt-28 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20">
                  <BookOpen className="h-3 w-3" /> Get Started
                </div>
                <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground">AntiPay Developer Documentation</h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Welcome to <span className="text-primary font-bold">AntiPay</span> Developer Docs! AntiPay is a secure, scalable, and flexible payment verification platform. This guide will help you understand how to integrate AntiPay’s <strong>Create</strong> and <strong>Verify</strong> APIs into your system.
                </p>
              </section>

              {/* Base URL */}
              <section id="base-url" className="scroll-mt-28 space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                  <Globe className="h-5 w-5 text-primary" /> Base URL
                </h2>
                <p className="text-muted-foreground">All API requests are made to the following base URL:</p>
                <div className="bg-[#0b141a] p-4 rounded-xl border border-border/10 group relative">
                  <code className="text-primary font-mono text-sm break-all">https://pay.antipay.site/v1/</code>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div className="p-4 bg-secondary/30 rounded-xl border border-border/20">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Endpoint 1</p>
                    <p className="text-sm font-bold">/create</p>
                    <p className="text-xs text-muted-foreground mt-1">Create a payment session.</p>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-xl border border-border/20">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Endpoint 2</p>
                    <p className="text-sm font-bold">/verify</p>
                    <p className="text-xs text-muted-foreground mt-1">Verify payment via transaction ID.</p>
                  </div>
                </div>
              </section>

              {/* Create Session */}
              <section id="create-session" className="scroll-mt-28 space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                  <Terminal className="h-5 w-5 text-primary" /> 1. Create Payment Session
                </h2>
                <p className="text-muted-foreground">
                  The <span className="font-bold text-foreground">Create Payment Session</span> endpoint allows you to initiate a payment session, providing a secure way for your users to make a payment.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-600 hover:bg-emerald-600 font-bold uppercase text-[10px]">POST</Badge>
                    <code className="text-xs font-mono text-muted-foreground">/v1/create</code>
                  </div>

                  <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
                    <div className="bg-slate-800 px-4 py-2 text-[10px] font-mono text-slate-400 flex justify-between">
                      <span>HEADERS</span>
                    </div>
                    <pre className="p-4 text-xs font-mono text-emerald-400">
                      <code>{`Content-Type: application/json\nx-api-key: YOUR_API_KEY`}</code>
                    </pre>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-border/40 shadow-sm bg-card">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-secondary/50 border-b">
                        <tr>
                          <th className="px-4 py-3 font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Field</th>
                          <th className="px-4 py-3 font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Type</th>
                          <th className="px-4 py-3 font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        <tr>
                          <td className="px-4 py-3 font-mono text-primary text-xs">amount</td>
                          <td className="px-4 py-3 text-xs">number</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">The amount to be paid (must be greater than 0).</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-mono text-primary text-xs">val_id</td>
                          <td className="px-4 py-3 text-xs">string</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">A unique reference ID for the payment (optional).</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
                    <div className="bg-slate-800 px-4 py-2 text-[10px] font-mono text-slate-400">SUCCESS RESPONSE</div>
                    <pre className="p-4 text-xs font-mono text-slate-300">
                      <code>{`{
  "payment_url": "https://pay.antipay.site/v1/verify?sessionId=abc123"
}`}</code>
                    </pre>
                  </div>
                </div>
              </section>

              {/* Verify Payment */}
              <section id="verify-payment" className="scroll-mt-28 space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                  <ShieldCheck className="h-5 w-5 text-primary" /> 2. Verify Payment
                </h2>
                <p className="text-muted-foreground">
                  After a user makes a payment, you can verify the transaction using the <span className="font-bold text-foreground">Verify Payment</span> endpoint. This will confirm the payment status.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-600 hover:bg-emerald-600 font-bold uppercase text-[10px]">POST</Badge>
                    <code className="text-xs font-mono text-muted-foreground">/v1/verify</code>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-border/40 shadow-sm bg-card">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-secondary/50 border-b">
                        <tr>
                          <th className="px-4 py-3 font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Field</th>
                          <th className="px-4 py-3 font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Type</th>
                          <th className="px-4 py-3 font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        <tr>
                          <td className="px-4 py-3 font-mono text-primary text-xs">trxId</td>
                          <td className="px-4 py-3 text-xs">string</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">The transaction ID returned after payment.</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-mono text-primary text-xs">sessionId</td>
                          <td className="px-4 py-3 text-xs">string</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">The session ID returned when creating the session.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
                    <div className="bg-slate-800 px-4 py-2 text-[10px] font-mono text-slate-400">SUCCESS RESPONSE</div>
                    <pre className="p-4 text-xs font-mono text-slate-300">
                      <code>{`{
  "status": "verified",
  "message": "Payment successfully verified",
  "trx_id": "DDI8ANJG4Q",
  "amount": 145,
  "method": "bkash"
}`}</code>
                    </pre>
                  </div>
                </div>
              </section>

              {/* Authentication */}
              <section id="authentication" className="scroll-mt-28 space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                  <Key className="h-5 w-5 text-primary" /> Authentication
                </h2>
                <p className="text-muted-foreground">
                  To authenticate your API requests, you will need to include the <code className="text-primary font-bold">x-api-key</code> header. This key is provided to you when you create an account with <strong>AntiPay</strong>.
                </p>
                <div className="bg-[#162129] p-4 rounded-xl border border-[#16a34a]/20">
                   <p className="text-xs font-mono text-[#16a34a]">x-api-key: YOUR_API_KEY</p>
                </div>
              </section>

              {/* Error Handling */}
              <section id="error-handling" className="scroll-mt-28 space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                  <AlertCircle className="h-5 w-5 text-primary" /> Error Handling
                </h2>
                <p className="text-muted-foreground">Our API returns standard HTTP status codes along with detailed error messages. Below are common error responses:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { code: "400", title: "Bad Request", desc: "Invalid parameters or missing required fields." },
                    { code: "401", title: "Unauthorized", desc: "Missing or invalid API key." },
                    { code: "404", title: "Not Found", desc: "The requested resource does not exist." },
                    { code: "500", title: "Internal Server Error", desc: "An error occurred on the server side." },
                  ].map((err) => (
                    <div key={err.code} className="p-4 bg-red-500/5 rounded-xl border border-red-500/10">
                      <p className="text-sm font-bold text-red-500">{err.code} {err.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{err.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Webhooks */}
              <section id="webhooks" className="scroll-mt-28 space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                  <Hash className="h-5 w-5 text-primary" /> Additional Features
                </h2>
                <div className="p-6 bg-secondary/20 rounded-2xl border border-border/40">
                  <h3 className="font-bold mb-2">Webhooks</h3>
                  <p className="text-sm text-muted-foreground mb-4">We also support webhooks for automatic notifications regarding payment status updates.</p>
                  <code className="text-xs font-mono bg-background px-3 py-1.5 rounded border">https://your-webhook-url.com</code>
                </div>
              </section>

              {/* Workflow */}
              <section id="workflow" className="scroll-mt-28 space-y-6">
                <h2 className="text-2xl font-bold text-foreground">Example Workflow</h2>
                <div className="space-y-4 relative pl-8 border-l-2 border-primary/20">
                  {[
                    { step: "1", title: "Create a payment session", desc: "Use the /create endpoint to generate a payment session and receive the payment_url." },
                    { step: "2", title: "Redirect the user", desc: "Redirect the user to the generated payment_url where they can complete the payment." },
                    { step: "3", title: "Verify the payment", desc: "After the user completes the payment, use the /verify endpoint to confirm the payment status." },
                  ].map((item) => (
                    <div key={item.step} className="relative">
                      <div className="absolute -left-[41px] top-0 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-black text-white ring-4 ring-background">
                        {item.step}
                      </div>
                      <h4 className="font-bold text-foreground">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Contact */}
              <section id="contact" className="scroll-mt-28 bg-[#16a34a] p-8 rounded-[2rem] text-white shadow-xl shadow-primary/20">
                <h2 className="text-3xl font-headline font-bold mb-4">Need help?</h2>
                <p className="opacity-90 mb-8 max-w-md">For any further queries or support, feel free to reach out to our support team:</p>
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                      <Globe className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase opacity-70">Website</p>
                      <p className="text-sm font-bold">www.antipay.site</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                      <LinkIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase opacity-70">Email</p>
                      <p className="text-sm font-bold">support.antipay@gmail.com</p>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  )
}
