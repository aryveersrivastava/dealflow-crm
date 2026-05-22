// ==============================================================
// Task Service
// ==============================================================
import { prisma } from "@/lib/prisma/client";
import type { Prisma } from "@prisma/client";

export async function getTasks(tenantId: string, filters: { status?: string; assignedToId?: string; leadId?: string } = {}) {
  const where: Prisma.TaskWhereInput = { tenantId };
  if (filters.status) where.status = filters.status as Prisma.EnumTaskStatusFilter["equals"];
  if (filters.assignedToId) where.assignedToId = filters.assignedToId;
  if (filters.leadId) where.leadId = filters.leadId;

  return prisma.task.findMany({
    where,
    include: {
      createdBy: { select: { id: true, fullName: true, avatar: true } },
      assignedTo: { select: { id: true, fullName: true, avatar: true } },
      lead: { select: { id: true, contactName: true } },
    },
    orderBy: [{ status: "asc" }, { priority: "desc" }, { dueDate: "asc" }],
  });
}

export async function createTask(
  tenantId: string,
  userId: string,
  data: Omit<Prisma.TaskUncheckedCreateInput, "tenantId" | "createdById">
) {
  return prisma.task.create({
    data: { ...data, tenantId, createdById: userId },
  });
}

export async function updateTask(tenantId: string, id: string, data: Prisma.TaskUpdateInput) {
  const task = await prisma.task.findFirst({ where: { id, tenantId } });
  if (!task) throw new Error("Task not found");
  return prisma.task.update({ where: { id }, data });
}

export async function completeTask(tenantId: string, id: string) {
  const task = await prisma.task.findFirst({ where: { id, tenantId } });
  if (!task) throw new Error("Task not found");
  return prisma.task.update({
    where: { id },
    data: { status: "DONE", completedAt: new Date() },
  });
}
