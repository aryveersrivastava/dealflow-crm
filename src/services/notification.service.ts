// ==============================================================
// Notification Service — User notifications management
// ==============================================================
import { prisma } from "@/lib/prisma/client";

export async function getNotifications(tenantId: string, userId: string, limit = 20) {
  return prisma.notification.findMany({
    where: {
      tenantId,
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });
}

export async function createNotification(
  tenantId: string,
  userId: string,
  title: string,
  message: string,
  link?: string
) {
  return prisma.notification.create({
    data: {
      tenantId,
      userId,
      title,
      message,
      link,
      isRead: false,
    },
  });
}

export async function markNotificationAsRead(tenantId: string, userId: string, notificationId: string) {
  // Confirm ownership before updating
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      tenantId,
      userId,
    },
  });

  if (!notification) throw new Error("Notification not found");

  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

export async function markAllNotificationsAsRead(tenantId: string, userId: string) {
  return prisma.notification.updateMany({
    where: {
      tenantId,
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });
}
