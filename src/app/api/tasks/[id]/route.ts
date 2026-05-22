import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/supabase/server";
import * as taskService from "@/services/task.service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    // Support simple complete status or partial updates
    let task;
    if (body.status === "DONE" && Object.keys(body).length === 1) {
      task = await taskService.completeTask(user.tenantId, id);
    } else {
      const updateData: any = {};
      if (body.title !== undefined) updateData.title = body.title;
      if (body.description !== undefined) updateData.description = body.description;
      if (body.priority !== undefined) updateData.priority = body.priority;
      if (body.status !== undefined) updateData.status = body.status;
      if (body.dueDate !== undefined) updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;
      if (body.assignedToId !== undefined) updateData.assignedToId = body.assignedToId || null;

      task = await taskService.updateTask(user.tenantId, id, updateData);
    }

    return NextResponse.json({ data: task });
  } catch (error) {
    console.error("PATCH /api/tasks/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
