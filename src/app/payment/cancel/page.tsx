'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { XCircle, RefreshCcw, ArrowLeft, AlertCircle } from "lucide-react";
import { Footer } from "@/components/landing/footer";

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-[#0b141a] flex flex-col font-body">
      <header className="border-b border-white/5 bg-[#162129]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <img src="https://i.imgur.com/18owxBD.png" alt="AntiPay" className="h-10 w-auto" />
            <span className="text-2xl font-headline font-bold tracking-tight text-[#16a34a]">AntiPay</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 py-20">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-rose-500 blur-3xl opacity-10 rounded-full animate-pulse" />
            <div className="relative h-24 w-24 rounded-full bg-rose-500/10 border-4 border-rose-500/20 flex items-center justify-center mx-auto mb-6">
               <XCircle size={48} className="text-rose-500 animate-in bounce-in duration-500" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl font-black text-white tracking-tight uppercase">Payment Aborted</h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Your transaction was cancelled or interrupted. Your account limits have not been updated.
            </p>
          </div>

          <Card className="bg-[#162129] border-border/10 shadow-2xl overflow-hidden rounded-[2rem]">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-start gap-4 p-5 bg-rose-500/5 rounded-2xl border border-rose-500/10 text-left">
                 <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                 <div>
                    <p className="text-xs font-bold text-slate-100">Why was this cancelled?</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">
                       The payment may have been cancelled by you, or the gateway session timed out. No funds were deducted.
                    </p>
                 </div>
              </div>

              <div className="space-y-4">
                 <Button asChild className="ios-btn bg-white hover:bg-slate-100 text-black w-full h-12 font-black rounded-xl border-none">
                    <Link href="/dashboard/plans">
                       <RefreshCcw className="mr-2 h-4 w-4" /> Try Again
                    </Link>
                 </Button>
                 <Button variant="ghost" asChild className="w-full text-muted-foreground hover:text-white font-bold">
                    <Link href="/dashboard">
                       <ArrowLeft className="mr-2 h-4 w-4" /> Return to Dashboard
                    </Link>
                 </Button>
              </div>
            </CardContent>
          </Card>

          <p className="text-[10px] text-muted-foreground font-medium italic">
             Need help? Contact support at supports.antipay@gmail.com
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
