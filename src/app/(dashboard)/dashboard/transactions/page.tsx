
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { query, collection, orderBy } from 'firebase/firestore';
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Search,
  Filter,
  History,
  Eye
} from "lucide-react"
import Link from 'next/link';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { format } from 'date-fns';

export default function PaymentHistoryPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  // Querying the nested sessions subcollection
  const historyQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'payment_sessions', user.uid, 'sessions'),
      orderBy('createdAt', 'desc')
    );
  }, [db, user?.uid]);

  const { data: history, isLoading } = useCollection(historyQuery);

  // Filter history based on search term (TrxID or val_id)
  const filteredHistory = history?.filter((tx) => {
    const term = searchTerm.toLowerCase();
    return (
      tx.trxId?.toLowerCase().includes(term) ||
      tx.val_id?.toLowerCase().includes(term) ||
      tx.sender?.toLowerCase().includes(term)
    );
  });

  const safeFormatDate = (ts: any, formatStr: string = 'dd MMM, hh:mm a') => {
    if (!ts) return "—";
    try {
      const date = ts.toDate ? ts.toDate() : new Date(ts);
      return isNaN(date.getTime()) ? "—" : format(date, formatStr);
    } catch (e) {
      return "—";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-headline font-bold text-foreground">Payment History</h1>
          <p className="text-sm text-muted-foreground">Monitor and manage all your verified payment activities.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search TrxID or Order ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 w-[200px] lg:w-[300px] rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="bg-[#0b141a] border-border/40 shadow-2xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/20 hover:bg-transparent">
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14 pl-6">#</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14">Provider</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14">Internal Ref</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14">Transaction ID</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14">Amount</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14">Status</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14">Date/Time</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14 text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-20 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs">Loading ledger...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredHistory && filteredHistory.length > 0 ? (
                  filteredHistory.map((tx, index) => (
                    <TableRow
                      key={tx.id}
                      onClick={() => router.push(`/dashboard/transactions/${tx.id}`)}
                      className="border-border/10 hover:bg-secondary/10 transition-colors cursor-pointer"
                    >
                      <TableCell className="pl-6 text-xs font-mono text-muted-foreground">{(index + 1).toString().padStart(2, '0')}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${
                            tx.method === 'bkash' ? 'bg-[#e2136e]' : 
                            tx.method === 'nagad' ? 'bg-[#f7941d]' : 
                            'bg-[#8c3494]'
                          }`} />
                          <span className="text-xs font-bold uppercase">{tx.method}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-slate-300">{tx.val_id || "—"}</TableCell>
                      <TableCell className="text-xs font-mono text-primary font-bold">{tx.trxId || "—"}</TableCell>
                      <TableCell className="text-xs font-bold">৳{tx.amount}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`text-[8px] uppercase font-black px-2 py-0.5 ${
                            tx.status === 'verified' ? 'border-[#16a34a]/30 text-[#16a34a] bg-[#16a34a]/10' : 
                            tx.status === 'pending' ? 'border-amber-500/30 text-amber-500 bg-amber-500/10' : 
                            'border-rose-500/30 text-rose-500 bg-rose-500/10'
                          }`}
                        >
                          {tx.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[10px] text-muted-foreground">
                        {safeFormatDate(tx.createdAt)}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                        >
                          <Link
                            href={`/dashboard/transactions/${tx.id}`}
                            onClick={(e) => e.stopPropagation()}
                            title="View full details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-32">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-16 w-16 bg-secondary/20 rounded-full flex items-center justify-center mb-2">
                          <History className="h-8 w-8 text-muted-foreground/20" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {searchTerm ? "No transactions found matching your search." : "No payment history found for your account."}
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
