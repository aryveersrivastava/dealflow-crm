import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
}

export function KpiCard({ title, value, change, changeLabel, icon: Icon, iconColor = "text-primary" }: KpiCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md hover-lift">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1">
              <span
                className={cn(
                  "text-xs font-medium",
                  change >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                )}
              >
                {change >= 0 ? "↑" : "↓"} {Math.abs(change)}%
              </span>
              {changeLabel && (
                <span className="text-xs text-muted-foreground">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        <div className={cn("rounded-lg bg-primary/10 p-3", iconColor)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary/50 to-primary opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
}
