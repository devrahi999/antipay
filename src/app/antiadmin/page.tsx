'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CreditCard, Activity, TrendingUp, ShieldCheck, Clock } from "lucide-react"
import { collection, query, limit } from "firebase/firestore"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"

export default function AdminOverview() {
  const db = useFirestore();

  const usersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'users'), limit(100));
  }, [db]);

  const { data: users, isLoading: usersLoading } = useCollection(usersQuery);

  const stats = [
    { label: "Total Users", value: users?.length || 0, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Active Subs", value: "0", icon: CreditCard, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Daily Txns", value: "0", icon: Activity, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "System Health", value: "99.9%", icon: ShieldCheck, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Administration Overview</h1>
        <p className="text-muted-foreground mt-1">Real-time stats and system monitoring for AntiPay.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-[#162129] border-border/10 shadow-xl border-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</span>
              <div className={`${stat.bg} p-2 rounded-lg`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-emerald-500" /> +0% from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-[#162129] border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#16a34a]" /> Recent Registrations
            </CardTitle>
          </CardHeader>
          <CardContent>
             {usersLoading ? (
               <p className="text-center py-10 text-muted-foreground">Loading users...</p>
             ) : users && users.length > 0 ? (
               <div className="space-y-4">
                 {users.slice(0, 5).map((u) => (
                   <div key={u.id} className="flex items-center justify-between p-3 bg-[#0b141a] rounded-xl border border-border/10">
                     <div className="flex items-center gap-3">
                       <div className="h-10 w-10 rounded-full bg-[#16a34a]/10 flex items-center justify-center text-[#16a34a] font-bold">
                         {u.displayName?.charAt(0) || u.email?.charAt(0)}
                       </div>
                       <div>
                         <p className="text-sm font-bold text-slate-100">{u.displayName || "Unknown User"}</p>
                         <p className="text-[10px] text-muted-foreground">{u.email}</p>
                       </div>
                     </div>
                     <span className="text-[9px] text-muted-foreground font-mono bg-[#162129] px-2 py-1 rounded">
                       {u.id.substring(0, 8)}...
                     </span>
                   </div>
                 ))}
               </div>
             ) : (
               <p className="text-center py-10 text-muted-foreground italic">No users found.</p>
             )}
          </CardContent>
        </Card>

        <Card className="bg-[#162129] border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#16a34a]" /> System Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="h-32 w-32 rounded-full border-8 border-[#16a34a]/20 border-t-[#16a34a] animate-spin-slow flex items-center justify-center">
              <span className="text-2xl font-bold text-white">99%</span>
            </div>
            <p className="text-sm text-muted-foreground">Verification Engine Operational</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}