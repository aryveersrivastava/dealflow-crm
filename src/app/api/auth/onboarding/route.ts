import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { slugify } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { fullName, phone, brokerageName, city, reraNumber } = body;

    // Check if user already onboarded
    const existing = await prisma.user.findUnique({
      where: { supabaseId: authUser.id },
    });
    if (existing) {
      return NextResponse.json({ error: "Already onboarded" }, { status: 400 });
    }

    // Create brokerage firm (tenant)
    let slug = slugify(brokerageName);
    const slugExists = await prisma.brokerageFirm.findUnique({ where: { slug } });
    if (slugExists) slug = `${slug}-${Date.now().toString(36)}`;

    const tenant = await prisma.brokerageFirm.create({
      data: {
        name: brokerageName,
        slug,
        city,
        reraNumber: reraNumber || null,
        email: authUser.email,
      },
    });

    // Create user linked to tenant
    const user = await prisma.user.create({
      data: {
        supabaseId: authUser.id,
        tenantId: tenant.id,
        email: authUser.email!,
        fullName,
        phone,
        role: "BROKERAGE_ADMIN",
      },
    });

    return NextResponse.json({
      success: true,
      user: { id: user.id, tenantId: tenant.id, role: user.role },
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}
