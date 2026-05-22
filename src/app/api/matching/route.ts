import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/supabase/server";
import * as matchingService from "@/services/matching.service";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const params = request.nextUrl.searchParams;
    const requirementId = params.get("requirementId");
    const propertyId = params.get("propertyId");
    const limit = Number(params.get("limit") || "20");

    if (requirementId) {
      const matches = await matchingService.findMatchesForRequirement(
        user.tenantId, requirementId, limit
      );
      return NextResponse.json({ data: matches, type: "properties" });
    }

    if (propertyId) {
      const matches = await matchingService.findMatchesForProperty(
        user.tenantId, propertyId, limit
      );
      return NextResponse.json({ data: matches, type: "requirements" });
    }

    return NextResponse.json(
      { error: "Provide either requirementId or propertyId" },
      { status: 400 }
    );
  } catch (error) {
    console.error("GET /api/matching error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
