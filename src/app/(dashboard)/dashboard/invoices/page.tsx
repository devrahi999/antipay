
'use client';

import { useState } from 'react';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Filter as FilterIcon, 
  FileText, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  Calendar,
  Wallet
} from "lucide-react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { format } from 'date-fns';
import Link from 'next/link';

export default function InvoicesPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  // Query nested sessions
  const invoicesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'payment_sessions', user.uid, 'sessions'),
      orderBy('createdAt', 'desc'),
      limit(50) // reasonable limit for MVP
    );
  }, [db, user?.uid]);

  const { data: invoices, isLoading } = useCollection(invoicesQuery);

  // Client-side filtering
  const filteredInvoices = invoices?.filter(inv => {
    const matchesSearch = 
      inv.trxId?.toLowerCase().includes(search.toLowerCase()) || 
      inv.val_id?.toLowerCase().includes(search.toLowerCase()) ||
      inv.sender?.includes(search);
    
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    const matchesMethod = methodFilter === 'all' || inv.method === methodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground">Invoices</h1>
          <p className="text-sm text-muted-foreground">Manage and track automated payment receipts.</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-card p-4 rounded-2xl border border-border/50 shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search TrxID, Order ID, or Sender..." 
            className="pl-10 h-11 bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={methodFilter} onValueChange={setMethodFilter}>
          <SelectTrigger className="w-[140px] h-11 bg-background">
            <SelectValue placeholder="All Methods" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="bkash">bKash</SelectItem>
            <SelectItem value="nagad">Nagad</SelectItem>
            <SelectItem value="rocket">Rocket</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] h-11 bg-background">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoices Table */}
      <Card className="border-border/40 shadow-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/20 hover:bg-secondary/20 border-b">
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest h-14 pl-6">Sender No</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest h-14">Method</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest h-14">TXN ID</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest h-14">Amount</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest h-14">Status</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest h-14">Date</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest h-14 text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-24">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Generating Ledger...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredInvoices && filteredInvoices.length > 0 ? (
                  filteredInvoices.map((inv) => (
                    <TableRow key={inv.id} className="group border-border/10 hover:bg-primary/5 transition-colors">
                      <TableCell className="pl-6 font-mono text-xs font-bold text-slate-300">
                        {inv.sender || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[9px] uppercase border-primary/20 bg-primary/5 text-primary">
                          {inv.method}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-primary font-bold">
                        {inv.trxId || "Awaiting..."}
                      </TableCell>
                      <TableCell className="font-black text-sm">৳{inv.amount}</TableCell>
                      <TableCell>
                        <Badge 
                          className={`text-[8px] uppercase font-black px-2 py-0.5 ${
                            inv.status === 'verified' ? 'bg-green-500/20 text-green-500' : 
                            inv.status === 'pending' ? 'bg-amber-500/20 text-amber-500' : 
                            'bg-rose-500/20 text-rose-500'
                          }`}
                        >
                          {inv.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[10px] text-muted-foreground font-medium">
                        {inv.createdAt?.toDate ? format(inv.createdAt.toDate(), 'dd MMM, p') : "Just now"}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-50 group-hover:opacity-100" asChild>
                          <Link href={`/dashboard/invoices/${inv.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-32">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-16 w-16 bg-secondary/20 rounded-full flex items-center justify-center mb-2">
                          <FileText className="h-8 w-8 text-muted-foreground/20" />
                        </div>
                        <p className="text-sm font-bold text-muted-foreground">No invoices found matching current criteria.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center items-center gap-4 pt-2">
        <Button variant="outline" size="sm" className="h-9 px-4 font-bold border-border/40 rounded-xl" disabled>
          <ChevronLeft className="h-4 w-4 mr-2" /> Previous
        </Button>
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Page 1 of 1</span>
        <Button variant="outline" size="sm" className="h-9 px-4 font-bold border-border/40 rounded-xl" disabled>
          Next <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
