import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/supabase/server";
import { createVisitSchema } from "@/lib/validations";
import * as visitService from "@/services/visit.service";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const params = request.nextUrl.searchParams;
    const filters = {
      leadId: params.get("leadId") || undefined,
      propertyId: params.get("propertyId") || undefined,
    };

    const visits = await visitService.getVisits(user.tenantId, filters);
    return NextResponse.json({ data: visits });
  } catch (error) {
    console.error("GET /api/visits error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const validation = createVisitSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const visit = await visitService.createVisit(user.tenantId, user.id, {
      propertyId: validation.data.propertyId,
      leadId: validation.data.leadId,
      scheduledAt: new Date(validation.data.scheduledAt),
    });

    return NextResponse.json({ data: visit }, { status: 201 });
  } catch (error) {
    console.error("POST /api/visits error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
