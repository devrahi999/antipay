'use client';

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldCheck, ArrowLeft, BookOpen, Terminal, Code2, Cpu, CheckCircle2 } from "lucide-react"
import { Footer } from "@/components/landing/footer"

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
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
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href="/login">Merchant Console</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 py-16 lg:py-24 bg-secondary/5">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="space-y-12">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground">Developer Documentation</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Integrate AntiPay's powerful payment verification system into your platform with ease.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 rounded-2xl bg-card border shadow-sm space-y-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Terminal className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">API Reference</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Comprehensive guide to our RESTful endpoints. Learn how to authenticate requests, create sessions, and verify transactions programmatically.
                </p>
                <ul className="space-y-2 pt-2">
                  <li className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3 w-3 text-primary" /> POST /v1/sessions
                  </li>
                  <li className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3 w-3 text-primary" /> GET /v1/verify/:trxId
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-2xl bg-card border shadow-sm space-y-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Code2 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">SDKs & Libraries</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Official packages for Node.js, PHP, and Python. Speed up your integration process with our pre-built software development kits.
                </p>
                <div className="flex gap-2 pt-2">
                  <span className="px-2 py-1 rounded bg-secondary text-[10px] font-mono">npm install @antipay/sdk</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-1 shadow-2xl overflow-hidden border border-slate-800">
              <div className="bg-slate-800 px-4 py-2 flex items-center gap-2 border-b border-slate-700">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                </div>
                <span className="text-[10px] text-slate-400 font-mono ml-2">quickstart.js</span>
              </div>
              <pre className="p-6 text-[12px] font-mono text-slate-300 overflow-x-auto">
                <code>{`// Initialize AntiPay Client
const antipay = require('@antipay/sdk')('YOUR_API_KEY');

// Verify a transaction
const result = await antipay.verify({
  trxId: '8J9A1X7K',
  amount: 1200,
  method: 'bkash'
});

if (result.status === 'success') {
  console.log('Payment confirmed! Order processing...');
}`}</code>
              </pre>
            </div>

            <div className="text-center py-12">
              <p className="text-muted-foreground italic flex items-center justify-center gap-2">
                <BookOpen className="h-4 w-4" /> Full documentation portal and interactive playground coming soon.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
