// ==============================================================
// Activity Service
// ==============================================================
import { prisma } from "@/lib/prisma/client";
import type { Prisma } from "@prisma/client";

export async function getActivities(
  tenantId: string,
  leadId?: string,
  limit: number = 30
) {
  return prisma.activity.findMany({
    where: { tenantId, ...(leadId ? { leadId } : {}) },
    include: { user: { select: { id: true, fullName: true, avatar: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function createActivity(
  tenantId: string,
  userId: string,
  data: { type: string; title: string; description?: string; leadId?: string; metadata?: Prisma.JsonValue }
) {
  return prisma.activity.create({
    data: {
      tenantId,
      userId,
      type: data.type as "NOTE" | "CALL" | "EMAIL" | "MEETING" | "SITE_VISIT" | "FOLLOW_UP" | "STATUS_CHANGE" | "DEAL_UPDATE",
      title: data.title,
      description: data.description,
      leadId: data.leadId,
      metadata: data.metadata as any,
    },
    include: {
      user: { select: { id: true, fullName: true, avatar: true } },
    },
  });
}
