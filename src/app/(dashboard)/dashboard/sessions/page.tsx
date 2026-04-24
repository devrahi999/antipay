'use client';

import { query, collection, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter, Download, ExternalLink, Layers } from "lucide-react"
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';

export default function SessionsPage() {
  const { user } = useUser();
  const db = useFirestore();

  // Updated to use the nested sessions subcollection path
  const sessionsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'payment_sessions', user.uid, 'sessions'), 
      orderBy('createdAt', 'desc')
    );
  }, [db, user?.uid]);

  const { data: sessions, isLoading } = useCollection(sessionsQuery);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground">Payment Sessions</h1>
          <p className="text-muted-foreground">Monitor real-time verification requests from your stores.</p>
        </div>
        <Button variant="outline" className="bg-card">
          <Download className="mr-2 h-4 w-4" /> Export Data
        </Button>
      </div>

      <Card className="shadow-sm border-none">
        <CardHeader className="pb-3">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by Session ID or Transaction ID..." className="pl-10" />
            </div>
            <Button variant="secondary">
              <Filter className="mr-2 h-4 w-4" /> Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-10 text-muted-foreground">Loading sessions...</p>
          ) : sessions && sessions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b-2">
                  <TableHead>Session ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Trx ID</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id} className="cursor-pointer hover:bg-secondary/30">
                    <TableCell className="font-mono font-medium text-primary text-xs">{session.id}</TableCell>
                    <TableCell className="font-semibold">৳{session.amount}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal border-primary/20 bg-primary/5 text-primary uppercase">
                        {session.method}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={
                          session.status === "completed" ? "bg-green-100 text-green-700" :
                          session.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                          "bg-red-100 text-red-700"
                        }
                      >
                        {session.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{session.userProvidedTransactionId || "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-[10px]">
                      {session.createdAt?.toDate ? session.createdAt.toDate().toLocaleString() : new Date(session.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" asChild>
                        <a href={`/s/${session.id}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-20">
              <Layers className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm text-muted-foreground">No sessions recorded yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}