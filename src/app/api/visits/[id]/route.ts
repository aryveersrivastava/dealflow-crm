import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/supabase/server";
import { updateVisitSchema } from "@/lib/validations";
import * as visitService from "@/services/visit.service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const validation = updateVisitSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const visit = await visitService.updateVisit(
      user.tenantId,
      id,
      user.id,
      validation.data as Parameters<typeof visitService.updateVisit>[3]
    );

    return NextResponse.json({ data: visit });
  } catch (error) {
    console.error("PATCH /api/visits/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
