'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Mail, 
  Lock, 
  ShieldCheck, 
  Save, 
  Loader2,
  AlertCircle,
  RefreshCcw
} from "lucide-react"
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { updateUserProfile, initiatePasswordReset } from '@/firebase/non-blocking-login';
import { useToast } from '@/hooks/use-toast';
import { doc } from 'firebase/firestore';

export function SettingsPageClient() {
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  
  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);
  const { data: profile } = useDoc(profileRef);

  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    if (profile?.displayName) {
      setDisplayName(profile.displayName);
    } else if (user?.displayName) {
      setDisplayName(user.displayName);
    }
  }, [profile, user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db) return;
    setLoading(true);
    try {
      await updateUserProfile(db, user, { displayName });
      toast({ 
        title: "Profile Updated", 
        description: "Your profile information has been saved successfully." 
      });
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Update Failed", 
        description: error.message || "Could not update profile." 
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setResetLoading(true);
    try {
      await initiatePasswordReset(auth, user.email);
      toast({ 
        title: "Reset Link Sent", 
        description: `We've sent a password setup link to ${user.email}.` 
      });
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: error.message 
      });
    } finally {
      setResetLoading(false);
    }
  };

  const providers = user?.providerData.map(p => p.providerId) || [];
  const isGoogleUser = providers.includes('google.com');
  const isPasswordUser = providers.includes('password');

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-headline font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your merchant account preferences and security.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card className="bg-[#0b141a] border-border/40 shadow-xl overflow-hidden">
          <CardHeader className="bg-[#162129] border-b border-border/10">
            <CardTitle className="flex items-center gap-2 text-[#16a34a]">
              <User className="h-5 w-5" /> Profile Information
            </CardTitle>
            <CardDescription>Update your personal details visible in the system.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-100 font-bold">Display Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Merchant Name"
                      className="bg-[#162129] border-border/20 pl-10 h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-100 font-bold">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                    <Input 
                      value={user?.email || ''} 
                      disabled 
                      className="bg-[#162129]/50 border-border/20 pl-10 text-muted-foreground/50 cursor-not-allowed h-11"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">Registered email address cannot be changed.</p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" className="bg-[#16a34a] hover:bg-[#15803d] h-11 px-8 font-bold" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />} Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-[#0b141a] border-border/40 shadow-xl overflow-hidden">
          <CardHeader className="bg-[#162129] border-b border-border/10">
            <CardTitle className="flex items-center gap-2 text-[#16a34a]">
              <Lock className="h-5 w-5" /> Security & Password
            </CardTitle>
            <CardDescription>Manage how you access your account.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="flex flex-col gap-4 p-4 bg-[#162129] rounded-xl border border-border/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-100">Auth Providers</p>
                    <p className="text-xs text-muted-foreground">Linked login methods</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {isGoogleUser && (
                    <Badge className="bg-[#16a34a] hover:bg-[#16a34a] px-3 py-1 font-bold">Google</Badge>
                  )}
                  {isPasswordUser && (
                    <Badge className="bg-[#16a34a] hover:bg-[#16a34a] px-3 py-1 font-bold">Email/Pass</Badge>
                  )}
                </div>
              </div>
            </div>

            {!isPasswordUser ? (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">Setup Email Login</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                      You are using Google Login. You can also setup a password to login via Email.
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={handlePasswordReset} 
                  variant="outline" 
                  className="w-full h-11 border-primary/20 hover:bg-primary/10 text-primary font-bold"
                  disabled={resetLoading}
                >
                  {resetLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCcw className="h-4 w-4 mr-2" />} Setup Password for Email Login
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">Update Password</h4>
                    <p className="text-xs text-muted-foreground">Request a link to change your security password.</p>
                  </div>
                  <Button 
                    onClick={handlePasswordReset} 
                    variant="outline" 
                    className="h-10 border-border/20 hover:bg-secondary/10 font-bold"
                    disabled={resetLoading}
                  >
                    {resetLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Request Reset Link"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-secondary/10 px-6 py-4 border-t border-border/10">
            <p className="text-[10px] text-muted-foreground italic text-center w-full">
              Need help? Contact support at support@antipay.io
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
