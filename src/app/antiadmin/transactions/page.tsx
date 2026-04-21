
'use client';

import { collection, query, orderBy, limit } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { History, CreditCard, User, Calendar, Loader2 } from "lucide-react"

export default function AdminTransactionsPage() {
  const db = useFirestore();

  const transactionsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'plan_transactions'), orderBy('createdAt', 'desc'), limit(100));
  }, [db]);

  const { data: transactions, isLoading } = useCollection(transactionsQuery);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white font-headline">Plan Purchases</h1>
          <p className="text-muted-foreground text-sm">Monitor system revenue and subscription history.</p>
        </div>
        <div className="flex items-center gap-2">
           <Badge variant="outline" className="bg-[#16a34a]/10 text-[#16a34a] border-[#16a34a]/20 px-3 h-8 font-bold">
             Total Volume: ৳{transactions?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0}
           </Badge>
        </div>
      </div>

      <Card className="bg-[#162129] border-none shadow-2xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/10 hover:bg-transparent">
                <TableHead className="text-[10px] uppercase font-bold text-muted-foreground h-14 pl-6">Merchant / Email</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-muted-foreground h-14">Plan Purchased</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-muted-foreground h-14">Amount</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-muted-foreground h-14">Method</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-muted-foreground h-14 text-right pr-6">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Fetching transaction history...</p>
                  </TableCell>
                </TableRow>
              ) : transactions && transactions.length > 0 ? (
                transactions.map((tx) => (
                  <TableRow key={tx.id} className="border-border/5 hover:bg-white/5 transition-colors">
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-[#0b141a] flex items-center justify-center text-muted-foreground border border-border/10">
                          <User className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-200">{tx.userEmail}</span>
                          <span className="text-[9px] text-muted-foreground font-mono">{tx.userId?.substring(0, 10)}...</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[9px] uppercase border-primary/20 text-primary bg-primary/5">
                        {tx.planName}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-bold text-[#16a34a]">
                      ৳{tx.amount}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[8px] bg-secondary/50 uppercase">
                        {tx.status || 'Success'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6 text-[10px] text-muted-foreground font-medium">
                       <div className="flex flex-col items-end">
                         <span className="flex items-center gap-1"><Calendar className="h-2.5 w-2.5" /> {tx.createdAt?.toDate ? tx.createdAt.toDate().toLocaleDateString() : "Just now"}</span>
                         <span>{tx.createdAt?.toDate ? tx.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}</span>
                       </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-32 text-muted-foreground italic">
                    <div className="flex flex-col items-center gap-3">
                      <History className="h-10 w-10 opacity-20" />
                      <p>No transactions recorded in the system yet.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
