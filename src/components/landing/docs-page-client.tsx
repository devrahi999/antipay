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
  Activity,
  Download,
  ShieldAlert,
  Webhook
} from "lucide-react"
import { Footer } from "@/components/landing/footer"
import { SupportFAB } from "@/components/landing/support-fab"
import { useToast } from "@/hooks/use-toast"

export function DocsPageClient() {
  const { toast } = useToast();
  
  const sections = [
    { id: "introduction", title: "Introduction" },
    { id: "base-url", title: "Base URL" },
    { id: "authentication", title: "Authentication" },
    { id: "create-session", title: "1. Create Session" },
    { id: "verify-payment", title: "2. Verify Payment" },
    { id: "webhook", title: "3. Webhook" },
    { id: "redirect-flow", title: "4. Redirect Flow" },
    { id: "error-handling", title: "Error Codes" },
    { id: "workflow", title: "Final Workflow" },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Code snippet copied to clipboard." });
  };

  const downloadGuide = () => {
    const content = `API Reference Guide - AntiPay

The AntiPay API is organized around REST. Our API returns JSON responses and uses standard HTTP response codes.

----------------------------------------
BASE URL
----------------------------------------
https://pay.antipay.site/api/v1

----------------------------------------
AUTHENTICATION
----------------------------------------
All requests must include your API key in the header:
x-api-key: YOUR_BRAND_API_KEY

⚠️ The API key variable name must be set to 'x-api-key' in your request headers.

----------------------------------------
1. CREATE PAYMENT SESSION
----------------------------------------
POST /api/v1/create

Request Parameters:
- amount (number, required): The amount to be charged in BDT.
- val_id (string, optional): Your internal reference (Order ID).
- webhook_url (string, required): Your backend endpoint to receive payment updates.

----------------------------------------
2. VERIFY PAYMENT (SERVER ONLY)
----------------------------------------
POST /api/v1/verify

----------------------------------------
3. WEBHOOK (IMPORTANT)
----------------------------------------
AntiPay sends a POST request to your webhook_url when payment status changes.
⚠️ This is the PRIMARY way to confirm payments.

----------------------------------------
FINAL INTEGRATION FLOW
----------------------------------------
1. Your backend -> /create (get paymentUrl)
2. User pays using AntiPay UI
3. User completes payment
4. AntiPay -> webhook (backend notified)
5. Backend -> mark order as PAID
6. User -> redirected to success/cancel page
7. (Optional) backend -> /verify for double check`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "antipay-api-guide.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Guide Downloaded", description: "The updated guide has been saved." });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-body selection:bg-primary/20">
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
            <Button 
              onClick={downloadGuide}
              variant="outline" 
              className="hidden md:flex font-bold border-primary/20 hover:bg-primary/5 text-primary"
            >
              <Download className="mr-2 h-4 w-4" /> Download .txt
            </Button>
            <Button asChild className="ios-btn bg-[#16a34a] hover:bg-[#15803d] font-bold shadow-lg shadow-[#16a34a]/20 border-none">
              <Link href="/login">Merchant Console</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 md:px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-16">
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-32 space-y-8">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60 mb-6 ml-4">Developer Guide</h4>
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
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Support</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">Our engineer team is available to help you with complex custom integrations.</p>
              </div>
            </div>
          </aside>

          <main className="flex-1 max-w-4xl">
            <div className="space-y-24 pb-20">
              <section id="introduction" className="scroll-mt-32 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.15em] border border-primary/20 w-fit">
                  <BookOpen className="h-3 w-3" /> API Reference Guide
                </div>
                <h1 className="text-4xl md:text-6xl font-headline font-bold text-foreground tracking-tight">API Integration</h1>
                <div className="space-y-4">
                  <p className="text-xl text-muted-foreground leading-relaxed">
                    The AntiPay API is organized around REST. Our API returns JSON responses and uses standard HTTP response codes.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    This guide explains how to create a payment session, receive real-time updates via webhook, and verify payments securely. To start integrating, you will need an <strong>API Key</strong> which can be generated from your <Link href="/dashboard/brands" className="text-primary font-bold hover:underline">Brand Dashboard</Link>.
                  </p>
                </div>
              </section>

              <section id="base-url" className="scroll-mt-32 space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-3 text-foreground">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Globe size={18} /></div>
                  Base URL
                </h2>
                <div className="bg-[#0b141a] p-6 rounded-2xl border border-border/10 flex justify-between items-center group shadow-xl">
                  <code className="text-[#16a34a] font-mono text-sm break-all font-bold">https://pay.antipay.site/api/v1</code>
                  <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-white" onClick={() => copyToClipboard("https://pay.antipay.site/api/v1")}><Copy className="h-5 w-5" /></Button>
                </div>
              </section>

              <section id="authentication" className="scroll-mt-32 space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-3 text-foreground">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><ShieldAlert size={18} /></div>
                  Authentication
                </h2>
                <div className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    All requests must include your unique brand API key in the headers.
                  </p>
                  <div className="bg-secondary/30 p-6 rounded-2xl border border-border/10 shadow-inner flex items-center gap-4">
                     <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0"><Zap size={20} /></div>
                     <code className="text-sm font-mono text-foreground font-bold">x-api-key: YOUR_BRAND_API_KEY</code>
                  </div>
                  <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl flex gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                    <div className="space-y-1">
                      <p className="text-xs text-amber-500 font-medium">⚠️ Never expose your API key in frontend code or client-side repositories.</p>
                      <p className="text-xs text-amber-500 font-bold italic">The API key variable name must be set with 'x-api-key' and also must be included in the header when sending requests.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section id="create-session" className="scroll-mt-32 space-y-8">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold flex items-center gap-3 text-foreground">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Server size={18} /></div>
                    1. Create Payment Session
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Creates a payment session and returns a hosted payment URL.
                  </p>
                </div>
                
                <div className="flex items-center gap-3 bg-[#162129] w-fit px-4 py-2 rounded-xl border border-border/10 shadow-inner">
                  <Badge className="bg-emerald-600 hover:bg-emerald-600 font-black uppercase text-[10px] px-3 py-1">POST</Badge>
                  <code className="text-sm font-mono text-emerald-400">/api/v1/create</code>
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
                          <td className="px-6 py-4">The amount to be charged in BDT.</td>
                        </tr>
                        <tr className="hover:bg-primary/5 transition-colors">
                          <td className="px-6 py-4 font-mono text-primary font-bold">val_id</td>
                          <td className="px-6 py-4 text-muted-foreground font-medium">string</td>
                          <td className="px-6 py-4">Your internal reference (Order ID).</td>
                        </tr>
                        <tr className="hover:bg-primary/5 transition-colors">
                          <td className="px-6 py-4 font-mono text-primary font-bold">webhook_url <span className="text-destructive">*</span></td>
                          <td className="px-6 py-4 text-muted-foreground font-medium">string</td>
                          <td className="px-6 py-4">Your endpoint to receive payment updates.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Implementation Snippets</h3>
                  <Tabs defaultValue="curl" className="w-full">
                    <TabsList className="bg-[#162129] border border-border/10 p-1 rounded-t-2xl rounded-b-none h-auto flex flex-wrap justify-start border-b-0">
                      <TabsTrigger value="curl" className="px-6 py-2.5 text-xs font-bold data-[state=active]:bg-[#16a34a] data-[state=active]:text-white transition-all uppercase">cURL</TabsTrigger>
                      <TabsTrigger value="nodejs" className="px-6 py-2.5 text-xs font-bold data-[state=active]:bg-[#16a34a] data-[state=active]:text-white transition-all uppercase">Node.js</TabsTrigger>
                      <TabsTrigger value="php" className="px-6 py-2.5 text-xs font-bold data-[state=active]:bg-[#16a34a] data-[state=active]:text-white transition-all uppercase">PHP</TabsTrigger>
                      <TabsTrigger value="python" className="px-6 py-2.5 text-xs font-bold data-[state=active]:bg-[#16a34a] data-[state=active]:text-white transition-all uppercase">Python</TabsTrigger>
                    </TabsList>
                    <div className="bg-[#0b141a] rounded-b-2xl border border-border/10 p-8 shadow-2xl relative group">
                      <TabsContent value="curl" className="m-0">
                        <pre className="text-[13px] font-mono leading-relaxed text-emerald-400 overflow-x-auto"><code>{`curl -X POST "https://pay.antipay.site/api/v1/create" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{
    "amount": 145.50,
    "val_id": "ORDER_88721",
    "webhook_url": "https://your-site.com/webhook"
  }'`}</code></pre>
                      </TabsContent>
                      <TabsContent value="nodejs" className="m-0">
                        <pre className="text-[13px] font-mono leading-relaxed text-emerald-400 overflow-x-auto"><code>{`const response = await fetch("https://pay.antipay.site/api/v1/create", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "YOUR_API_KEY"
  },
  body: JSON.stringify({
    amount: 145.50,
    val_id: "ORDER_88721",
    webhook_url: "https://your-site.com/webhook"
  })
});

const { paymentUrl } = await response.json();
window.location.href = paymentUrl;`}</code></pre>
                      </TabsContent>
                      <TabsContent value="php" className="m-0">
                        <pre className="text-[13px] font-mono leading-relaxed text-emerald-400 overflow-x-auto"><code>{`<?php
$data = [
    "amount" => 145.50,
    "val_id" => "ORDER_88721",
    "webhook_url" => "https://your-site.com/webhook"
];

$ch = curl_init("https://pay.antipay.site/api/v1/create");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json",
    "x-api-key: YOUR_API_KEY"
]);

$result = json_decode(curl_exec($ch), true);
header("Location: " . $result['paymentUrl']);
?>`}</code></pre>
                      </TabsContent>
                      <TabsContent value="python" className="m-0">
                        <pre className="text-[13px] font-mono leading-relaxed text-emerald-400 overflow-x-auto"><code>{`import requests

url = "https://pay.antipay.site/api/v1/create"
headers = {"x-api-key": "YOUR_API_KEY"}
payload = {
    "amount": 145.50,
    "val_id": "ORDER_88721",
    "webhook_url": "https://your-site.com/webhook"
}

response = requests.post(url, json=payload, headers=headers)
data = response.json()
print(f"Redirect user to: {data['paymentUrl']}")`}</code></pre>
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>
              </section>

              <section id="verify-payment" className="scroll-mt-32 space-y-8">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold flex items-center gap-3 text-foreground">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><ShieldCheck size={18} /></div>
                    2. Verify Payment (Server Only)
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Verify payment manually (optional but recommended for extra security).
                  </p>
                </div>

                <Tabs defaultValue="curl" className="w-full">
                    <TabsList className="bg-[#162129] border border-border/10 p-1 rounded-t-2xl rounded-b-none h-auto flex flex-wrap justify-start border-b-0">
                      <TabsTrigger value="curl" className="px-6 py-2.5 text-xs font-bold data-[state=active]:bg-[#16a34a] data-[state=active]:text-white transition-all uppercase">cURL</TabsTrigger>
                      <TabsTrigger value="nodejs" className="px-6 py-2.5 text-xs font-bold data-[state=active]:bg-[#16a34a] data-[state=active]:text-white transition-all uppercase">Node.js</TabsTrigger>
                      <TabsTrigger value="php" className="px-6 py-2.5 text-xs font-bold data-[state=active]:bg-[#16a34a] data-[state=active]:text-white transition-all uppercase">PHP</TabsTrigger>
                      <TabsTrigger value="python" className="px-6 py-2.5 text-xs font-bold data-[state=active]:bg-[#16a34a] data-[state=active]:text-white transition-all uppercase">Python</TabsTrigger>
                    </TabsList>
                    <div className="bg-[#0b141a] rounded-b-2xl border border-border/10 p-8 shadow-2xl relative group">
                      <TabsContent value="curl" className="m-0">
                        <pre className="text-[13px] font-mono leading-relaxed text-emerald-400 overflow-x-auto"><code>{`curl -X POST "https://pay.antipay.site/api/v1/verify" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{
    "trxId": "8J9A1X7K",
    "sessionId": "sess_xxx"
  }'`}</code></pre>
                      </TabsContent>
                      <TabsContent value="nodejs" className="m-0">
                        <pre className="text-[13px] font-mono leading-relaxed text-emerald-400 overflow-x-auto"><code>{`const response = await fetch("https://pay.antipay.site/api/v1/verify", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "YOUR_API_KEY"
  },
  body: JSON.stringify({ 
    trxId: "8J9A1X7K", 
    sessionId: "sess_xxx" 
  })
});

const result = await response.json();
if (result.status === 'verified') {
  console.log("Payment Confirmed");
}`}</code></pre>
                      </TabsContent>
                      <TabsContent value="php" className="m-0">
                        <pre className="text-[13px] font-mono leading-relaxed text-emerald-400 overflow-x-auto"><code>{`<?php
$data = ["trxId" => "8J9A1X7K", "sessionId" => "sess_xxx"];
$ch = curl_init("https://pay.antipay.site/api/v1/verify");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json",
    "x-api-key: YOUR_API_KEY"
]);

$result = json_decode(curl_exec($ch), true);
if($result['status'] === 'verified') {
    // Success logic
}
?>`}</code></pre>
                      </TabsContent>
                      <TabsContent value="python" className="m-0">
                        <pre className="text-[13px] font-mono leading-relaxed text-emerald-400 overflow-x-auto"><code>{`import requests

url = "https://pay.antipay.site/api/v1/verify"
headers = {"x-api-key": "YOUR_API_KEY"}
payload = {"trxId": "8J9A1X7K", "sessionId": "sess_xxx"}

response = requests.post(url, json=payload, headers=headers)
if response.json().get('status') == 'verified':
    print("Verification Successful")`}</code></pre>
                      </TabsContent>
                    </div>
                </Tabs>
              </section>

              <section id="webhook" className="scroll-mt-32 space-y-8">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold flex items-center gap-3 text-foreground">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Webhook size={18} /></div>
                    3. Webhook (IMPORTANT)
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    AntiPay will send a POST request to your <code>webhook_url</code> when payment status changes. 
                    <strong> This is the PRIMARY way to confirm payments.</strong>
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Webhook Payload Example</h3>
                  <div className="bg-[#0b141a] rounded-2xl border border-border/10 p-8 shadow-2xl">
                    <pre className="text-[13px] font-mono leading-relaxed text-emerald-400 overflow-x-auto"><code>{`POST https://your-site.com/api/webhook

{
  "status": "verified",
  "sessionId": "sess_xxx",
  "trxId": "8J9A1X7K",
  "amount": 145.50,
  "method": "bkash",
  "val_id": "ORDER_88721"
}`}</code></pre>
                  </div>
                </div>
              </section>

              <section id="redirect-flow" className="scroll-mt-32 space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-3 text-foreground">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Activity size={18} /></div>
                  4. Redirect Flow (User Side)
                </h2>
                <div className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    After payment, users are redirected back to your configured URLs. Note: These URLs must be configured in your AntiPay Brand Dashboard.
                  </p>
                  <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-xl flex gap-3">
                    <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
                    <p className="text-xs text-rose-500 font-medium">⚠️ Do NOT trust query parameters alone for order fulfillment. Always rely on the webhook or /verify endpoint.</p>
                  </div>
                </div>
              </section>

              <section id="workflow" className="scroll-mt-32 space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-3 text-foreground">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><CheckCircle2 size={18} /></div>
                  Final Integration Flow
                </h2>
                <div className="relative border-l-2 border-primary/20 ml-4 pl-8 space-y-8">
                   {[
                     "Your backend calls /create with amount, webhook, and identifier (val_id).",
                     "User is sent to the AntiPay hosted payment URL.",
                     "User completes the payment flow.",
                     "AntiPay sends a POST webhook to your server instantly.",
                     "Your backend receives webhook and marks order as PAID.",
                     "User is redirected back to your configured success/cancel page.",
                     "(Optional) Your server calls /verify for a final double-check."
                   ].map((step, i) => (
                     <div key={i} className="relative">
                        <div className="absolute -left-11 top-0 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-black text-white">{i+1}</div>
                        <p className="text-sm text-muted-foreground font-medium">{step}</p>
                     </div>
                   ))}
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
      <Footer />
      <SupportFAB />
    </div>
  )
}
