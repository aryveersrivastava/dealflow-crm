import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/supabase/server";
import { createTaskSchema } from "@/lib/validations";
import * as taskService from "@/services/task.service";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const params = request.nextUrl.searchParams;
    const filters = {
      status: params.get("status") || undefined,
      assignedToId: params.get("assignedToId") || undefined,
      leadId: params.get("leadId") || undefined,
    };

    const tasks = await taskService.getTasks(user.tenantId, filters);
    return NextResponse.json({ data: tasks });
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const validation = createTaskSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { dueDate, ...rest } = validation.data;
    const task = await taskService.createTask(user.tenantId, user.id, {
      ...rest,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });

    return NextResponse.json({ data: task }, { status: 201 });
  } catch (error) {
    console.error("POST /api/tasks error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
