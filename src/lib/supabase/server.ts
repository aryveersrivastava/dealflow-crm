// ==============================================================
// Supabase Server Client — for Server Components, API Routes, Server Actions
// ==============================================================

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma/client";
import type { SessionUser } from "@/types";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Silently ignored in Server Components — middleware handles refresh
          }
        },
      },
    }
  );
}

/**
 * Get the authenticated user from Supabase (validates with auth server).
 * Returns null if not authenticated.
 */
export async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Get the full session user with tenant and role information.
 * This is the primary auth check for all protected server operations.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const authUser = await getAuthUser();
  if (!authUser) return null;

  const user = await prisma.user.findUnique({
    where: { supabaseId: authUser.id },
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          slug: true,
          subscriptionPlan: true,
        },
      },
    },
  });

  if (!user || !user.isActive) return null;

  return {
    id: user.id,
    supabaseId: user.supabaseId,
    tenantId: user.tenantId,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    avatar: user.avatar,
    tenant: user.tenant,
  };
}

/**
 * Require authentication — throws if not authenticated.
 * Use in API routes and Server Actions.
 */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

/**
 * Require specific role(s) — throws if user doesn't have the required role.
 */
export async function requireRole(
  roles: string[]
): Promise<SessionUser> {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    throw new Error("Forbidden: insufficient permissions");
  }
  return user;
}
