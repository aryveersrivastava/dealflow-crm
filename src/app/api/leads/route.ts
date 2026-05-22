import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/supabase/server";
import { createLeadSchema } from "@/lib/validations";
import * as leadService from "@/services/lead.service";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const params = request.nextUrl.searchParams;
    const filters = {
      status: params.get("status") || undefined,
      assignedToId: params.get("assignedToId") || undefined,
      source: params.get("source") || undefined,
      search: params.get("search") || undefined,
    };
    const pagination = {
      page: Number(params.get("page") || "1"),
      limit: Number(params.get("limit") || "50"),
    };

    // If pipeline=true, return all leads grouped for Kanban
    if (params.get("pipeline") === "true") {
      const leads = await leadService.getLeadsForPipeline(user.tenantId, filters.assignedToId);
      return NextResponse.json({ data: leads });
    }

    const { data, total } = await leadService.getLeads(user.tenantId, filters, pagination);
    return NextResponse.json({
      data,
      pagination: { page: pagination.page, limit: pagination.limit, total, totalPages: Math.ceil(total / pagination.limit) },
    });
  } catch (error) {
    console.error("GET /api/leads error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const validation = createLeadSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Validation failed", details: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const lead = await leadService.createLead(
      user.tenantId, user.id, validation.data as Parameters<typeof leadService.createLead>[2]
    );
    return NextResponse.json({ data: lead }, { status: 201 });
  } catch (error) {
    console.error("POST /api/leads error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
