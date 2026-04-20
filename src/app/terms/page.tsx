'use client';

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldCheck, ArrowLeft } from "lucide-react"
import { Footer } from "@/components/landing/footer"

export default function TermsPage() {
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
          <h1 className="text-4xl font-headline font-bold mb-8">Terms of Service</h1>
          <div className="prose prose-green max-w-none space-y-6 text-muted-foreground">
            <p>Last updated: October 2024</p>
            <h2 className="text-2xl font-bold text-foreground pt-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using AntiPay, you agree to be bound by these Terms of Service. If you do not agree, you may not use our services.
            </p>
            <h2 className="text-2xl font-bold text-foreground pt-4">2. Use of Service</h2>
            <p>
              AntiPay provides payment verification tools. You are responsible for maintaining the confidentiality of your API keys and for all activities that occur under your account.
            </p>
            <h2 className="text-2xl font-bold text-foreground pt-4">3. Prohibited Activities</h2>
            <p>
              You may not use AntiPay for any illegal activities, including fraud, money laundering, or unauthorized access to third-party data.
            </p>
            <h2 className="text-2xl font-bold text-foreground pt-4">4. Limitation of Liability</h2>
            <p>
              AntiPay is not liable for any indirect, incidental, or consequential damages arising from the use or inability to use our services.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
