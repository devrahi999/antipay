'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Mail, 
  Lock, 
  ShieldCheck, 
  Key, 
  Save, 
  Loader2,
  AlertCircle,
  RefreshCcw
} from "lucide-react"
import { useUser, useAuth } from '@/firebase';
import { updateUserProfile, initiatePasswordReset } from '@/firebase/non-blocking-login';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { user } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  
  // Profile Form State
  const [displayName, setDisplayName] = useState(user?.displayName || '');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await updateUserProfile(user, { displayName });
      toast({ title: "Profile Updated", description: "Your profile information has been saved." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update Failed", description: error.message });
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
        description: `We've sent a password setup/reset link to ${user.email}. Check your inbox.` 
      });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setResetLoading(false);
    }
  };

  const isGoogleUser = user?.providerData.some(p => p.providerId === 'google.com');

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-headline font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your merchant account preferences and security.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Profile Information */}
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
                      className="bg-[#162129] border-border/20 pl-10"
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
                      className="bg-[#162129]/50 border-border/20 pl-10 text-muted-foreground/50 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">Registered email address cannot be changed.</p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" className="bg-[#16a34a] hover:bg-[#15803d]" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />} Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Security & Authentication */}
        <Card className="bg-[#0b141a] border-border/40 shadow-xl overflow-hidden">
          <CardHeader className="bg-[#162129] border-b border-border/10">
            <CardTitle className="flex items-center gap-2 text-[#16a34a]">
              <Lock className="h-5 w-5" /> Security & Password
            </CardTitle>
            <CardDescription>Manage how you access your account.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between p-4 bg-[#162129] rounded-xl border border-border/10">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-100">Auth Provider</p>
                  <p className="text-xs text-muted-foreground">You are currently signed in via</p>
                </div>
              </div>
              <Badge className="bg-[#16a34a] hover:bg-[#16a34a] px-3 py-1 font-bold">
                {isGoogleUser ? 'Google OAuth' : 'Email & Password'}
              </Badge>
            </div>

            {isGoogleUser ? (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">Enable Email Login</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                      You are using Google Login. To enable login via Email & Password for this account, click below to set up a password.
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={handlePasswordReset} 
                  variant="outline" 
                  className="w-full border-primary/20 hover:bg-primary/10 text-primary font-bold"
                  disabled={resetLoading}
                >
                  {resetLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCcw className="h-4 w-4 mr-2" />} Setup Password for Email Login
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">Change Password</h4>
                    <p className="text-xs text-muted-foreground">We will send a reset link to your email.</p>
                  </div>
                  <Button 
                    onClick={handlePasswordReset} 
                    variant="outline" 
                    className="border-border/20 hover:bg-secondary/10"
                    disabled={resetLoading}
                  >
                    {resetLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Request Reset Link"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Developer Info */}
        <Card className="bg-[#0b141a] border-border/40 shadow-xl overflow-hidden">
          <CardHeader className="bg-[#162129] border-b border-border/10">
            <CardTitle className="flex items-center gap-2 text-[#16a34a]">
              <Key className="h-5 w-5" /> Account Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-100 text-xs font-bold uppercase tracking-wider">Merchant UID</Label>
                <div className="bg-[#162129] p-3 rounded-lg border border-border/10 font-mono text-xs text-primary flex justify-between items-center">
                  <span>{user?.uid}</span>
                  <Badge variant="outline" className="text-[8px] border-primary/20 text-primary">System ID</Badge>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-secondary/10 px-6 py-4 border-t border-border/10">
            <p className="text-[10px] text-muted-foreground italic">
              Need to delete your account? Contact support at support@antipay.io
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
