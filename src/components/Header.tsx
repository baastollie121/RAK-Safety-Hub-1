
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
import { Logo } from './logo';
import { cn } from '@/lib/utils';

export function Header() {
  const { user, logout } = useAuth();
  const { state, isMobile } = useSidebar();

  if (!user) return null;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <div className={cn("flex items-center gap-2", state === "expanded" && "md:hidden")}>
             <SidebarTrigger />
        </div>
        
        <div className="hidden md:block">
            {/* You can add a breadcrumb component here later if needed */}
        </div>


        <div className="ml-auto flex items-center gap-4">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                       <Avatar className="h-10 w-10 border-2 border-primary/50">
                         <AvatarFallback className="bg-primary/20 text-primary font-bold">
                            {getInitials(user.firstName, user.lastName)}
                         </AvatarFallback>
                       </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
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
