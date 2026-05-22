import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/supabase/server";
import { getAllUsers, updateUserRole, deactivateUser, activateUser } from "@/services/admin.service";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "SUPER_ADMIN" && user.role !== "BROKERAGE_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await getAllUsers(user.tenantId);
    return NextResponse.json({ data: users });
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
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
    const { userId, action, role } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    if (action === "updateRole") {
      if (!role) return NextResponse.json({ error: "Role is required" }, { status: 400 });
      const updated = await updateUserRole(user.tenantId, userId, role);
      return NextResponse.json({ data: updated });
    }

    if (action === "deactivate") {
      const updated = await deactivateUser(user.tenantId, userId);
      return NextResponse.json({ data: updated });
    }

    if (action === "activate") {
      const updated = await activateUser(user.tenantId, userId);
      return NextResponse.json({ data: updated });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("PATCH /api/admin/users error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
