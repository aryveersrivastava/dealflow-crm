// ==============================================================
// Storage Service — Supabase Storage for images and documents
// Uses signed URLs for private docs, public URLs for images
// ==============================================================

import { createClient } from "@/lib/supabase/server";

const BUCKETS = {
  PROPERTY_IMAGES: "property-images",
  DOCUMENTS: "documents",
  AVATARS: "avatars",
} as const;

export async function uploadPropertyImage(
  file: File,
  propertyId: string
): Promise<string> {
  const supabase = await createClient();
  const ext = file.name.split(".").pop();
  const fileName = `${propertyId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKETS.PROPERTY_IMAGES)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage
    .from(BUCKETS.PROPERTY_IMAGES)
    .getPublicUrl(fileName);

  return data.publicUrl;
}

export async function uploadDocument(
  file: File,
  tenantId: string,
  category: string = "general"
): Promise<string> {
  const supabase = await createClient();
  const ext = file.name.split(".").pop();
  const fileName = `${tenantId}/${category}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKETS.DOCUMENTS)
    .upload(fileName, file, { cacheControl: "3600" });

  if (error) throw new Error(`Upload failed: ${error.message}`);
  return fileName;
}

export async function getSignedUrl(
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(BUCKETS.DOCUMENTS)
    .createSignedUrl(path, expiresIn);

  if (error) throw new Error(`Signed URL failed: ${error.message}`);
  return data.signedUrl;
}

export async function deleteFile(bucket: string, path: string) {
  const supabase = await createClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw new Error(`Delete failed: ${error.message}`);
}

export async function uploadAvatar(file: File, userId: string): Promise<string> {
  const supabase = await createClient();
  const ext = file.name.split(".").pop();
  const fileName = `${userId}/avatar.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKETS.AVATARS)
    .upload(fileName, file, { cacheControl: "3600", upsert: true });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKETS.AVATARS).getPublicUrl(fileName);
  return data.publicUrl;
}
