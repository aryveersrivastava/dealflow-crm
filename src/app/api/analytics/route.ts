import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/supabase/server";
import * as analyticsService from "@/services/analytics.service";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const type = request.nextUrl.searchParams.get("type") || "dashboard";

    switch (type) {
      case "dashboard": {
        const stats = await analyticsService.getDashboardStats(user.tenantId);
        return NextResponse.json({ data: stats });
      }
      case "leads": {
        const breakdown = await analyticsService.getLeadsByStatusBreakdown(user.tenantId);
        return NextResponse.json({ data: breakdown });
      }
      case "trends": {
        const months = Number(request.nextUrl.searchParams.get("months") || "6");
        const trends = await analyticsService.getMonthlyTrends(user.tenantId, months);
        return NextResponse.json({ data: trends });
      }
      case "agents": {
        const agents = await analyticsService.getAgentPerformance(user.tenantId);
        return NextResponse.json({ data: agents });
      }
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
  } catch (error) {
    console.error("GET /api/analytics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
