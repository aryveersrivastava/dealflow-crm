// ==============================================================
// Requirements [id] API — GET / PATCH / DELETE
// ==============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma/client';
import { updateRequirementSchema } from '@/lib/validations';
import { logAuditEvent } from '@/lib/audit';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const requirement = await prisma.requirement.findFirst({
      where: { id, tenantId: user.tenantId },
      include: {
        createdBy: { select: { id: true, fullName: true, avatar: true, email: true } },
        _count: { select: { leads: true } },
      },
    });

    if (!requirement) {
      return NextResponse.json({ error: 'Requirement not found' }, { status: 404 });
    }

    return NextResponse.json({ data: requirement });
  } catch (error) {
    console.error('[Requirement GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const validation = updateRequirementSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existing = await prisma.requirement.findFirst({
      where: { id, tenantId: user.tenantId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Requirement not found' }, { status: 404 });
    }

    const requirement = await prisma.requirement.update({
      where: { id },
      data: validation.data,
      include: {
        createdBy: { select: { id: true, fullName: true, avatar: true, email: true } },
      },
    });

    await logAuditEvent({
      tenantId: user.tenantId,
      userId: user.id,
      action: 'UPDATE',
      entity: 'Requirement',
      entityId: id,
      oldData: existing as unknown as Record<string, unknown>,
      newData: validation.data as unknown as Record<string, unknown>,
      request,
    });

    return NextResponse.json({ data: requirement });
  } catch (error) {
    console.error('[Requirement PATCH]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const existing = await prisma.requirement.findFirst({
      where: { id, tenantId: user.tenantId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Requirement not found' }, { status: 404 });
    }

    // Soft delete — cancel instead of hard delete
    await prisma.requirement.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    await logAuditEvent({
      tenantId: user.tenantId,
      userId: user.id,
      action: 'CANCEL',
      entity: 'Requirement',
      entityId: id,
      oldData: { status: existing.status },
      newData: { status: 'CANCELLED' },
      request,
    });

    return NextResponse.json({ message: 'Requirement cancelled successfully' });
  } catch (error) {
    console.error('[Requirement DELETE]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
