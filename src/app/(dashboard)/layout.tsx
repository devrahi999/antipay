
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@/firebase';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { usePlanEnforcement } from '@/hooks/use-plan-enforcement';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  // Revoke access the moment a plan's validity ends (and restore it on renewal).
  usePlanEnforcement();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isUserLoading && !user) {
      router.push('/login');
    }

    // Force verify email check
    if (user && !user.emailVerified) {
       // Only allow access if verified. For Google users, this is usually true.
       // For Password users, we enforce it.
       auth.signOut().then(() => {
         router.push('/login?error=verify-email');
       });
    }
  }, [user, isUserLoading, router, auth]);

  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Authenticating...</p>
      </div>
    );
  }

  if (!user || !user.emailVerified) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <SidebarProvider>
        <div className="flex h-screen w-full overflow-hidden font-body">
          <AppSidebar />
          <SidebarInset className="flex-1 flex flex-col overflow-hidden bg-background">
            <DashboardHeader />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
              <div className="mx-auto w-full max-w-7xl">
                {children}
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
