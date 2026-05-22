import { redirect, notFound } from "next/navigation";
import { getSessionUser } from "@/lib/supabase/server";
import { getLeadById } from "@/services/lead.service";
import { findMatchesForRequirement, findMatchesForProperty } from "@/services/matching.service";
import { LeadDetailClient } from "./lead-detail-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LeadDetailPage({ params }: PageProps) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const lead = await getLeadById(user.tenantId, id);

  if (!lead) {
    notFound();
  }

  // Fetch property matches or requirement matches using the matching engine
  let matches: any[] = [];
  let matchType: "property" | "requirement" | null = null;

  if (lead.requirementId) {
    try {
      matches = await findMatchesForRequirement(user.tenantId, lead.requirementId);
      matchType = "property";
    } catch (err) {
      console.error("Failed to fetch matches for lead requirement:", err);
    }
  } else if (lead.propertyId) {
    try {
      matches = await findMatchesForProperty(user.tenantId, lead.propertyId);
      matchType = "requirement";
    } catch (err) {
      console.error("Failed to fetch matches for lead property:", err);
    }
  }

  // Serialize dates for Client Component safety
  const serializedLead = JSON.parse(JSON.stringify(lead));
  const serializedMatches = JSON.parse(JSON.stringify(matches));

  return (
    <LeadDetailClient
      lead={serializedLead}
      initialMatches={serializedMatches}
      matchType={matchType}
    />
  );
}
