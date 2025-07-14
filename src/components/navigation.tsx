
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  Bot,
  CalendarCog,
  FileArchive,
  FileCheck2,
  FileCog,
  FileJson2,
  FileSearch,
  FileText,
  Folder,
  Home,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Map,
  MessageSquare,
  Newspaper,
  Package,
  ScanSearch,
  Shield,
  ShieldCheck,
  Sparkles,
  Truck,
  UserCog,
  UserPlus,
  Users,
  ChevronRight,
  BookOpenCheck,
  FilePlus,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { useAuth } from '@/context/AuthContext';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';

export function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [hasNewMessages, setHasNewMessages] = useState(true);
  const [hasUnreadNews, setHasUnreadNews] = useState(false);

  useEffect(() => {
    const checkNews = () => {
        if (user?.role === 'client') {
            const unread = localStorage.getItem('hasUnreadNews') === 'true';
            setHasUnreadNews(unread);
        }
    };

    checkNews();
    
    window.addEventListener('storage', checkNews);

    return () => {
        window.removeEventListener('storage', checkNews);
    }
  }, [user, pathname]);

  const mainNav = [
    { href: '/', icon: <Home />, label: 'Dashboard' },
    { href: '/documents', icon: <Folder />, label: 'Document Library' },
    { href: '/safety-consultant', icon: <Bot />, label: 'AI Safety Consultant' },
    { href: '/safety-news', icon: <Newspaper />, label: 'Safety News', notification: hasUnreadNews && user?.role === 'client' },
  ];
  
  const aiToolsNav = [
    { href: '/hazard-hunter', icon: <ScanSearch />, label: 'AI Hazard Hunter' },
    { href: '/hira-generator', icon: <FileCheck2 />, label: 'HIRA Generator' },
    { href: '/she-site-plan-generator', icon: <Map />, label: 'SHE Site Plan Generator' },
    { href: '/safe-work-procedure', icon: <ShieldCheck />, label: 'Safe Work Procedure' },
    { href: '/method-statement', icon: <FileText />, label: 'Method Statement Gen' },
  ];
  
  const trackersNav = [
    { href: '/trackers/site-health-dashboard', icon: <LayoutDashboard />, label: 'Site Health Dashboard' },
    { href: '/trackers/vehicle-equipment-tracker', icon: <Truck />, label: 'Vehicle Fleet Tracker' },
    { href: '/trackers/asset-equipment-tracker', icon: <Package />, label: 'Tool & Equipment Tracker' },
    { href: '/trackers/employee-training-tracker', icon: <Users />, label: 'Employee Training' },
    { href: '/trackers/site-resource-planner', icon: <CalendarCog />, label: 'Site & Resource Planner' },
  ];
  
  const aiDocsNav = [
    { href: '/ai-docs/saved-hira-reports', icon: <FileCheck2 />, label: 'Saved HIRA Reports' },
    { href: '/ai-docs/saved-she-plans', icon: <FileJson2 />, label: 'Saved SHE Plans' },
    { href: '/ai-docs/saved-swps', icon: <Shield />, label: 'Saved SWPs' },
    { href: '/ai-docs/saved-method-statements', icon: <FileText />, label: 'Saved Method Statements' },
  ];
  
  const supportNav = [
      { href: '/support', icon: <LifeBuoy />, label: 'Support & Billing' },
      { href: '/how-to-guide', icon: <BookOpenCheck />, label: 'How-To Guide' },
  ]
  
  const adminNav = [
    { href: '/admin/onboard-client', icon: <UserPlus />, label: 'Onboard Client' },
    { href: '/admin/manage-documents', icon: <FileCog />, label: 'Manage Documents' },
    { href: '/admin/manage-news', icon: <FilePlus />, label: 'Manage Articles' },
    { href: '/admin/news-scraper', icon: <FileSearch />, label: 'News Scraper' },
    { href: '/admin/client-messages', icon: <MessageSquare />, label: 'Client Messages', notification: hasNewMessages },
  ];

  const NavGroup = ({
    title,
    icon,
    items,
    pathname,
  }: {
    title: string;
    icon: React.ReactNode;
    items: Array<{ href: string; icon: React.ReactNode; label: string; notification?: boolean }>;
    pathname: string;
  }) => {
    const isAnyItemActive = items.some((item) => pathname.startsWith(item.href) && (item.href !== '/' || pathname === '/'));
  
    return (
      <Collapsible defaultOpen={isAnyItemActive} className="w-full">
        <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md p-2 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground [&[data-state=open]>svg]:rotate-90">
          <div className="flex items-center gap-2 text-sm font-medium">
            {icon}
            <span>{title}</span>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-200" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenu className="ml-4 mt-1 flex flex-col items-stretch border-l border-sidebar-border pl-4">
            {items.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  size="sm"
                  isActive={pathname.startsWith(item.href) && (item.href !== '/' || pathname === '/')}
                  tooltip={{
                    children: item.label,
                  }}
                >
                  <Link href={item.href}>
                    {item.icon}
                    <span>{item.label}</span>
                     {item.notification && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 size-2 rounded-full bg-red-500" />
                      )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  const renderNavItems = (items: typeof mainNav) =>
    items.map((item) => (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuButton
          asChild
          isActive={pathname === item.href}
          tooltip={{
            children: item.label,
          }}
        >
          <Link href={item.href}>
            {item.icon}
            <span>{item.label}</span>
            {item.notification && (
                <span className="ml-auto size-2 rounded-full bg-red-500" />
            )}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

  return (
    <>
      <SidebarGroup className="p-2">
        <SidebarMenu>{renderNavItems(mainNav)}</SidebarMenu>
      </SidebarGroup>

      <SidebarSeparator />

      <SidebarGroup className="p-0">
         <NavGroup title="AI Tools" icon={<Sparkles className="size-4" />} items={aiToolsNav} pathname={pathname} />
      </SidebarGroup>

      <SidebarSeparator />

      <SidebarGroup className="p-0">
         <NavGroup title="Trackers & Management" icon={<Activity className="size-4" />} items={trackersNav} pathname={pathname} />
      </SidebarGroup>

      <SidebarSeparator />

      <SidebarGroup className="p-0">
         <NavGroup title="AI Generated Docs" icon={<FileArchive className="size-4" />} items={aiDocsNav} pathname={pathname} />
      </SidebarGroup>
      
      {user?.role === 'admin' && (
        <>
          <SidebarSeparator />
          <SidebarGroup className="p-0">
            <NavGroup
              title="Admin"
              icon={<UserCog className="size-4" />}
              items={adminNav}
              pathname={pathname}
            />
          </SidebarGroup>
        </>
      )}

      <SidebarSeparator />
      
      <SidebarGroup className="p-2 mt-auto">
        <SidebarMenu>
            {renderNavItems(supportNav)}
            <SidebarMenuItem>
              <SidebarMenuButton onClick={logout}>
                <LogOut />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}
