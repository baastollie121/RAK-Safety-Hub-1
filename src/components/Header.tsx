
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
import { Settings, LogOut, User } from 'lucide-react';
import { SidebarTrigger, useSidebar } from './ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function Header() {
  const { user, logout } = useAuth();
  const { state, isMobile } = useSidebar();

  if (!user) return null;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b bg-black px-4 sm:px-6">
        <div className="md:hidden">
            <SidebarTrigger />
        </div>
        
        {!isMobile && state === 'collapsed' && (
            <SidebarTrigger />
        )}

        <h1 className="text-lg font-semibold text-primary-foreground/90 font-headline hidden md:block">
            Safety Management System
        </h1>

        <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                       <Avatar className="h-8 w-8">
                         <AvatarFallback className="bg-primary/50 text-primary-foreground">
                            {getInitials(user.firstName, user.lastName)}
                         </AvatarFallback>
                       </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                        <p className="font-semibold">{user.firstName} {user.lastName}</p>
                        <p className="text-xs font-normal text-muted-foreground">{user.email}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </DropdownMenuItem>
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
