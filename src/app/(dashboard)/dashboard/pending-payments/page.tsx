'use client';

import { useState } from 'react';
import { collection, limit, query, where } from 'firebase/firestore';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Loader2,
  Hourglass,
  Inbox,
  ChevronRight,
  Webhook,
  CheckCircle2,
  Ban,
  Clock,
  AlertTriangle
} from "lucide-react"
import Link from 'next/link';
import { format } from 'date-fns';

/** pending → awaiting the merchant, processing → settling, completed/rejected → done. */
const STATUS_STYLES: Record<string, string> = {
  pending: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
  processing: 'border-sky-500/30 text-sky-400 bg-sky-500/10',
  completed: 'border-[#16a34a]/30 text-[#16a34a] bg-[#16a34a]/10',
  rejected: 'border-rose-500/30 text-rose-400 bg-rose-500/10',
};

const FILTERS = [
  { key: 'pending', label: 'Pending' },
  { key: 'completed', label: 'Completed' },
  { key: 'all', label: 'All' },
];

export default function PendingPaymentsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('pending');

  // No orderBy: that would need a composite index. Sorted client-side below.
  const reviewsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'pending_transactions'), where('userId', '==', user.uid), limit(200));
  }, [db, user?.uid]);
  const { data: reviews, isLoading } = useCollection(reviewsQuery);

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

  const all = reviews || [];
  const pendingCount = all.filter((r) => r.status === 'pending' || r.status === 'processing').length;
  const completedCount = all.filter((r) => r.status === 'completed').length;
  const pendingValue = all
    .filter((r) => r.status === 'pending' || r.status === 'processing')
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const visible = all
    .filter((r) => {
      if (activeFilter === 'pending') return r.status === 'pending' || r.status === 'processing';
      if (activeFilter === 'completed') return r.status === 'completed';
      return true;
    })
    .filter((r) => {
      const term = searchTerm.trim().toLowerCase();
      if (!term) return true;
      return (
        r.trxId?.toLowerCase().includes(term) ||
        r.sender?.toLowerCase().includes(term) ||
        r.sessionId?.toLowerCase().includes(term) ||
        r.store?.name?.toLowerCase().includes(term) ||
        String(r.amount ?? '').includes(term)
      );
    })
    .sort((a, b) => {
      // Pending first, then newest.
      const aPending = a.status === 'pending' || a.status === 'processing' ? 1 : 0;
      const bPending = b.status === 'pending' || b.status === 'processing' ? 1 : 0;
      if (aPending !== bPending) return bPending - aPending;
      return (parseDate(b.submittedAt)?.getTime() ?? 0) - (parseDate(a.submittedAt)?.getTime() ?? 0);
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-headline font-bold text-foreground">Pending Payments</h1>
          <p className="text-sm text-muted-foreground">
            Payments your customers submitted for manual review after automatic verification failed.
          </p>
        </div>
        {pendingCount > 0 && (
          <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase px-3 py-1.5">
            <Hourglass className="h-3 w-3 mr-1.5" /> {pendingCount} awaiting your decision
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-[#0b141a] border-border/40 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Awaiting Review</p>
            <Hourglass className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-amber-400 mt-2">{pendingCount}</p>
        </Card>
        <Card className="bg-[#0b141a] border-border/40 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Value On Hold</p>
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <p className="text-3xl font-black text-white mt-2">৳{pendingValue.toFixed(2)}</p>
        </Card>
        <Card className="bg-[#0b141a] border-border/40 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Approved</p>
            <CheckCircle2 className="h-4 w-4 text-[#16a34a]" />
          </div>
          <p className="text-3xl font-black text-[#16a34a] mt-2">{completedCount}</p>
        </Card>
      </div>

      <Card className="bg-[#0b141a] border-border/40 shadow-2xl overflow-hidden">
        <CardHeader className="p-5 border-b border-border/10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-200">Review Queue</CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground mt-1">
              Open a request to see the full payment details before approving.
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-1 p-1 bg-[#162129] rounded-xl border border-border/10">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className={`px-3 h-8 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors ${
                    activeFilter === f.key ? 'bg-[#16a34a] text-white' : 'text-muted-foreground hover:text-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search TrxID, sender, invoice..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 w-full sm:w-[260px] bg-[#162129] border-border/20"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/20 hover:bg-transparent">
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14 pl-6">Claimed TrxID</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14">Sender</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14">Amount</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14">Brand</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14">Webhook</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14">Status</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14">Submitted</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14 text-right pr-6">Review</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-20">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Loading queue...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : visible.length > 0 ? (
                  visible.map((r) => (
                    <TableRow key={r.id} className="border-border/10 hover:bg-secondary/10 transition-colors">
                      <TableCell className="pl-6 font-mono text-xs font-bold text-amber-400">{r.trxId || "—"}</TableCell>
                      <TableCell className="font-mono text-xs text-slate-300">{r.sender || "—"}</TableCell>
                      <TableCell className="text-xs font-black text-white">৳{Number(r.amount || 0).toFixed(2)}</TableCell>
                      <TableCell className="text-xs text-slate-300">{r.store?.name || "—"}</TableCell>
                      <TableCell>
                        {r.webhook_url ? (
                          r.webhookDelivered === false ? (
                            <span className="flex items-center gap-1.5 text-[9px] font-black uppercase text-rose-400">
                              <AlertTriangle className="h-3 w-3" /> Failed
                            </span>
                          ) : r.webhookDelivered === true ? (
                            <span className="flex items-center gap-1.5 text-[9px] font-black uppercase text-[#16a34a]">
                              <CheckCircle2 className="h-3 w-3" /> Sent
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-[9px] font-black uppercase text-muted-foreground/70">
                              <Webhook className="h-3 w-3" /> Ready
                            </span>
                          )
                        ) : (
                          <span className="flex items-center gap-1.5 text-[9px] font-black uppercase text-muted-foreground/40">
                            <Ban className="h-3 w-3" /> None
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[8px] uppercase font-black px-2 py-0.5 ${STATUS_STYLES[r.status] || 'border-border/30 text-muted-foreground'}`}
                        >
                          {r.status || "unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[10px] text-muted-foreground">{formatDate(r.submittedAt)}</TableCell>
                      <TableCell className="text-right pr-6">
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 text-[10px] font-black uppercase tracking-widest border-border/20 hover:border-primary/40 hover:text-primary"
                        >
                          <Link href={`/dashboard/pending-payments/${r.id}`}>
                            Open <ChevronRight className="h-3 w-3 ml-1" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-28">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-16 w-16 bg-[#162129] rounded-full flex items-center justify-center mb-2">
                          <Inbox className="h-8 w-8 text-muted-foreground/20" />
                        </div>
                        <p className="text-sm font-bold text-slate-200">
                          {searchTerm ? "Nothing matches your search." : activeFilter === 'pending' ? "No payments waiting for review." : "Nothing here yet."}
                        </p>
                        <p className="text-xs text-muted-foreground max-w-sm">
                          Requests land here when a customer fails automatic verification three times and submits their
                          payment for your approval.
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
