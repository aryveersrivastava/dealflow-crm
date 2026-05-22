// ==============================================================
// Lead Service — CRM pipeline management
// ==============================================================

import { prisma } from "@/lib/prisma/client";
import type { Prisma } from "@prisma/client";
import type { LeadFilters, PaginationParams } from "@/types";

const leadInclude = {
  createdBy: { select: { id: true, fullName: true, avatar: true } },
  assignedTo: { select: { id: true, fullName: true, avatar: true } },
  property: { select: { id: true, title: true, city: true, locality: true, price: true } },
  requirement: { select: { id: true, title: true, city: true, budgetMin: true, budgetMax: true } },
  _count: { select: { activities: true, taskItems: true, visits: true } },
} satisfies Prisma.LeadInclude;

export async function getLeads(
  tenantId: string,
  filters: LeadFilters = {},
  pagination: PaginationParams = { page: 1, limit: 50 }
) {
  const where: Prisma.LeadWhereInput = { tenantId };

  if (filters.status) where.status = filters.status as Prisma.EnumLeadStatusFilter["equals"];
  if (filters.assignedToId) where.assignedToId = filters.assignedToId;
  if (filters.source) where.source = filters.source;
  if (filters.search) {
    where.OR = [
      { contactName: { contains: filters.search, mode: "insensitive" } },
      { contactEmail: { contains: filters.search, mode: "insensitive" } },
      { contactPhone: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      include: leadInclude,
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.lead.count({ where }),
  ]);

  return { data, total };
}

export async function getLeadsByStatus(tenantId: string) {
  const leads = await prisma.lead.groupBy({
    by: ["status"],
    where: { tenantId },
    _count: { id: true },
  });

  return leads.map((l) => ({ status: l.status, count: l._count.id }));
}

export async function getLeadById(tenantId: string, id: string) {
  return prisma.lead.findFirst({
    where: { id, tenantId },
    include: {
      ...leadInclude,
      activities: {
        include: { user: { select: { id: true, fullName: true, avatar: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      taskItems: {
        include: {
          createdBy: { select: { id: true, fullName: true, avatar: true } },
          assignedTo: { select: { id: true, fullName: true, avatar: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      noteItems: {
        include: { user: { select: { id: true, fullName: true, avatar: true } } },
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      },
      visits: {
        include: { property: { select: { id: true, title: true } } },
        orderBy: { scheduledAt: "desc" },
      },
    },
  });
}

export async function createLead(
  tenantId: string,
  userId: string,
  data: Omit<Prisma.LeadUncheckedCreateInput, "tenantId" | "createdById">
) {
  const lead = await prisma.lead.create({
    data: { ...data, tenantId, createdById: userId },
    include: leadInclude,
  });

  // Auto-log activity
  await prisma.activity.create({
    data: {
      tenantId,
      userId,
      leadId: lead.id,
      type: "STATUS_CHANGE",
      title: "Lead created",
      description: `New lead created for ${lead.contactName}`,
    },
  });

  return lead;
}

export async function updateLead(
  tenantId: string,
  id: string,
  userId: string,
  data: Prisma.LeadUpdateInput
) {
  const existing = await prisma.lead.findFirst({ where: { id, tenantId } });
  if (!existing) throw new Error("Lead not found");

  const lead = await prisma.lead.update({
    where: { id },
    data: {
      ...data,
      closedAt: (data.status === "CLOSED_WON" || data.status === "CLOSED_LOST")
        ? new Date()
        : undefined,
    },
    include: leadInclude,
  });

  // Log status change activity
  if (data.status && data.status !== existing.status) {
    await prisma.activity.create({
      data: {
        tenantId,
        userId,
        leadId: id,
        type: "STATUS_CHANGE",
        title: `Status changed to ${data.status}`,
        description: `Pipeline stage moved from ${existing.status} to ${data.status}`,
        metadata: { from: existing.status, to: data.status },
      },
    });
  }

  return lead;
}

export async function getLeadsForPipeline(tenantId: string, assignedToId?: string) {
  const where: Prisma.LeadWhereInput = { tenantId };
  if (assignedToId) where.assignedToId = assignedToId;

  return prisma.lead.findMany({
    where,
    include: leadInclude,
    orderBy: { createdAt: "desc" },
  });
}
