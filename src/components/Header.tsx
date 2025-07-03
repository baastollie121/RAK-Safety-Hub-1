'use client';

import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Settings, LogOut } from 'lucide-react';
import { SidebarTrigger } from './ui/sidebar';

export function Header() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <div className="md:hidden">
            <SidebarTrigger />
        </div>
        <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <Settings className="size-5" />
                        <span className="sr-only">User Menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                        <p className="font-semibold">{user.firstName} {user.lastName}</p>
                        <p className="text-xs font-normal text-muted-foreground">{user.email}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    </header>
  );
}
