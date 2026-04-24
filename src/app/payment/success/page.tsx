'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ArrowRight, ShieldCheck, Zap, Sparkles } from "lucide-react";
import { Footer } from "@/components/landing/footer";

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-[#0b141a] flex flex-col font-body selection:bg-primary/20">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <header className="border-b border-white/5 bg-[#162129]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 group transition-transform active:scale-95">
            <img src="https://i.imgur.com/18owxBD.png" alt="AntiPay" className="h-10 w-auto" />
            <span className="text-2xl font-headline font-bold tracking-tight text-[#16a34a]">AntiPay</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 py-20 relative z-10">
        <div className="max-w-xl w-full space-y-10 text-center">
          
          {/* Main Hero Icon */}
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-[#16a34a] blur-3xl opacity-30 rounded-full animate-pulse" />
            <div className="relative h-32 w-32 rounded-[2.5rem] bg-gradient-to-br from-[#16a34a] to-emerald-700 border-4 border-white/10 flex items-center justify-center mx-auto mb-8 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
               <CheckCircle2 size={64} className="text-white animate-in zoom-in duration-700 delay-200" />
               <div className="absolute -top-4 -right-4 bg-amber-500 p-2 rounded-xl shadow-lg animate-bounce">
                 <Sparkles size={20} className="text-white" />
               </div>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase italic leading-none">
              Payment <span className="text-[#16a34a]">Success!</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
              Your infrastructure upgrade is now active. Your API limits and node quotas have been updated instantly.
            </p>
          </div>

          <Card className="bg-[#162129]/60 backdrop-blur-xl border-border/10 shadow-[0_40px_100px_-15px_rgba(0,0,0,0.5)] overflow-hidden rounded-[3rem] border-2">
            <CardContent className="p-10 space-y-8">
              {/* Status Indicator */}
              <div className="flex items-center justify-between p-6 bg-[#0b141a]/50 rounded-[2rem] border border-white/5 relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                 <div className="flex items-center gap-4 relative z-10">
                    <div className="h-12 w-12 rounded-2xl bg-[#16a34a]/20 flex items-center justify-center text-[#16a34a] shadow-inner">
                       <Zap size={24} className="animate-pulse" />
                    </div>
                    <div className="text-left">
                       <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-0.5">Instance Status</p>
                       <p className="font-black text-white text-lg tracking-tight uppercase italic">Active & Secured</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-2 relative z-10">
                    <span className="text-[10px] font-bold text-[#16a34a] uppercase hidden sm:block">Real-time</span>
                    <div className="h-3 w-3 rounded-full bg-[#16a34a] shadow-[0_0_15px_rgba(22,163,74,0.8)] animate-pulse" />
                 </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                 <Button asChild className="ios-btn bg-[#16a34a] hover:bg-[#15803d] w-full h-14 text-lg font-black rounded-2xl border-none shadow-2xl shadow-[#16a34a]/20">
                    <Link href="/dashboard" className="flex items-center justify-center gap-3">
                       Access Merchant Console <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                 </Button>
                 
                 <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" asChild className="h-12 font-bold rounded-2xl border-white/5 hover:bg-white/5 text-muted-foreground hover:text-white">
                        <Link href="/dashboard/subscription">View Plan</Link>
                    </Button>
                    <Button variant="outline" asChild className="h-12 font-bold rounded-2xl border-white/5 hover:bg-white/5 text-muted-foreground hover:text-white">
                        <Link href="/dashboard/invoices">Get Invoice</Link>
                    </Button>
                 </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center gap-3 text-[11px] text-muted-foreground font-black uppercase tracking-[0.3em]">
               <ShieldCheck size={14} className="text-[#16a34a]" /> AntiPay Secured Transaction
            </div>
            <div className="h-1 w-20 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-full" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
