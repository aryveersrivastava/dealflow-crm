// ==============================================================
// Matching Engine Service — Weighted Scoring Pipeline
// Designed as a modular scoring pipeline for future AI-assisted
// ranking model integration without core rewrite.
// ==============================================================

import { prisma } from "@/lib/prisma/client";
import type { Property, Requirement } from "@prisma/client";
import type { MatchScoreBreakdown, PropertyMatch, RequirementMatch } from "@/types";

// Scoring weights — modular config for future ML model replacement
const WEIGHTS = {
  location: 0.30,
  budget: 0.25,
  propertyType: 0.20,
  transaction: 0.15,
  area: 0.10,
} as const;

/**
 * Calculate a match score between a property and a requirement.
 * Returns 0-100 with a detailed breakdown per dimension.
 */
export function calculateMatchScore(
  property: Property,
  requirement: Requirement
): { totalScore: number; breakdown: MatchScoreBreakdown } {
  // 1. Location Score (30%) — City match + locality overlap
  let locationScore = 0;
  if (property.city.toLowerCase() === requirement.city.toLowerCase()) {
    locationScore = 60; // City match alone = 60% of location score

    const reqLocalities = requirement.preferredLocalities.map((l) => l.toLowerCase());
    const propLocality = property.locality.toLowerCase();

    if (requirement.locality && propLocality === requirement.locality.toLowerCase()) {
      locationScore = 100; // Exact locality match
    } else if (reqLocalities.length > 0 && reqLocalities.includes(propLocality)) {
      locationScore = 90; // Preferred locality match
    } else if (requirement.locality && propLocality.includes(requirement.locality.toLowerCase())) {
      locationScore = 75; // Partial locality match
    }
  }

  // 2. Budget Score (25%) — Property price within budget range
  let budgetScore = 0;
  const price = Number(property.price);
  const budgetMin = Number(requirement.budgetMin);
  const budgetMax = Number(requirement.budgetMax);

  if (price >= budgetMin && price <= budgetMax) {
    budgetScore = 100; // Within range
  } else if (price < budgetMin) {
    // Below budget — still attractive, slight penalty
    const ratio = price / budgetMin;
    budgetScore = ratio > 0.8 ? Math.round(ratio * 100) : Math.round(ratio * 70);
  } else {
    // Above budget — bigger penalty
    const ratio = budgetMax / price;
    budgetScore = ratio > 0.85 ? Math.round(ratio * 90) : Math.round(ratio * 50);
  }
  budgetScore = Math.max(0, Math.min(100, budgetScore));

  // 3. Property Type Score (20%) — Exact match
  const propertyTypeScore = property.propertyType === requirement.propertyType ? 100 : 0;

  // 4. Transaction Type Score (15%) — Exact match
  const transactionScore = property.transactionType === requirement.transactionType ? 100 : 0;

  // 5. Area Score (10%) — Property area within requirement range
  let areaScore = 50; // Default if no area requirement specified
  const propArea = Number(property.area);

  if (requirement.areaMin || requirement.areaMax) {
    const areaMin = requirement.areaMin ? Number(requirement.areaMin) : 0;
    const areaMax = requirement.areaMax ? Number(requirement.areaMax) : Infinity;

    if (propArea >= areaMin && propArea <= areaMax) {
      areaScore = 100;
    } else if (propArea < areaMin) {
      areaScore = Math.max(0, Math.round((propArea / areaMin) * 80));
    } else {
      areaScore = Math.max(0, Math.round((areaMax / propArea) * 80));
    }
  }

  const breakdown: MatchScoreBreakdown = {
    locationScore,
    budgetScore,
    propertyTypeScore,
    transactionScore,
    areaScore,
  };

  const totalScore = Math.round(
    locationScore * WEIGHTS.location +
    budgetScore * WEIGHTS.budget +
    propertyTypeScore * WEIGHTS.propertyType +
    transactionScore * WEIGHTS.transaction +
    areaScore * WEIGHTS.area
  );

  return { totalScore, breakdown };
}

/**
 * Find matching properties for a given requirement.
 * Pre-filters with indexed DB queries, then scores in memory.
 */
export async function findMatchesForRequirement(
  tenantId: string,
  requirementId: string,
  limit: number = 20
): Promise<PropertyMatch[]> {
  const requirement = await prisma.requirement.findFirst({
    where: { id: requirementId, tenantId },
  });
  if (!requirement) throw new Error("Requirement not found");

  // Pre-filter: same city, same transaction type, overlapping price range
  const candidates = await prisma.property.findMany({
    where: {
      tenantId,
      status: "ACTIVE",
      city: { equals: requirement.city, mode: "insensitive" },
      transactionType: requirement.transactionType,
      price: {
        gte: Number(requirement.budgetMin) * 0.7, // 30% tolerance
        lte: Number(requirement.budgetMax) * 1.3,
      },
    },
    include: {
      createdBy: {
        select: { id: true, fullName: true, avatar: true, email: true },
      },
      _count: { select: { leads: true, visits: true } },
    },
    take: 100, // Cap candidates for performance
  });

  // Score all candidates
  const matches: PropertyMatch[] = candidates
    .map((property) => {
      const { totalScore, breakdown } = calculateMatchScore(property, requirement);
      return { property, totalScore, breakdown };
    })
    .filter((match) => match.totalScore > 20) // Minimum threshold
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, limit);

  // Update match count on the requirement
  await prisma.requirement.update({
    where: { id: requirementId },
    data: { matchCount: matches.length },
  });

  return matches;
}

/**
 * Find matching requirements for a given property.
 * Reverse matching — property → requirements.
 */
export async function findMatchesForProperty(
  tenantId: string,
  propertyId: string,
  limit: number = 20
): Promise<RequirementMatch[]> {
  const property = await prisma.property.findFirst({
    where: { id: propertyId, tenantId },
  });
  if (!property) throw new Error("Property not found");

  // Pre-filter: same city, same transaction type, overlapping budget range
  const candidates = await prisma.requirement.findMany({
    where: {
      tenantId,
      status: "ACTIVE",
      city: { equals: property.city, mode: "insensitive" },
      transactionType: property.transactionType,
      budgetMin: { lte: Number(property.price) * 1.3 },
      budgetMax: { gte: Number(property.price) * 0.7 },
    },
    include: {
      createdBy: {
        select: { id: true, fullName: true, avatar: true, email: true },
      },
      _count: { select: { leads: true } },
    },
    take: 100,
  });

  const matches: RequirementMatch[] = candidates
    .map((requirement) => {
      const { totalScore, breakdown } = calculateMatchScore(property, requirement);
      return { requirement, totalScore, breakdown };
    })
    .filter((match) => match.totalScore > 20)
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, limit);

  return matches;
}
