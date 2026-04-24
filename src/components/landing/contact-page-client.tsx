'use client';

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldCheck, ArrowLeft, Mail, Phone, MapPin, Loader2 } from "lucide-react"
import { Footer } from "@/components/landing/footer"
import { SupportFAB } from "@/components/landing/support-fab"
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { doc } from "firebase/firestore"

export function ContactPageClient() {
  const db = useFirestore();

  const settingsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'settings', 'global');
  }, [db]);

  const { data: settings, isLoading } = useDoc(settingsRef);

  return (
    <div className="min-h-screen bg-background flex flex-col font-body">
      <header className="border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-3">
             <img src="https://i.imgur.com/18owxBD.png" alt="AntiPay" className="h-12 w-auto" />
            <span className="text-2xl font-headline font-bold tracking-tight text-primary">AntiPay</span>
          </Link>
          <Button asChild variant="ghost" className="hover:bg-primary/5">
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 py-16 lg:py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="max-w-2xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight">Contact Us</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Have questions or need integration help? Our merchant support team is ready to assist you.
              </p>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center py-20 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Loading contact info...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col items-center text-center p-10 rounded-[2.5rem] bg-card border border-border/40 shadow-sm space-y-6 hover:shadow-xl transition-all group">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Mail size={32} />
                  </div>
                  <div>
                    <p className="font-bold text-xl mb-1">Email Support</p>
                    <p className="text-primary font-bold text-lg select-all">{settings?.supportEmail || "support@antipay.io"}</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-center text-center p-10 rounded-[2.5rem] bg-card border border-border/40 shadow-sm space-y-6 hover:shadow-xl transition-all group">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Phone size={32} />
                  </div>
                  <div>
                    <p className="font-bold text-xl mb-1">Phone</p>
                    <p className="text-primary font-bold text-lg select-all">{settings?.supportPhone || "+880 1700-000000"}</p>
                  </div>
                </div>

                <div className="md:col-span-2 flex flex-col items-center text-center p-10 rounded-[2.5rem] bg-secondary/20 border border-secondary/50 space-y-6 hover:shadow-xl transition-all group">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <MapPin size={32} />
                  </div>
                  <div>
                    <p className="font-bold text-xl mb-1">Our Office</p>
                    <p className="text-muted-foreground font-medium text-lg">{settings?.officeAddress || "Dhaka, Bangladesh"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <SupportFAB />
    </div>
  )
}
