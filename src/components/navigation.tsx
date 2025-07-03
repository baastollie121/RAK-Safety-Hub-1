'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  Bot,
  CalendarCog,
  FileArchive,
  FileCheck,
  FileCheck2,
  FileCog,
  FileJson2,
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
  Rss,
  ScanSearch,
  Shield,
  ShieldCheck,
  Sparkles,
  Truck,
  UserCog,
  UserPlus,
  Users,
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';

const mainNav = [
  { href: '/', icon: <Home />, label: 'Dashboard' },
  { href: '/documents', icon: <Folder />, label: 'Document Library' },
  { href: '/safety-consultant', icon: <Bot />, label: 'AI Safety Consultant' },
  { href: '/safety-news', icon: <Newspaper />, label: 'Safety News' },
];

const adminNav = [
  { href: '/admin/onboard-client', icon: <UserPlus />, label: 'Onboard Client' },
  { href: '/admin/manage-documents', icon: <FileCog />, label: 'Manage Documents' },
  { href: '/admin/news-scraper', icon: <Rss />, label: 'News Scraper' },
  { href: '/admin/client-messages', icon: <MessageSquare />, label: 'Client Messages' },
];

const aiToolsNav = [
  { href: '/hazard-hunter', icon: <ScanSearch />, label: 'AI Hazard Hunter' },
  { href: '/risk-assessment', icon: <FileCheck />, label: 'Risk Assessment' },
  { href: '/hira-generator', icon: <FileCheck2 />, label: 'HIRA Generator' },
  { href: '/she-site-plan-generator', icon: <Map />, label: 'SHE Site Plan Generator' },
  { href: '/safe-work-procedure', icon: <ShieldCheck />, label: 'Safe Work Procedure' },
  { href: '/method-statement', icon: <FileText />, label: 'Method Statement Gen' },
];

const trackersNav = [
  { href: '/trackers/site-health-dashboard', icon: <LayoutDashboard />, label: 'Site Health Dashboard' },
  { href: '/trackers/vehicle-equipment-tracker', icon: <Truck />, label: 'Vehicle & Equipment' },
  { href: '/trackers/asset-equipment-tracker', icon: <Package />, label: 'Asset & Equipment' },
  { href: '/trackers/employee-training-tracker', icon: <Users />, label: 'Employee Training' },
  { href: '/trackers/site-resource-planner', icon: <CalendarCog />, label: 'Site & Resource Planner' },
];

const aiDocsNav = [
  { href: '/ai-docs/saved-risk-assessments', icon: <FileCheck />, label: 'Saved Risk Assessments' },
  { href: '/ai-docs/saved-hira-reports', icon: <FileCheck2 />, label: 'Saved HIRA Reports' },
  { href: '/ai-docs/saved-she-plans', icon: <FileJson2 />, label: 'Saved SHE Plans' },
  { href: '/ai-docs/saved-swps', icon: <Shield />, label: 'Saved SWPs' },
  { href: '/ai-docs/saved-method-statements', icon: <FileText />, label: 'Saved Method Statements' },
];

const supportNav = [
    { href: '/support', icon: <LifeBuoy />, label: 'Support & Billing' },
]

export function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

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
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

  return (
    <>
      <SidebarGroup className="p-2">
        <SidebarMenu>{renderNavItems(mainNav)}</SidebarMenu>
      </SidebarGroup>

      {user?.role === 'admin' && (
        <>
          <SidebarSeparator />
          <SidebarGroup className="p-2">
            <SidebarGroupLabel className="flex items-center gap-2 px-2 text-sidebar-foreground/70">
              <UserCog className="size-4" />
              <span>Admin</span>
            </SidebarGroupLabel>
            <SidebarMenu>{renderNavItems(adminNav)}</SidebarMenu>
          </SidebarGroup>
        </>
      )}

      <SidebarSeparator />

      <SidebarGroup className="p-2">
        <SidebarGroupLabel className="flex items-center gap-2 px-2 text-sidebar-foreground/70">
            <Sparkles className="size-4" />
            <span>AI Tools</span>
        </SidebarGroupLabel>
        <SidebarMenu>{renderNavItems(aiToolsNav)}</SidebarMenu>
      </SidebarGroup>

      <SidebarSeparator />

      <SidebarGroup className="p-2">
        <SidebarGroupLabel className="flex items-center gap-2 px-2 text-sidebar-foreground/70">
            <Activity className="size-4" />
            <span>Trackers & Management</span>
        </SidebarGroupLabel>
        <SidebarMenu>{renderNavItems(trackersNav)}</SidebarMenu>
      </SidebarGroup>

      <SidebarSeparator />

      <SidebarGroup className="p-2">
        <SidebarGroupLabel className="flex items-center gap-2 px-2 text-sidebar-foreground/70">
            <FileArchive className="size-4" />
            <span>AI Generated Docs</span>
        </SidebarGroupLabel>
        <SidebarMenu>{renderNavItems(aiDocsNav)}</SidebarMenu>
      </SidebarGroup>

      <SidebarSeparator />
      
      <SidebarGroup className="p-2 mt-auto">
        <SidebarMenu>
            {renderNavItems(supportNav)}
            <SidebarMenuItem>
                <SidebarMenuButton onClick={logout} tooltip={{children: 'Logout'}}>
                    <LogOut />
                    <span>Logout</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}
