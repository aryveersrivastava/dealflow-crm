// DealFlow CRM — Database Seeding Script
// Populates the PostgreSQL database with mock SaaS CRM data.
// ==============================================================

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Clean up existing data (in reverse order of dependencies)
  console.log("🧹 Cleaning up old data...");
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.collaboration.deleteMany({});
  await prisma.visit.deleteMany({});
  await prisma.note.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.activity.deleteMany({});
  await prisma.lead.deleteMany({});
  await prisma.requirement.deleteMany({});
  await prisma.property.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.brokerageFirm.deleteMany({});

  // 2. Create Brokerage Firm (Tenant)
  console.log("🏢 Creating default tenant brokerage firm...");
  const tenant = await prisma.brokerageFirm.create({
    data: {
      id: "firm-dealflow",
      name: "DealFlow Elite Brokerage",
      slug: "dealflow",
      city: "Gurugram",
      state: "Haryana",
      phone: "+91-124-4567890",
      email: "info@dealflow.crm",
      website: "https://dealflow.crm",
      reraNumber: "HRERA-GRG-124-2026",
      subscriptionPlan: "PROFESSIONAL",
      subscriptionStatus: "ACTIVE",
      maxUsers: 50,
      maxProperties: 500,
      maxRequirements: 500,
      featureFlags: JSON.stringify({
        matchingEngineV2: true,
        advancedAnalytics: true,
        exportReports: true,
      }),
      isActive: true,
    },
  });

  // 3. Create Users
  console.log("👥 Creating team users...");
  const admin = await prisma.user.create({
    data: {
      id: "user-admin",
      supabaseId: "mock-admin-uuid-12345",
      tenantId: tenant.id,
      email: "admin@dealflow.crm",
      fullName: "Arya Verma",
      phone: "+91-9999911111",
      role: "BROKERAGE_ADMIN",
      isActive: true,
    },
  });

  const broker = await prisma.user.create({
    data: {
      id: "user-broker",
      supabaseId: "mock-broker-uuid-54321",
      tenantId: tenant.id,
      email: "broker@dealflow.crm",
      fullName: "Rohan Sharma",
      phone: "+91-9999922222",
      role: "BROKER",
      isActive: true,
    },
  });

  // 4. Create Properties
  console.log("🏡 Creating properties...");
  const prop1 = await prisma.property.create({
    data: {
      id: "prop-1",
      tenantId: tenant.id,
      createdById: admin.id,
      title: "Sleek Penthouse in DLF Phase 5",
      description: "Ultra-luxury duplex penthouse with private pool, double-height ceiling lounge, and panoramic skyline view of Aravallis. Close to Golf Course Road metro.",
      propertyType: "PENTHOUSE",
      transactionType: "SALE",
      status: "ACTIVE",
      price: 75000000, // 7.5 Cr
      area: 4200,
      areaUnit: "sqft",
      bedrooms: 4,
      bathrooms: 5,
      furnishing: "FURNISHED",
      floor: 18,
      totalFloors: 19,
      facing: "North-East",
      city: "Gurugram",
      locality: "DLF Phase 5",
      address: "DLF The Crest, Sector 54, Gurugram, HR",
      ownerName: "Amit Khanna",
      ownerPhone: "+91-9876543210",
      amenities: ["Swimming Pool", "Gymnasium", "24x7 Security", "Power Backup", "Clubhouse"],
      tags: ["Luxury", "Duplex", "Penthouse", "High ROI"],
      images: [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
      ],
      isFeatured: true,
      publishedAt: new Date(),
    },
  });

  const prop2 = await prisma.property.create({
    data: {
      id: "prop-2",
      tenantId: tenant.id,
      createdById: broker.id,
      title: "Golf Course Road Office Space",
      description: "Fully fitted premium corporate office space. Includes 4 conference rooms, 80 workstations, server room, cafeteria, and private washrooms.",
      propertyType: "COMMERCIAL_OFFICE",
      transactionType: "LEASE",
      status: "ACTIVE",
      price: 250000, // 2.5L / Month
      area: 2800,
      areaUnit: "sqft",
      furnishing: "FURNISHED",
      floor: 8,
      totalFloors: 12,
      facing: "East",
      city: "Gurugram",
      locality: "Golf Course Road",
      address: "One Horizon Centre, Sector 43, Gurugram, HR",
      ownerName: "Vikas Goel",
      ownerPhone: "+91-9811122233",
      amenities: ["High-speed Elevators", "Central AC", "Parking", "Conference Room", "Server Room"],
      tags: ["Commercial", "Corporate", "Fully Fitted"],
      images: [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
      ],
      isFeatured: false,
      publishedAt: new Date(),
    },
  });

  // 5. Create Requirements
  console.log("🎯 Creating buyer requirements...");
  const req1 = await prisma.requirement.create({
    data: {
      id: "req-1",
      tenantId: tenant.id,
      createdById: broker.id,
      title: "Luxury Duplex/Penthouse Buyer",
      description: "Buyer looking for high-end penthouse or duplex villa in Sector 54 or Golf Course Road. Needs 4+ BHK, premium community, and good security.",
      buyerName: "Sanjay Malhotra",
      buyerEmail: "sanjay@malhotra.com",
      buyerPhone: "+91-9899933333",
      propertyType: "PENTHOUSE",
      transactionType: "SALE",
      budgetMin: 60000000, // 6 Cr
      budgetMax: 80000000, // 8 Cr
      areaMin: 3500,
      areaMax: 5000,
      bedrooms: 4,
      city: "Gurugram",
      locality: "DLF Phase 5",
      preferredLocalities: ["DLF Phase 5", "Golf Course Road", "Sector 54"],
      urgency: "IMMEDIATE",
      investmentGoal: "END_USE",
      furnishing: "FURNISHED",
      status: "ACTIVE",
      isPublic: true,
      matchCount: 1,
    },
  });

  // 6. Create Lead (CRM pipeline item)
  console.log("💼 Creating leads in pipeline...");
  const lead = await prisma.lead.create({
    data: {
      id: "lead-1",
      tenantId: tenant.id,
      createdById: broker.id,
      assignedToId: broker.id,
      propertyId: prop1.id,
      requirementId: req1.id,
      contactName: "Sanjay Malhotra",
      contactPhone: "+91-9899933333",
      contactEmail: "sanjay@malhotra.com",
      source: "Matching Engine",
      status: "NEW_LEAD",
      score: 95,
      expectedValue: 75000000,
      notes: "Auto-matched buyer for DLF Crest Penthouse. High budget match and exact locality overlap.",
    },
  });

  // 7. Create Activities
  console.log("📝 Log initial activities...");
  await prisma.activity.create({
    data: {
      tenantId: tenant.id,
      userId: broker.id,
      leadId: lead.id,
      type: "DEAL_UPDATE",
      title: "Lead Created via Match",
      description: "Auto-matched lead created from Sanjay Malhotra's requirement and DLF Crest Penthouse.",
      metadata: JSON.stringify({ score: 95 }),
    },
  });

  // 8. Create Tasks
  console.log("📅 Scheduling follow-up tasks...");
  await prisma.task.create({
    data: {
      tenantId: tenant.id,
      createdById: broker.id,
      assignedToId: broker.id,
      leadId: lead.id,
      title: "Schedule introductory call",
      description: "Pitch the DLF Phase 5 Penthouse to Sanjay and ask for a site visit.",
      priority: "HIGH",
      status: "TODO",
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
    },
  });

  console.log("✅ Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
