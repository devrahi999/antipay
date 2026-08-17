'use client';

import { useState } from 'react';
import {
  collection,
  doc,
  limit,
  query,
  runTransaction,
  serverTimestamp,
  where
} from 'firebase/firestore';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  Plus,
  Search,
  Loader2,
  Copy,
  Save,
  Lock,
  Info,
  Database,
  Hash,
  Smartphone,
  Phone,
  CircleDollarSign,
  BadgeCheck,
  Ban
} from "lucide-react"
import { useToast } from '@/hooks/use-toast';
import { isPlanActive } from '@/lib/plan';
import { format } from 'date-fns';
import Link from 'next/link';

/** Payment sources the AntiPay Sync app reports, mirrored from the brand `methods` array. */
const SOURCES = [
  { value: 'bkash', label: 'bKash', dot: 'bg-[#e2136e]' },
  { value: 'nagad', label: 'Nagad', dot: 'bg-[#f7941d]' },
  { value: 'rocket', label: 'Rocket', dot: 'bg-[#8c3494]' },
  { value: 'upay', label: 'Upay', dot: 'bg-[#00a99d]' },
];

const EMPTY_FORM = {
  trxId: '',
  sender: '',
  amount: '',
  source: 'bkash',
  status: 'unused',
};

export default function AddTransactionPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState(EMPTY_FORM);

  const planRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'user_plans', user.uid);
  }, [db, user?.uid]);
  const { data: activePlan } = useDoc(planRef);
  const planActive = isPlanActive(activePlan);

  // Only this merchant's raw transactions. No orderBy here on purpose: it would
  // need a composite index, and `createdAt` is a string on records synced from
  // the Android app — so ordering happens client-side below.
  const trxQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'transactions'), where('userId', '==', user.uid), limit(200));
  }, [db, user?.uid]);
  const { data: transactions, isLoading } = useCollection(trxQuery);

  const parseDate = (value: any): Date | null => {
    if (!value) return null;
    try {
      const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value);
      return isNaN(date.getTime()) ? null : date;
    } catch (e) {
      return null;
    }
  };

  const formatDate = (value: any) => {
    const date = parseDate(value);
    return date ? format(date, 'dd MMM yyyy, hh:mm a') : "—";
  };

  // Belt-and-braces: the query above is already scoped to this merchant, but we
  // re-check `userId` on every document so a record can never render for the
  // wrong account even if it arrives from a stale listener or a mismatched write.
  const ownTransactions = (transactions || []).filter(
    (tx) => !!user?.uid && tx.userId === user.uid
  );

  const visibleTransactions = ownTransactions
    .filter((tx) => {
      const term = searchTerm.trim().toLowerCase();
      if (!term) return true;
      return (
        tx.trxId?.toLowerCase().includes(term) ||
        tx.id?.toLowerCase().includes(term) ||
        tx.sender?.toLowerCase().includes(term) ||
        tx.source?.toLowerCase().includes(term) ||
        String(tx.amount ?? '').includes(term)
      );
    })
    .sort((a, b) => {
      const aTime = parseDate(a.createdAt)?.getTime() ?? 0;
      const bTime = parseDate(b.createdAt)?.getTime() ?? 0;
      return bTime - aTime;
    });

  const unusedCount = ownTransactions.filter((tx) => tx.status === 'unused').length;
  const usedCount = ownTransactions.filter((tx) => tx.status === 'used').length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db) return;

    // The gateway looks the record up at `transactions/{TRXID}` after
    // uppercasing the ID it receives, so the document ID must be uppercase.
    const trxId = formData.trxId.trim().toUpperCase();
    const sender = formData.sender.replace(/[\s-]/g, '');
    const amount = Number(formData.amount);

    if (!trxId) {
      toast({ variant: "destructive", title: "Transaction ID Required", description: "Enter the TrxID exactly as the provider sent it." });
      return;
    }
    if (!/^[A-Z0-9_-]{4,64}$/.test(trxId)) {
      toast({ variant: "destructive", title: "Invalid Transaction ID", description: "Use 4–64 letters, digits, dash or underscore only (no spaces or slashes)." });
      return;
    }
    if (!/^\+?\d{6,20}$/.test(sender)) {
      toast({ variant: "destructive", title: "Invalid Sender Number", description: "Enter the sender's mobile number, e.g. 01712345678." });
      return;
    }
    if (!isFinite(amount) || amount <= 0) {
      toast({ variant: "destructive", title: "Invalid Amount", description: "Amount must be a number greater than zero." });
      return;
    }

    setIsSubmitting(true);
    try {
      const trxRef = doc(db, 'transactions', trxId);

      // Atomic create: `transactions` is a global collection keyed by TrxID, so a
      // blind write could silently overwrite an existing record.
      await runTransaction(db, async (tx) => {
        const snapshot = await tx.get(trxRef);
        if (snapshot.exists()) throw new Error('DUPLICATE_TRX');

        tx.set(trxRef, {
          trxId,
          userId: user.uid,
          sender,
          amount,
          source: formData.source,
          status: formData.status,
          createdAt: new Date().toISOString(),
          createdVia: 'manual',
          addedAt: serverTimestamp(),
        });
      });

      toast({ title: "Transaction Added", description: `${trxId} is now available for verification.` });
      setFormData(EMPTY_FORM);
      setIsDialogOpen(false);
    } catch (error: any) {
      if (error.message === 'DUPLICATE_TRX') {
        toast({
          variant: "destructive",
          title: "Duplicate Transaction ID",
          description: `${trxId} already exists in the system. Every TrxID must be unique.`
        });
      } else {
        toast({ variant: "destructive", title: "Could Not Add", description: error.message || "Write failed." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Transaction ID copied to your clipboard." });
  };

  const sourceMeta = (value: string) => SOURCES.find((s) => s.value === value);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-headline font-bold text-foreground">Transactions</h1>
          <p className="text-sm text-muted-foreground">
            Your verification pool — every payment record on your account, and a place to add one manually.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) setFormData(EMPTY_FORM); setIsDialogOpen(open); }}>
          {!planActive ? (
            <Button asChild className="ios-btn bg-amber-500 hover:bg-amber-600 font-bold">
              <Link href="/dashboard/plans">
                <Lock className="mr-2 h-4 w-4" /> {activePlan ? 'Renew Plan to Add' : 'Buy Plan to Add'}
              </Link>
            </Button>
          ) : (
            <DialogTrigger asChild>
              <Button className="ios-btn bg-[#16a34a] hover:bg-[#15803d] text-white font-bold shadow-lg shadow-[#16a34a]/20 border-none">
                <Plus className="mr-2 h-4 w-4" /> New Transaction
              </Button>
            </DialogTrigger>
          )}

          <DialogContent className="sm:max-w-[620px] bg-[#0b141a] border-border/20 text-foreground p-0 overflow-hidden shadow-2xl">
            <DialogHeader className="p-5 border-b border-border/10 bg-[#162129]">
              <div className="flex items-center gap-2 text-[#16a34a]">
                <Database className="h-5 w-5" />
                <DialogTitle className="font-bold text-lg text-[#16a34a]">Insert Raw Transaction</DialogTitle>
              </div>
              <DialogDescription className="text-[11px] text-muted-foreground">
                This writes straight into the <span className="font-mono text-primary">transactions</span> collection — the same
                place the AntiPay Sync app writes to when it reads a payment SMS.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    <Hash className="h-3 w-3 text-primary" /> Transaction ID (TrxID) *
                  </Label>
                  <Input
                    placeholder="8H70QK4M4T"
                    className="bg-[#162129] border-border/20 h-10 text-white font-mono uppercase"
                    value={formData.trxId}
                    onChange={(e) => setFormData({ ...formData, trxId: e.target.value.toUpperCase() })}
                  />
                  <p className="text-[9px] text-muted-foreground/70 leading-snug">
                    Saved as the document ID in uppercase — this is what the gateway looks up.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    <Phone className="h-3 w-3 text-amber-500" /> Sender Number *
                  </Label>
                  <Input
                    placeholder="01712345678"
                    inputMode="tel"
                    className="bg-[#162129] border-border/20 h-10 text-white font-mono"
                    value={formData.sender}
                    onChange={(e) => setFormData({ ...formData, sender: e.target.value })}
                  />
                  <p className="text-[9px] text-muted-foreground/70 leading-snug">
                    The mobile number the money was sent from.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    <CircleDollarSign className="h-3 w-3 text-[#16a34a]" /> Amount (৳) *
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="500"
                    className="bg-[#162129] border-border/20 h-10 text-white font-bold"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                  <p className="text-[9px] text-muted-foreground/70 leading-snug">
                    Must match the payment session amount exactly, or verification fails.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    <Smartphone className="h-3 w-3 text-primary" /> Source *
                  </Label>
                  <Select value={formData.source} onValueChange={(value) => setFormData({ ...formData, source: value })}>
                    <SelectTrigger className="bg-[#162129] border-border/20 h-10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0b141a] border-border/20 text-white">
                      {SOURCES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          <span className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${s.dot}`} /> {s.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    <BadgeCheck className="h-3 w-3 text-[#16a34a]" /> Status *
                  </Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger className="bg-[#162129] border-border/20 h-10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0b141a] border-border/20 text-white">
                      <SelectItem value="unused">unused — available for verification</SelectItem>
                      <SelectItem value="used">used — already consumed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    <Lock className="h-3 w-3 text-muted-foreground" /> User ID (auto)
                  </Label>
                  <Input
                    readOnly
                    value={user?.uid || ''}
                    className="bg-[#0b141a] border-border/10 h-10 text-muted-foreground font-mono text-[10px] cursor-not-allowed"
                  />
                  <p className="text-[9px] text-muted-foreground/70 leading-snug">
                    Locked to your account — the gateway rejects a record owned by anyone else.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  A record verifies only when the <span className="font-bold text-slate-200">TrxID</span>,
                  the <span className="font-bold text-slate-200">amount</span> and the owning account all match the payment
                  session, and its status is still <span className="font-mono text-primary">unused</span>. The status flips to
                  <span className="font-mono text-primary"> used</span> automatically after a successful verification.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-border/10">
                <Button
                  type="button"
                  variant="ghost"
                  className="bg-[#162129] hover:bg-[#1c2a35] text-muted-foreground px-8 border border-border/10 rounded-xl"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="ios-btn bg-[#16a34a] hover:bg-[#15803d] text-white px-8 font-bold rounded-xl"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Transaction
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!planActive && (
        <Card className="bg-amber-500/5 border-amber-500/30 p-4 rounded-2xl flex items-start gap-3">
          <Lock className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {activePlan
              ? "Your subscription has expired, so new transactions cannot be added and your brands are suspended. Existing records stay visible."
              : "You need an active plan before you can add transactions."}{' '}
            <Link href="/dashboard/plans" className="font-bold text-amber-400 hover:underline">Go to plans →</Link>
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-[#0b141a] border-border/40 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Total Records</p>
            <Database className="h-4 w-4 text-primary" />
          </div>
          <p className="text-3xl font-black text-white mt-2">{transactions?.length ?? 0}</p>
        </Card>
        <Card className="bg-[#0b141a] border-border/40 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Unused</p>
            <BadgeCheck className="h-4 w-4 text-[#16a34a]" />
          </div>
          <p className="text-3xl font-black text-[#16a34a] mt-2">{unusedCount}</p>
        </Card>
        <Card className="bg-[#0b141a] border-border/40 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Used</p>
            <Ban className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-3xl font-black text-slate-400 mt-2">{usedCount}</p>
        </Card>
      </div>

      <Card className="bg-[#0b141a] border-border/40 shadow-2xl overflow-hidden">
        <CardHeader className="p-5 border-b border-border/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-200">Transaction Pool</CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground mt-1">
              Records synced by the Android app and the ones you added by hand.
            </CardDescription>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search TrxID, sender, amount..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 w-full sm:w-[280px] bg-[#162129] border-border/20"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/20 hover:bg-transparent">
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14 pl-6">Transaction ID</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14">Source</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14">Sender</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14">Amount</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14">Status</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14">Origin</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14">Created</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14 text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-20">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Loading pool...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : visibleTransactions.length > 0 ? (
                  visibleTransactions.map((tx) => (
                    <TableRow key={tx.id} className="border-border/10 hover:bg-secondary/10 transition-colors group">
                      <TableCell className="pl-6 font-mono text-xs font-bold text-[#16a34a]">
                        {tx.trxId || tx.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${sourceMeta(tx.source)?.dot || 'bg-muted'}`} />
                          <span className="text-xs font-bold uppercase">{sourceMeta(tx.source)?.label || tx.source || "—"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-300">{tx.sender || "—"}</TableCell>
                      <TableCell className="text-xs font-black text-white">৳{tx.amount}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[8px] uppercase font-black px-2 py-0.5 ${
                            tx.status === 'unused'
                              ? 'border-[#16a34a]/30 text-[#16a34a] bg-[#16a34a]/10'
                              : 'border-border/30 text-muted-foreground bg-secondary/20'
                          }`}
                        >
                          {tx.status || "unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/70">
                          {tx.createdVia === 'manual' ? 'Manual' : 'Sync App'}
                        </span>
                      </TableCell>
                      <TableCell className="text-[10px] text-muted-foreground">{formatDate(tx.createdAt)}</TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => copyToClipboard(tx.trxId || tx.id)}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-28">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-16 w-16 bg-[#162129] rounded-full flex items-center justify-center mb-2">
                          <Database className="h-8 w-8 text-muted-foreground/20" />
                        </div>
                        <p className="text-sm font-bold text-slate-200">
                          {searchTerm ? "No transaction matches your search." : "No transactions in your pool yet."}
                        </p>
                        <p className="text-xs text-muted-foreground max-w-sm">
                          {searchTerm
                            ? "Try a different TrxID, sender number or amount."
                            : "Records arrive automatically from the AntiPay Sync app, or you can insert one manually."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
