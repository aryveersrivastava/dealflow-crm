import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/supabase/server";
import { createCollaborationSchema } from "@/lib/validations";
import * as collaborationService from "@/services/collaboration.service";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const collabs = await collaborationService.getCollaborations(user.tenantId, user.id);
    return NextResponse.json({ data: collabs });
  } catch (error) {
    console.error("GET /api/collaborations error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const validation = createCollaborationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const collab = await collaborationService.createCollaboration(user.tenantId, user.id, validation.data);
    return NextResponse.json({ data: collab }, { status: 201 });
  } catch (error) {
    console.error("POST /api/collaborations error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
