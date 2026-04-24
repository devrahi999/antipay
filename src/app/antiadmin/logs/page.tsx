'use client';

import { collectionGroup, query, orderBy, limit } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Database, Search, History } from "lucide-react"

export default function SystemLogsPage() {
  const db = useFirestore();

  // Updated to use the nested 'sessions' subcollection group
  const sessionsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collectionGroup(db, 'sessions'), orderBy('createdAt', 'desc'), limit(100));
  }, [db]);

  const { data: logs, isLoading } = useCollection(sessionsQuery);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">System Logs</h1>
          <p className="text-muted-foreground">Global payment sessions and verification activity.</p>
        </div>
        <div className="flex items-center gap-2">
           <Badge variant="outline" className="bg-[#16a34a]/10 text-[#16a34a] border-[#16a34a]/20">Live Feed</Badge>
        </div>
      </div>

      <Card className="bg-[#162129] border-none shadow-2xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/10 hover:bg-transparent">
                <TableHead className="text-[10px] uppercase font-bold text-muted-foreground h-14 pl-6">Session ID</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-muted-foreground h-14">Method</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-muted-foreground h-14">Amount</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-muted-foreground h-14">Status</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-muted-foreground h-14 text-right pr-6">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">Streaming global activity...</TableCell>
                </TableRow>
              ) : logs && logs.length > 0 ? (
                logs.map((log) => (
                  <TableRow key={log.id} className="border-border/5 hover:bg-white/5 transition-colors">
                    <TableCell className="pl-6 font-mono text-[10px] text-primary">
                      {log.id}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[9px] uppercase border-[#16a34a]/20 text-[#16a34a]">
                        {log.method}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-bold text-slate-200">৳{log.amount}</TableCell>
                    <TableCell>
                      <Badge className={
                        log.status === 'completed' ? 'bg-[#16a34a]/20 text-[#16a34a]' :
                        log.status === 'pending' ? 'bg-amber-500/20 text-amber-500' :
                        'bg-rose-500/20 text-rose-500'
                      }>
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6 text-[10px] text-muted-foreground">
                       {log.createdAt?.toDate ? log.createdAt.toDate().toLocaleString() : "Just now"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic">
                    <div className="flex flex-col items-center gap-2">
                      <History className="h-10 w-10 opacity-20" />
                      <p>No activity recorded yet.</p>
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