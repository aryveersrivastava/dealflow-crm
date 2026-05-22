import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/supabase/server";
import { getFlaggedProperties, moderateProperty } from "@/services/admin.service";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    // Only SUPER_ADMINs or BROKERAGE_ADMINs can moderate listings
    if (user.role !== "SUPER_ADMIN" && user.role !== "BROKERAGE_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const flagged = await getFlaggedProperties();
    return NextResponse.json({ data: flagged });
  } catch (error) {
    console.error("GET /api/admin/moderation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "SUPER_ADMIN" && user.role !== "BROKERAGE_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { propertyId, action } = body;

    if (!propertyId || !action || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const updated = await moderateProperty(propertyId, action);
    return NextResponse.json({ data: updated });
  } catch (error: any) {
    console.error("PATCH /api/admin/moderation error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
