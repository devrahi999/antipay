"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Tags,
  History,
  FileText,
  BookOpen,
  Smartphone,
  CreditCard,
  Settings,
  LogOut,
  ShieldCheck,
  WalletCards,
  SmartphoneNfc,
  Layers
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { doc } from "firebase/firestore"

const navItems = [
  {
    title: "Overview",
    icon: LayoutDashboard,
    url: "/dashboard",
  },
  {
    title: "Brands",
    icon: Tags,
    url: "/dashboard/brands",
  },
  {
    title: "Transactions",
    icon: History,
    url: "/dashboard/transactions",
  },
  {
    title: "Invoices",
    icon: FileText,
    url: "/dashboard/invoices",
  },
  {
    title: "Payment Methods",
    icon: WalletCards,
    url: "/dashboard/payment-methods",
  },
  {
    title: "Devices",
    icon: SmartphoneNfc,
    url: "/dashboard/devices",
  },
  {
    title: "All Plans",
    icon: Layers,
    url: "/dashboard/plans",
  },
  {
    title: "My Subscription",
    icon: CreditCard,
    url: "/dashboard/subscription",
  },
  {
    title: "Android App",
    icon: Smartphone,
    url: "/dashboard/android",
  },
  {
    title: "Settings",
    icon: Settings,
    url: "/dashboard/settings",
  },
]

export function AppSidebar() {
  const [mounted, setMounted] = React.useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const auth = useAuth()
  const db = useFirestore()
  const { user } = useUser()

  // Fetch real profile data from Firestore to get the most updated photoURL and displayName
  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);
  const { data: profile } = useDoc(profileRef);

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  }

  const displayName = profile?.displayName || user?.displayName || "Merchant";
  const photoURL = profile?.photoURL || user?.photoURL || "";

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-r border-border/50">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg text-primary-foreground shadow-lg shadow-primary/20">
            <ShieldCheck size={24} />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-headline font-bold text-xl tracking-tight text-primary">AntiPay</span>
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Merchant Console</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground/50 px-4 mb-2">Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={mounted ? item.title : undefined}
                    className={`h-10 px-4 transition-all duration-200 ${
                      pathname === item.url 
                      ? "bg-primary/10 text-primary border-r-2 border-primary rounded-none" 
                      : "hover:bg-primary/5 text-muted-foreground"
                    }`}
                  >
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className={`h-5 w-5 ${pathname === item.url ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 bg-secondary/20 border-t border-border/50">
        <SidebarSeparator className="mb-4 hidden" />
        {user && (
          <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center px-2 mb-4">
            <Avatar className="h-9 w-9 ring-2 ring-primary/20">
              <AvatarImage src={photoURL} alt="User Avatar" />
              <AvatarFallback className="bg-primary/10 text-primary">{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden overflow-hidden">
              <span className="text-xs font-bold truncate text-foreground">{displayName}</span>
              <span className="text-[10px] text-muted-foreground truncate">{user.email}</span>
            </div>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout}
              tooltip={mounted ? "Logout" : undefined} 
              className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-10 px-4 rounded-lg"
            >
              <LogOut className="h-4 w-4" />
              <span className="font-bold group-data-[collapsible=icon]:hidden">Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
