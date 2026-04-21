'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { doc } from 'firebase/firestore';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  
  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);
  
  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="min-h-screen bg-[#0b141a] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 text-[#16a34a] animate-spin" />
        <p className="text-sm font-medium text-muted-foreground">Checking Admin Access...</p>
      </div>
    );
  }

  // Simple Admin check based on isAdmin field in Firestore
  if (!user || !profile?.isAdmin) {
    return (
      <div className="min-h-screen bg-[#0b141a] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-destructive/10 p-4 rounded-full mb-4">
          <ShieldAlert className="h-12 w-12 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-muted-foreground max-w-md mb-6">
          You do not have administrative privileges to access this area. If you believe this is an error, contact the system administrator.
        </p>
        <Button asChild className="bg-[#16a34a] hover:bg-[#15803d]">
          <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-[#0b141a] text-foreground font-body">
      <SidebarProvider>
        <div className="flex h-screen w-full overflow-hidden">
          <AdminSidebar />
          <SidebarInset className="flex-1 flex flex-col overflow-hidden bg-[#0b141a]">
            <header className="h-16 border-b border-border/10 flex items-center px-6 bg-[#162129]">
               <h2 className="text-lg font-bold text-[#16a34a] flex items-center gap-2">
                 <ShieldAlert className="h-5 w-5" /> AntiPay Admin Center
               </h2>
            </header>
            <main className="flex-1 overflow-y-auto p-6 md:p-8">
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