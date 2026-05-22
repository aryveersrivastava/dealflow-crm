import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { 
  Building2, 
  ClipboardList, 
  TrendingUp, 
  Users, 
  Plus, 
  Zap, 
  ArrowRight,
  Phone,
  Mail,
  FileText,
  Calendar,
  DollarSign,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/analytics/kpi-card";
import { PageHeader } from "@/components/shared/page-header";
import { buttonVariants } from "@/components/ui/button";
import { cn, formatPrice } from "@/lib/utils";
import { getSessionUser } from "@/lib/supabase/server";
import { getDashboardStats, getLeadsByStatusBreakdown } from "@/services/analytics.service";
import { getActivities } from "@/services/activity.service";
import { getTasks } from "@/services/task.service";
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "DealFlow CRM Dashboard — Live overview of your real estate operations",
};

// Activity type icons helper
const getActivityIcon = (type: string) => {
  switch (type) {
    case "NOTE": return FileText;
    case "CALL": return Phone;
    case "EMAIL": return Mail;
    case "MEETING": return Users;
    case "SITE_VISIT": return Building2;
    case "FOLLOW_UP": return Calendar;
    case "STATUS_CHANGE": return Zap;
    case "DEAL_UPDATE": return TrendingUp;
    default: return ClipboardList;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case "NOTE": return "text-cyan-500";
    case "CALL": return "text-blue-500";
    case "EMAIL": return "text-indigo-500";
    case "MEETING": return "text-purple-500";
    case "SITE_VISIT": return "text-amber-500";
    case "FOLLOW_UP": return "text-pink-500";
    case "STATUS_CHANGE": return "text-orange-500";
    case "DEAL_UPDATE": return "text-emerald-500";
    default: return "text-muted-foreground";
  }
};

export default async function DashboardPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch live stats, activities, and tasks from database
  const stats = await getDashboardStats(user.tenantId);
  const statusBreakdown = await getLeadsByStatusBreakdown(user.tenantId);
  const recentActivities = await getActivities(user.tenantId, undefined, 5);
  const upcomingTasks = await getTasks(user.tenantId, { status: "TODO", assignedToId: user.id });

  // Funnel calculations
  const totalLeadsCount = stats.totalLeads;
  const funnelStages = [
    { stage: "NEW_LEAD", label: "New Lead", color: "bg-blue-500" },
    { stage: "CONTACTED", label: "Contacted", color: "bg-cyan-500" },
    { stage: "INTERESTED", label: "Interested", color: "bg-indigo-500" },
    { stage: "SITE_VISIT", label: "Site Visit", color: "bg-amber-500" },
    { stage: "NEGOTIATION", label: "Negotiation", color: "bg-orange-500" },
    { stage: "CLOSED_WON", label: "Closed Won", color: "bg-emerald-500" },
  ];

  const funnelData = funnelStages.map((stageInfo) => {
    const matched = statusBreakdown.find((item) => item.status === stageInfo.stage);
    const count = matched ? matched.count : 0;
    const percentage = totalLeadsCount > 0 ? Math.round((count / totalLeadsCount) * 100) : 0;
    return {
      ...stageInfo,
      count,
      width: `${percentage}%`,
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${user.fullName}! Here's a live overview of your brokerage operations.`}
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard 
          title="Total Properties" 
          value={stats.totalProperties.toString()} 
          icon={Building2} 
        />
        <KpiCard 
          title="Active Requirements" 
          value={stats.totalRequirements.toString()} 
          icon={ClipboardList} 
        />
        <KpiCard 
          title="Active Leads" 
          value={stats.totalLeads.toString()} 
          icon={TrendingUp} 
        />
        <KpiCard 
          title="Deals Closed" 
          value={stats.totalDeals.toString()} 
          icon={Zap} 
        />
      </div>

      {/* Quick Actions + Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="lg:col-span-1 glass-panel border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/properties/new" className={cn(buttonVariants({ variant: "outline" }), "w-full justify-start hover:bg-primary/5 transition-colors")}>
              <Plus className="mr-2 h-4 w-4 text-primary" /> Add Property
            </Link>
            <Link href="/requirements/new" className={cn(buttonVariants({ variant: "outline" }), "w-full justify-start hover:bg-primary/5 transition-colors")}>
              <Plus className="mr-2 h-4 w-4 text-primary" /> Post Requirement
            </Link>
            <Link href="/crm" className={cn(buttonVariants({ variant: "outline" }), "w-full justify-start hover:bg-primary/5 transition-colors")}>
              <TrendingUp className="mr-2 h-4 w-4 text-primary" /> View Pipeline
            </Link>
            <Link href="/matching" className={cn(buttonVariants({ variant: "outline" }), "w-full justify-start hover:bg-primary/5 transition-colors")}>
              <Zap className="mr-2 h-4 w-4 text-primary" /> Run Matching
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2 glass-panel border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <Link href="/collaboration" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hover:bg-muted/40")}>
              View collaboration feed <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground space-y-2">
                <AlertCircle className="h-8 w-8 text-muted-foreground/45" />
                <p className="text-sm font-semibold">No recent activities</p>
                <p className="text-xs text-muted-foreground/80">Log updates, create properties, or post requirements to see them here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  const color = getActivityColor(activity.type);
                  return (
                    <div key={activity.id} className="flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-muted/40">
                      <div className={cn("rounded-lg bg-muted/65 p-2", color)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground leading-snug">{activity.title}</p>
                        {activity.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{activity.description}</p>
                        )}
                        <p className="text-[10px] text-muted-foreground/60 mt-1 font-semibold">
                          By {activity.user.fullName} · {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pipeline funnel */}
        <Card className="glass-panel border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Pipeline Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3.5">
              {funnelData.map((item) => (
                <div key={item.stage} className="flex items-center gap-3">
                  <span className="w-24 text-xs font-semibold text-muted-foreground shrink-0">{item.label}</span>
                  <div className="flex-1 h-3 rounded-full bg-muted/30 overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-500", item.color)} style={{ width: item.count > 0 ? item.width : "0%" }} />
                  </div>
                  <span className="text-xs font-black text-foreground w-8 text-right">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card className="glass-panel border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Your Upcoming Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-2">
                <AlertCircle className="h-8 w-8 text-muted-foreground/45" />
                <p className="text-sm font-semibold">All caught up!</p>
                <p className="text-xs text-muted-foreground/80">No pending follow-ups assigned to you.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center gap-3 rounded-xl border border-border/40 p-3.5 transition-colors hover:bg-muted/30">
                    <div className={cn("h-2.5 w-2.5 rounded-full shrink-0", 
                      task.priority === "HIGH" || task.priority === "URGENT" ? "bg-rose-500 animate-pulse" :
                      task.priority === "MEDIUM" ? "bg-amber-500" : "bg-emerald-500"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate leading-snug">{task.title}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {task.lead ? `Lead: ${task.lead.contactName}` : "General Task"}
                      </p>
                    </div>
                    {task.dueDate && (
                      <span className="text-xs font-semibold text-muted-foreground bg-muted/65 px-2 py-1 rounded-lg shrink-0">
                        {new Date(task.dueDate).toLocaleDateString([], { month: "short", day: "numeric" })}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
