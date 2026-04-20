'use client';

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldCheck, ArrowLeft, Mail, Phone, MapPin } from "lucide-react"
import { Footer } from "@/components/landing/footer"

export default function ContactPage() {
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
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="max-w-2xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-headline font-bold">Contact Us</h1>
              <p className="text-lg text-muted-foreground">
                Have questions? We're here to help you get started with AntiPay.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-card border shadow-sm space-y-4">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Mail size={28} />
                </div>
                <div>
                  <p className="font-bold text-xl">Email Support</p>
                  <p className="text-muted-foreground">support@antipay.io</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-card border shadow-sm space-y-4">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Phone size={28} />
                </div>
                <div>
                  <p className="font-bold text-xl">Phone</p>
                  <p className="text-muted-foreground">+880 1700-000000</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-secondary/20 border border-secondary space-y-4">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <MapPin size={28} />
              </div>
              <div>
                <p className="font-bold text-xl">Office</p>
                <p className="text-muted-foreground">Dhaka, Bangladesh</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
