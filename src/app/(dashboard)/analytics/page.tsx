"use client";

import { useEffect, useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target, 
  Percent, 
  Loader2, 
  Sparkles 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/analytics/kpi-card";
import { PageHeader } from "@/components/shared/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { formatPrice, cn, getInitials } from "@/lib/utils";
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS } from "@/lib/constants";
import { toast } from "sonner";

type DashboardStats = {
  totalProperties: number;
  totalRequirements: number;
  totalLeads: number;
  totalDeals: number;
  conversionRate: number;
  revenuePipeline: number;
  activeAgents: number;
  matchRate: number;
};

type LeadStatusBreakdown = {
  status: string;
  count: number;
};

type MonthlyTrend = {
  month: string;
  leads: number;
  deals: number;
  revenue: number;
};

type AgentPerformance = {
  userId: string;
  fullName: string;
  avatar: string | null;
  totalLeads: number;
  closedWon: number;
  conversionRate: number;
  revenue: number;
};

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [leadsBreakdown, setLeadsBreakdown] = useState<LeadStatusBreakdown[]>([]);
  const [trends, setTrends] = useState<MonthlyTrend[]>([]);
  const [agents, setAgents] = useState<AgentPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const [statsRes, leadsRes, trendsRes, agentsRes] = await Promise.all([
        fetch("/api/analytics?type=dashboard"),
        fetch("/api/analytics?type=leads"),
        fetch("/api/analytics?type=trends"),
        fetch("/api/analytics?type=agents"),
      ]);

      if (statsRes.ok) {
        const json = await statsRes.json();
        setStats(json.data);
      }
      if (leadsRes.ok) {
        const json = await leadsRes.json();
        setLeadsBreakdown(json.data || []);
      }
      if (trendsRes.ok) {
        const json = await trendsRes.json();
        setTrends(json.data || []);
      }
      if (agentsRes.ok) {
        const json = await agentsRes.json();
        setAgents(json.data || []);
      }
    } catch (err: any) {
      toast.error("Failed to load real-time analytics data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm font-semibold text-muted-foreground animate-pulse">Aggregating real-time metrics...</p>
      </div>
    );
  }

  // Calculate funnel percentage relative to total leads
  const totalLeadsCount = stats?.totalLeads || 0;
  
  // Custom mapping to ensure logical pipeline flow in funnel visualization
  const funnelStages = [
    "NEW_LEAD",
    "CONTACTED",
    "INTERESTED",
    "SITE_VISIT",
    "NEGOTIATION",
    "CLOSED_WON",
  ];

  const processedFunnel = funnelStages.map((stage) => {
    const matched = leadsBreakdown.find((item) => item.status === stage);
    const count = matched ? matched.count : 0;
    const percentage = totalLeadsCount > 0 ? Math.round((count / totalLeadsCount) * 100) : 0;
    return { stage, count, percentage };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics Dashboard"
        description="Real-time performance analytics, pipeline conversion rates, and brokerage performance insights."
        action={
          <Badge variant="outline" className="text-sm px-3 py-1.5 border-primary/20 bg-primary/5 text-primary font-bold">
            <Sparkles className="mr-1 h-3.5 w-3.5 text-amber-500 fill-amber-500" /> Live Data Engine
          </Badge>
        }
      />

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard 
          title="Total Leads" 
          value={stats?.totalLeads || 0} 
          icon={TrendingUp} 
          iconColor="text-blue-500"
        />
        <KpiCard 
          title="Conversion Rate" 
          value={`${stats?.conversionRate || 0}%`} 
          icon={Percent} 
          iconColor="text-emerald-500"
        />
        <KpiCard 
          title="Revenue (Closed Won)" 
          value={formatPrice(stats?.revenuePipeline || 0)} 
          icon={DollarSign} 
          iconColor="text-amber-500"
        />
        <KpiCard 
          title="Active Properties" 
          value={stats?.totalProperties || 0} 
          icon={Target} 
          iconColor="text-purple-500"
        />
      </div>

      {/* Secondary KPI Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass-panel border-none p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Buyer Requirements</span>
            <h3 className="text-2xl font-black text-foreground mt-1">{stats?.totalRequirements || 0}</h3>
          </div>
          <div className="bg-primary/10 rounded-xl p-2.5 text-primary">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-panel border-none p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Matching Success Rate</span>
            <h3 className="text-2xl font-black text-foreground mt-1">{stats?.matchRate || 0}%</h3>
          </div>
          <div className="bg-amber-500/10 rounded-xl p-2.5 text-amber-600">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-panel border-none p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Brokerage Agents</span>
            <h3 className="text-2xl font-black text-foreground mt-1">{stats?.activeAgents || 0}</h3>
          </div>
          <div className="bg-blue-500/10 rounded-xl p-2.5 text-blue-600">
            <Users className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pipeline Funnel */}
        <Card className="glass-panel border-none rounded-2xl shadow-sm">
          <CardHeader className="border-b border-border/10">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BarChart3 className="h-4.5 w-4.5 text-primary" /> Lead Pipeline Funnel
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {processedFunnel.map((item) => (
                <div key={item.stage} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <div className={cn("h-3 w-3 rounded-sm", LEAD_STATUS_COLORS[item.stage as keyof typeof LEAD_STATUS_COLORS])} />
                      <span className="text-foreground/80">{LEAD_STATUS_LABELS[item.stage as keyof typeof LEAD_STATUS_LABELS]}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-foreground font-black">{item.count}</span>
                      <span className="text-muted-foreground w-8 text-right">{item.percentage}%</span>
                    </div>
                  </div>
                  <Progress value={item.percentage} className="h-2 bg-muted/30" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card className="glass-panel border-none rounded-2xl shadow-sm">
          <CardHeader className="border-b border-border/10">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-primary" /> Monthly Activity Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {trends.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-xs text-muted-foreground italic">
                No monthly activity trends recorded yet.
              </div>
            ) : (
              <div className="space-y-4">
                {trends.map((item) => {
                  const maxLeads = Math.max(...trends.map(t => t.leads), 1);
                  const maxDeals = Math.max(...trends.map(t => t.deals), 1);

                  // Extract human readable month name
                  const dateObj = new Date(item.month + "-01");
                  const formattedMonth = dateObj.toLocaleDateString("en-IN", { month: "short", year: "numeric" });

                  return (
                    <div key={item.month} className="flex items-center gap-4 rounded-xl p-2 hover:bg-muted/10 transition-colors">
                      <span className="w-16 text-[10px] font-bold text-muted-foreground shrink-0">{formattedMonth}</span>
                      <div className="flex-1 flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-[9px] font-bold text-muted-foreground mb-1">
                            <span>Leads Created</span>
                            <span>{item.leads}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
                            <div className="h-full rounded-full bg-blue-500" style={{ width: `${(item.leads / maxLeads) * 100}%` }} />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-[9px] font-bold text-muted-foreground mb-1">
                            <span>Deals Closed</span>
                            <span>{item.deals}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
                            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(item.deals / maxDeals) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-black text-primary w-20 text-right shrink-0">{formatPrice(item.revenue)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Agent Leaderboard */}
      <Card className="glass-panel border-none rounded-2xl shadow-sm">
        <CardHeader className="border-b border-border/10">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Users className="h-4.5 w-4.5 text-primary" /> Agent Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {agents.length === 0 ? (
            <div className="text-center py-12 text-xs text-muted-foreground italic">
              No sales agent performance logs found. Create leads and close won deals to populate.
            </div>
          ) : (
            <div className="space-y-3">
              {agents.map((agent, index) => {
                const rank = index + 1;
                return (
                  <div
                    key={agent.userId}
                    className={cn(
                      "flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-muted/10",
                      rank <= 3 ? "border border-border/40 bg-card/40" : "bg-card/10"
                    )}
                  >
                    <span className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-xs font-extrabold shrink-0",
                      rank === 1 && "bg-amber-500/10 text-amber-600 border border-amber-500/20",
                      rank === 2 && "bg-gray-400/10 text-gray-500 border border-gray-500/20",
                      rank === 3 && "bg-orange-500/10 text-orange-600 border border-orange-500/20",
                      rank > 3 && "bg-muted text-muted-foreground"
                    )}>
                      {rank}
                    </span>
                    <Avatar className="h-9 w-9 border border-border/20 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-black">
                        {getInitials(agent.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{agent.fullName}</p>
                    </div>
                    <div className="grid grid-cols-4 gap-4 sm:gap-8 text-right shrink-0">
                      <div>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Leads</span>
                        <span className="text-xs font-semibold text-foreground/80">{agent.totalLeads}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Deals</span>
                        <span className="text-xs font-semibold text-foreground/80">{agent.closedWon}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Rate</span>
                        <span className="text-xs font-semibold text-foreground/80">{agent.conversionRate}%</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Revenue</span>
                        <span className="text-xs font-black text-primary">{formatPrice(agent.revenue)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
