'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Settings, Save, ShieldCheck, Mail, Phone, MapPin, Facebook, MessageCircle, Loader2, Megaphone, Download, Smartphone, ExternalLink } from "lucide-react"
import { useToast } from '@/hooks/use-toast';

export default function AdminSettingsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const settingsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'settings', 'global');
  }, [db]);

  const { data: globalSettings, isLoading } = useDoc(settingsRef);

  const [formData, setFormData] = useState({
    facebookUrl: '',
    whatsappUrl: '',
    supportEmail: '',
    supportPhone: '',
    officeAddress: '',
    announcementText: '',
    androidApkUrl: '',
    androidAppVersion: '',
    showAnnouncement: false,
    maintenanceMode: false
  });

  useEffect(() => {
    if (globalSettings) {
      setFormData({
        facebookUrl: globalSettings.facebookUrl || '',
        whatsappUrl: globalSettings.whatsappUrl || '',
        supportEmail: globalSettings.supportEmail || '',
        supportPhone: globalSettings.supportPhone || '',
        officeAddress: globalSettings.officeAddress || '',
        announcementText: globalSettings.announcementText || '',
        androidApkUrl: globalSettings.androidApkUrl || '',
        androidAppVersion: globalSettings.androidAppVersion || '',
        showAnnouncement: globalSettings.showAnnouncement || false,
        maintenanceMode: globalSettings.maintenanceMode || false
      });
    }
  }, [globalSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'global'), {
        ...formData,
        updatedAt: serverTimestamp()
      }, { merge: true });
      toast({ title: "Settings Saved", description: "Global configuration updated successfully." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Loading system settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white font-headline">Global Settings</h1>
        <p className="text-muted-foreground">Control system-wide configuration, announcements, and contact information.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Announcement Bar */}
          <Card className="bg-[#162129] border-none shadow-xl lg:col-span-2">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-amber-500">
                <Megaphone className="h-5 w-5" /> Announcement Bar
              </CardTitle>
              <CardDescription>Display a promotional banner at the very top of the landing page.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-[#0b141a] rounded-xl border border-border/10">
                <div className="space-y-0.5">
                  <Label className="text-slate-100 font-bold">Show Announcement</Label>
                  <p className="text-[10px] text-muted-foreground">Toggle global visibility of the top offer bar.</p>
                </div>
                <Switch 
                  checked={formData.showAnnouncement} 
                  onCheckedChange={(v) => setFormData({...formData, showAnnouncement: v})} 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-muted-foreground">Announcement Text</Label>
                <Input 
                  placeholder="e.g. 100% Money Back Guarantee! Services" 
                  className="bg-[#0b141a] border-border/10 h-11 text-white" 
                  value={formData.announcementText}
                  onChange={e => setFormData({...formData, announcementText: e.target.value})}
                  disabled={!formData.showAnnouncement}
                />
                <p className="text-[10px] text-muted-foreground italic">Tip: You can use standard text. HTML is not supported here for security.</p>
              </div>
            </CardContent>
          </Card>

          {/* Support Links */}
          <Card className="bg-[#162129] border-none shadow-xl">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-[#16a34a]">
                <MessageCircle className="h-5 w-5" /> Social Support Links
              </CardTitle>
              <CardDescription>Links for the floating support button on landing page.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-2">
                  <Facebook className="h-3 w-3" /> Facebook Page URL
                </Label>
                <Input 
                  placeholder="https://facebook.com/yourpage" 
                  className="bg-[#0b141a] border-border/10 h-11" 
                  value={formData.facebookUrl}
                  onChange={e => setFormData({...formData, facebookUrl: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-2">
                  <MessageCircle className="h-3 w-3" /> WhatsApp Link
                </Label>
                <Input 
                  placeholder="https://wa.me/8801XXXXXXXXX" 
                  className="bg-[#0b141a] border-border/10 h-11" 
                  value={formData.whatsappUrl}
                  onChange={e => setFormData({...formData, whatsappUrl: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Details */}
          <Card className="bg-[#162129] border-none shadow-xl">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-[#16a34a]">
                <Mail className="h-5 w-5" /> Contact Information
              </CardTitle>
              <CardDescription>Details shown on the public Contact page.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-2">
                  <Mail className="h-3 w-3" /> Support Email
                </Label>
                <Input 
                  placeholder="support@antipay.site" 
                  className="bg-[#0b141a] border-border/10 h-11" 
                  value={formData.supportEmail}
                  onChange={e => setFormData({...formData, supportEmail: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-2">
                  <Phone className="h-3 w-3" /> Phone Number
                </Label>
                <Input 
                  placeholder="+880 17XXXXXXXXX" 
                  className="bg-[#0b141a] border-border/10 h-11" 
                  value={formData.supportPhone}
                  onChange={e => setFormData({...formData, supportPhone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-3 w-3" /> Office Address
                </Label>
                <Input 
                  placeholder="Dhaka, Bangladesh" 
                  className="bg-[#0b141a] border-border/10 h-11" 
                  value={formData.officeAddress}
                  onChange={e => setFormData({...formData, officeAddress: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>
          {/* Android App Distribution */}
          <Card className="bg-[#162129] border-none shadow-xl lg:col-span-2">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-sky-400">
                <Smartphone className="h-5 w-5" /> Android App Distribution
              </CardTitle>
              <CardDescription>
                The APK link served by the "Download Latest APK" button on every merchant's Android Node page.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-2">
                    <Download className="h-3 w-3" /> APK Download URL
                  </Label>
                  <Input
                    placeholder="https://your-cdn.com/antipay-sync.apk"
                    className="bg-[#0b141a] border-border/10 h-11 text-white font-mono text-xs"
                    value={formData.androidApkUrl}
                    onChange={e => setFormData({...formData, androidApkUrl: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-2">
                    <Smartphone className="h-3 w-3" /> App Version
                  </Label>
                  <Input
                    placeholder="2.1"
                    className="bg-[#0b141a] border-border/10 h-11 text-white"
                    value={formData.androidAppVersion}
                    onChange={e => setFormData({...formData, androidAppVersion: e.target.value})}
                  />
                </div>
              </div>

              {formData.androidApkUrl ? (
                <a
                  href={formData.androidApkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-sky-400 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" /> Test this link
                </a>
              ) : (
                <p className="text-[10px] text-amber-500/80 italic">
                  No link set — the download button stays disabled for merchants until you add one.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" className="bg-[#16a34a] hover:bg-[#15803d] px-10 h-12 font-bold shadow-lg shadow-[#16a34a]/20" disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />} Save Global Configuration
          </Button>
        </div>
      </form>
    </div>
  )
}