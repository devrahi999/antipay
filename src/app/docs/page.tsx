'use client';

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  BookOpen, 
  Terminal, 
  Globe, 
  ChevronRight,
  Copy,
  Code2,
  ShieldCheck,
  Link as LinkIcon,
  Server,
  Zap,
  CheckCircle2,
  AlertCircle,
  Mail,
  Activity
} from "lucide-react"
import { Footer } from "@/components/landing/footer"
import { useToast } from "@/hooks/use-toast"

export default function DocsPage() {
  const { toast } = useToast();
  
  const sections = [
    { id: "introduction", title: "Introduction" },
    { id: "base-url", title: "Base URL" },
    { id: "create-session", title: "1. Create Session" },
    { id: "verify-payment", title: "2. Verify Payment" },
    { id: "authentication", title: "Authentication" },
    { id: "error-handling", title: "Error Handling" },
    { id: "workflow", title: "Example Workflow" },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Code snippet copied to clipboard." });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-body selection:bg-primary/20">
      {/* Premium Header */}
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-3 group">
            <img src="https://i.imgur.com/18owxBD.png" alt="AntiPay" className="h-12 w-auto transition-transform group-hover:scale-105" />
            <span className="text-2xl font-headline font-bold tracking-tight text-primary">AntiPay</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" className="hidden sm:flex hover:bg-primary/5">
              <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
            </Button>
            <Button asChild className="ios-btn bg-[#16a34a] hover:bg-[#15803d] font-bold shadow-lg shadow-[#16a34a]/20 border-none">
              <Link href="/login">Merchant Console</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 md:px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-32 space-y-8">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60 mb-6 ml-4">Documentation</h4>
                <nav className="flex flex-col gap-1">
                  {sections.map((section) => (
                    <a 
                      key={section.id} 
                      href={`#${section.id}`} 
                      className="text-sm font-semibold text-muted-foreground hover:text-primary px-4 py-2 rounded-xl hover:bg-primary/5 flex items-center group transition-all"
                    >
                      <ChevronRight className="h-3.5 w-3.5 mr-2 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-primary" />
                      {section.title}
                    </a>
                  ))}
                </nav>
              </div>
              
              <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10">
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Technical Support</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">Our engineer-led support is available to help you with complex custom integrations.</p>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 max-w-4xl">
            <div className="space-y-24 pb-20">
              {/* Introduction */}
              <section id="introduction" className="scroll-mt-32 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.15em] border border-primary/20">
                  <BookOpen className="h-3 w-3" /> Developer Portal
                </div>
                <h1 className="text-4xl md:text-6xl font-headline font-bold text-foreground tracking-tight">API Reference Guide</h1>
                <div className="space-y-4">
                  <p className="text-xl text-muted-foreground leading-relaxed">
                    The AntiPay API is organized around REST. Our API has predictable resource-oriented URLs, returns JSON-encoded responses, and uses standard HTTP response codes, authentication, and verbs.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    This guide will walk you through the process of creating a payment session and verifying it on your backend. To start integrating, you will need an <strong>API Key</strong> which can be generated from your <Link href="/dashboard/brands" className="text-primary font-bold hover:underline">Brand Dashboard</Link>.
                  </p>
                </div>
              </section>

              {/* Base URL */}
              <section id="base-url" className="scroll-mt-32 space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-3 text-foreground">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Globe size={18} /></div>
                  Base URL
                </h2>
                <div className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    Every request to the AntiPay API must be made to the following base URL. We recommend using environment variables in your application to store this path securely.
                  </p>
                  <div className="bg-[#0b141a] p-6 rounded-2xl border border-border/10 flex justify-between items-center group shadow-xl">
                    <code className="text-[#16a34a] font-mono text-sm break-all font-bold">https://pay.antipay.site/v1/</code>
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-white" onClick={() => copyToClipboard("https://pay.antipay.site/v1/")}><Copy className="h-5 w-5" /></Button>
                  </div>
                </div>
              </section>

              {/* 1. Create Session */}
              <section id="create-session" className="scroll-mt-32 space-y-8">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold flex items-center gap-3 text-foreground">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Server size={18} /></div>
                    1. Create Payment Session
                  </h2>
                  <div className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      To initiate a payment, you must call the <code>/create</code> endpoint. This step registers the intent to pay and sets the amount. Once successful, the API returns a <strong>Session ID</strong> and a <strong>Payment URL</strong>.
                    </p>
                    <p className="text-sm font-medium p-4 bg-primary/5 border-l-4 border-primary rounded-r-xl">
                      <strong>Developer Note:</strong> You should store the <code>sessionId</code> in your database associated with your order. You will need it in step 2 to verify the final payment status.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 bg-[#162129] w-fit px-4 py-2 rounded-xl border border-border/10 shadow-inner">
                  <Badge className="bg-emerald-600 hover:bg-emerald-600 font-black uppercase text-[10px] px-3 py-1">POST</Badge>
                  <code className="text-sm font-mono text-emerald-400">/v1/create</code>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">Request Parameters</h3>
                  <div className="overflow-hidden rounded-2xl border border-border/10 shadow-lg">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-[#162129] text-muted-foreground uppercase text-[10px] font-black tracking-widest">
                        <tr>
                          <th className="px-6 py-4">Parameter</th>
                          <th className="px-6 py-4">Type</th>
                          <th className="px-6 py-4">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10 bg-[#0b141a]/30">
                        <tr className="hover:bg-primary/5 transition-colors">
                          <td className="px-6 py-4 font-mono text-primary font-bold">amount <span className="text-destructive">*</span></td>
                          <td className="px-6 py-4 text-muted-foreground font-medium">number</td>
                          <td className="px-6 py-4">The total amount to be charged in BDT.</td>
                        </tr>
                        <tr className="hover:bg-primary/5 transition-colors">
                          <td className="px-6 py-4 font-mono text-primary font-bold">val_id</td>
                          <td className="px-6 py-4 text-muted-foreground font-medium">string</td>
                          <td className="px-6 py-4">Your internal reference (e.g. Order ID).</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Implementation Snippets</h3>
                  <Tabs defaultValue="curl" className="w-full">
                    <TabsList className="bg-[#162129] border border-border/10 p-1 rounded-t-2xl rounded-b-none h-auto flex flex-wrap justify-start border-b-0">
                      <TabsTrigger value="curl" className="px-6 py-2.5 text-xs font-bold data-[state=active]:bg-[#16a34a] data-[state=active]:text-white transition-all">cURL</TabsTrigger>
                      <TabsTrigger value="js" className="px-6 py-2.5 text-xs font-bold data-[state=active]:bg-[#16a34a] data-[state=active]:text-white transition-all">Node.js</TabsTrigger>
                      <TabsTrigger value="php" className="px-6 py-2.5 text-xs font-bold data-[state=active]:bg-[#16a34a] data-[state=active]:text-white transition-all">PHP</TabsTrigger>
                    </TabsList>
                    <div className="bg-[#0b141a] rounded-b-2xl border border-border/10 p-8 shadow-2xl relative group">
                      <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyToClipboard('curl -X POST "https://pay.antipay.site/v1/create"')}><Copy size={16} /></Button>
                      <TabsContent value="curl" className="m-0">
                        <pre className="text-[13px] font-mono leading-relaxed text-emerald-400 overflow-x-auto"><code>{`curl -X POST "https://pay.antipay.site/v1/create" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{
    "amount": 145.50,
    "val_id": "ORDER_88721"
  }'`}</code></pre>
                      </TabsContent>
                      <TabsContent value="js" className="m-0">
                        <pre className="text-[13px] font-mono leading-relaxed text-emerald-400 overflow-x-auto"><code>{`const response = await fetch("https://pay.antipay.site/v1/create", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "YOUR_API_KEY"
  },
  body: JSON.stringify({
    amount: 145.50,
    val_id: "ORDER_88721"
  })
});
const data = await response.json();
window.location.href = data.payment_url;`}</code></pre>
                      </TabsContent>
                      <TabsContent value="php" className="m-0">
                        <pre className="text-[13px] font-mono leading-relaxed text-emerald-400 overflow-x-auto"><code>{`<?php
$payload = ["amount" => 145.50, "val_id" => "ORDER_88721"];
$ch = curl_init("https://pay.antipay.site/v1/create");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json",
    "x-api-key: YOUR_API_KEY"
]);
$res = json_decode(curl_exec($ch), true);
header("Location: " . $res['payment_url']);`}</code></pre>
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>
              </section>

              {/* 2. Verify Payment */}
              <section id="verify-payment" className="scroll-mt-32 space-y-8">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold flex items-center gap-3 text-foreground">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><ShieldCheck size={18} /></div>
                    2. Verify Payment
                  </h2>
                  <div className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      After the customer completes the transaction on our hosted page, they are redirected back to your <strong>Redirect URL</strong>. At this point, your backend must verify the payment to confirm the funds were successfully received.
                    </p>
                    <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl flex gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                      <p className="text-xs text-amber-500 font-medium">Never fulfill an order based solely on client-side redirection. Always call our <code>/verify</code> endpoint server-side to confirm the transaction is legitimate.</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-[#162129] w-fit px-4 py-2 rounded-xl border border-border/10 shadow-inner">
                  <Badge className="bg-emerald-600 hover:bg-emerald-600 font-black uppercase text-[10px] px-3 py-1">POST</Badge>
                  <code className="text-sm font-mono text-emerald-400">/v1/verify</code>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">Request Parameters</h3>
                  <div className="overflow-hidden rounded-2xl border border-border/10 shadow-lg">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-[#162129] text-muted-foreground uppercase text-[10px] font-black tracking-widest">
                        <tr>
                          <th className="px-6 py-4">Parameter</th>
                          <th className="px-6 py-4">Type</th>
                          <th className="px-6 py-4">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10 bg-[#0b141a]/30">
                        <tr className="hover:bg-primary/5 transition-colors">
                          <td className="px-6 py-4 font-mono text-primary font-bold">trxId <span className="text-destructive">*</span></td>
                          <td className="px-6 py-4 text-muted-foreground font-medium">string</td>
                          <td className="px-6 py-4">The transaction ID (e.g. bKash TrxID).</td>
                        </tr>
                        <tr className="hover:bg-primary/5 transition-colors">
                          <td className="px-6 py-4 font-mono text-primary font-bold">sessionId <span className="text-destructive">*</span></td>
                          <td className="px-6 py-4 text-muted-foreground font-medium">string</td>
                          <td className="px-6 py-4">The original Session ID from Step 1.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Verification Logic Example</h3>
                  <div className="bg-[#0b141a] rounded-2xl border border-border/10 p-8 shadow-2xl">
                    <pre className="text-[13px] font-mono leading-relaxed text-emerald-400 overflow-x-auto"><code>{`// Post the TrxID and SessionID to our API
const response = await fetch("https://pay.antipay.site/v1/verify", {
  method: "POST",
  headers: { "x-api-key": "YOUR_API_KEY" },
  body: JSON.stringify({ trxId: "8J9A1X7K", sessionId: "SESS_123" })
});

const result = await response.json();
if (result.status === 'verified') {
    // 1. Mark order as PAID in your database
    // 2. Deliver the digital product or service
    // 3. Inform the user of success
}`}</code></pre>
                  </div>
                </div>
              </section>

              {/* Authentication */}
              <section id="authentication" className="scroll-mt-32 space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-3 text-foreground">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><LinkIcon size={18} /></div>
                  Authentication
                </h2>
                <div className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    AntiPay uses API keys to authenticate requests. You can view and manage your API keys in the <strong>Brands</strong> section of the merchant console.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Your API keys carry many privileges, so be sure to keep them secure! Do not share your secret API keys in publicly accessible areas such as GitHub, client-side code, and so forth.
                  </p>
                  <div className="bg-secondary/30 p-6 rounded-2xl border border-border/10 shadow-inner flex items-center gap-4">
                     <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0"><Zap size={20} /></div>
                     <code className="text-sm font-mono text-foreground font-bold">x-api-key: YOUR_BRAND_API_KEY</code>
                  </div>
                </div>
              </section>

              {/* Error Handling */}
              <section id="error-handling" className="scroll-mt-32 space-y-6">
                <h2 className="text-2xl font-bold text-foreground">Error Codes</h2>
                <div className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    AntiPay uses conventional HTTP response codes to indicate the success or failure of an API request. In general: Codes in the <code>2xx</code> range indicate success. Codes in the <code>4xx</code> range indicate an error that failed given the information provided.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { code: "400", title: "Bad Request", desc: "The request was unacceptable, often due to missing a required parameter." },
                      { code: "401", title: "Unauthorized", desc: "No valid API key provided." },
                      { code: "404", title: "Not Found", desc: "The requested resource doesn't exist." },
                      { code: "500", title: "Server Errors", desc: "Something went wrong on AntiPay's end." }
                    ].map((err) => (
                      <div key={err.code} className="p-6 bg-card border border-border/10 rounded-2xl flex flex-col gap-2 hover:border-primary/30 transition-colors">
                        <Badge variant="outline" className="w-fit border-destructive/20 text-destructive bg-destructive/5 font-black">{err.code}</Badge>
                        <h4 className="font-bold text-foreground">{err.title}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{err.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Workflow */}
              <section id="workflow" className="scroll-mt-32 space-y-8">
                <h2 className="text-2xl font-bold text-foreground">Integration Workflow</h2>
                <div className="space-y-6 relative">
                  <div className="absolute left-6 top-0 bottom-0 w-px bg-border/20 z-0 hidden md:block" />
                  {[
                    { step: "01", title: "Server Call", desc: "Your backend calls /create to get a payment URL. Store the sessionId for later." },
                    { step: "02", title: "User Payment", desc: "User is redirected to AntiPay. They send money and enter the TrxID on our UI." },
                    { step: "03", title: "Redirection", desc: "User is redirected back to your site. You grab the TrxID from the URL parameters." },
                    { step: "04", title: "Final Verification", desc: "Your backend calls /verify with the TrxID and stored SessionID to finalize the order." }
                  ].map((item) => (
                    <div key={item.step} className="flex gap-6 p-6 bg-[#162129]/30 rounded-[2rem] border border-border/10 relative z-10 hover:bg-primary/5 transition-colors group">
                      <span className="h-12 w-12 rounded-2xl bg-[#16a34a] text-white flex items-center justify-center font-black text-xl shadow-lg shadow-[#16a34a]/20 group-hover:scale-110 transition-transform">{item.step}</span>
                      <div>
                        <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
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
