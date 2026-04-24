
'use client';

import { useState } from 'react';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Wallet, 
  Activity,
  CircleCheck,
  Clock,
  History,
  MoreVertical,
  XCircle,
  X
} from "lucide-react"
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const [showWelcome, setShowWelcome] = useState(true);

  // Updated to use the nested subcollection path
  const sessionsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'payment_sessions', user.uid, 'sessions'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
  }, [db, user?.uid]);

  const { data: recentSessions, isLoading: sessionsLoading } = useCollection(sessionsQuery);

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
              <div className="text-3xl font-black">৳0</div>
              <p className="text-[10px] mt-1 opacity-70">0 Invoices Generated</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-none text-white bg-emerald-500 shadow-xl ios-btn">
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Completed Volume</p>
              <CircleCheck className="h-5 w-5 opacity-40" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-black">৳0</div>
              <p className="text-[10px] mt-1 opacity-70">0 Invoices Paid</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-none text-white bg-amber-500 shadow-xl ios-btn">
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Pending Recovery</p>
              <Clock className="h-5 w-5 opacity-40" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-black">৳0</div>
              <p className="text-[10px] mt-1 opacity-70">0 Awaiting Payment</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-none text-white bg-rose-500 shadow-xl ios-btn">
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Canceled</p>
              <XCircle className="h-5 w-5 opacity-40" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-black">৳0</div>
              <p className="text-[10px] mt-1 opacity-70">0 Invoices Canceled</p>
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
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider">Customer</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider">Method</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider">Identifier</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider">Amount</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider">TXN ID</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessionsLoading ? (
                   <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground text-xs">Loading sessions...</TableCell></TableRow>
                ) : recentSessions && recentSessions.length > 0 ? (
                  recentSessions.map((session) => (
                    <TableRow key={session.id} className="border-border/30 hover:bg-secondary/20">
                      <TableCell className="text-xs font-medium">Guest User</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[9px] uppercase border-primary/20 text-primary bg-primary/5">{session.method}</Badge>
                      </TableCell>
                      <TableCell className="text-[10px] font-mono text-muted-foreground">{session.id.substring(0, 8)}</TableCell>
                      <TableCell className="text-xs font-bold">৳{session.amount}</TableCell>
                      <TableCell className="text-[10px] font-mono">{session.userProvidedTransactionId || "—"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="h-3.5 w-3.5" /></Button>
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
    </div>
  )
}

function Button({ children, variant, size, className, ...props }: any) {
  const variants: any = {
    ghost: "hover:bg-secondary/50",
    outline: "border border-border",
    default: "bg-primary text-primary-foreground"
  }
  const sizes: any = {
    icon: "p-1",
    default: "px-4 py-2"
  }
  return <button className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors ${variants[variant || 'default']} ${sizes[size || 'default']} ${className}`} {...props}>{children}</button>
}
