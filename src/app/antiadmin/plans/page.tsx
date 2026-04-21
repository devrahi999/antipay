'use client';

import { useState } from 'react';
import { collection, query, orderBy, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Package, Trash2, Edit2, Save, Loader2, X } from "lucide-react"
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function ManagePlansPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    maxApiKeys: 1,
    maxDevices: 1,
    transactionLimitMonthly: 1000,
    priceMonthly: 0
  });

  const plansQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'subscriptionPlans'), orderBy('priceMonthly', 'asc'));
  }, [db]);

  const { data: plans, isLoading } = useCollection(plansQuery);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !formData.id) return;
    setIsSubmitting(true);
    try {
      await setDoc(doc(db, 'subscriptionPlans', formData.id), {
        ...formData,
        priceMonthly: Number(formData.priceMonthly),
        maxApiKeys: Number(formData.maxApiKeys),
        maxDevices: Number(formData.maxDevices),
        transactionLimitMonthly: Number(formData.transactionLimitMonthly),
      });
      toast({ title: "Success", description: "Plan saved successfully." });
      setIsOpen(false);
      resetForm();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      description: '',
      maxApiKeys: 1,
      maxDevices: 1,
      transactionLimitMonthly: 1000,
      priceMonthly: 0
    });
  };

  const handleDelete = async (id: string) => {
    if (!db || !confirm("Delete this plan?")) return;
    try {
      await deleteDoc(doc(db, 'subscriptionPlans', id));
      toast({ title: "Deleted", description: "Plan removed." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Subscription Plans</h1>
          <p className="text-muted-foreground">Define and manage available tier limits.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#16a34a] hover:bg-[#15803d]" onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" /> Create New Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#162129] border-border/20 text-white sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add/Edit Subscription Plan</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Plan ID (slug)</Label>
                  <Input 
                    placeholder="e.g. starter" 
                    value={formData.id} 
                    onChange={e => setFormData({...formData, id: e.target.value.toLowerCase()})}
                    required
                    className="bg-[#0b141a] border-border/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Human Name</Label>
                  <Input 
                    placeholder="e.g. Starter Plan" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required
                    className="bg-[#0b141a] border-border/10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input 
                  placeholder="What's included?" 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="bg-[#0b141a] border-border/10"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Monthly Price (৳)</Label>
                  <Input 
                    type="number" 
                    value={formData.priceMonthly} 
                    onChange={e => setFormData({...formData, priceMonthly: Number(e.target.value)})}
                    className="bg-[#0b141a] border-border/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Monthly Trx Limit</Label>
                  <Input 
                    type="number" 
                    value={formData.transactionLimitMonthly} 
                    onChange={e => setFormData({...formData, transactionLimitMonthly: Number(e.target.value)})}
                    className="bg-[#0b141a] border-border/10"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max API Keys</Label>
                  <Input 
                    type="number" 
                    value={formData.maxApiKeys} 
                    onChange={e => setFormData({...formData, maxApiKeys: Number(e.target.value)})}
                    className="bg-[#0b141a] border-border/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Devices</Label>
                  <Input 
                    type="number" 
                    value={formData.maxDevices} 
                    onChange={e => setFormData({...formData, maxDevices: Number(e.target.value)})}
                    className="bg-[#0b141a] border-border/10"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-[#16a34a] hover:bg-[#15803d]" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />} Save Plan
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p className="col-span-full text-center py-20 text-muted-foreground">Loading plans...</p>
        ) : plans && plans.length > 0 ? (
          plans.map((plan) => (
            <Card key={plan.id} className="bg-[#162129] border-none shadow-xl overflow-hidden group">
              <CardHeader className="bg-[#16a34a]/10 border-b border-[#16a34a]/10">
                <div className="flex justify-between items-start">
                  <div className="h-10 w-10 rounded-xl bg-[#16a34a] flex items-center justify-center text-white font-bold">
                    <Package className="h-5 w-5" />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white" onClick={() => { setFormData(plan); setIsOpen(true); }}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(plan.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="mt-4 text-xl text-white">{plan.name}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="py-6 space-y-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">৳{plan.priceMonthly}</span>
                  <span className="text-xs text-muted-foreground">/month</span>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Limits & Caps</p>
                  <ul className="text-xs space-y-2 text-slate-300">
                    <li className="flex justify-between">
                      <span>Transactions</span>
                      <span className="font-bold text-white">{plan.transactionLimitMonthly}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>API Keys</span>
                      <span className="font-bold text-white">{plan.maxApiKeys}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Connected Devices</span>
                      <span className="font-bold text-white">{plan.maxDevices}</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full py-20 bg-[#162129] border-dashed border-border/10 flex flex-col items-center justify-center text-center">
            <Package className="h-12 w-12 text-muted-foreground/20 mb-4" />
            <h3 className="text-lg font-bold text-white">No Plans Defined</h3>
            <p className="text-sm text-muted-foreground">Start by creating your first subscription tier.</p>
          </Card>
        )}
      </div>
    </div>
  )
}