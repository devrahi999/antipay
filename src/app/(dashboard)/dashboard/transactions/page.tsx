
'use client';

import { useState } from 'react';
import { query, collection, orderBy } from 'firebase/firestore';
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Search, 
  Filter, 
  History, 
  Eye, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Fingerprint, 
  Database,
  Calendar,
  Wallet
} from "lucide-react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog"
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { format } from 'date-fns';

export default function PaymentHistoryPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Querying the nested sessions subcollection
  const historyQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'payment_sessions', user.uid, 'sessions'),
      orderBy('createdAt', 'desc')
    );
  }, [db, user?.uid]);

  const { data: history, isLoading } = useCollection(historyQuery);

  const safeFormatDate = (ts: any, formatStr: string = 'dd MMM, hh:mm a') => {
    if (!ts) return "—";
    try {
      const date = ts.toDate ? ts.toDate() : new Date(ts);
      return isNaN(date.getTime()) ? "—" : format(date, formatStr);
    } catch (e) {
      return "—";
    }
  };

  const handleViewDetails = (session: any) => {
    setSelectedSession(session);
    setIsViewOpen(true);
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
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:bg-primary/10 hover:text-primary" 
                          onClick={() => handleViewDetails(tx)}
                        >
                          <Eye className="h-3.5 w-3.5" />
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

      {/* Transaction Details Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[500px] bg-[#0b141a] border-border/20 text-foreground p-0 overflow-hidden shadow-2xl rounded-[2rem]">
          {selectedSession && (
            <>
              <DialogHeader className="p-6 bg-[#162129] border-b border-border/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Fingerprint size={20} />
                    </div>
                    <div>
                      <DialogTitle className="text-lg font-bold text-slate-100">Transaction Details</DialogTitle>
                      <DialogDescription className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Session Log</DialogDescription>
                    </div>
                  </div>
                  <Badge 
                    className={`text-[9px] font-black uppercase px-3 py-1 ${
                      selectedSession.status === 'verified' ? 'bg-[#16a34a]/20 text-[#16a34a]' : 
                      selectedSession.status === 'pending' ? 'bg-amber-500/20 text-amber-500' : 
                      'bg-rose-500/20 text-rose-500'
                    }`}
                  >
                    {selectedSession.status}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="p-6 space-y-6">
                <div className="bg-[#162129]/40 p-6 rounded-2xl border border-border/10 flex flex-col items-center gap-1">
                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Settlement Amount</p>
                   <p className="text-4xl font-black text-white">৳{selectedSession.amount}</p>
                   <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary text-[10px] font-bold uppercase">{selectedSession.method}</Badge>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 p-4 bg-[#162129]/30 rounded-xl border border-border/5">
                    <p className="text-[9px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                       <Database className="h-2.5 w-2.5" /> Internal Ref
                    </p>
                    <p className="text-xs font-bold text-slate-200 truncate">{selectedSession.val_id || "—"}</p>
                  </div>
                  <div className="space-y-1 p-4 bg-[#162129]/30 rounded-xl border border-border/5">
                    <p className="text-[9px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                       <CheckCircle2 className="h-2.5 w-2.5" /> Transaction ID
                    </p>
                    <p className="text-xs font-mono font-bold text-[#16a34a] truncate">{selectedSession.trxId || "Awaiting..."}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-border/10" />
                    <span className="text-[9px] uppercase font-black text-muted-foreground tracking-widest">Metadata & Timeline</span>
                    <div className="h-px flex-1 bg-border/10" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                       <span className="text-muted-foreground flex items-center gap-1.5"><Clock className="h-3 w-3" /> Created At</span>
                       <span className="text-slate-200 font-medium">
                         {safeFormatDate(selectedSession.createdAt, 'PPP, hh:mm a')}
                       </span>
                    </div>
                    {selectedSession.status === 'verified' && (
                      <div className="flex items-center justify-between text-xs">
                         <span className="text-muted-foreground flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-[#16a34a]" /> Verified At</span>
                         <span className="text-[#16a34a] font-bold">
                           {safeFormatDate(selectedSession.verifiedAt, 'PPP, hh:mm a')}
                         </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs">
                       <span className="text-muted-foreground flex items-center gap-1.5"><Wallet className="h-3 w-3" /> Receiver No</span>
                       <span className="text-slate-200 font-mono font-bold">{selectedSession.receiverNumber || "Configured Number"}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Session ID (System Reference)</p>
                  <code className="block w-full p-2.5 bg-[#162129] border border-border/10 rounded-lg text-[10px] font-mono text-primary truncate">
                    {selectedSession.id}
                  </code>
                </div>
              </div>

              <div className="p-4 bg-[#162129]/50 border-t border-border/10 flex justify-end">
                <Button variant="ghost" className="text-xs font-bold rounded-xl" onClick={() => setIsViewOpen(false)}>Close Log</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
