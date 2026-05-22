// ==============================================================
// Visit Service
// ==============================================================
import { prisma } from "@/lib/prisma/client";
import type { VisitStatus } from "@prisma/client";

export async function getVisits(tenantId: string, filters: { leadId?: string; propertyId?: string } = {}) {
  const where: any = { tenantId };
  if (filters.leadId) where.leadId = filters.leadId;
  if (filters.propertyId) where.propertyId = filters.propertyId;

  return prisma.visit.findMany({
    where,
    include: {
      user: { select: { id: true, fullName: true, avatar: true } },
      property: { select: { id: true, title: true, city: true, locality: true, price: true } },
      lead: { select: { id: true, contactName: true } },
    },
    orderBy: { scheduledAt: "desc" },
  });
}

export async function createVisit(
  tenantId: string,
  userId: string,
  data: { propertyId: string; leadId?: string; scheduledAt: Date }
) {
  const visit = await prisma.visit.create({
    data: {
      tenantId,
      userId,
      propertyId: data.propertyId,
      leadId: data.leadId,
      scheduledAt: data.scheduledAt,
      status: "SCHEDULED",
    },
    include: {
      user: { select: { id: true, fullName: true } },
      property: { select: { id: true, title: true } },
    },
  });

  // Log activity if linked to a lead
  if (data.leadId) {
    await prisma.activity.create({
      data: {
        tenantId,
        userId,
        leadId: data.leadId,
        type: "SITE_VISIT",
        title: "Site visit scheduled",
        description: `Scheduled visit for property "${visit.property.title}" on ${data.scheduledAt.toLocaleString()}`,
        metadata: { propertyId: data.propertyId, scheduledAt: data.scheduledAt },
      },
    });
  }

  return visit;
}

export async function updateVisit(
  tenantId: string,
  id: string,
  userId: string,
  data: { status?: VisitStatus; feedback?: string; rating?: number }
) {
  const existing = await prisma.visit.findFirst({
    where: { id, tenantId },
    include: { property: { select: { title: true } } },
  });
  if (!existing) throw new Error("Visit not found");

  const visit = await prisma.visit.update({
    where: { id },
    data,
    include: {
      user: { select: { id: true, fullName: true } },
      property: { select: { id: true, title: true } },
    },
  });

  // Log activity on status change
  if (data.status && data.status !== existing.status && existing.leadId) {
    await prisma.activity.create({
      data: {
        tenantId,
        userId,
        leadId: existing.leadId,
        type: "SITE_VISIT",
        title: `Site visit ${data.status.toLowerCase()}`,
        description: `Visit status for "${existing.property.title}" changed to ${data.status}`,
        metadata: { visitId: id, status: data.status },
      },
    });
  }

  return visit;
}
