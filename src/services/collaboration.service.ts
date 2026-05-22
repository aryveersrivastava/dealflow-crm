// ==============================================================
// Collaboration Service
// ==============================================================
import { prisma } from "@/lib/prisma/client";
import type { Prisma } from "@prisma/client";

export async function getCollaborations(tenantId: string, userId: string) {
  return prisma.collaboration.findMany({
    where: {
      tenantId,
      OR: [{ fromUserId: userId }, { toUserId: userId }],
    },
    include: {
      fromUser: { select: { id: true, fullName: true, avatar: true, email: true } },
      toUser: { select: { id: true, fullName: true, avatar: true, email: true } },
      property: { select: { id: true, title: true, city: true, price: true } },
      requirement: { select: { id: true, title: true, city: true, budgetMin: true, budgetMax: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function createCollaboration(
  tenantId: string,
  userId: string,
  data: Omit<Prisma.CollaborationUncheckedCreateInput, "tenantId" | "fromUserId">
) {
  const collab = await prisma.collaboration.create({
    data: { ...data, tenantId, fromUserId: userId },
  });

  // Create notification for recipient
  await prisma.notification.create({
    data: {
      tenantId,
      userId: data.toUserId,
      title: "New Collaboration",
      message: `You have a new ${data.type.toLowerCase().replace("_", " ")} request`,
      link: "/collaboration",
    },
  });

  return collab;
}

export async function acceptCollaboration(tenantId: string, id: string) {
  const collab = await prisma.collaboration.findFirst({ where: { id, tenantId } });
  if (!collab) throw new Error("Collaboration not found");
  return prisma.collaboration.update({
    where: { id },
    data: { isAccepted: true },
  });
}

export async function declineCollaboration(tenantId: string, id: string) {
  const collab = await prisma.collaboration.findFirst({ where: { id, tenantId } });
  if (!collab) throw new Error("Collaboration not found");
  return prisma.collaboration.update({
    where: { id },
    data: { isAccepted: false },
  });
}

