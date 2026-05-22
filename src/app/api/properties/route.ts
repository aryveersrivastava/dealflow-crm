import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/supabase/server";
import { createPropertySchema } from "@/lib/validations";
import * as propertyService from "@/services/property.service";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const params = request.nextUrl.searchParams;
    const filters = {
      city: params.get("city") || undefined,
      locality: params.get("locality") || undefined,
      propertyType: params.get("propertyType") || undefined,
      transactionType: params.get("transactionType") || undefined,
      status: params.get("status") || undefined,
      furnishing: params.get("furnishing") || undefined,
      priceMin: params.get("priceMin") ? Number(params.get("priceMin")) : undefined,
      priceMax: params.get("priceMax") ? Number(params.get("priceMax")) : undefined,
      bedrooms: params.get("bedrooms") ? Number(params.get("bedrooms")) : undefined,
      search: params.get("search") || undefined,
    };
    const pagination = {
      page: Number(params.get("page") || "1"),
      limit: Number(params.get("limit") || "20"),
    };
    const sort = {
      sortBy: params.get("sortBy") || "createdAt",
      sortOrder: (params.get("sortOrder") || "desc") as "asc" | "desc",
    };

    const { data, total } = await propertyService.getProperties(
      user.tenantId, filters, pagination, sort
    );

    return NextResponse.json({
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    });
  } catch (error) {
    console.error("GET /api/properties error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const validation = createPropertySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const property = await propertyService.createProperty(
      user.tenantId,
      user.id,
      validation.data as Parameters<typeof propertyService.createProperty>[2]
    );

    return NextResponse.json({ data: property }, { status: 201 });
  } catch (error) {
    console.error("POST /api/properties error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
