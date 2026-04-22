'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Settings, Save, ShieldCheck, Mail, Phone, MapPin, Facebook, MessageCircle, Loader2 } from "lucide-react"
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
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading system settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white font-headline">Global Settings</h1>
        <p className="text-muted-foreground">Control system-wide contact information and social support links.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Support Links */}
          <Card className="bg-[#162129] border-none shadow-xl">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-[#16a34a]">
                <MessageCircle className="h-5 w-5" /> Social Support Links
              </CardTitle>
              <CardDescription>Managed links for the floating support button.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-2">
                  <Facebook className="h-3 w-3" /> Facebook Page URL
                </Label>
                <Input 
                  placeholder="https://facebook.com/yourpage" 
                  className="bg-[#0b141a] border-border/10" 
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
                  className="bg-[#0b141a] border-border/10" 
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
              <CardDescription>Details shown on the public Contact Us page.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-2">
                  <Mail className="h-3 w-3" /> Support Email
                </Label>
                <Input 
                  placeholder="support@antipay.io" 
                  className="bg-[#0b141a] border-border/10" 
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
                  className="bg-[#0b141a] border-border/10" 
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
                  className="bg-[#0b141a] border-border/10" 
                  value={formData.officeAddress}
                  onChange={e => setFormData({...formData, officeAddress: e.target.value})}
                />
              </div>
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
