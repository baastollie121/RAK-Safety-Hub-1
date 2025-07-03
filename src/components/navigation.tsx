'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, FileCheck, FileText, Folder, Home, ScanSearch, ShieldCheck } from 'lucide-react';

import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';

const navItems = [
  { href: '/', icon: <Home />, label: 'Dashboard', tooltip: 'Dashboard' },
  {
    href: '/hazard-hunter',
    icon: <ScanSearch />,
    label: 'AI Hazard Hunter',
    tooltip: 'AI Hazard Hunter',
  },
  {
    href: '/risk-assessment',
    icon: <FileCheck />,
    label: 'Risk Assessment Gen',
    tooltip: 'Risk Assessment Generator',
  },
  {
    href: '/method-statement',
    icon: <FileText />,
    label: 'Method Statement Gen',
    tooltip: 'Method Statement Generator',
  },
  {
    href: '/safe-work-procedure',
    icon: <ShieldCheck />,
    label: 'Safe Work Procedure',
    tooltip: 'Safe Work Procedure Generator',
  },
  {
    href: '/safety-consultant',
    icon: <Bot />,
    label: 'AI Safety Consultant',
    tooltip: 'AI Safety Consultant',
  },
  {
    href: '/documents',
    icon: <Folder />,
    label: 'Document Library',
    tooltip: 'Document Library',
  },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} legacyBehavior passHref>
            <SidebarMenuButton
              isActive={pathname === item.href}
              tooltip={{
                children: item.tooltip,
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </>
  );
}
