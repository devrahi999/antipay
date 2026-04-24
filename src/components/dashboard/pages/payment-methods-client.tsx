'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, limit } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, Save, Loader2, Tags, ArrowRight } from "lucide-react"
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export function PaymentMethodsPageClient() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [configs, setConfigs] = useState<any>({
    bkash: { enabled: false, number: '' },
    nagad: { enabled: false, number: '' },
    rocket: { enabled: false, number: '' },
    upay: { enabled: false, number: '' },
  });

  const brandsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'stores'), where('userId', '==', user.uid), limit(1));
  }, [db, user?.uid]);
  const { data: brands, isLoading: brandsLoading } = useCollection(brandsQuery);

  useEffect(() => {
    async function fetchConfigs() {
      if (!user || !db) return;
      const docRef = doc(db, 'users', user.uid, 'paymentConfig', 'main');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setConfigs(snap.data());
      }
    }
    fetchConfigs();
  }, [user, db]);

  const handleSave = async () => {
    if (!user || !db) return;
    setLoading(true);
    await setDoc(doc(db, 'users', user.uid, 'paymentConfig', 'main'), {
      ...configs,
      updatedAt: serverTimestamp(),
    });
    setLoading(false);
    toast({ title: "Configuration Saved", description: "Your payment methods have been updated." });
  };

  const updateMethod = (method: string, field: string, value: any) => {
    setConfigs((prev: any) => ({
      ...prev,
      [method]: { ...prev[method], [field]: value }
    }));
  };

  const methods = [
    { id: "bkash", name: "bKash", logo: "https://i.imgur.com/GeOlI04.png" },
    { id: "nagad", name: "Nagad", logo: "https://i.imgur.com/RZBbEjb.png" },
    { id: "rocket", name: "Rocket", logo: "https://i.imgur.com/wolCFJc.png" },
    { id: "upay", name: "Upay", logo: "https://i.imgur.com/iqgxYRk.png" },
  ];

  if (brandsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Checking Infrastructure...</p>
      </div>
    );
  }

  if (!brands || brands.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground">Payment Methods</h1>
          <p className="text-muted-foreground">Configure your receiver accounts for automated verification.</p>
        </div>

        <Card className="bg-[#0b141a] border-2 border-dashed border-amber-500/20 p-12 text-center flex flex-col items-center gap-6 shadow-2xl rounded-3xl">
          <div className="h-20 w-20 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-inner">
            <Tags size={40} className="animate-pulse" />
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-black text-slate-100 uppercase tracking-tight">Access Locked</h3>
            <p className="text-amber-500/80 max-w-md text-lg font-bold leading-relaxed">
              আপনার কোন ব্র্যান্ড নেই, অনুগ্রহ করে আগে একটি ব্র্যান্ড তৈরি করুন।
            </p>
            <p className="text-muted-foreground text-sm">You need at least one brand identity to configure payment methods.</p>
          </div>
          <Button asChild className="mt-4 bg-[#16a34a] hover:bg-[#15803d] h-12 px-10 font-black rounded-xl shadow-xl shadow-[#16a34a]/20">
             <Link href="/dashboard/brands">ব্র্যান্ড তৈরি করুন <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold text-foreground">Payment Methods</h1>
        <p className="text-muted-foreground">Configure your receiver accounts for automated verification.</p>
      </div>

      <Alert className="bg-accent/20 border-accent/50 text-accent-foreground">
        <Info className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          Ensure these numbers are linked to the device running the AntiPay Sync app.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {methods.map((method) => (
          <Card key={method.id} className="shadow-sm border-none bg-card/50 overflow-hidden flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-4 bg-secondary/10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-20 rounded-lg flex items-center justify-center bg-white p-1 shadow-sm">
                  <img src={method.logo} alt={method.name} className="h-full w-full object-contain" />
                </div>
                <div>
                  <CardTitle className="text-lg">{method.name}</CardTitle>
                </div>
              </div>
              <Switch 
                checked={configs[method.id]?.enabled} 
                onCheckedChange={(val) => updateMethod(method.id, 'enabled', val)}
              />
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor={`${method.id}-number`} className="font-bold">Receiver Number</Label>
                <Input 
                  id={`${method.id}-number`} 
                  placeholder="01XXXXXXXXX" 
                  value={configs[method.id]?.number || ''}
                  onChange={(e) => updateMethod(method.id, 'number', e.target.value)}
                  disabled={!configs[method.id]?.enabled}
                  className="bg-background/50 h-11 font-mono"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <Button size="lg" className="bg-primary hover:bg-primary/90 px-8 h-12 font-bold shadow-xl shadow-primary/20" onClick={handleSave} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save Configuration
        </Button>
      </div>
    </div>
  )
}
