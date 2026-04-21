'use client';

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ShieldCheck, 
  ArrowLeft, 
  BookOpen, 
  Terminal, 
  Globe, 
  Link as LinkIcon, 
  Key, 
  AlertCircle,
  Hash,
  ChevronRight,
  Copy
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
              </section>

              {/* Create Session */}
              <section id="create-session" className="scroll-mt-28 space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                  <Terminal className="h-5 w-5 text-primary" /> 1. Create Payment Session
                </h2>
                <p className="text-muted-foreground">
                  The <span className="font-bold text-foreground">Create Payment Session</span> endpoint allows you to initiate a payment session, providing a secure way for your users to make a payment.
                </p>

                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-600 hover:bg-emerald-600 font-bold uppercase text-[10px]">POST</Badge>
                    <code className="text-xs font-mono text-muted-foreground">/v1/create</code>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-foreground">Request Examples</h3>
                    <Tabs defaultValue="curl" className="w-full">
                      <TabsList className="bg-[#162129] border border-border/10 p-1 mb-0 rounded-t-xl rounded-b-none h-auto flex flex-wrap justify-start gap-1">
                        <TabsTrigger value="curl" className="px-4 py-2 text-xs font-bold data-[state=active]:bg-primary data-[state=active]:text-white">cURL</TabsTrigger>
                        <TabsTrigger value="js" className="px-4 py-2 text-xs font-bold data-[state=active]:bg-primary data-[state=active]:text-white">JavaScript</TabsTrigger>
                        <TabsTrigger value="php" className="px-4 py-2 text-xs font-bold data-[state=active]:bg-primary data-[state=active]:text-white">PHP</TabsTrigger>
                        <TabsTrigger value="python" className="px-4 py-2 text-xs font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Python</TabsTrigger>
                      </TabsList>
                      <div className="bg-[#0b141a] rounded-b-xl border border-t-0 border-border/10 overflow-hidden">
                        <div className="flex justify-between items-center px-4 py-2 bg-[#162129]/50 border-b border-border/10">
                          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Request Headers</span>
                          <button className="text-muted-foreground hover:text-primary"><Copy className="h-3.5 w-3.5" /></button>
                        </div>
                        <TabsContent value="curl" className="m-0 p-6">
                          <pre className="text-xs font-mono text-emerald-400 overflow-x-auto">
                            <code>{`curl -X POST "https://pay.antipay.site/v1/create" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{
    "amount": 145,
    "val_id": "ORDER-1001"
  }'`}</code>
                          </pre>
                        </TabsContent>
                        <TabsContent value="js" className="m-0 p-6">
                          <pre className="text-xs font-mono text-emerald-400 overflow-x-auto">
                            <code>{`const response = await fetch('https://pay.antipay.site/v1/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    amount: 145,
    val_id: 'ORDER-1001'
  })
});
const data = await response.json();
console.log(data);`}</code>
                          </pre>
                        </TabsContent>
                        <TabsContent value="php" className="m-0 p-6">
                          <pre className="text-xs font-mono text-emerald-400 overflow-x-auto">
                            <code>{`$ch = curl_init('https://pay.antipay.site/v1/create');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'x-api-key: YOUR_API_KEY'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'amount' => 145,
    'val_id' => 'ORDER-1001'
]));
$response = curl_exec($ch);
curl_close($ch);
echo $response;`}</code>
                          </pre>
                        </TabsContent>
                        <TabsContent value="python" className="m-0 p-6">
                          <pre className="text-xs font-mono text-emerald-400 overflow-x-auto">
                            <code>{`import requests

url = "https://pay.antipay.site/v1/create"
headers = {
    "Content-Type": "application/json",
    "x-api-key": "YOUR_API_KEY"
}
payload = {
    "amount": 145,
    "val_id": "ORDER-1001"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`}</code>
                          </pre>
                        </TabsContent>
                      </div>
                    </Tabs>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-foreground">Response Body</h3>
                    <div className="bg-[#0b141a] rounded-xl border border-border/10 overflow-hidden">
                      <div className="flex justify-between items-center px-4 py-2 bg-[#162129]/50 border-b border-border/10">
                        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">SUCCESS RESPONSE</span>
                        <button className="text-muted-foreground hover:text-primary"><Copy className="h-3.5 w-3.5" /></button>
                      </div>
                      <div className="p-6">
                        <pre className="text-xs font-mono text-slate-300 overflow-x-auto">
                          <code>{`{
  "payment_url": "https://pay.antipay.site/v1/verify?sessionId=abc123"
}`}</code>
                        </pre>
                      </div>
                    </div>
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

                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-600 hover:bg-emerald-600 font-bold uppercase text-[10px]">POST</Badge>
                    <code className="text-xs font-mono text-muted-foreground">/v1/verify</code>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-foreground">Request Examples</h3>
                    <Tabs defaultValue="curl" className="w-full">
                      <TabsList className="bg-[#162129] border border-border/10 p-1 mb-0 rounded-t-xl rounded-b-none h-auto flex flex-wrap justify-start gap-1">
                        <TabsTrigger value="curl" className="px-4 py-2 text-xs font-bold data-[state=active]:bg-primary data-[state=active]:text-white">cURL</TabsTrigger>
                        <TabsTrigger value="js" className="px-4 py-2 text-xs font-bold data-[state=active]:bg-primary data-[state=active]:text-white">JavaScript</TabsTrigger>
                        <TabsTrigger value="php" className="px-4 py-2 text-xs font-bold data-[state=active]:bg-primary data-[state=active]:text-white">PHP</TabsTrigger>
                        <TabsTrigger value="python" className="px-4 py-2 text-xs font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Python</TabsTrigger>
                      </TabsList>
                      <div className="bg-[#0b141a] rounded-b-xl border border-t-0 border-border/10 overflow-hidden">
                        <div className="flex justify-between items-center px-4 py-2 bg-[#162129]/50 border-b border-border/10">
                          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Request Headers</span>
                          <button className="text-muted-foreground hover:text-primary"><Copy className="h-3.5 w-3.5" /></button>
                        </div>
                        <TabsContent value="curl" className="m-0 p-6">
                          <pre className="text-xs font-mono text-emerald-400 overflow-x-auto">
                            <code>{`curl -X POST "https://pay.antipay.site/v1/verify" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{
    "trxId": "DDI8ANJG4Q",
    "sessionId": "abc123"
  }'`}</code>
                          </pre>
                        </TabsContent>
                        <TabsContent value="js" className="m-0 p-6">
                          <pre className="text-xs font-mono text-emerald-400 overflow-x-auto">
                            <code>{`const response = await fetch('https://pay.antipay.site/v1/verify', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    trxId: 'DDI8ANJG4Q',
    sessionId: 'abc123'
  })
});
const data = await response.json();
console.log(data);`}</code>
                          </pre>
                        </TabsContent>
                        <TabsContent value="php" className="m-0 p-6">
                          <pre className="text-xs font-mono text-emerald-400 overflow-x-auto">
                            <code>{`$ch = curl_init('https://pay.antipay.site/v1/verify');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'x-api-key: YOUR_API_KEY'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'trxId' => 'DDI8ANJG4Q',
    'sessionId' => 'abc123'
]));
$response = curl_exec($ch);
curl_close($ch);
echo $response;`}</code>
                          </pre>
                        </TabsContent>
                        <TabsContent value="python" className="m-0 p-6">
                          <pre className="text-xs font-mono text-emerald-400 overflow-x-auto">
                            <code>{`import requests

url = "https://pay.antipay.site/v1/verify"
headers = {
    "Content-Type": "application/json",
    "x-api-key": "YOUR_API_KEY"
}
payload = {
    "trxId": "DDI8ANJG4Q",
    "sessionId": "abc123"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`}</code>
                          </pre>
                        </TabsContent>
                      </div>
                    </Tabs>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-foreground">Response Body</h3>
                    <div className="bg-[#0b141a] rounded-xl border border-border/10 overflow-hidden">
                      <div className="flex justify-between items-center px-4 py-2 bg-[#162129]/50 border-b border-border/10">
                        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">SUCCESS RESPONSE</span>
                        <button className="text-muted-foreground hover:text-primary"><Copy className="h-3.5 w-3.5" /></button>
                      </div>
                      <div className="p-6">
                        <pre className="text-xs font-mono text-slate-300 overflow-x-auto">
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
