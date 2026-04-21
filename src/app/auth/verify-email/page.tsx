
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

  useEffect(() => {
    if (!oobCode) {
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
  }, [auth, oobCode]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b141a] p-4 font-body">
      <Card className="w-full max-w-md border-none shadow-2xl bg-[#162129]">
        <CardHeader className="text-center">
          <div className="bg-[#16a34a] p-3 rounded-2xl text-white shadow-lg shadow-[#16a34a]/20 w-fit mx-auto mb-4">
            <ShieldCheck size={32} />
          </div>
          <CardTitle className="text-white font-headline font-bold">Email Verification</CardTitle>
          <CardDescription className="text-muted-foreground">
            {status === 'verifying' ? 'Processing your request...' : 
             status === 'success' ? 'Verification complete!' : 'Something went wrong.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-6 text-center">
          {status === 'verifying' && <Loader2 className="h-12 w-12 text-primary animate-spin" />}
          
          {status === 'success' && (
            <div className="space-y-4">
              <CheckCircle2 className="h-16 w-16 text-primary mx-auto" />
              <p className="text-slate-300 text-sm">Your email has been successfully verified. You can now access your merchant dashboard.</p>
              <Button asChild className="w-full bg-[#16a34a] hover:bg-[#15803d]">
                <Link href="/login">Go to Dashboard</Link>
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
              <p className="text-slate-300 text-sm">The verification link is invalid or has expired. Please log in and request a new one.</p>
              <Button asChild className="w-full bg-[#16a34a] hover:bg-[#15803d]">
                <Link href="/login">Back to Login</Link>
              </Button>
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
