import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col overflow-auto p-6 md:p-8">
          <main className="mx-auto w-full max-w-7xl">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}