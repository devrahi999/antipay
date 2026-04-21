'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { applyActionCode } from 'firebase/auth';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
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
    if (!oobCode || mode !== 'verifyEmail') {
      if (mode === 'resetPassword') {
        window.location.href = `/auth/reset-password?${searchParams.toString()}`;
        return;
      }
      setStatus('error');
      return;
    }

    applyActionCode(auth, oobCode)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [auth, oobCode, mode, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b141a] p-4 font-body">
      <Card className="w-full max-w-md border-none shadow-2xl bg-[#162129] overflow-hidden">
        <div className="h-2 bg-primary w-full" />
        <CardHeader className="text-center pb-8 pt-10">
          <div className="h-16 w-16 mb-4 mx-auto">
            <img src="https://i.imgur.com/18owxBD.png" alt="AntiPay" className="h-full w-full object-contain" />
          </div>
          <CardTitle className="text-2xl text-white font-headline font-bold">Account Verification</CardTitle>
          <CardDescription className="text-muted-foreground text-xs uppercase tracking-widest font-bold mt-2">
            {status === 'verifying' ? 'Securing your identity...' : status === 'success' ? 'Access Granted' : 'Handshake Failed'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-6 px-8 text-center text-white">
          {status === 'verifying' && <Loader2 className="h-12 w-12 text-primary animate-spin" />}
          {status === 'success' && (
            <div className="space-y-6">
              <CheckCircle2 size={40} className="text-primary mx-auto" />
              <p className="text-sm">Email verified. Welcome to the AntiPay Merchant Console.</p>
              <Button asChild className="w-full bg-primary hover:bg-primary/90"><Link href="/login">Go to Login</Link></Button>
            </div>
          )}
          {status === 'error' && (
            <div className="space-y-6">
              <AlertCircle size={40} className="text-rose-500 mx-auto" />
              <p className="text-sm">Invalid or expired link. Please request a new verification email.</p>
              <Button asChild className="w-full bg-[#162129] border border-border/10"><Link href="/login">Back to Login</Link></Button>
            </div>
          )}
        </CardContent>
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