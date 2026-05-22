// ==============================================================
// Property Service — Tenant-scoped CRUD for property listings
// ==============================================================

import { prisma } from "@/lib/prisma/client";
import type { Prisma } from "@prisma/client";
import type { PropertyFilters, PaginationParams, SortParams } from "@/types";

const propertyInclude = {
  createdBy: {
    select: { id: true, fullName: true, avatar: true, email: true },
  },
  _count: {
    select: { leads: true, visits: true },
  },
} satisfies Prisma.PropertyInclude;

export async function getProperties(
  tenantId: string,
  filters: PropertyFilters = {},
  pagination: PaginationParams = { page: 1, limit: 20 },
  sort: SortParams = { sortBy: "createdAt", sortOrder: "desc" }
) {
  const where: Prisma.PropertyWhereInput = { tenantId };

  if (filters.city) where.city = filters.city;
  if (filters.locality) where.locality = { contains: filters.locality, mode: "insensitive" };
  if (filters.propertyType) where.propertyType = filters.propertyType as any;
  if (filters.transactionType) where.transactionType = filters.transactionType as any;
  if (filters.status) where.status = filters.status as any;
  if (filters.furnishing) where.furnishing = filters.furnishing as any;
  if (filters.bedrooms) where.bedrooms = filters.bedrooms;

  if (filters.priceMin || filters.priceMax) {
    where.price = {};
    if (filters.priceMin) where.price.gte = filters.priceMin;
    if (filters.priceMax) where.price.lte = filters.priceMax;
  }

  if (filters.areaMin || filters.areaMax) {
    where.area = {};
    if (filters.areaMin) where.area.gte = filters.areaMin;
    if (filters.areaMax) where.area.lte = filters.areaMax;
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
      { locality: { contains: filters.search, mode: "insensitive" } },
      { city: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.property.findMany({
      where,
      include: propertyInclude,
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
      orderBy: { [sort.sortBy]: sort.sortOrder },
    }),
    prisma.property.count({ where }),
  ]);

  return { data, total };
}

export async function getPropertyById(tenantId: string, id: string) {
  return prisma.property.findFirst({
    where: { id, tenantId },
    include: propertyInclude,
  });
}

export async function createProperty(
  tenantId: string,
  userId: string,
  data: Omit<Prisma.PropertyUncheckedCreateInput, "tenantId" | "createdById">
) {
  const property = await prisma.property.create({
    data: {
      ...data,
      tenantId,
      createdById: userId,
      publishedAt: data.status === "ACTIVE" ? new Date() : undefined,
    },
    include: propertyInclude,
  });

  await prisma.auditLog.create({
    data: {
      tenantId,
      userId,
      action: "CREATE",
      entity: "Property",
      entityId: property.id,
      newData: JSON.parse(JSON.stringify(property)),
    },
  });

  return property;
}

export async function updateProperty(
  tenantId: string,
  id: string,
  userId: string,
  data: Prisma.PropertyUpdateInput
) {
  const existing = await prisma.property.findFirst({ where: { id, tenantId } });
  if (!existing) throw new Error("Property not found");

  const property = await prisma.property.update({
    where: { id },
    data,
    include: propertyInclude,
  });

  await prisma.auditLog.create({
    data: {
      tenantId,
      userId,
      action: "UPDATE",
      entity: "Property",
      entityId: id,
      oldData: JSON.parse(JSON.stringify(existing)),
      newData: JSON.parse(JSON.stringify(property)),
    },
  });

  return property;
}

export async function deleteProperty(tenantId: string, id: string, userId: string) {
  const existing = await prisma.property.findFirst({ where: { id, tenantId } });
  if (!existing) throw new Error("Property not found");

  const property = await prisma.property.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });

  await prisma.auditLog.create({
    data: { tenantId, userId, action: "ARCHIVE", entity: "Property", entityId: id },
  });

  return property;
}

export async function incrementViewCount(id: string) {
  return prisma.property.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });
}
