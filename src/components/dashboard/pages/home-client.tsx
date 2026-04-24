'use client';

import { useState } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Wallet, 
  Activity,
  CircleCheck,
  Clock,
  History,
  MoreVertical,
  XCircle,
  X,
  Eye,
  Fingerprint,
  Database,
  Calendar
} from "lucide-react"
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog"
import { format } from 'date-fns';

export function DashboardHomeClient() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const [showWelcome, setShowWelcome] = useState(true);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Fetch sessions for calculation (limit removed to get accurate volume for the merchant)
  const sessionsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'payment_sessions', user.uid, 'sessions'),
      orderBy('createdAt', 'desc')
    );
  }, [db, user?.uid]);

  const { data: allSessions, isLoading: sessionsLoading } = useCollection(sessionsQuery);

  // Aggregation Logic
  const stats = (allSessions || []).reduce((acc, session) => {
    const amount = Number(session.amount) || 0;
    acc.totalVolume += amount;
    acc.totalCount += 1;

    if (session.status === 'verified') {
      acc.completedVolume += amount;
      acc.completedCount += 1;
    } else if (session.status === 'pending') {
      acc.pendingVolume += amount;
      acc.pendingCount += 1;
    } else if (session.status === 'cancelled' || session.status === 'failed') {
      acc.cancelledVolume += amount;
      acc.cancelledCount += 1;
    }
    return acc;
  }, {
    totalVolume: 0, totalCount: 0,
    completedVolume: 0, completedCount: 0,
    pendingVolume: 0, pendingCount: 0,
    cancelledVolume: 0, cancelledCount: 0
  });

  const handleViewDetails = (session: any) => {
    setSelectedSession(session);
    setIsViewOpen(true);
  };

  if (isUserLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      {showWelcome && (
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/40 p-6 rounded-xl border border-border/50">
          <div>
            <h1 className="text-2xl font-headline font-bold text-foreground">Welcome back, {user?.displayName?.split(' ')[0] || "Merchant"}! 👋</h1>
            <p className="text-sm text-muted-foreground mt-1">Great things in business are never done by one person. 🤝</p>
          </div>
          <button 
            onClick={() => setShowWelcome(false)}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Invoice Analytics</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
        </div>
        <p className="text-xs text-muted-foreground -mt-3">Monitor volume, status, and performance</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="relative overflow-hidden border-none text-white bg-emerald-800 shadow-xl group ios-btn">
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Total Volume</p>
              <Wallet className="h-5 w-5 opacity-40" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-black">৳{stats.totalVolume.toLocaleString()}</div>
              <p className="text-[10px] mt-1 opacity-70">{stats.totalCount} Invoices Generated</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-none text-white bg-emerald-500 shadow-xl ios-btn">
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Completed Volume</p>
              <CircleCheck className="h-5 w-5 opacity-40" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-black">৳{stats.completedVolume.toLocaleString()}</div>
              <p className="text-[10px] mt-1 opacity-70">{stats.completedCount} Invoices Paid</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-none text-white bg-amber-500 shadow-xl ios-btn">
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Pending Recovery</p>
              <Clock className="h-5 w-5 opacity-40" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-black">৳{stats.pendingVolume.toLocaleString()}</div>
              <p className="text-[10px] mt-1 opacity-70">{stats.pendingCount} Awaiting Payment</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-none text-white bg-rose-500 shadow-xl ios-btn">
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Canceled</p>
              <XCircle className="h-5 w-5 opacity-40" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-black">৳{stats.cancelledVolume.toLocaleString()}</div>
              <p className="text-[10px] mt-1 opacity-70">{stats.cancelledCount} Invoices Canceled</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <History className="h-4 w-4 text-primary" /> Recent Transactions
            </CardTitle>
            <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px] gap-1 px-3 py-1 border border-primary/20">
              <Activity className="h-3 w-3" /> Live
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" /> Auto refreshing
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider">Provider</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider">Internal Ref</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider">Amount</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider">TrxID</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider">Status</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider text-right">View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessionsLoading ? (
                   <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground text-xs">Loading sessions...</TableCell></TableRow>
                ) : allSessions && allSessions.length > 0 ? (
                  allSessions.slice(0, 5).map((session) => (
                    <TableRow key={session.id} className="border-border/30 hover:bg-secondary/20">
                      <TableCell>
                        <Badge variant="outline" className="text-[9px] uppercase border-primary/20 bg-primary/5 text-primary">{session.method}</Badge>
                      </TableCell>
                      <TableCell className="text-[10px] font-mono text-muted-foreground">{session.val_id || "—"}</TableCell>
                      <TableCell className="text-xs font-bold">৳{session.amount}</TableCell>
                      <TableCell className="text-[10px] font-mono font-bold text-primary">{session.trxId || "—"}</TableCell>
                      <TableCell>
                        <Badge 
                          className={`text-[8px] uppercase ${
                            session.status === 'verified' ? 'bg-green-500/10 text-green-500' : 
                            session.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 
                            'bg-rose-500/10 text-rose-500'
                          }`}
                        >
                          {session.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7"
                          onClick={() => handleViewDetails(session)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-20">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Activity className="h-8 w-8 opacity-20" />
                        <p className="text-xs">No completed transactions found yet.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

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
                       <CircleCheck className="h-2.5 w-2.5" /> Transaction ID
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
                         {selectedSession.createdAt?.toDate ? format(selectedSession.createdAt.toDate(), 'PPP, hh:mm a') : "—"}
                       </span>
                    </div>
                    {selectedSession.status === 'verified' && (
                      <div className="flex items-center justify-between text-xs">
                         <span className="text-muted-foreground flex items-center gap-1.5"><CircleCheck className="h-3 w-3 text-[#16a34a]" /> Verified At</span>
                         <span className="text-[#16a34a] font-bold">
                           {selectedSession.verifiedAt?.toDate ? format(selectedSession.verifiedAt.toDate(), 'PPP, hh:mm a') : "Just now"}
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
