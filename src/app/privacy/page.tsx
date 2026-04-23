'use client';

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldCheck, ArrowLeft } from "lucide-react"
import { Footer } from "@/components/landing/footer"
import { SupportFAB } from "@/components/landing/support-fab"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg text-primary-foreground">
              <ShieldCheck size={24} />
            </div>
            <span className="text-2xl font-headline font-bold tracking-tight text-primary">AntiPay</span>
          </Link>
          <Button asChild variant="ghost">
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 py-16 lg:py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <h1 className="text-4xl font-headline font-bold mb-8">Privacy Policy</h1>
          <div className="prose prose-green max-w-none space-y-6 text-muted-foreground">
            <p>Last updated: October 2024</p>
            <p>
              At AntiPay, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your information when you use our payment verification services.
            </p>
            <h2 className="text-2xl font-bold text-foreground pt-4">1. Information We Collect</h2>
            <p>
              We collect information you provide to us directly, such as your business details, email address, and payment method configurations. We also collect transaction data (trxId, amount) for verification purposes.
            </p>
            <h2 className="text-2xl font-bold text-foreground pt-4">2. How We Use Information</h2>
            <div>
              <p>We use your information to:</p>
              <ul className="list-disc pl-6 pt-2">
                <li>Provide and maintain our verification services.</li>
                <li>Process and verify payment transactions.</li>
                <li>Improve our API and security systems.</li>
                <li>Communicate with you regarding account updates.</li>
              </ul>
            </div>
            <h2 className="text-2xl font-bold text-foreground pt-4">3. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data. All API calls are encrypted via TLS, and sensitive keys are stored securely. We never store full customer financial details.
            </p>
          </div>
        </div>
      </main>

      <Footer />
      <SupportFAB />
    </div>
  )
}
