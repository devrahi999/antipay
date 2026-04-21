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
  Link as LinkIcon
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
    { id: "contact", title: "Contact Us" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-body">
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-3">
            <img src="https://i.imgur.com/18owxBD.png" alt="AntiPay" className="h-11 w-auto" />
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
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-28 space-y-6">
              <div>
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Documentation</h4>
                <nav className="flex flex-col gap-2">
                  {sections.map((section) => (
                    <a key={section.id} href={`#${section.id}`} className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center group transition-colors">
                      <ChevronRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                      {section.title}
                    </a>
                  ))}
                </nav>
              </div>
            </div>
          </aside>

          <main className="flex-1 max-w-4xl">
            <div className="space-y-16 pb-20">
              <section id="introduction" className="scroll-mt-28 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20">
                  <BookOpen className="h-3 w-3" /> Get Started
                </div>
                <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground">AntiPay Developer Documentation</h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Welcome to <span className="text-primary font-bold">AntiPay</span> Developer Docs! AntiPay is a secure, scalable, and flexible payment verification platform. This guide will help you understand how to integrate AntiPay’s <strong>Create</strong> and <strong>Verify</strong> APIs into your system.
                </p>
              </section>

              <section id="base-url" className="scroll-mt-28 space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground"><Globe className="h-5 w-5 text-primary" /> Base URL</h2>
                <p className="text-muted-foreground">All API requests are made to the following base URL:</p>
                <div className="bg-[#0b141a] p-4 rounded-xl border border-border/10 flex justify-between items-center group">
                  <code className="text-primary font-mono text-sm break-all">https://pay.antipay.site/v1/</code>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"><Copy className="h-4 w-4" /></Button>
                </div>
              </section>

              <section id="create-session" className="scroll-mt-28 space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground"><Terminal className="h-5 w-5 text-primary" /> 1. Create Payment Session</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The <strong>Create Payment Session</strong> endpoint allows you to initiate a payment session, providing a secure way for your users to make a payment.
                </p>
                
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-600 hover:bg-emerald-600 font-bold uppercase text-[10px]">POST</Badge>
                  <code className="text-xs font-mono text-muted-foreground">/v1/create</code>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Request Body Parameters</h3>
                  <div className="overflow-hidden rounded-xl border border-border/10">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-secondary/50 text-muted-foreground uppercase text-[10px] font-bold">
                        <tr>
                          <th className="px-4 py-3">Field</th>
                          <th className="px-4 py-3">Type</th>
                          <th className="px-4 py-3">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10">
                        <tr>
                          <td className="px-4 py-3 font-mono text-primary font-bold">amount</td>
                          <td className="px-4 py-3 text-muted-foreground">number</td>
                          <td className="px-4 py-3">The amount to be paid (must be greater than 0).</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-mono text-primary font-bold">val_id</td>
                          <td className="px-4 py-3 text-muted-foreground">string</td>
                          <td className="px-4 py-3">A unique reference ID for the payment (optional).</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Code Examples</h3>
                  <Tabs defaultValue="curl" className="w-full">
                    <TabsList className="bg-[#162129] border border-border/10 p-1 rounded-t-xl rounded-b-none h-auto flex flex-wrap justify-start">
                      <TabsTrigger value="curl" className="px-4 py-2 text-xs font-bold">cURL</TabsTrigger>
                      <TabsTrigger value="js" className="px-4 py-2 text-xs font-bold">JavaScript</TabsTrigger>
                      <TabsTrigger value="php" className="px-4 py-2 text-xs font-bold">PHP</TabsTrigger>
                      <TabsTrigger value="python" className="px-4 py-2 text-xs font-bold">Python</TabsTrigger>
                    </TabsList>
                    <div className="bg-[#0b141a] rounded-b-xl border border-t-0 border-border/10 p-6">
                      <TabsContent value="curl" className="m-0">
                        <pre className="text-xs font-mono text-emerald-400 overflow-x-auto"><code>{`curl -X POST "https://pay.antipay.site/v1/create" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{
    "amount": 145,
    "val_id": "ORDER-1001"
  }'`}</code></pre>
                      </TabsContent>
                      <TabsContent value="js" className="m-0">
                        <pre className="text-xs font-mono text-emerald-400 overflow-x-auto"><code>{`fetch("https://pay.antipay.site/v1/create", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "YOUR_API_KEY"
  },
  body: JSON.stringify({
    amount: 145,
    val_id: "ORDER-1001"
  })
})
.then(response => response.json())
.then(data => console.log(data));`}</code></pre>
                      </TabsContent>
                      <TabsContent value="php" className="m-0">
                        <pre className="text-xs font-mono text-emerald-400 overflow-x-auto"><code>{`<?php
$curl = curl_init();
curl_setopt_array($curl, [
  CURLOPT_URL => "https://pay.antipay.site/v1/create",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_POST => true,
  CURLOPT_POSTFIELDS => json_encode(["amount" => 145, "val_id" => "ORDER-1001"]),
  CURLOPT_HTTPHEADER => [
    "Content-Type: application/json",
    "x-api-key: YOUR_API_KEY"
  ],
]);
$response = curl_exec($curl);
curl_close($curl);
echo $response;`}</code></pre>
                      </TabsContent>
                      <TabsContent value="python" className="m-0">
                        <pre className="text-xs font-mono text-emerald-400 overflow-x-auto"><code>{`import requests

url = "https://pay.antipay.site/v1/create"
payload = {
    "amount": 145,
    "val_id": "ORDER-1001"
}
headers = {
    "Content-Type": "application/json",
    "x-api-key": "YOUR_API_KEY"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`}</code></pre>
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>
              </section>

              <section id="verify-payment" className="scroll-mt-28 space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground"><ShieldCheck className="h-5 w-5 text-primary" /> 2. Verify Payment</h2>
                <p className="text-muted-foreground leading-relaxed">
                  After a user makes a payment, you can verify the transaction using the <strong>Verify Payment</strong> endpoint.
                </p>

                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-600 hover:bg-emerald-600 font-bold uppercase text-[10px]">POST</Badge>
                  <code className="text-xs font-mono text-muted-foreground">/v1/verify</code>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Request Body Parameters</h3>
                  <div className="overflow-hidden rounded-xl border border-border/10">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-secondary/50 text-muted-foreground uppercase text-[10px] font-bold">
                        <tr>
                          <th className="px-4 py-3">Field</th>
                          <th className="px-4 py-3">Type</th>
                          <th className="px-4 py-3">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10">
                        <tr>
                          <td className="px-4 py-3 font-mono text-primary font-bold">trxId</td>
                          <td className="px-4 py-3 text-muted-foreground">string</td>
                          <td className="px-4 py-3">The transaction ID returned after payment.</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-mono text-primary font-bold">sessionId</td>
                          <td className="px-4 py-3 text-muted-foreground">string</td>
                          <td className="px-4 py-3">The session ID returned when creating the session.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Success Response Example</h3>
                  <div className="bg-[#0b141a] rounded-xl border border-border/10 p-6">
                    <pre className="text-xs font-mono text-emerald-400 overflow-x-auto"><code>{`{
  "status": "verified",
  "message": "Payment successfully verified",
  "trx_id": "DDI8ANJG4Q",
  "amount": 145,
  "method": "bkash"
}`}</code></pre>
                  </div>
                </div>
              </section>

              <section id="authentication" className="scroll-mt-28 space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground"><LinkIcon className="h-5 w-5 text-primary" /> Authentication</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To authenticate your API requests, you will need to include the <code>x-api-key</code> header. This key is provided to you when you create an account and register a brand with <strong>AntiPay</strong>.
                </p>
                <div className="bg-secondary/30 p-4 rounded-xl border border-border/10">
                  <code className="text-sm font-mono text-primary">x-api-key: YOUR_API_KEY</code>
                </div>
              </section>

              <section id="error-handling" className="scroll-mt-28 space-y-4">
                <h2 className="text-2xl font-bold text-foreground">Error Handling</h2>
                <p className="text-muted-foreground">Our API returns standard HTTP status codes along with detailed error messages:</p>
                <ul className="space-y-3">
                  <li className="flex gap-4 text-sm">
                    <span className="font-bold text-foreground min-w-[120px]">400 Bad Request</span>
                    <span className="text-muted-foreground">Invalid parameters or missing required fields.</span>
                  </li>
                  <li className="flex gap-4 text-sm">
                    <span className="font-bold text-foreground min-w-[120px]">401 Unauthorized</span>
                    <span className="text-muted-foreground">Missing or invalid API key.</span>
                  </li>
                  <li className="flex gap-4 text-sm">
                    <span className="font-bold text-foreground min-w-[120px]">404 Not Found</span>
                    <span className="text-muted-foreground">The requested resource does not exist.</span>
                  </li>
                  <li className="flex gap-4 text-sm">
                    <span className="font-bold text-foreground min-w-[120px]">500 Error</span>
                    <span className="text-muted-foreground">An internal server error occurred.</span>
                  </li>
                </ul>
              </section>

              <section id="webhooks" className="scroll-mt-28 space-y-4">
                <h2 className="text-2xl font-bold text-foreground">Webhooks</h2>
                <p className="text-muted-foreground">We also support webhooks for automatic notifications regarding payment status updates. Configure your endpoint in the dashboard.</p>
                <div className="bg-secondary/30 p-4 rounded-xl border border-border/10">
                  <code className="text-sm font-mono text-muted-foreground">Webhook URL: https://your-webhook-url.com</code>
                </div>
              </section>

              <section id="workflow" className="scroll-mt-28 space-y-6">
                <h2 className="text-2xl font-bold text-foreground">Example Workflow</h2>
                <div className="space-y-4">
                  {[
                    { step: "01", title: "Create Session", desc: "Use the /create endpoint to generate a payment session and receive the payment_url." },
                    { step: "02", title: "Redirect User", desc: "Redirect the user to the generated payment_url where they can complete the payment." },
                    { step: "03", title: "Verify Payment", desc: "After completion, use the /verify endpoint to confirm the transaction status." }
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4 p-4 bg-secondary/20 rounded-2xl border border-border/10">
                      <span className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0">{item.step}</span>
                      <div>
                        <h4 className="font-bold">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section id="contact" className="scroll-mt-28 space-y-4">
                <h2 className="text-2xl font-bold text-foreground">Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">For any further queries or support, feel free to reach out to our support team:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-card border rounded-xl">
                    <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Email</p>
                    <p className="text-primary font-bold">support@antipay.site</p>
                  </div>
                  <div className="p-4 bg-card border rounded-xl">
                    <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Website</p>
                    <p className="text-primary font-bold">www.antipay.site</p>
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
