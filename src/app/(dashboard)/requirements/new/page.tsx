import { getSessionUser } from "@/lib/supabase/server";
import { RequirementForm } from "@/components/requirements/requirement-form";
import { redirect } from "next/navigation";

export default async function NewRequirementPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return <RequirementForm />;
}
