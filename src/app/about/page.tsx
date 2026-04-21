'use client';

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldCheck, ArrowLeft } from "lucide-react"
import { Footer } from "@/components/landing/footer"

export default function AboutPage() {
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
          <h1 className="text-4xl font-headline font-bold mb-8">About AntiPay</h1>
          <div className="prose prose-green max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg">
              AntiPay is a leading payment verification infrastructure built specifically for the Bangladeshi market. Our mission is to empower merchants by automating the often tedious process of verifying mobile banking payments.
            </p>
            <p>
              In an economy where mobile banking is king, manual verification slows down business growth. AntiPay solves this by providing real-time API-driven verification for bKash, Nagad, Rocket, and other major providers.
            </p>
            <h2 className="text-2xl font-bold text-foreground pt-8">Our Vision</h2>
            <p>
              We envision a seamless digital economy in Bangladesh where every merchant, from a small online shop to a large enterprise, can accept and verify payments instantly without human intervention.
            </p>
            <h2 className="text-2xl font-bold text-foreground pt-8">Why AntiPay?</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>99.9% Verification Accuracy</li>
              <li>Real-time data synchronization</li>
              <li>Developer-first API design</li>
              <li>Secure and compliant infrastructure</li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
