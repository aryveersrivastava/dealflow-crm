import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/supabase/server";
import * as activityService from "@/services/activity.service";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const params = request.nextUrl.searchParams;
    const leadId = params.get("leadId") || undefined;
    const limit = params.get("limit") ? Number(params.get("limit")) : 30;

    const activities = await activityService.getActivities(user.tenantId, leadId, limit);
    return NextResponse.json({ data: activities });
  } catch (error) {
    console.error("GET /api/activities error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    if (!body.type || !body.title) {
      return NextResponse.json({ error: "Type and Title are required" }, { status: 400 });
    }

    const activity = await activityService.createActivity(user.tenantId, user.id, {
      type: body.type,
      title: body.title,
      description: body.description,
      leadId: body.leadId,
      metadata: body.metadata,
    });

    return NextResponse.json({ data: activity }, { status: 201 });
  } catch (error) {
    console.error("POST /api/activities error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
