
'use client';

import { useState } from 'react';
import { collection, query, orderBy, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Plus, Package, Trash2, Edit2, Save, Loader2, CheckCircle2, Clock } from "lucide-react"
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
    benefits: '', // Comma separated
    maxApiKeys: 1,
    maxDevices: 1,
    price: 0,
    billingCycle: 'monthly',
    isFreeTrialAvailable: false
  });

  const plansQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'subscriptionPlans'), orderBy('price', 'asc'));
  }, [db]);

  const { data: plans, isLoading } = useCollection(plansQuery);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !formData.id) return;
    setIsSubmitting(true);
    try {
      // Clean benefits: split by comma and trim
      const benefitsArray = formData.benefits.split(',').map(b => b.trim()).filter(b => b !== '');

      await setDoc(doc(db, 'subscriptionPlans', formData.id), {
        ...formData,
        benefits: benefitsArray,
        price: Number(formData.price),
        maxApiKeys: Number(formData.maxApiKeys),
        maxDevices: Number(formData.maxDevices),
        updatedAt: new Date().toISOString()
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
      benefits: '',
      maxApiKeys: 1,
      maxDevices: 1,
      price: 0,
      billingCycle: 'monthly',
      isFreeTrialAvailable: false
    });
  };

  const handleEdit = (plan: any) => {
    setFormData({
      ...plan,
      benefits: Array.isArray(plan.benefits) ? plan.benefits.join(', ') : ''
    });
    setIsOpen(true);
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
          <p className="text-muted-foreground">Define and manage available tier limits & benefits.</p>
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
                  <Label>Plan Name</Label>
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
                <Label>Benefits (separated by comma)</Label>
                <Textarea 
                  placeholder="e.g. Priority Support, Unlimited Invoices, Daily Reports" 
                  value={formData.benefits} 
                  onChange={e => setFormData({...formData, benefits: e.target.value})}
                  className="bg-[#0b141a] border-border/10 min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price (৳)</Label>
                  <Input 
                    type="number" 
                    value={formData.price} 
                    onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                    className="bg-[#0b141a] border-border/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Billing Cycle</Label>
                  <Select 
                    value={formData.billingCycle} 
                    onValueChange={(v) => setFormData({...formData, billingCycle: v})}
                  >
                    <SelectTrigger className="bg-[#0b141a] border-border/10">
                      <SelectValue placeholder="Select Cycle" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#162129] border-border/20 text-white">
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
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

              <div className="flex items-center justify-between p-3 bg-[#0b141a] rounded-lg border border-border/10">
                <div className="space-y-0.5">
                  <Label className="text-white">Allow Free Trial</Label>
                  <p className="text-[10px] text-muted-foreground">Users can try this plan for 1 month for free.</p>
                </div>
                <Switch 
                  checked={formData.isFreeTrialAvailable} 
                  onCheckedChange={(v) => setFormData({...formData, isFreeTrialAvailable: v})}
                />
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
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white" onClick={() => handleEdit(plan)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(plan.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="mt-4 text-xl text-white">{plan.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold uppercase text-[#16a34a] bg-[#16a34a]/10 px-2 py-0.5 rounded">
                    {plan.billingCycle}
                  </span>
                  {plan.isFreeTrialAvailable && (
                    <span className="text-[10px] font-bold uppercase text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                      <Clock className="h-2 w-2" /> Trial Ready
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="py-6 space-y-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">৳{plan.price}</span>
                  <span className="text-xs text-muted-foreground">/{plan.billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                </div>
                
                <div className="space-y-3">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Plan Benefits</p>
                  <ul className="space-y-2">
                    {Array.isArray(plan.benefits) && plan.benefits.map((benefit: string, i: number) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#16a34a] shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-border/10 space-y-2">
                   <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Hard Limits</p>
                   <div className="flex justify-between text-xs text-slate-400">
                     <span>API Keys</span>
                     <span className="font-bold text-white">{plan.maxApiKeys}</span>
                   </div>
                   <div className="flex justify-between text-xs text-slate-400">
                     <span>Devices</span>
                     <span className="font-bold text-white">{plan.maxDevices}</span>
                   </div>
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
