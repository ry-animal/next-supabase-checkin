'use client';
import Link from 'next/link';
import { BarChart3, Calendar, HelpCircle, Home, LogOut, Settings } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

interface AppSidebarProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AppSidebar({ isOpen, onOpenChange }: AppSidebarProps) {
  const menuItems = [
    { name: 'Dashboard', icon: Home, href: '/' },
    { name: 'Check-in History', icon: Calendar, href: '/history' },
    { name: 'Statistics', icon: BarChart3, href: '/stats' },
    { name: 'Settings', icon: Settings, href: '/settings' },
    { name: 'Help', icon: HelpCircle, href: '/help' },
  ];

  return (
    <SidebarProvider open={isOpen} onOpenChange={onOpenChange}>
      <Sidebar className="h-full border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <SidebarHeader className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            <h2 className="font-bold text-lg">Daily Check-in</h2>
          </div>
          <div className="lg:hidden">
            <SidebarTrigger className="lg:hidden" />
          </div>
        </SidebarHeader>
        <SidebarContent className="px-3 py-2">
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton asChild tooltip={item.name}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent"
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="flex flex-col gap-2 px-4 py-4 mt-auto">
          <ThemeToggle />
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Sign Out">
                <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent">
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  );
}
