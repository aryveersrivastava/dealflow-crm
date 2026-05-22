import { getSessionUser } from "@/lib/supabase/server";
import { getPropertyById } from "@/services/property.service";
import { notFound, redirect } from "next/navigation";
import { PropertyForm } from "@/components/properties/property-form";

interface EditPropertyPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const resolvedParams = await params;
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const property = await getPropertyById(user.tenantId, resolvedParams.id);

  if (!property) {
    notFound();
  }

  // Convert decimal to numbers for forms serialization
  const serializedProperty = JSON.parse(JSON.stringify(property));

  return <PropertyForm initialData={serializedProperty} isEdit />;
}
