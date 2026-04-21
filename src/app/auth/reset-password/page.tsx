
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { ShieldCheck, Lock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const oobCode = searchParams.get('oobCode');

  useEffect(() => {
    if (!oobCode) {
      setVerifying(false);
      return;
    }

    verifyPasswordResetCode(auth, oobCode)
      .then((emailAddress) => {
        setEmail(emailAddress);
        setVerifying(false);
      })
      .catch((error) => {
        console.error(error);
        setVerifying(false);
      });
  }, [auth, oobCode]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ variant: "destructive", title: "Mismatch", description: "Passwords do not match." });
      return;
    }
    if (!oobCode) return;

    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setIsSuccess(true);
      toast({ title: "Success", description: "Your password has been reset successfully." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
      setLoading(false);
    }
  };

  if (verifying) return <div className="min-h-screen flex items-center justify-center bg-[#0b141a]"><Loader2 className="animate-spin text-primary" /></div>;

  if (!oobCode || (!email && !isSuccess)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0b141a]">
        <Card className="w-full max-w-md text-center p-8 space-y-4 bg-[#162129] border-border/10">
          <AlertCircle className="mx-auto text-destructive h-12 w-12" />
          <CardTitle className="text-white font-headline font-bold">Invalid or Expired Link</CardTitle>
          <p className="text-muted-foreground text-sm">This password reset link is invalid or has expired. Please request a new one.</p>
          <Button asChild className="w-full bg-[#16a34a] hover:bg-[#15803d]">
            <Link href="/login">Back to Login</Link>
          </Button>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0b141a]">
        <Card className="w-full max-w-md text-center p-8 space-y-6 bg-[#162129] border-border/10">
          <CheckCircle2 className="mx-auto text-primary h-16 w-16" />
          <CardTitle className="text-white font-headline font-bold">Password Reset Complete</CardTitle>
          <p className="text-muted-foreground text-sm">You can now sign in to your AntiPay account with your new password.</p>
          <Button asChild className="w-full bg-[#16a34a] hover:bg-[#15803d]">
            <Link href="/login">Sign In</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b141a] p-4">
      <Card className="w-full max-w-md border-none shadow-2xl bg-[#162129]">
        <CardHeader className="text-center pb-8">
          <div className="bg-[#16a34a] p-3 rounded-2xl text-white shadow-lg shadow-[#16a34a]/20 w-fit mx-auto mb-4">
            <ShieldCheck size={32} />
          </div>
          <CardTitle className="text-white font-headline font-bold">New Password</CardTitle>
          <CardDescription className="text-muted-foreground">Resetting password for {email}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-slate-100 font-bold">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-10 bg-[#0b141a] border-border/20 text-white" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-100 font-bold">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-10 bg-[#0b141a] border-border/20 text-white" 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)} 
                  required 
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-[#16a34a] hover:bg-[#15803d] h-11 font-bold" disabled={loading}>
              {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : "Reset Password"}
            </Button>
          </form>
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
