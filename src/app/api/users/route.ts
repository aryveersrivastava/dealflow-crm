import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";

export async function GET(_request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const users = await prisma.user.findMany({
      where: { tenantId: user.tenantId, isActive: true },
      select: {
        id: true,
        fullName: true,
        email: true,
        avatar: true,
        role: true,
      },
      orderBy: { fullName: "asc" },
    });

    return NextResponse.json({ data: users });
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
