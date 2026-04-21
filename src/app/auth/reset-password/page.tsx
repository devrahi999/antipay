
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
  const mode = searchParams.get('mode');

  useEffect(() => {
    // Security check: Mode must be resetPassword
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
      .catch((error) => {
        console.error(error);
        setVerifying(false);
      });
  }, [auth, oobCode, mode, searchParams]);

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

  if (verifying) return <div className="min-h-screen flex items-center justify-center bg-[#0b141a]"><Loader2 className="animate-spin text-[#16a34a] h-10 w-10" /></div>;

  if (!oobCode || mode !== 'resetPassword' || (!email && !isSuccess)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0b141a]">
        <Card className="w-full max-w-md text-center p-10 space-y-6 bg-[#162129] border-none shadow-2xl">
          <div className="bg-rose-500/10 p-4 rounded-full w-fit mx-auto text-rose-500">
            <AlertCircle size={48} />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-white font-headline font-bold text-2xl">Session Expired</CardTitle>
            <p className="text-muted-foreground text-sm leading-relaxed">This reset link is invalid or of the wrong type. Please request a new link.</p>
          </div>
          <Button asChild className="w-full bg-[#162129] border border-border/10 hover:bg-[#1c2a35] h-12 font-bold">
            <Link href="/login">Back to Login</Link>
          </Button>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0b141a]">
        <Card className="w-full max-w-md text-center p-10 space-y-8 bg-[#162129] border-none shadow-2xl">
          <div className="bg-[#16a34a]/10 p-4 rounded-full w-fit mx-auto text-[#16a34a] border border-[#16a34a]/20">
            <CheckCircle2 size={56} />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-white font-headline font-bold text-2xl">Vault Secured</CardTitle>
            <p className="text-muted-foreground text-sm">Your password has been successfully reset. You can now use your new credentials to sign in.</p>
          </div>
          <Button asChild className="w-full bg-[#16a34a] hover:bg-[#15803d] h-12 font-bold shadow-xl shadow-[#16a34a]/20">
            <Link href="/login">Return to Sign In</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b141a] p-4">
      <Card className="w-full max-w-md border-none shadow-2xl bg-[#162129] overflow-hidden">
        <div className="h-2 bg-[#16a34a] w-full" />
        <CardHeader className="text-center pb-8 pt-10 px-8">
          <div className="bg-[#16a34a] p-3 rounded-2xl text-white shadow-lg shadow-[#16a34a]/20 w-fit mx-auto mb-6">
            <ShieldCheck size={32} />
          </div>
          <CardTitle className="text-2xl text-white font-headline font-bold">Set New Password</CardTitle>
          <CardDescription className="text-muted-foreground text-xs mt-2 italic">Securing account: {email}</CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-10">
          <form onSubmit={handleReset} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-slate-100 font-bold text-xs uppercase tracking-wider">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-10 bg-[#0b141a] border-border/10 text-white h-12 focus:ring-[#16a34a]/20" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-100 font-bold text-xs uppercase tracking-wider">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-10 bg-[#0b141a] border-border/10 text-white h-12 focus:ring-[#16a34a]/20" 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)} 
                  required 
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-[#16a34a] hover:bg-[#15803d] h-12 font-bold shadow-xl shadow-[#16a34a]/20" disabled={loading}>
              {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : "Authorize & Reset"}
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
