
'use client';

import { useState } from 'react';
import { collection, query, orderBy, setDoc, doc, deleteDoc, where } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Plus, 
  Package, 
  Trash2, 
  Edit2, 
  Save, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Users,
  Eye
} from "lucide-react"
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function ManagePlansPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isUsersDialogOpen, setIsUsersDialogOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    benefits: '', 
    maxApiKeys: 1,
    maxDevices: 1,
    price: 0,
    billingCycle: 'monthly',
    isFreeTrialAvailable: false
  });

  const plansQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'subscriptionPlans'));
  }, [db]);
  const { data: plans, isLoading } = useCollection(plansQuery);

  // Query to find users on a specific plan
  const planUsersQuery = useMemoFirebase(() => {
    if (!db || !selectedPlanId) return null;
    return query(collection(db, 'users'), where('subscriptionPlanId', '==', selectedPlanId));
  }, [db, selectedPlanId]);
  const { data: planUsers, isLoading: isUsersLoading } = useCollection(planUsersQuery);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !formData.id) return;
    setIsSubmitting(true);
    try {
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
      id: '', name: '', benefits: '', maxApiKeys: 1, maxDevices: 1, price: 0, billingCycle: 'monthly', isFreeTrialAvailable: false
    });
  };

  const handleEdit = (plan: any) => {
    setFormData({ ...plan, benefits: Array.isArray(plan.benefits) ? plan.benefits.join(', ') : '' });
    setIsOpen(true);
  };

  const confirmDelete = (id: string) => {
    setPlanToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!db || !planToDelete) return;
    try {
      await deleteDoc(doc(db, 'subscriptionPlans', planToDelete));
      toast({ title: "Deleted", description: "Plan removed." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsDeleteDialogOpen(false);
      setPlanToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white font-headline">Subscription Tiers</h1>
          <p className="text-muted-foreground text-sm">Control the economy of AntiPay with limits & pricing.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#16a34a] hover:bg-[#15803d]" onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" /> Add New Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#162129] border-border/20 text-white sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Define Subscription Plan</DialogTitle>
              <DialogDescription>Set pricing, cycles and hard system limits.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Plan ID (slug)</Label>
                  <Input 
                    placeholder="e.g. enterprise-plus" 
                    value={formData.id} 
                    onChange={e => setFormData({...formData, id: e.target.value.toLowerCase()})}
                    required
                    className="bg-[#0b141a] border-border/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Plan Name</Label>
                  <Input 
                    placeholder="e.g. Pro Merchant" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required
                    className="bg-[#0b141a] border-border/10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Benefits (Comma Separated)</Label>
                <Textarea 
                  placeholder="24/7 Support, API Dashboard, Custom Node..." 
                  value={formData.benefits} 
                  onChange={e => setFormData({...formData, benefits: e.target.value})}
                  className="bg-[#0b141a] border-border/10 min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price (৳)</Label>
                  <Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="bg-[#0b141a] border-border/10" />
                </div>
                <div className="space-y-2">
                  <Label>Cycle</Label>
                  <Select value={formData.billingCycle} onValueChange={(v) => setFormData({...formData, billingCycle: v})}>
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
                  <Label>Brand Limit</Label>
                  <Input type="number" value={formData.maxApiKeys} onChange={e => setFormData({...formData, maxApiKeys: Number(e.target.value)})} className="bg-[#0b141a] border-border/10" />
                </div>
                <div className="space-y-2">
                  <Label>Device Limit</Label>
                  <Input type="number" value={formData.maxDevices} onChange={e => setFormData({...formData, maxDevices: Number(e.target.value)})} className="bg-[#0b141a] border-border/10" />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#0b141a] rounded-lg border border-border/10">
                <div className="space-y-0.5">
                  <Label className="text-white">Enable Free Trial</Label>
                  <p className="text-[10px] text-muted-foreground">Visible to users as 1-month trial.</p>
                </div>
                <Switch checked={formData.isFreeTrialAvailable} onCheckedChange={(v) => setFormData({...formData, isFreeTrialAvailable: v})} />
              </div>

              <Button type="submit" className="w-full bg-[#16a34a] hover:bg-[#15803d]" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />} Save System Plan
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p className="col-span-full text-center py-20 text-muted-foreground animate-pulse">Scanning system tiers...</p>
        ) : plans && plans.length > 0 ? (
          plans.map((plan) => (
            <Card key={plan.id} className="bg-[#162129] border-none shadow-xl overflow-hidden group">
              <CardHeader className="bg-[#16a34a]/10 border-b border-[#16a34a]/10 pb-4">
                <div className="flex justify-between items-start">
                  <div className="h-10 w-10 rounded-xl bg-[#16a34a] flex items-center justify-center text-white font-bold shadow-lg shadow-[#16a34a]/20">
                    <Package className="h-5 w-5" />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white" onClick={() => handleEdit(plan)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:bg-rose-500/10" onClick={() => confirmDelete(plan.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="mt-4 text-xl text-white flex items-center gap-2">
                  {plan.name}
                  {plan.isFreeTrialAvailable && <Badge className="bg-amber-500 text-[8px] uppercase">Trial</Badge>}
                </CardTitle>
                <p className="text-[10px] font-bold text-[#16a34a] uppercase tracking-widest">{plan.billingCycle} Billing</p>
              </CardHeader>
              <CardContent className="py-6 space-y-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">৳{plan.price}</span>
                  <span className="text-xs text-muted-foreground">/{plan.billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                </div>
                
                <div className="pt-4 border-t border-border/10 space-y-4">
                   <div className="flex justify-between items-center bg-[#0b141a] p-3 rounded-lg border border-border/5">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Active Users</span>
                        <Button 
                          variant="link" 
                          className="p-0 h-auto text-primary font-black text-sm justify-start hover:no-underline"
                          onClick={() => { setSelectedPlanId(plan.id); setIsUsersDialogOpen(true); }}
                        >
                          View List <Eye className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                      <Users className="h-5 w-5 text-primary opacity-20" />
                   </div>

                   <div className="space-y-2">
                     <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-[0.2em]">Quotas</p>
                     <div className="flex justify-between text-xs text-slate-400">
                       <span>API Brand Identity</span>
                       <span className="font-bold text-white">{plan.maxApiKeys}</span>
                     </div>
                     <div className="flex justify-between text-xs text-slate-400">
                       <span>Connected Nodes</span>
                       <span className="font-bold text-white">{plan.maxDevices}</span>
                     </div>
                   </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full py-24 bg-[#162129] border-dashed border-border/10 flex flex-col items-center justify-center text-center">
            <Package className="h-12 w-12 text-muted-foreground/20 mb-4" />
            <h3 className="text-lg font-bold text-white uppercase tracking-tight">Financial Void</h3>
            <p className="text-sm text-muted-foreground">Create subscription tiers to start scaling AntiPay.</p>
          </Card>
        )}
      </div>

      {/* Users on Plan Dialog */}
      <Dialog open={isUsersDialogOpen} onOpenChange={setIsUsersDialogOpen}>
        <DialogContent className="bg-[#162129] border-border/20 text-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-[#16a34a] font-bold">Active Users on Tier</DialogTitle>
            <DialogDescription className="text-muted-foreground italic text-xs">Real-time usage snapshot for {selectedPlanId}.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[300px] overflow-y-auto space-y-2 py-4">
             {isUsersLoading ? (
               <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
             ) : planUsers && planUsers.length > 0 ? (
               planUsers.map(user => (
                 <div key={user.id} className="flex items-center justify-between p-3 bg-[#0b141a] rounded-xl border border-border/5">
                   <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-200">{user.displayName || "Merchant"}</span>
                      <span className="text-[10px] text-muted-foreground">{user.email}</span>
                   </div>
                   <Badge variant="outline" className="text-[8px] uppercase border-[#16a34a]/20 text-[#16a34a]">Live</Badge>
                 </div>
               ))
             ) : (
               <p className="text-center text-xs text-muted-foreground py-8">No users currently on this tier.</p>
             )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#0b141a] border-border/20 text-white">
          <AlertDialogHeader>
            <div className="h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-4">
               <AlertTriangle size={24} />
            </div>
            <AlertDialogTitle className="text-xl font-bold">Delete Infrastructure Plan?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Existing users will maintain access, but new merchants won't be able to subscribe to this tier.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="bg-secondary/10 hover:bg-secondary/20 border-none text-white">Retain</AlertDialogCancel>
            <AlertDialogAction className="bg-rose-500 hover:bg-rose-600 text-white font-bold" onClick={handleDelete}>
              Erase Plan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
