"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  ClipboardList,
  Zap,
  KanbanSquare,
  Users,
  BarChart3,
  Shield,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { getInitials } from "@/lib/utils";
import { USER_ROLE_LABELS } from "@/lib/constants";
import type { SessionUser } from "@/types";

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Properties", href: "/properties", icon: Building2 },
  { title: "Requirements", href: "/requirements", icon: ClipboardList },
  { title: "Matching", href: "/matching", icon: Zap },
  { title: "CRM Pipeline", href: "/crm", icon: KanbanSquare },
  { title: "Collaboration", href: "/collaboration", icon: Users },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
];

const adminItems = [
  { title: "Admin", href: "/admin", icon: Shield },
];

interface SidebarProps {
  user: SessionUser;
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ user, collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = user.role === "SUPER_ADMIN" || user.role === "BROKERAGE_ADMIN";

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
        collapsed ? "w-[68px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Zap className="h-4 w-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold gradient-text">DealFlow</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                          isActive
                            ? "bg-primary/10 text-primary shadow-sm"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                        )}
                      />
                    }
                  >
                      <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
                      {!collapsed && <span>{item.title}</span>}
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right">{item.title}</TooltipContent>
                  )}
                </Tooltip>
              </li>
            );
          })}
        </ul>

        {isAdmin && (
          <>
            <Separator className="my-4" />
            <ul className="space-y-1">
              {adminItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Link
                            href={item.href}
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                              isActive
                                ? "bg-primary/10 text-primary"
                                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                            )}
                          />
                        }
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </TooltipTrigger>
                      {collapsed && <TooltipContent side="right">{item.title}</TooltipContent>}
                    </Tooltip>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </nav>

      {/* Settings + User */}
      <div className="border-t border-sidebar-border p-3">
        <Tooltip>
          <TooltipTrigger
            render={
              <Link
                href="/settings"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all"
              />
            }
          >
            <Settings className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Settings</span>}
          </TooltipTrigger>
          {collapsed && <TooltipContent side="right">Settings</TooltipContent>}
        </Tooltip>

        <Separator className="my-2" />

        <div className="flex items-center gap-3 px-3 py-2">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {getInitials(user.fullName)}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{user.fullName}</p>
              <p className="truncate text-xs text-muted-foreground">
                {USER_ROLE_LABELS[user.role] || user.role}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-accent transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>
    </aside>
  );
}
