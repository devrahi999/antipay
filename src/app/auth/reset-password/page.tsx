'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { Lock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  
  const auth = useAuth();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const oobCode = searchParams.get('oobCode');
  const mode = searchParams.get('mode');

  useEffect(() => {
    if (!oobCode || mode !== 'resetPassword') {
      if (mode === 'verifyEmail') {
        window.location.href = `/auth/verify-email?${searchParams.toString()}`;
        return;
      }
      setVerifying(false);
      return;
    }

    verifyPasswordResetCode(auth, oobCode)
      .then((emailAddress) => {
        setEmail(emailAddress);
        setVerifying(false);
      })
      .catch(() => setVerifying(false));
  }, [auth, oobCode, mode, searchParams]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ variant: "destructive", title: "Mismatch", description: "Passwords do not match." });
      return;
    }
    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode!, password);
      setIsSuccess(true);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
      setLoading(false);
    }
  };

  if (verifying) return <div className="min-h-screen flex items-center justify-center bg-[#0b141a]"><Loader2 className="animate-spin text-primary h-10 w-10" /></div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b141a] p-4">
      <Card className="w-full max-w-md border-none shadow-2xl bg-[#162129] overflow-hidden">
        <div className="h-2 bg-primary w-full" />
        <CardHeader className="text-center pb-8 pt-10">
          <div className="h-20 w-20 mb-4 mx-auto">
            <img src="https://i.imgur.com/18owxBD.png" alt="AntiPay" className="h-full w-full object-contain" />
          </div>
          <CardTitle className="text-2xl text-white font-headline font-bold">Set New Password</CardTitle>
          <CardDescription className="text-muted-foreground text-xs mt-2 italic">{isSuccess ? 'Password Reset Successful' : `Securing account: ${email}`}</CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-10 text-white">
          {isSuccess ? (
            <div className="text-center space-y-6">
              <CheckCircle2 size={56} className="text-primary mx-auto" />
              <p>Your password has been successfully reset. You can now sign in with your new credentials.</p>
              <Button asChild className="w-full bg-primary hover:bg-primary/90"><Link href="/login">Return to Sign In</Link></Button>
            </div>
          ) : !oobCode || !email ? (
            <div className="text-center space-y-6">
              <AlertCircle size={48} className="text-rose-500 mx-auto" />
              <p>Invalid or expired reset link. Please request a new one.</p>
              <Button asChild className="w-full bg-[#162129] border border-border/10"><Link href="/login">Back to Login</Link></Button>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="password" placeholder="••••••••" className="pl-10 bg-[#0b141a] border-border/10 text-white" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="password" placeholder="••••••••" className="pl-10 bg-[#0b141a] border-border/10 text-white" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                </div>
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
                {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : "Reset Password"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0b141a]"><Loader2 className="animate-spin text-primary" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
