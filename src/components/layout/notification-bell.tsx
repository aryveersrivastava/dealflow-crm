"use client";

import { useEffect, useState } from "react";
import { Bell, Check, Loader2, Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Failed to load notifications");
      const json = await res.json();
      const list = json.data || [];
      setNotifications(list);
      setUnreadCount(list.filter((n: NotificationItem) => !n.isRead).length);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for live notification updates
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });

      if (!res.ok) throw new Error("Failed to mark notification as read");
      
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAllRead" }),
      });

      if (!res.ok) throw new Error("Failed to mark all as read");

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update notifications");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground" />
        }
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground animate-pulse">
            {unreadCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 glass-panel border-none shadow-xl text-foreground">
        <div className="flex items-center justify-between border-b border-border/10 p-3">
          <span className="font-bold text-sm">Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[10px] font-bold hover:bg-muted/50 px-2 flex items-center gap-1"
              onClick={handleMarkAllRead}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Check className="h-3 w-3" />
              )}
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-72">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center text-muted-foreground space-y-2">
              <div className="rounded-full bg-muted p-3 w-fit">
                <Info className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-xs font-semibold">No notifications</p>
              <p className="text-[10px] text-muted-foreground px-4">
                We'll notify you here about new match results, co-broke proposals, or team tasks.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/5">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "p-3 text-left transition-colors relative hover:bg-muted/30 cursor-pointer",
                    !item.isRead && "bg-primary/5"
                  )}
                  onClick={() => !item.isRead && handleMarkAsRead(item.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <p className={cn("text-xs font-bold text-foreground", !item.isRead && "text-primary")}>
                        {item.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground leading-normal">
                        {item.message}
                      </p>
                      {item.link && (
                        <Link
                          href={item.link}
                          className="inline-block text-[9px] font-bold text-primary hover:underline mt-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Details →
                        </Link>
                      )}
                    </div>
                    {!item.isRead && (
                      <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />
                    )}
                  </div>
                  <span className="block text-[8px] text-muted-foreground/60 mt-1.5 font-semibold">
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
