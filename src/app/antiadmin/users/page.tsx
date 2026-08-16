'use client';

import { useState } from 'react';
import { collection, query, doc, updateDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Search, 
  ShieldCheck, 
  MoreHorizontal, 
  UserCog, 
  Zap, 
  Loader2, 
  MailWarning
} from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { notifyPlanExpiration, notifyPlanActivation } from '@/app/actions/notifications';
import { restoreBillingSuspendedBrands } from '@/lib/plan-lifecycle';

export default function ManageUsersPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isAssigningPlan, setIsAssigningPlan] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState<string | null>(null);

  // Users list - Simple query to avoid index issues during dev
  const usersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'users'));
  }, [db]);

  const { data: users, isLoading } = useCollection(usersQuery);

  // Available plans list
  const plansQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'subscriptionPlans'));
  }, [db]);
  const { data: plans } = useCollection(plansQuery);

  const filteredUsers = users?.filter(u => 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleAdmin = async (userId: string, currentAdminStatus: boolean) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'users', userId), {
        isAdmin: !currentAdminStatus,
        updatedAt: serverTimestamp()
      });
      toast({ title: "Updated", description: `User role changed successfully.` });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleSendExpiryEmail = async (user: any) => {
    if (!user.email) return;
    setIsEmailLoading(user.id);
    try {
      await notifyPlanExpiration(user.email, user.subscriptionPlanId || "Active Plan");
      toast({ title: "Alert Sent", description: `Expiration email sent to ${user.email}.` });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed", description: "Could not send email." });
    } finally {
      setIsEmailLoading(null);
    }
  };

  const assignPlan = async (plan: any) => {
    if (!db || !selectedUser) return;
    setIsSubmitting(true);
    try {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 30);

      // 1. Update user_plans root collection
      await setDoc(doc(db, 'user_plans', selectedUser.id), {
        userId: selectedUser.id,
        planId: plan.id,
        planName: plan.name,
        price: plan.price,
        billingCycle: plan.billingCycle,
        maxApiKeys: plan.maxApiKeys,
        maxDevices: plan.maxDevices,
        benefits: plan.benefits || [],
        activatedAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(expiry),
        status: 'active',
        isExpired: false,
        updatedAt: serverTimestamp()
      });

      // 2. Sync user profile
      await updateDoc(doc(db, 'users', selectedUser.id), {
        subscriptionPlanId: plan.id,
        subscriptionStartedAt: serverTimestamp(),
        subscriptionExpiresAt: Timestamp.fromDate(expiry),
        subscriptionStatus: 'active',
        updatedAt: serverTimestamp()
      });

      // 2b. Re-enable brands suspended by a previous expiry/cancellation
      await restoreBillingSuspendedBrands(db, selectedUser.id).catch(e =>
        console.error("Brand restore failed:", e)
      );

      // 3. Log transaction
      const txRef = doc(collection(db, 'plan_transactions'));
      await setDoc(txRef, {
        id: txRef.id,
        userId: selectedUser.id,
        userEmail: selectedUser.email,
        planId: plan.id,
        planName: plan.name,
        amount: plan.price,
        status: 'manual_assigned',
        isActivated: true,
        activatedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      });

      // TRIGGER EMAIL NOTIFICATION
      if (selectedUser.email) {
        notifyPlanActivation(selectedUser.email, plan.name).catch(e => console.error("Manual activation email failed:", e));
      }

      toast({ title: "Plan Assigned", description: `${plan.name} has been manually activated.` });
      setIsAssigningPlan(false);
      setSelectedUser(null);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white font-headline">Manage Users</h1>
          <p className="text-muted-foreground text-sm">Oversee merchant accounts and manual subscription overrides.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search merchants..." 
            className="pl-10 bg-[#162129] border-border/10 focus:ring-[#16a34a]/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="bg-[#162129] border-none shadow-2xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/10 hover:bg-transparent">
                <TableHead className="text-[10px] uppercase font-bold text-muted-foreground h-14 pl-6">Merchant</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-muted-foreground h-14">Plan / Status</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-muted-foreground h-14">Created</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-muted-foreground h-14 text-right pr-6">Management</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Fetching users...</p>
                  </TableCell>
                </TableRow>
              ) : filteredUsers && filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <TableRow key={u.id} className="border-border/5 hover:bg-white/5 transition-colors">
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#16a34a]/20 to-transparent flex items-center justify-center text-[#16a34a] font-bold border border-[#16a34a]/10">
                          {u.displayName?.charAt(0) || u.email?.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-200">{u.displayName || "Merchant"}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">{u.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5">
                        <Badge variant="outline" className="w-fit text-[9px] uppercase border-[#16a34a]/30 text-[#16a34a] bg-[#16a34a]/5">
                          {u.subscriptionPlanId || 'No Active Plan'}
                        </Badge>
                        {u.isAdmin && <Badge className="w-fit bg-[#16a34a] text-white text-[8px] uppercase">Admin</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-[10px] text-muted-foreground">
                       {u.createdAt?.toDate ? u.createdAt.toDate().toLocaleDateString() : "Unknown"}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-rose-400 hover:bg-rose-500/10"
                          onClick={() => handleSendExpiryEmail(u)}
                          disabled={isEmailLoading === u.id}
                        >
                          {isEmailLoading === u.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MailWarning className="h-4 w-4" />}
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#162129] border-border/20 text-white w-48">
                            <DropdownMenuItem className="text-xs cursor-pointer focus:bg-[#16a34a]/10" onClick={() => { setSelectedUser(u); setIsAssigningPlan(true); }}>
                              <Zap className="mr-2 h-3.5 w-3.5 text-amber-500" /> Override Subscription
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs cursor-pointer focus:bg-[#16a34a]/10" onClick={() => toggleAdmin(u.id, u.isAdmin)}>
                              <ShieldCheck className="mr-2 h-3.5 w-3.5" /> {u.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs cursor-pointer focus:bg-[#16a34a]/10">
                              <UserCog className="mr-2 h-3.5 w-3.5" /> View Full Profile
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-20 text-muted-foreground italic">
                    {searchTerm ? "No users match your search." : "No users registered yet."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isAssigningPlan} onOpenChange={setIsAssigningPlan}>
        <DialogContent className="bg-[#162129] border-border/20 text-white sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-[#16a34a] font-bold">Manual Subscription Override</DialogTitle>
            <DialogDescription className="text-muted-foreground">Assign a plan manually to {selectedUser?.displayName || selectedUser?.email}.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
               <Label className="text-xs uppercase font-bold text-muted-foreground">Select New Tier</Label>
               <div className="grid grid-cols-1 gap-2">
                 {plans?.map((plan) => (
                   <Button 
                    key={plan.id}
                    variant="outline"
                    className="justify-between h-14 border-border/10 bg-[#0b141a] hover:bg-[#16a34a]/10 hover:border-[#16a34a]/30 group"
                    onClick={() => assignPlan(plan)}
                    disabled={isSubmitting}
                   >
                     <div className="flex flex-col items-start">
                        <span className="font-bold text-slate-200 group-hover:text-[#16a34a]">{plan.name}</span>
                        <span className="text-[10px] text-muted-foreground">৳{plan.price} / {plan.billingCycle}</span>
                     </div>
                     <Zap className="h-4 w-4 opacity-20 group-hover:opacity-100 group-hover:text-amber-500 transition-opacity" />
                   </Button>
                 ))}
               </div>
            </div>
          </div>
          <div className="flex justify-end">
             <Button variant="ghost" onClick={() => setIsAssigningPlan(false)} className="text-muted-foreground">Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
