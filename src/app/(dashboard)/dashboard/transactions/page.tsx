
'use client';

import { useMemo } from 'react';
import { query, collection, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Search, Filter, History } from "lucide-react"
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { format } from 'date-fns';

export default function TransactionsPage() {
  const { user } = useUser();
  const db = useFirestore();

  const sessionsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'users', user.uid, 'paymentSessions'),
      orderBy('createdAt', 'desc')
    );
  }, [db, user]);

  const { data: transactions, isLoading } = useCollection(sessionsQuery);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-headline font-bold text-foreground">Transactions</h1>
          <p className="text-sm text-muted-foreground">Monitor and manage all your payment activities.</p>
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
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14">Serial</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14">Provider</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14">Brand Name</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14">Transaction ID</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14">Sender Number</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14">Amount</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14">Date/Time</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-20 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs">Loading transactions...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : transactions && transactions.length > 0 ? (
                  transactions.map((tx, index) => (
                    <TableRow key={tx.id} className="border-border/10 hover:bg-secondary/10 transition-colors">
                      <TableCell className="text-xs font-mono text-muted-foreground">{(index + 1).toString().padStart(2, '0')}</TableCell>
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
                      <TableCell className="text-xs font-mono text-muted-foreground">{tx.senderNumber || "—"}</TableCell>
                      <TableCell className="text-xs font-bold">৳{tx.amount}</TableCell>
                      <TableCell className="text-[10px] text-muted-foreground">
                        {tx.createdAt ? format(tx.createdAt.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt), 'dd MMM yyyy, hh:mm a') : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary">
                          <MoreHorizontal className="h-4 w-4" />
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
                        <p className="text-sm font-medium text-muted-foreground">No stored data available.</p>
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
