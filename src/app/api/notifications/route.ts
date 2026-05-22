import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/supabase/server";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/services/notification.service";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const notifications = await getNotifications(user.tenantId, user.id);
    return NextResponse.json({ data: notifications });
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { notificationId, action } = body;

    if (action === "markAllRead") {
      await markAllNotificationsAsRead(user.tenantId, user.id);
      return NextResponse.json({ success: true });
    }

    if (!notificationId) {
      return NextResponse.json({ error: "Notification ID is required" }, { status: 400 });
    }

    const updated = await markNotificationAsRead(user.tenantId, user.id, notificationId);
    return NextResponse.json({ data: updated });
  } catch (error: any) {
    console.error("PATCH /api/notifications error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
