
"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Key,
  WalletCards,
  History,
  CreditCard,
  Settings,
  LogOut,
  ShieldCheck,
  Smartphone,
  Layers,
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
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { useAuth, useUser } from "@/firebase"

const navItems = [
  {
    title: "Overview",
    icon: LayoutDashboard,
    url: "/dashboard",
  },
  {
    title: "API Keys",
    icon: Key,
    url: "/dashboard/api-keys",
  },
  {
    title: "Payment Methods",
    icon: WalletCards,
    url: "/dashboard/payment-methods",
  },
  {
    title: "Sessions",
    icon: Layers,
    url: "/dashboard/sessions",
  },
  {
    title: "Raw Transactions",
    icon: History,
    url: "/dashboard/transactions",
  },
  {
    title: "Devices",
    icon: Smartphone,
    url: "/dashboard/devices",
  },
  {
    title: "Subscription",
    icon: CreditCard,
    url: "/dashboard/subscription",
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
  const { user } = useUser()
  const userAvatar = PlaceHolderImages.find(img => img.id === "user-avatar")?.imageUrl

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  }

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg text-primary-foreground">
            <ShieldCheck size={24} />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-headline font-bold text-xl tracking-tight text-primary">AntiPay</span>
            <span className="text-xs text-muted-foreground font-medium">Merchant Console</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={mounted ? item.title : undefined}
                    className="h-10"
                  >
                    <Link href={item.url}>
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <SidebarSeparator className="mb-4" />
        {user && (
          <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center px-2">
            <Avatar className="h-8 w-8 ring-1 ring-primary/20">
              <AvatarImage src={userAvatar} alt="User Avatar" />
              <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden overflow-hidden">
              <span className="text-xs font-semibold truncate">{user.displayName || "Merchant"}</span>
              <span className="text-[10px] text-muted-foreground truncate">{user.email}</span>
            </div>
          </div>
        )}
        <SidebarMenu className="mt-4">
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout}
              tooltip={mounted ? "Logout" : undefined} 
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              <span className="font-medium group-data-[collapsible=icon]:hidden">Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
