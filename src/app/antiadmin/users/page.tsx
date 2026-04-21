'use client';

import { collection, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ShieldCheck, ShieldAlert, MoreHorizontal, UserCog } from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { useToast } from '@/hooks/use-toast';

export default function ManageUsersPage() {
  const db = useFirestore();
  const { toast } = useToast();

  const usersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'users'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: users, isLoading } = useCollection(usersQuery);

  const toggleAdmin = async (userId: string, currentAdminStatus: boolean) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'users', userId), {
        isAdmin: !currentAdminStatus,
        updatedAt: new Date().toISOString()
      });
      toast({ title: "Updated", description: `User admin status changed to ${!currentAdminStatus}.` });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Manage Users</h1>
          <p className="text-muted-foreground">Monitor and manage all merchant accounts.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search users..." className="pl-10 bg-[#162129] border-border/10" />
        </div>
      </div>

      <Card className="bg-[#162129] border-none shadow-2xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/10 hover:bg-transparent">
                <TableHead className="text-[10px] uppercase font-bold text-muted-foreground h-14 pl-6">Merchant</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-muted-foreground h-14">Email</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-muted-foreground h-14">Status</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-muted-foreground h-14">Created</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-muted-foreground h-14 text-right pr-6">Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">Fetching users...</TableCell>
                </TableRow>
              ) : users && users.length > 0 ? (
                users.map((u) => (
                  <TableRow key={u.id} className="border-border/5 hover:bg-white/5 transition-colors">
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-[#16a34a]/10 flex items-center justify-center text-[#16a34a] font-bold">
                          {u.displayName?.charAt(0) || u.email?.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-slate-200">{u.displayName || "Unknown"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[9px] uppercase border-[#16a34a]/30 text-[#16a34a] bg-[#16a34a]/5">
                        Verified
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[10px] text-muted-foreground">
                       {u.createdAt?.toDate ? u.createdAt.toDate().toLocaleDateString() : "Unknown"}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        {u.isAdmin ? (
                          <Badge className="bg-[#16a34a] text-white text-[9px] uppercase">Admin</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[9px] uppercase">Merchant</Badge>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#162129] border-border/20">
                            <DropdownMenuItem className="text-xs cursor-pointer" onClick={() => toggleAdmin(u.id, u.isAdmin)}>
                              <ShieldCheck className="mr-2 h-3.5 w-3.5" /> {u.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs cursor-pointer">
                              <UserCog className="mr-2 h-3.5 w-3.5" /> View Full Profile
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic">No users registered yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}