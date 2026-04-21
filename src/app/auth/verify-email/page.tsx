
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { applyActionCode } from 'firebase/auth';
import { ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/firebase';
import Link from 'next/link';

function VerifyEmailForm() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const auth = useAuth();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get('oobCode');
  const mode = searchParams.get('mode');

  useEffect(() => {
    // Security check: If mode is not verifyEmail, it might be a wrong link
    if (!oobCode || mode !== 'verifyEmail') {
      if (mode === 'resetPassword') {
        // Silently redirect if the mode is actually password reset
        window.location.href = `/auth/reset-password?${searchParams.toString()}`;
        return;
      }
      setStatus('error');
      return;
    }

    applyActionCode(auth, oobCode)
      .then(() => {
        setStatus('success');
      })
      .catch((error) => {
        console.error(error);
        setStatus('error');
      });
  }, [auth, oobCode, mode, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b141a] p-4 font-body">
      <Card className="w-full max-w-md border-none shadow-[0_30px_60px_rgba(0,0,0,0.5)] bg-[#162129] overflow-hidden">
        <div className="h-2 bg-[#16a34a] w-full" />
        <CardHeader className="text-center pb-8 pt-10">
          <div className="bg-[#16a34a] p-3 rounded-2xl text-white shadow-lg shadow-[#16a34a]/20 w-fit mx-auto mb-6">
            <ShieldCheck size={40} />
          </div>
          <CardTitle className="text-2xl text-white font-headline font-bold">Account Verification</CardTitle>
          <CardDescription className="text-muted-foreground text-xs uppercase tracking-widest font-bold mt-2">
            {status === 'verifying' ? 'Securing your identity...' : 
             status === 'success' ? 'Access Granted' : 'Handshake Failed'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-6 px-8 text-center">
          {status === 'verifying' && (
            <div className="space-y-4">
               <Loader2 className="h-12 w-12 text-[#16a34a] animate-spin mx-auto" />
               <p className="text-slate-300 text-sm">Please wait while we confirm your credentials with our nodes.</p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="space-y-6">
              <div className="h-20 w-20 rounded-full bg-[#16a34a]/10 flex items-center justify-center text-[#16a34a] mx-auto border border-[#16a34a]/20">
                <CheckCircle2 size={40} />
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                Your email has been successfully verified. You are now authorized to access the AntiPay Merchant Console.
              </p>
              <Button asChild className="w-full bg-[#16a34a] hover:bg-[#15803d] h-12 font-bold shadow-xl shadow-[#16a34a]/20">
                <Link href="/login">Go to Login</Link>
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-6">
              <div className="h-20 w-20 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mx-auto border border-rose-500/20">
                <AlertCircle size={40} />
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                The verification link is invalid or has expired. This can happen if the link was already used or if it's the wrong action type.
              </p>
              <Button asChild className="w-full bg-[#162129] border border-border/10 hover:bg-[#1c2a35] h-12 font-bold">
                <Link href="/login">Back to Login</Link>
              </Button>
            </div>
          )}
        </CardContent>
        <div className="p-4 bg-[#0b141a]/50 text-center">
           <p className="text-[10px] text-muted-foreground italic">Secure verification powered by AntiPay Edge.</p>
        </div>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0b141a]"><Loader2 className="animate-spin text-primary" /></div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
