// ==============================================================
// Admin Service — Platform management operations
// ==============================================================
import { prisma } from "@/lib/prisma/client";

export async function getAllUsers(tenantId: string) {
  return prisma.user.findMany({
    where: { tenantId },
    include: { tenant: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateUserRole(tenantId: string, userId: string, role: "BROKERAGE_ADMIN" | "BROKER" | "AGENT") {
  const user = await prisma.user.findFirst({ where: { id: userId, tenantId } });
  if (!user) throw new Error("User not found");
  return prisma.user.update({ where: { id: userId }, data: { role } });
}

export async function deactivateUser(tenantId: string, userId: string) {
  const user = await prisma.user.findFirst({ where: { id: userId, tenantId } });
  if (!user) throw new Error("User not found");
  return prisma.user.update({ where: { id: userId }, data: { isActive: false } });
}

export async function activateUser(tenantId: string, userId: string) {
  const user = await prisma.user.findFirst({ where: { id: userId, tenantId } });
  if (!user) throw new Error("User not found");
  return prisma.user.update({ where: { id: userId }, data: { isActive: true } });
}

export async function getAllBrokerages() {
  return prisma.brokerageFirm.findMany({
    include: {
      _count: { select: { users: true, properties: true, requirements: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getFlaggedProperties() {
  return prisma.property.findMany({
    where: { status: "FLAGGED" },
    include: {
      createdBy: { select: { id: true, fullName: true, email: true } },
      tenant: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function moderateProperty(id: string, action: "approve" | "reject") {
  return prisma.property.update({
    where: { id },
    data: { status: action === "approve" ? "ACTIVE" : "ARCHIVED" },
  });
}

export async function updateBrokerage(
  id: string,
  data: {
    subscriptionPlan?: "FREE" | "STARTER" | "PROFESSIONAL" | "ENTERPRISE";
    subscriptionStatus?: "ACTIVE" | "TRIAL" | "PAST_DUE" | "CANCELLED" | "SUSPENDED";
    maxUsers?: number;
    maxProperties?: number;
    maxRequirements?: number;
    isActive?: boolean;
  }
) {
  return prisma.brokerageFirm.update({
    where: { id },
    data,
  });
}

