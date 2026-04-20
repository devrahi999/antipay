
'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, Save, Loader2 } from "lucide-react"
import { useUser, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

export default function PaymentMethodsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [configs, setConfigs] = useState<any>({
    bkash: { enabled: false, number: '' },
    nagad: { enabled: false, number: '' },
    rocket: { enabled: false, number: '' },
  });

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
    { id: "bkash", name: "bKash", color: "bg-[#e2136e]", icon: "BK" },
    { id: "nagad", name: "Nagad", color: "bg-[#f7941d]", icon: "NG" },
    { id: "rocket", name: "Rocket", color: "bg-[#8c3494]", icon: "RK" },
  ];

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {methods.map((method) => (
          <Card key={method.id} className="shadow-sm border-none">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="flex items-center gap-3">
                <div className={`${method.color} w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
                  {method.icon}
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
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`${method.id}-number`}>Receiver Number</Label>
                <Input 
                  id={`${method.id}-number`} 
                  placeholder="01XXXXXXXXX" 
                  value={configs[method.id]?.number}
                  onChange={(e) => updateMethod(method.id, 'number', e.target.value)}
                  disabled={!configs[method.id]?.enabled}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <Button size="lg" className="bg-primary hover:bg-primary/90 px-8" onClick={handleSave} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save Configuration
        </Button>
      </div>
    </div>
  )
}
