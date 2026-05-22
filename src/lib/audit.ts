// ==============================================================
// DealFlow CRM — Audit Logging Utility
// ==============================================================

import { prisma } from '@/lib/prisma/client';
import type { NextRequest } from 'next/server';

interface AuditLogParams {
  tenantId: string;
  userId: string;
  action: string;
  entity: string;
  entityId?: string;
  oldData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  request?: NextRequest;
}

export async function logAuditEvent({
  tenantId,
  userId,
  action,
  entity,
  entityId,
  oldData,
  newData,
  request,
}: AuditLogParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action,
        entity,
        entityId,
        oldData: (oldData as any) ?? undefined,
        newData: (newData as any) ?? undefined,
        ipAddress: request?.headers.get('x-forwarded-for') ?? request?.headers.get('x-real-ip') ?? null,
        userAgent: request?.headers.get('user-agent') ?? null,
      },
    });
  } catch (error) {
    // Audit logging should never break the main request
    console.error('[AuditLog] Failed to log event:', error);
  }
}
