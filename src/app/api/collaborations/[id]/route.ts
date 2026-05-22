import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/supabase/server";
import * as collaborationService from "@/services/collaboration.service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    if (body.action === "ACCEPT") {
      const collab = await collaborationService.acceptCollaboration(user.tenantId, id);
      return NextResponse.json({ data: collab });
    } else if (body.action === "DECLINE") {
      const collab = await collaborationService.declineCollaboration(user.tenantId, id);
      return NextResponse.json({ data: collab });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("PATCH /api/collaborations/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
