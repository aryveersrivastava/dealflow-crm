// ==============================================================
// Requirement Service — Tenant-scoped CRUD for buyer requirements
// ==============================================================

import { prisma } from "@/lib/prisma/client";
import type { Prisma } from "@prisma/client";
import type { RequirementFilters, PaginationParams, SortParams } from "@/types";

const requirementInclude = {
  createdBy: {
    select: { id: true, fullName: true, avatar: true, email: true },
  },
  _count: { select: { leads: true } },
} satisfies Prisma.RequirementInclude;

export async function getRequirements(
  tenantId: string,
  filters: RequirementFilters = {},
  pagination: PaginationParams = { page: 1, limit: 20 },
  sort: SortParams = { sortBy: "createdAt", sortOrder: "desc" }
) {
  const where: Prisma.RequirementWhereInput = { tenantId };

  if (filters.city) where.city = filters.city;
  if (filters.propertyType) where.propertyType = filters.propertyType as Prisma.EnumPropertyTypeFilter["equals"];
  if (filters.transactionType) where.transactionType = filters.transactionType as Prisma.EnumTransactionTypeFilter["equals"];
  if (filters.urgency) where.urgency = filters.urgency as Prisma.EnumRequirementUrgencyFilter["equals"];
  if (filters.status) where.status = filters.status as Prisma.EnumRequirementStatusFilter["equals"];

  if (filters.budgetMin || filters.budgetMax) {
    if (filters.budgetMin) where.budgetMax = { gte: filters.budgetMin };
    if (filters.budgetMax) where.budgetMin = { lte: filters.budgetMax };
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { buyerName: { contains: filters.search, mode: "insensitive" } },
      { city: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.requirement.findMany({
      where,
      include: requirementInclude,
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
      orderBy: { [sort.sortBy]: sort.sortOrder },
    }),
    prisma.requirement.count({ where }),
  ]);

  return { data, total };
}

export async function getRequirementById(tenantId: string, id: string) {
  return prisma.requirement.findFirst({
    where: { id, tenantId },
    include: requirementInclude,
  });
}

export async function createRequirement(
  tenantId: string,
  userId: string,
  data: Omit<Prisma.RequirementUncheckedCreateInput, "tenantId" | "createdById">
) {
  const requirement = await prisma.requirement.create({
    data: { ...data, tenantId, createdById: userId },
    include: requirementInclude,
  });

  await prisma.auditLog.create({
    data: {
      tenantId,
      userId,
      action: "CREATE",
      entity: "Requirement",
      entityId: requirement.id,
    },
  });

  return requirement;
}

export async function updateRequirement(
  tenantId: string,
  id: string,
  userId: string,
  data: Prisma.RequirementUpdateInput
) {
  const existing = await prisma.requirement.findFirst({ where: { id, tenantId } });
  if (!existing) throw new Error("Requirement not found");

  const requirement = await prisma.requirement.update({
    where: { id },
    data,
    include: requirementInclude,
  });

  await prisma.auditLog.create({
    data: { tenantId, userId, action: "UPDATE", entity: "Requirement", entityId: id },
  });

  return requirement;
}

export async function deleteRequirement(tenantId: string, id: string, userId: string) {
  const existing = await prisma.requirement.findFirst({ where: { id, tenantId } });
  if (!existing) throw new Error("Requirement not found");

  await prisma.requirement.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  await prisma.auditLog.create({
    data: { tenantId, userId, action: "CANCEL", entity: "Requirement", entityId: id },
  });
}
