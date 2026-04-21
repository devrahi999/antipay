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
    { id: "webhooks", title: "Webhooks" },
    { id: "workflow", title: "Example Workflow" },
    { id: "contact", title: "Contact Us" },
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
            <Button asChild className="bg-[#16a34a] hover:bg-[#15803d] font-bold shadow-lg shadow-[#16a34a]/20">
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
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Need Help?</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed mb-4">Our developer support team is available 24/7 for integration assistance.</p>
                <Button asChild variant="link" className="p-0 h-auto text-xs font-black text-primary hover:no-underline">
                  <Link href="/contact">Talk to Support →</Link>
                </Button>
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
                <h1 className="text-4xl md:text-6xl font-headline font-bold text-foreground tracking-tight">API Reference & Integration Guide</h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Welcome to <span className="text-primary font-bold">AntiPay</span>. This documentation provides everything you need to automate your payment verification for bKash, Nagad, and Rocket instantly using our robust JSON API.
                </p>
              </section>

              {/* Base URL */}
              <section id="base-url" className="scroll-mt-32 space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-3 text-foreground">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Globe size={18} /></div>
                  Base URL
                </h2>
                <p className="text-muted-foreground leading-relaxed">All API requests are made over HTTPS to the following production environment:</p>
                <div className="bg-[#0b141a] p-6 rounded-2xl border border-border/10 flex justify-between items-center group shadow-xl">
                  <code className="text-[#16a34a] font-mono text-sm break-all font-bold">https://pay.antipay.site/v1/</code>
                  <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-white" onClick={() => copyToClipboard("https://pay.antipay.site/v1/")}><Copy className="h-5 w-5" /></Button>
                </div>
              </section>

              {/* 1. Create Session */}
              <section id="create-session" className="scroll-mt-32 space-y-8">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold flex items-center gap-3 text-foreground">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Server size={18} /></div>
                    1. Create Payment Session
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Initiate a secure payment session. This endpoint returns a <code className="text-primary font-bold bg-primary/5 px-1 rounded">payment_url</code> where your customer should be redirected to complete the transaction.
                  </p>
                </div>
                
                <div className="flex items-center gap-3 bg-[#162129] w-fit px-4 py-2 rounded-xl border border-border/10 shadow-inner">
                  <Badge className="bg-emerald-600 hover:bg-emerald-600 font-black uppercase text-[10px] px-3 py-1">POST</Badge>
                  <code className="text-sm font-mono text-emerald-400">/v1/create</code>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">Request Body</h3>
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
                          <td className="px-6 py-4">Transaction value in BDT. Minimum 10.00</td>
                        </tr>
                        <tr className="hover:bg-primary/5 transition-colors">
                          <td className="px-6 py-4 font-mono text-primary font-bold">val_id</td>
                          <td className="px-6 py-4 text-muted-foreground font-medium">string</td>
                          <td className="px-6 py-4">Your internal Order/Reference ID.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Integration Examples</h3>
                  <Tabs defaultValue="curl" className="w-full">
                    <TabsList className="bg-[#162129] border border-border/10 p-1 rounded-t-2xl rounded-b-none h-auto flex flex-wrap justify-start border-b-0">
                      <TabsTrigger value="curl" className="px-6 py-2.5 text-xs font-bold data-[state=active]:bg-[#16a34a] data-[state=active]:text-white transition-all">cURL</TabsTrigger>
                      <TabsTrigger value="js" className="px-6 py-2.5 text-xs font-bold data-[state=active]:bg-[#16a34a] data-[state=active]:text-white transition-all">Node.js</TabsTrigger>
                      <TabsTrigger value="php" className="px-6 py-2.5 text-xs font-bold data-[state=active]:bg-[#16a34a] data-[state=active]:text-white transition-all">PHP</TabsTrigger>
                      <TabsTrigger value="python" className="px-6 py-2.5 text-xs font-bold data-[state=active]:bg-[#16a34a] data-[state=active]:text-white transition-all">Python</TabsTrigger>
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
                      <TabsContent value="python" className="m-0">
                        <pre className="text-[13px] font-mono leading-relaxed text-emerald-400 overflow-x-auto"><code>{`import requests

url = "https://pay.antipay.site/v1/create"
headers = {"x-api-key": "YOUR_API_KEY"}
data = {"amount": 145.50, "val_id": "ORDER_88721"}

res = requests.post(url, json=data, headers=headers).json()
print(f"Redirect to: {res['payment_url']}")`}</code></pre>
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
                  <p className="text-muted-foreground leading-relaxed">
                    Verify the validity of a transaction ID returned by the checkout page. Always perform this check on your server before granting access to services/products.
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-[#162129] w-fit px-4 py-2 rounded-xl border border-border/10 shadow-inner">
                  <Badge className="bg-emerald-600 hover:bg-emerald-600 font-black uppercase text-[10px] px-3 py-1">POST</Badge>
                  <code className="text-sm font-mono text-emerald-400">/v1/verify</code>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">Request Body</h3>
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
                          <td className="px-6 py-4">The 8-10 digit Transaction ID (e.g., 8J9A1X7K)</td>
                        </tr>
                        <tr className="hover:bg-primary/5 transition-colors">
                          <td className="px-6 py-4 font-mono text-primary font-bold">sessionId <span className="text-destructive">*</span></td>
                          <td className="px-6 py-4 text-muted-foreground font-medium">string</td>
                          <td className="px-6 py-4">The original Session ID returned during creation.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Verification Examples</h3>
                  <Tabs defaultValue="curl" className="w-full">
                    <TabsList className="bg-[#162129] border border-border/10 p-1 rounded-t-2xl rounded-b-none h-auto flex flex-wrap justify-start border-b-0">
                      <TabsTrigger value="curl" className="px-6 py-2.5 text-xs font-bold data-[state=active]:bg-[#16a34a] data-[state=active]:text-white transition-all">cURL</TabsTrigger>
                      <TabsTrigger value="js" className="px-6 py-2.5 text-xs font-bold data-[state=active]:bg-[#16a34a] data-[state=active]:text-white transition-all">Node.js</TabsTrigger>
                      <TabsTrigger value="php" className="px-6 py-2.5 text-xs font-bold data-[state=active]:bg-[#16a34a] data-[state=active]:text-white transition-all">PHP</TabsTrigger>
                      <TabsTrigger value="python" className="px-6 py-2.5 text-xs font-bold data-[state=active]:bg-[#16a34a] data-[state=active]:text-white transition-all">Python</TabsTrigger>
                    </TabsList>
                    <div className="bg-[#0b141a] rounded-b-2xl border border-border/10 p-8 shadow-2xl relative group">
                      <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyToClipboard('curl -X POST "https://pay.antipay.site/v1/verify"')}>
                        <Copy size={16} />
                      </Button>
                      <TabsContent value="curl" className="m-0">
                        <pre className="text-[13px] font-mono leading-relaxed text-emerald-400 overflow-x-auto"><code>{`curl -X POST "https://pay.antipay.site/v1/verify" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{
    "trxId": "DDI8ANJG4Q",
    "sessionId": "SESSION_ID_HERE"
  }'`}</code></pre>
                      </TabsContent>
                      <TabsContent value="js" className="m-0">
                        <pre className="text-[13px] font-mono leading-relaxed text-emerald-400 overflow-x-auto"><code>{`const response = await fetch("https://pay.antipay.site/v1/verify", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "YOUR_API_KEY"
  },
  body: JSON.stringify({
    trxId: "DDI8ANJG4Q",
    sessionId: "SESSION_ID_HERE"
  })
});
const result = await response.json();
if (result.status === 'verified') {
    // Deliver services here
}`}</code></pre>
                      </TabsContent>
                      <TabsContent value="php" className="m-0">
                        <pre className="text-[13px] font-mono leading-relaxed text-emerald-400 overflow-x-auto"><code>{`<?php
$payload = ["trxId" => "DDI8ANJG4Q", "sessionId" => "SESSION_ID_HERE"];
$ch = curl_init("https://pay.antipay.site/v1/verify");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json",
    "x-api-key: YOUR_API_KEY"
]);
$result = json_decode(curl_exec($ch), true);
if ($result['status'] == 'verified') {
    // Deliver services
}`}</code></pre>
                      </TabsContent>
                      <TabsContent value="python" className="m-0">
                        <pre className="text-[13px] font-mono leading-relaxed text-emerald-400 overflow-x-auto"><code>{`import requests

url = "https://pay.antipay.site/v1/verify"
headers = {"x-api-key": "YOUR_API_KEY"}
data = {"trxId": "DDI8ANJG4Q", "sessionId": "SESSION_ID_HERE"}

res = requests.post(url, json=data, headers=headers).json()
if res.get('status') == 'verified':
    print("Payment Verified Successfully!")`}</code></pre>
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Successful Response</h3>
                  <div className="bg-[#0b141a] rounded-2xl border border-border/10 p-6 shadow-xl">
                    <pre className="text-[13px] font-mono text-emerald-400 overflow-x-auto"><code>{`{
  "status": "verified",
  "message": "Payment successfully verified",
  "trx_id": "DDI8ANJG4Q",
  "amount": 145.50,
  "method": "bkash",
  "verified_at": "2024-10-24T14:22:10Z"
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
                <p className="text-muted-foreground leading-relaxed">
                  To authenticate your API requests, you must include the <code className="text-primary font-bold">x-api-key</code> header in every request. You can find your API key in the <strong>Brands</strong> section of your Merchant Console.
                </p>
                <div className="bg-secondary/30 p-6 rounded-2xl border border-border/10 shadow-inner flex items-center gap-4">
                   <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0"><Zap size={20} /></div>
                   <code className="text-sm font-mono text-foreground font-bold">x-api-key: YOUR_BRAND_API_KEY</code>
                </div>
                <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl flex gap-3">
                   <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                   <p className="text-xs text-amber-500/80 font-medium">Keep your API keys secret. Do not expose them in client-side code like React or Vue apps without a backend proxy.</p>
                </div>
              </section>

              {/* Error Handling */}
              <section id="error-handling" className="scroll-mt-32 space-y-6">
                <h2 className="text-2xl font-bold text-foreground">Error Handling</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { code: "400", title: "Bad Request", desc: "Invalid payload or missing required fields." },
                    { code: "401", title: "Unauthorized", desc: "Missing or invalid x-api-key header." },
                    { code: "404", title: "Not Found", desc: "Requested resource or session does not exist." },
                    { code: "500", title: "Server Error", desc: "Internal AntiPay failure. Contact support." }
                  ].map((err) => (
                    <div key={err.code} className="p-6 bg-card border border-border/10 rounded-2xl flex flex-col gap-2 hover:border-primary/30 transition-colors">
                      <Badge variant="outline" className="w-fit border-destructive/20 text-destructive bg-destructive/5">{err.code}</Badge>
                      <h4 className="font-bold">{err.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{err.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Workflow */}
              <section id="workflow" className="scroll-mt-32 space-y-8">
                <h2 className="text-2xl font-bold text-foreground">Example Workflow</h2>
                <div className="space-y-6 relative">
                  <div className="absolute left-6 top-0 bottom-0 w-px bg-border/20 z-0 hidden md:block" />
                  {[
                    { step: "01", title: "Create Session", desc: "Post the amount and val_id to /create. Store the sessionId for later verification." },
                    { step: "02", title: "Redirect Customer", desc: "Redirect your user to the payment_url. We handle the UI and secure SMS verification." },
                    { step: "03", title: "Confirm Payment", desc: "Once the user is redirected back to your success_url, verify the trxId on your backend." }
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

              {/* Contact Us - Premium Redesigned with Hydration Fix */}
              <section id="contact" className="scroll-mt-32 space-y-8">
                <h2 className="text-2xl font-bold text-foreground">Support & Assistance</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Email Support Card */}
                  <div className="relative group overflow-hidden p-8 bg-card border border-border/40 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-500">
                    <div className="absolute -top-12 -right-12 h-32 w-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
                    <div className="relative z-10 space-y-6">
                      <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <Mail className="h-7 w-7" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-primary tracking-[0.2em] mb-1">Direct Communication</p>
                        <h4 className="text-2xl font-bold text-foreground">support@antipay.site</h4>
                        <p className="text-xs text-muted-foreground mt-2 font-medium">Expected response time: Under 2 hours during business hours.</p>
                      </div>
                      <Button className="w-full bg-[#16a34a] hover:bg-[#15803d] font-bold h-12 rounded-xl shadow-lg shadow-[#16a34a]/20" asChild>
                        <Link href="mailto:support@antipay.site">Send Email Notification</Link>
                      </Button>
                    </div>
                  </div>

                  {/* Infrastructure Status Card */}
                  <div className="relative group overflow-hidden p-8 bg-card border border-border/40 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-500">
                    <div className="absolute -top-12 -right-12 h-32 w-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
                    <div className="relative z-10 space-y-6">
                      <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <Activity className="h-7 w-7" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em] mb-1">Infrastructure Health</p>
                        {/* FIX: Using div instead of p to avoid descendant div inside p error */}
                        <div className="text-2xl font-bold text-foreground flex items-center gap-3">
                           <div className="h-4 w-4 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" /> 
                           99.9% Operational
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 font-medium">Real-time status tracking across all nodes & gateways.</p>
                      </div>
                      <Button variant="outline" className="w-full border-emerald-500/20 hover:bg-emerald-500/5 font-bold h-12 rounded-xl" asChild>
                        <Link href="/">View Status Dashboard</Link>
                      </Button>
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
