
"use client"

import { useState } from "react"
import { query, collection, orderBy, doc, deleteDoc, where } from "firebase/firestore"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Smartphone, ShieldCheck, Clock, MoreVertical, Trash2, SmartphoneNfc, AlertTriangle, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function DevicesPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<string | null>(null);

  // Fetch devices belonging to user's brands from root /devices
  const devicesQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    // We check root /devices where a userId or brand mapping is present
    // MVP: Assume devices document structure where userId is stored to list all for merchant
    return query(collection(db, "devices"), where("userId", "==", user.uid));
  }, [db, user])

  const { data: devices, isLoading } = useCollection(devicesQuery)

  const confirmDelete = (id: string) => {
    setDeviceToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!user || !db || !deviceToDelete) return
    try {
      await deleteDoc(doc(db, "devices", deviceToDelete));
      toast({ title: "Disconnected", description: "Node has been removed from your account." })
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeviceToDelete(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground">AntiPay Nodes</h1>
          <p className="text-muted-foreground text-sm">Monitor Android nodes currently synced with your brands.</p>
        </div>
        <Button asChild className="bg-[#16a34a] hover:bg-[#15803d] font-bold shadow-lg shadow-[#16a34a]/20">
          <Link href="/dashboard/android"><SmartphoneNfc className="mr-2 h-4 w-4" /> Link New Node</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 text-center text-muted-foreground">
             <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
             <p className="text-xs font-bold uppercase tracking-widest">Scanning Signal...</p>
          </div>
        ) : devices && devices.length > 0 ? (
          devices.map((device) => (
            <Card key={device.id} className="bg-[#0b141a] border-border/40 shadow-xl overflow-hidden group">
              <CardHeader className="flex flex-row items-center justify-between pb-3 bg-[#162129]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-slate-100">{device.deviceName || 'Android Node'}</CardTitle>
                    <div className="flex items-center gap-1.5 mt-0.5">
                       <Badge className="text-[8px] uppercase border-[#16a34a]/30 text-[#16a34a] bg-[#16a34a]/10 px-2">Active</Badge>
                       <span className="text-[8px] text-muted-foreground font-mono">{device.brandId?.substring(0, 8)}...</span>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white"><MoreVertical className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#0b141a] border-border/20">
                    <DropdownMenuItem className="text-destructive focus:bg-destructive/10 cursor-pointer" onClick={() => confirmDelete(device.id)}>
                      <Trash2 className="mr-2 h-3.5 w-3.5" /> Disconnect Node
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[9px] uppercase text-muted-foreground font-bold flex items-center gap-1">
                      <Clock className="h-3 w-3 text-primary" /> Last Sync
                    </p>
                    <p className="text-xs text-slate-200">
                      {device.lastActiveAt?.toDate ? device.lastActiveAt.toDate().toLocaleTimeString() : "Online"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] uppercase text-muted-foreground font-bold flex items-center gap-1">
                      <Layers className="h-3 w-3 text-amber-500" /> Mapping
                    </p>
                    <p className="text-xs text-slate-200 truncate">{device.brandName || "Default Brand"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full py-24 bg-[#0b141a] border-dashed border-border/40 flex flex-col items-center justify-center text-center">
            <Smartphone className="h-12 w-12 text-muted-foreground/10 mb-4" />
            <h3 className="text-lg font-bold text-slate-200 uppercase tracking-tighter">No Active Nodes</h3>
            <p className="text-xs text-muted-foreground max-w-xs mt-1">Install AntiPay Sync on your device to start capturing transaction SMS.</p>
            <Button variant="outline" className="mt-8 border-border/20 font-bold" asChild>
              <Link href="/dashboard/android">Installation Guide</Link>
            </Button>
          </Card>
        )}
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#0b141a] border-border/20 text-white">
          <AlertDialogHeader>
            <div className="h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-4">
               <AlertTriangle size={24} />
            </div>
            <AlertDialogTitle className="text-xl font-bold">Sever Node Connection?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground italic">
              The SMS relay from this device will stop immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="bg-secondary/10 hover:bg-secondary/20 border-none text-white">Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-rose-500 hover:bg-rose-600 text-white font-bold" onClick={handleDelete}>Disconnect Now</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
