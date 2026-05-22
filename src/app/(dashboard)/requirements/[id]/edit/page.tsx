import { getSessionUser } from "@/lib/supabase/server";
import { getRequirementById } from "@/services/requirement.service";
import { notFound, redirect } from "next/navigation";
import { RequirementForm } from "@/components/requirements/requirement-form";

interface EditRequirementPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRequirementPage({ params }: EditRequirementPageProps) {
  const resolvedParams = await params;
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const requirement = await getRequirementById(user.tenantId, resolvedParams.id);

  if (!requirement) {
    notFound();
  }

  const serializedRequirement = JSON.parse(JSON.stringify(requirement));

  return <RequirementForm initialData={serializedRequirement} isEdit />;
}
