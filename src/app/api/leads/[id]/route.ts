import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/supabase/server";
import { updateLeadSchema } from "@/lib/validations";
import * as leadService from "@/services/lead.service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const lead = await leadService.getLeadById(user.tenantId, id);
    if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ data: lead });
  } catch (error) {
    console.error("GET /api/leads/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const validation = updateLeadSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Validation failed", details: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const lead = await leadService.updateLead(
      user.tenantId, id, user.id, validation.data as Parameters<typeof leadService.updateLead>[3]
    );
    return NextResponse.json({ data: lead });
  } catch (error) {
    console.error("PATCH /api/leads/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
