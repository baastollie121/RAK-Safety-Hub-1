
'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Header } from "@/components/Header";
import { Navigation } from "@/components/navigation";
import { Skeleton } from './ui/skeleton';
import { ChatWidget } from '@/components/support/ChatWidget';
import { Logo } from './logo';

function AppSkeleton() {
    return (
        <div className="flex h-screen w-full bg-background">
            <div className="hidden md:flex flex-col gap-4 border-r p-4 w-64">
                <div className="flex items-center gap-2 p-2">
                    <Skeleton className="size-8 rounded-full" />
                    <Skeleton className="h-6 w-32" />
                </div>
                <div className="flex flex-col gap-2 p-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                </div>
            </div>
            <div className="flex-1 p-8">
                <Skeleton className="h-10 w-1/3 mb-4" />
                <Skeleton className="h-4 w-1/2 mb-8" />
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
            </div>
        </div>
    )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated && pathname !== '/login') {
      router.push('/login');
    }
  }, [loading, isAuthenticated, pathname, router]);

  if (loading) {
    return <AppSkeleton />;
  }
  
  if (pathname === '/login') {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    // This state can happen briefly before the redirect effect kicks in.
    // Showing a skeleton here prevents a flicker of the main UI.
    return <AppSkeleton />;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4 flex items-center justify-between">
           
           <SidebarTrigger />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <Navigation />
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col h-screen">
          <Header />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
        {user?.role === 'client' && <ChatWidget />}
      </SidebarInset>
    </SidebarProvider>
  );
}
