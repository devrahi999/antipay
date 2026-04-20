"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Store,
  WalletCards,
  History,
  CreditCard,
  Settings,
  LogOut,
  ShieldCheck,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

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

const navItems = [
  {
    title: "Overview",
    icon: LayoutDashboard,
    url: "/dashboard",
  },
  {
    title: "Store Config",
    icon: Store,
    url: "/stores",
  },
  {
    title: "Payment Methods",
    icon: WalletCards,
    url: "/payments",
  },
  {
    title: "Transactions",
    icon: History,
    url: "/transactions",
  },
  {
    title: "Subscription",
    icon: CreditCard,
    url: "/subscription",
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const userAvatar = PlaceHolderImages.find(img => img.id === "user-avatar")?.imageUrl

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg text-primary-foreground">
            <ShieldCheck size={24} />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-headline font-bold text-xl tracking-tight text-primary">AntiPay</span>
            <span className="text-xs text-muted-foreground">Merchant Dashboard</span>
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
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
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
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <Avatar className="h-10 w-10 ring-2 ring-primary/20">
            <AvatarImage src={userAvatar} alt="User Avatar" />
            <AvatarFallback>AP</AvatarFallback>
          </Avatar>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden overflow-hidden">
            <span className="text-sm font-semibold truncate">Rahat Kabir</span>
            <span className="text-xs text-muted-foreground truncate">rahat@antipay.io</span>
          </div>
        </div>
        <SidebarMenu className="mt-4">
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Logout" className="text-destructive hover:text-destructive hover:bg-destructive/10">
              <LogOut />
              <span className="group-data-[collapsible=icon]:hidden">Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}