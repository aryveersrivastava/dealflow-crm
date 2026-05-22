// ==============================================================
// Analytics Service — Dashboard KPIs and metrics aggregation
// ==============================================================

import { prisma } from "@/lib/prisma/client";
import type { DashboardStats, LeadsByStatus, MonthlyTrend, AgentPerformance } from "@/types";

export async function getDashboardStats(tenantId: string): Promise<DashboardStats> {
  const [
    totalProperties,
    totalRequirements,
    totalLeads,
    closedWon,
    activeAgents,
    revenueResult,
  ] = await Promise.all([
    prisma.property.count({ where: { tenantId, status: { not: "ARCHIVED" } } }),
    prisma.requirement.count({ where: { tenantId, status: "ACTIVE" } }),
    prisma.lead.count({ where: { tenantId } }),
    prisma.lead.count({ where: { tenantId, status: "CLOSED_WON" } }),
    prisma.user.count({ where: { tenantId, isActive: true } }),
    prisma.lead.aggregate({
      where: { tenantId, status: "CLOSED_WON" },
      _sum: { expectedValue: true },
    }),
  ]);

  const conversionRate = totalLeads > 0 ? Math.round((closedWon / totalLeads) * 100) : 0;
  const revenuePipeline = Number(revenueResult._sum.expectedValue || 0);

  // Match rate approximation
  const reqsWithMatches = await prisma.requirement.count({
    where: { tenantId, matchCount: { gt: 0 } },
  });
  const matchRate = totalRequirements > 0
    ? Math.round((reqsWithMatches / totalRequirements) * 100)
    : 0;

  return {
    totalProperties,
    totalRequirements,
    totalLeads,
    totalDeals: closedWon,
    conversionRate,
    revenuePipeline,
    activeAgents,
    matchRate,
  };
}

export async function getLeadsByStatusBreakdown(tenantId: string): Promise<LeadsByStatus[]> {
  const result = await prisma.lead.groupBy({
    by: ["status"],
    where: { tenantId },
    _count: { id: true },
  });

  return result.map((r) => ({ status: r.status, count: r._count.id }));
}

export async function getMonthlyTrends(
  tenantId: string,
  months: number = 6
): Promise<MonthlyTrend[]> {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const leads = await prisma.lead.findMany({
    where: { tenantId, createdAt: { gte: startDate } },
    select: { createdAt: true, status: true, expectedValue: true },
  });

  const monthMap = new Map<string, { leads: number; deals: number; revenue: number }>();

  for (let i = 0; i < months; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthMap.set(key, { leads: 0, deals: 0, revenue: 0 });
  }

  for (const lead of leads) {
    const key = `${lead.createdAt.getFullYear()}-${String(lead.createdAt.getMonth() + 1).padStart(2, "0")}`;
    const entry = monthMap.get(key);
    if (entry) {
      entry.leads++;
      if (lead.status === "CLOSED_WON") {
        entry.deals++;
        entry.revenue += Number(lead.expectedValue || 0);
      }
    }
  }

  return Array.from(monthMap.entries())
    .map(([month, data]) => ({ month, ...data }))
    .reverse();
}

export async function getAgentPerformance(tenantId: string): Promise<AgentPerformance[]> {
  const users = await prisma.user.findMany({
    where: { tenantId, isActive: true, role: { in: ["BROKER", "AGENT"] } },
    select: { id: true, fullName: true, avatar: true },
  });

  const performance: AgentPerformance[] = [];

  for (const user of users) {
    const [totalLeads, closedWon, revenueResult] = await Promise.all([
      prisma.lead.count({ where: { tenantId, assignedToId: user.id } }),
      prisma.lead.count({ where: { tenantId, assignedToId: user.id, status: "CLOSED_WON" } }),
      prisma.lead.aggregate({
        where: { tenantId, assignedToId: user.id, status: "CLOSED_WON" },
        _sum: { expectedValue: true },
      }),
    ]);

    performance.push({
      userId: user.id,
      fullName: user.fullName,
      avatar: user.avatar,
      totalLeads,
      closedWon,
      conversionRate: totalLeads > 0 ? Math.round((closedWon / totalLeads) * 100) : 0,
      revenue: Number(revenueResult._sum.expectedValue || 0),
    });
  }

  return performance.sort((a, b) => b.revenue - a.revenue);
}
