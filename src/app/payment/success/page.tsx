'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { Footer } from "@/components/landing/footer";

export default function PaymentSuccessPage() {
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
            <div className="absolute inset-0 bg-[#16a34a] blur-3xl opacity-20 rounded-full animate-pulse" />
            <div className="relative h-24 w-24 rounded-full bg-[#16a34a]/10 border-4 border-[#16a34a]/20 flex items-center justify-center mx-auto mb-6">
               <CheckCircle2 size={48} className="text-[#16a34a] animate-in zoom-in duration-500" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl font-black text-white tracking-tight uppercase">Payment Success!</h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Your infrastructure upgrade is now active. Your API limits and node quotas have been updated instantly.
            </p>
          </div>

          <Card className="bg-[#162129] border-border/10 shadow-2xl overflow-hidden rounded-[2rem]">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center justify-between p-4 bg-[#0b141a] rounded-2xl border border-border/5">
                 <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#16a34a]/10 flex items-center justify-center text-[#16a34a]">
                       <Zap size={20} />
                    </div>
                    <div className="text-left">
                       <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Instance Status</p>
                       <p className="font-bold text-white">Active & Secured</p>
                    </div>
                 </div>
                 <div className="h-2 w-2 rounded-full bg-[#16a34a] animate-pulse" />
              </div>

              <div className="space-y-4">
                 <Button asChild className="ios-btn bg-[#16a34a] hover:bg-[#15803d] w-full h-12 font-black rounded-xl border-none">
                    <Link href="/dashboard">
                       Access Merchant Console <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                 </Button>
                 <Button variant="ghost" asChild className="w-full text-muted-foreground hover:text-white font-bold">
                    <Link href="/dashboard/subscription">View Plan Details</Link>
                 </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">
             <ShieldCheck size={12} className="text-[#16a34a]" /> AntiPay Secured Transaction
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
