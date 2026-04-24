'use client';

import { useState, useEffect } from 'react';
import { doc, updateDoc, serverTimestamp, collection, query, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Info, Save, Loader2, Tags, ArrowRight, Store } from "lucide-react"
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export function PaymentMethodsPageClient() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  
  // Local state for the 4 supported methods
  const [configs, setConfigs] = useState<any>({
    bkash: { isActive: false, number: '' },
    nagad: { isActive: false, number: '' },
    rocket: { isActive: false, number: '' },
    upay: { isActive: false, number: '' },
  });

  const brandsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'stores'), where('userId', '==', user.uid));
  }, [db, user?.uid]);
  
  const { data: brands, isLoading: brandsLoading } = useCollection(brandsQuery);

  // Set initial selected store
  useEffect(() => {
    if (brands && brands.length > 0 && !selectedStoreId) {
      setSelectedStoreId(brands[0].id);
    }
  }, [brands, selectedStoreId]);

  // Load configs whenever selected store changes
  useEffect(() => {
    if (selectedStoreId && brands) {
      const store = brands.find(b => b.id === selectedStoreId);
      if (store && store.methods && Array.isArray(store.methods)) {
        const newConfigs: any = {
          bkash: { isActive: false, number: '' },
          nagad: { isActive: false, number: '' },
          rocket: { isActive: false, number: '' },
          upay: { isActive: false, number: '' },
        };

        // Map array structure [{bkash: {isActive, number}}, ...] to our flat object state
        store.methods.forEach((item: any) => {
          const providerKey = Object.keys(item)[0];
          if (newConfigs[providerKey]) {
            newConfigs[providerKey] = item[providerKey];
          }
        });
        setConfigs(newConfigs);
      }
    }
  }, [selectedStoreId, brands]);

  const handleSave = async () => {
    if (!user || !db || !selectedStoreId) return;
    setLoading(true);
    try {
      // Rebuild the array structure: [{bkash: {...}}, {nagad: {...}}, ...]
      const methodsArray = [
        { bkash: configs.bkash },
        { nagad: configs.nagad },
        { rocket: configs.rocket },
        { upay: configs.upay }
      ];

      await updateDoc(doc(db, 'stores', selectedStoreId), {
        methods: methodsArray,
        updatedAt: serverTimestamp(),
      });

      toast({ title: "Updated", description: "Payment methods saved directly to your brand document." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const updateMethod = (method: string, field: string, value: any) => {
    setConfigs((prev: any) => ({
      ...prev,
      [method]: { ...prev[method], [field]: value }
    }));
  };

  const providers = [
    { id: "bkash", name: "bKash", logo: "https://i.imgur.com/GeOlI04.png" },
    { id: "nagad", name: "Nagad", logo: "https://i.imgur.com/RZBbEjb.png" },
    { id: "rocket", name: "Rocket", logo: "https://i.imgur.com/wolCFJc.png" },
    { id: "upay", name: "Upay", logo: "https://i.imgur.com/iqgxYRk.png" },
  ];

  if (brandsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Syncing Banking Data...</p>
      </div>
    );
  }

  if (!brands || brands.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-headline font-bold">Payment Methods</h1>
        <Card className="bg-[#0b141a] border-2 border-dashed border-amber-500/20 p-12 text-center flex flex-col items-center gap-6 shadow-2xl rounded-3xl">
          <div className="h-20 w-20 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-inner">
            <Tags size={40} className="animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-100 uppercase tracking-tight">ব্র্যান্ড খুঁজে পাওয়া যায়নি</h3>
            <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
              পেমেন্ট মেথড সেটআপ করার জন্য আপনাকে প্রথমে একটি ব্র্যান্ড তৈরি করতে হবে।
            </p>
          </div>
          <Button asChild className="ios-btn bg-[#16a34a] hover:bg-[#15803d] h-12 px-10 rounded-xl font-bold">
             <Link href="/dashboard/brands">ব্র্যান্ড তৈরি করুন <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground">Payment Methods</h1>
          <p className="text-muted-foreground">আপনার পার্সোনাল/মার্চেন্ট একাউন্ট নম্বর এখানে যুক্ত করুন।</p>
        </div>

        <div className="w-full md:w-72 space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <Store className="h-3 w-3" /> Select Target Brand
          </Label>
          <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
            <SelectTrigger className="bg-[#162129] border-border/10 h-11 rounded-xl shadow-lg">
              <SelectValue placeholder="Choose a brand" />
            </SelectTrigger>
            <SelectContent className="bg-[#0b141a] border-border/20 text-white">
              {brands.map(brand => (
                <SelectItem key={brand.id} value={brand.id} className="cursor-pointer focus:bg-[#16a34a]/10">
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Alert className="bg-primary/5 border-primary/20 text-foreground rounded-2xl">
        <Info className="h-4 w-4 text-primary" />
        <AlertTitle className="font-bold">গুরুত্বপূর্ণ নির্দেশনা</AlertTitle>
        <AlertDescription className="text-xs text-muted-foreground leading-relaxed">
          এখানে যে নম্বরগুলো দিবেন, সেই সিমে আসা এসএমএস রিলে করার জন্য আপনার ফোনে <strong>AntiPay Sync</strong> অ্যাপটি অবশ্যই ইন্সটল থাকতে হবে।
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {providers.map((method) => (
          <Card key={method.id} className="shadow-2xl border-none bg-card/40 overflow-hidden flex flex-col group hover:ring-1 hover:ring-primary/20 transition-all rounded-[2rem]">
            <CardHeader className="flex flex-row items-center justify-between pb-4 bg-secondary/10 px-6 pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-20 rounded-xl flex items-center justify-center bg-white p-1.5 shadow-inner">
                  <img src={method.logo} alt={method.name} className="h-full w-full object-contain" />
                </div>
                <CardTitle className="text-lg font-bold">{method.name}</CardTitle>
              </div>
              <Switch 
                checked={configs[method.id]?.isActive} 
                onCheckedChange={(val) => updateMethod(method.id, 'isActive', val)}
                className="data-[state=checked]:bg-[#16a34a]"
              />
            </CardHeader>
            <CardContent className="space-y-4 pt-6 px-6 pb-8">
              <div className="space-y-2">
                <Label htmlFor={`${method.id}-number`} className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Receiver Number
                </Label>
                <Input 
                  id={`${method.id}-number`} 
                  placeholder="01XXXXXXXXX" 
                  value={configs[method.id]?.number || ''}
                  onChange={(e) => updateMethod(method.id, 'number', e.target.value)}
                  disabled={!configs[method.id]?.isActive}
                  className="bg-background/50 h-11 font-mono text-center tracking-[0.2em] font-bold rounded-xl border-border/10 focus:ring-primary/30"
                />
                <p className="text-[9px] text-muted-foreground text-center italic">Personal/Agent/Merchant</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end pt-4 pb-20">
        <Button size="lg" className="ios-btn bg-[#16a34a] hover:bg-[#15803d] px-12 h-14 font-black rounded-2xl shadow-xl shadow-[#16a34a]/30 border-none" onClick={handleSave} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />} 
          Save Configuration
        </Button>
      </div>
    </div>
  )
}
