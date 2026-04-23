"use client"

import { useState, useEffect } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { User, LogOut, Settings, Search, Menu } from "lucide-react"
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { doc } from "firebase/firestore"
import Link from "next/link"

export function DashboardHeader() {
  const [mounted, setMounted] = useState(false)
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();

  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);
  const { data: profile } = useDoc(profileRef);

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <header className="h-16 border-b bg-background" />;

  const displayName = profile?.displayName || user?.displayName || "Merchant";
  const photoURL = profile?.photoURL || user?.photoURL || "";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="h-9 w-9 text-muted-foreground hover:text-primary transition-colors">
          <Menu className="h-6 w-6" />
        </SidebarTrigger>
      </div>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <Link href="/dashboard">
          <img 
            src="https://i.imgur.com/Chozuv5.png" 
            alt="AntiPay" 
            className="h-10 md:h-12 w-auto object-contain"
          />
        </Link>
      </div>

      <div className="flex items-center gap-2 md:gap-4 justify-end">
        <div className="hidden md:flex items-center bg-secondary/30 rounded-lg px-3 py-1.5 border border-border/50">
          <Search className="h-4 w-4 text-muted-foreground mr-2" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground w-20 lg:w-40"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-primary/10 p-0 overflow-hidden">
              <Avatar className="h-9 w-9">
                <AvatarImage src={photoURL} alt="User" />
                <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 dark bg-[#0b141a] border-border/20 text-slate-100" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-bold leading-none text-white">{displayName}</p>
                <p className="text-[10px] leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/10" />
            <DropdownMenuItem asChild className="focus:bg-[#16a34a]/10 focus:text-white cursor-pointer">
              <Link href="/dashboard/settings" className="flex items-center w-full">
                <User className="mr-2 h-4 w-4 text-[#16a34a]" />
                <span className="font-medium">Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="focus:bg-[#16a34a]/10 focus:text-white cursor-pointer">
              <Link href="/dashboard/settings" className="flex items-center w-full">
                <Settings className="mr-2 h-4 w-4 text-[#16a34a]" />
                <span className="font-medium">Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/10" />
            <DropdownMenuItem className="text-rose-400 focus:bg-rose-500/10 focus:text-rose-300 cursor-pointer" onClick={() => auth.signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              <span className="font-bold">Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
