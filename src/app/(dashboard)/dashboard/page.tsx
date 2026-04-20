
'use client';

import { useMemo } from 'react';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowUpRight, 
  Wallet, 
  Layers, 
  Activity,
  CheckCircle2,
  Smartphone,
  Key
} from "lucide-react"
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  const sessionsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'users', user.uid, 'paymentSessions'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
  }, [db, user]);

  const { data: recentSessions, isLoading: sessionsLoading } = useCollection(sessionsQuery);

  const stats = [
    { title: "Total Sessions", value: "24", icon: Layers, trend: "+12%" },
    { title: "Verified", value: "18", icon: CheckCircle2, trend: "+8%" },
    { title: "Pending", value: "6", icon: Activity, trend: "-2%" },
    { title: "Active Devices", value: "1", icon: Smartphone, trend: "0%" },
  ];

  if (isUserLoading) return <div className="p-8 text-center">Loading your dashboard...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold text-foreground">Welcome back, {user?.displayName || "Merchant"}</h1>
        <p className="text-muted-foreground">Here's what's happening with your payments today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <Card key={idx} className="shadow-sm border-none bg-card hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <span className="text-primary flex items-center"><ArrowUpRight className="h-3 w-3" /> {stat.trend}</span> vs yesterday
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-sm border-none">
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>The last 5 payment requests initiated via your API.</CardDescription>
          </CardHeader>
          <CardContent>
            {sessionsLoading ? (
              <p className="text-sm text-muted-foreground">Loading sessions...</p>
            ) : recentSessions && recentSessions.length > 0 ? (
              <div className="space-y-4">
                {recentSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-full text-primary">
                        <Wallet className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">৳{session.amount}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">{session.method}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant="secondary" 
                        className={
                          session.status === 'completed' ? 'bg-green-100 text-green-700' :
                          session.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }
                      >
                        {session.status}
                      </Badge>
                      <p className="text-[10px] text-muted-foreground mt-1">{new Date(session.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Layers className="mx-auto h-12 w-12 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No sessions yet. Integrate your API to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none">
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Status of your critical services.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Key className="text-primary h-5 w-5" />
                <span className="text-sm font-medium">API Endpoint</span>
              </div>
              <Badge variant="outline" className="border-green-500 text-green-500">Operational</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="text-primary h-5 w-5" />
                <span className="text-sm font-medium">SMS Gateway</span>
              </div>
              <Badge variant="outline" className="border-green-500 text-green-500">Connected</Badge>
            </div>
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-2">Usage Limit</p>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full w-[15%]" />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">150 / 1000 transactions this month</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
