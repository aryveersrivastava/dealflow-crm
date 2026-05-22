// ==============================================================
// Note Service
// ==============================================================
import { prisma } from "@/lib/prisma/client";

export async function createNote(
  tenantId: string,
  userId: string,
  data: { content: string; leadId?: string; isPinned?: boolean }
) {
  const note = await prisma.note.create({
    data: {
      tenantId,
      userId,
      content: data.content,
      leadId: data.leadId,
      isPinned: data.isPinned || false,
    },
    include: {
      user: { select: { id: true, fullName: true, avatar: true } },
    },
  });

  // Log activity if linked to a lead
  if (data.leadId) {
    await prisma.activity.create({
      data: {
        tenantId,
        userId,
        leadId: data.leadId,
        type: "NOTE",
        title: "Added note",
        description: data.content.length > 60 ? `${data.content.substring(0, 60)}...` : data.content,
      },
    });
  }

  return note;
}

export async function updateNote(
  tenantId: string,
  id: string,
  userId: string,
  data: { content?: string; isPinned?: boolean }
) {
  const note = await prisma.note.findFirst({ where: { id, tenantId } });
  if (!note) throw new Error("Note not found");

  return prisma.note.update({
    where: { id },
    data,
    include: {
      user: { select: { id: true, fullName: true, avatar: true } },
    },
  });
}

export async function deleteNote(tenantId: string, id: string) {
  const note = await prisma.note.findFirst({ where: { id, tenantId } });
  if (!note) throw new Error("Note not found");

  return prisma.note.delete({
    where: { id },
  });
}
