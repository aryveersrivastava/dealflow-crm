import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/supabase/server";
import { getAllBrokerages, updateBrokerage } from "@/services/admin.service";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    // Only platform-wide SUPER_ADMINs can list all brokerages
    if (user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden: Super Admin only" }, { status: 403 });
    }

    const brokerages = await getAllBrokerages();
    return NextResponse.json({ data: brokerages });
  } catch (error) {
    console.error("GET /api/admin/brokerages error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    // Only platform-wide SUPER_ADMINs can update brokerages
    if (user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden: Super Admin only" }, { status: 403 });
    }

    const body = await request.json();
    const {
      brokerageId,
      subscriptionPlan,
      subscriptionStatus,
      maxUsers,
      maxProperties,
      maxRequirements,
      isActive,
    } = body;

    if (!brokerageId) {
      return NextResponse.json({ error: "Brokerage ID is required" }, { status: 400 });
    }

    const updated = await updateBrokerage(brokerageId, {
      subscriptionPlan,
      subscriptionStatus,
      maxUsers: typeof maxUsers === "number" ? maxUsers : undefined,
      maxProperties: typeof maxProperties === "number" ? maxProperties : undefined,
      maxRequirements: typeof maxRequirements === "number" ? maxRequirements : undefined,
      isActive: typeof isActive === "boolean" ? isActive : undefined,
    });

    return NextResponse.json({ data: updated });
  } catch (error: any) {
    console.error("PATCH /api/admin/brokerages error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

