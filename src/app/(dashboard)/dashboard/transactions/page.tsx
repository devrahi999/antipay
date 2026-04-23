
'use client';

import { query, collection, where, orderBy } from 'firebase/firestore';
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Search, Filter, History, ExternalLink } from "lucide-react"
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { format } from 'date-fns';

export default function PaymentHistoryPage() {
  const { user } = useUser();
  const db = useFirestore();

  // Query root collection filtered by userId
  const historyQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'payment_sessions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [db, user?.uid]);

  const { data: history, isLoading } = useCollection(historyQuery);

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
              placeholder="Search TrxID..." 
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
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14 pl-6">Serial</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14">Provider</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14">Brand Name</TableHead>
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
                ) : history && history.length > 0 ? (
                  history.map((tx, index) => (
                    <TableRow key={tx.id} className="border-border/10 hover:bg-secondary/10 transition-colors">
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
                      <TableCell className="text-xs font-medium">{tx.storeName || "Main Store"}</TableCell>
                      <TableCell className="text-xs font-mono text-primary">{tx.userProvidedTransactionId || "—"}</TableCell>
                      <TableCell className="text-xs font-bold">৳{tx.amount}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[8px] uppercase ${tx.status === 'completed' ? 'border-[#16a34a]/30 text-[#16a34a] bg-[#16a34a]/10' : 'border-amber-500/30 text-amber-500 bg-amber-500/10'}`}>
                          {tx.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[10px] text-muted-foreground">
                        {tx.createdAt ? format(tx.createdAt.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt), 'dd MMM yyyy, hh:mm a') : "—"}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary">
                          <ExternalLink className="h-4 w-4" />
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
                        <p className="text-sm font-medium text-muted-foreground">No payment history found for your account.</p>
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
