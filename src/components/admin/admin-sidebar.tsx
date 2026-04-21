"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Package,
  ArrowLeft,
  Database,
  Tags,
  History
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
} from "@/components/ui/sidebar"
import { useAuth } from "@/firebase"

const adminNavItems = [
  { title: "Overview", icon: LayoutDashboard, url: "/antiadmin" },
  { title: "Manage Users", icon: Users, url: "/antiadmin/users" },
  { title: "All Brands", icon: Tags, url: "/antiadmin/brands" },
  { title: "Plan Purchases", icon: History, url: "/antiadmin/transactions" },
  { title: "Subscription Plans", icon: Package, url: "/antiadmin/plans" },
  { title: "System Logs", icon: Database, url: "/antiadmin/logs" },
  { title: "Global Settings", icon: Settings, url: "/antiadmin/settings" },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const auth = useAuth()

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  }

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-r border-border/10 bg-[#0b141a]">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 flex items-center justify-center overflow-hidden">
            <img src="https://i.imgur.com/18owxBD.png" alt="AntiAdmin" className="h-full w-auto object-contain" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-headline font-bold text-xl tracking-tight text-[#16a34a]">AntiAdmin</span>
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Control Panel</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground/50 px-4 mb-2">Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className={`h-11 px-4 transition-all duration-200 ${
                      pathname === item.url 
                      ? "bg-[#16a34a]/10 text-[#16a34a] border-r-2 border-[#16a34a] rounded-none" 
                      : "hover:bg-[#162129] text-muted-foreground"
                    }`}
                  >
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className={`h-5 w-5 ${pathname === item.url ? "text-[#16a34a]" : "text-muted-foreground"}`} />
                      <span className="font-bold">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 bg-[#162129]/50 border-t border-border/10">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild
              className="text-slate-300 hover:text-white hover:bg-secondary/10 h-10 px-4 rounded-lg mb-2"
            >
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
                <span className="font-bold">Exit Admin</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout}
              className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-10 px-4 rounded-lg"
            >
              <LogOut className="h-4 w-4" />
              <span className="font-bold">Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}