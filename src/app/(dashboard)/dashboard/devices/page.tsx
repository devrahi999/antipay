"use client"

import { query, collection, orderBy } from "firebase/firestore"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Smartphone, ShieldCheck, Clock, MoreVertical, Trash2, SmartphoneNfc } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates"
import { doc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

export default function DevicesPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  const devicesQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(collection(db, "users", user.uid, "devices"), orderBy("createdAt", "desc"))
  }, [db, user])

  const { data: devices, isLoading } = useCollection(devicesQuery)

  const handleDelete = (deviceId: string) => {
    if (!user || !db || !confirm("Are you sure you want to disconnect this device?")) return
    deleteDocumentNonBlocking(doc(db, "users", user.uid, "devices", deviceId))
    toast({ title: "Disconnected", description: "The device has been removed from your account." })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground">My Devices</h1>
          <p className="text-muted-foreground">Manage Android devices connected to your AntiPay ecosystem.</p>
        </div>
        <Button className="bg-[#16a34a] hover:bg-[#15803d] font-bold shadow-lg shadow-[#16a34a]/20">
          <SmartphoneNfc className="mr-2 h-4 w-4" /> Link New Device
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 text-center text-muted-foreground">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
            Loading devices...
          </div>
        ) : devices && devices.length > 0 ? (
          devices.map((device) => (
            <Card key={device.id} className="bg-[#0b141a] border-border/40 shadow-xl overflow-hidden group">
              <CardHeader className="flex flex-row items-center justify-between pb-2 bg-[#162129]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-slate-100">{device.deviceName}</CardTitle>
                    <Badge variant="outline" className="text-[8px] uppercase border-[#16a34a]/30 text-[#16a34a] bg-[#16a34a]/10 px-2 mt-0.5">
                      Active
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#0b141a] border-border/20">
                    <DropdownMenuItem className="text-destructive focus:bg-destructive/10 cursor-pointer" onClick={() => handleDelete(device.id)}>
                      <Trash2 className="mr-2 h-3.5 w-3.5" /> Disconnect Device
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase text-muted-foreground font-bold flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Last Active
                    </p>
                    <p className="text-xs text-slate-200">
                      {device.lastActiveAt?.toDate ? device.lastActiveAt.toDate().toLocaleString() : "Just now"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase text-muted-foreground font-bold flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> Security
                    </p>
                    <p className="text-xs text-slate-200">Encrypted</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full py-20 bg-[#0b141a] border-dashed border-border/40 flex flex-col items-center justify-center text-center">
            <div className="h-20 w-20 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
              <Smartphone className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <h3 className="text-lg font-bold text-slate-200">No Devices Connected</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-2">
              Connect your Android device using the AntiPay Sync app to start verifying SMS transactions.
            </p>
            <Button variant="outline" className="mt-6 border-border/20 hover:bg-secondary/10 font-bold" asChild>
              <Link href="/dashboard/android">Setup Instructions</Link>
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}
