import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/supabase/server";
import { createRequirementSchema } from "@/lib/validations";
import * as requirementService from "@/services/requirement.service";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const params = request.nextUrl.searchParams;
    const filters = {
      city: params.get("city") || undefined,
      propertyType: params.get("propertyType") || undefined,
      transactionType: params.get("transactionType") || undefined,
      urgency: params.get("urgency") || undefined,
      status: params.get("status") || undefined,
      budgetMin: params.get("budgetMin") ? Number(params.get("budgetMin")) : undefined,
      budgetMax: params.get("budgetMax") ? Number(params.get("budgetMax")) : undefined,
      search: params.get("search") || undefined,
    };
    const pagination = {
      page: Number(params.get("page") || "1"),
      limit: Number(params.get("limit") || "20"),
    };

    const { data, total } = await requirementService.getRequirements(
      user.tenantId, filters, pagination
    );

    return NextResponse.json({
      data,
      pagination: { page: pagination.page, limit: pagination.limit, total, totalPages: Math.ceil(total / pagination.limit) },
    });
  } catch (error) {
    console.error("GET /api/requirements error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const validation = createRequirementSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Validation failed", details: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const requirement = await requirementService.createRequirement(
      user.tenantId, user.id, validation.data as Parameters<typeof requirementService.createRequirement>[2]
    );
    return NextResponse.json({ data: requirement }, { status: 201 });
  } catch (error) {
    console.error("POST /api/requirements error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
