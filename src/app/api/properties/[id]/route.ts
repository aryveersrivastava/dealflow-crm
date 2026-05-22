import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/supabase/server";
import { updatePropertySchema } from "@/lib/validations";
import * as propertyService from "@/services/property.service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const property = await propertyService.getPropertyById(user.tenantId, id);
    if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Increment view count asynchronously
    propertyService.incrementViewCount(id).catch(() => {});

    return NextResponse.json({ data: property });
  } catch (error) {
    console.error("GET /api/properties/[id] error:", error);
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
    const validation = updatePropertySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const property = await propertyService.updateProperty(
      user.tenantId, id, user.id, validation.data as Parameters<typeof propertyService.updateProperty>[3]
    );
    return NextResponse.json({ data: property });
  } catch (error) {
    console.error("PATCH /api/properties/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await propertyService.deleteProperty(user.tenantId, id, user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/properties/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
