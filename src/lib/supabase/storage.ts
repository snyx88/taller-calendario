import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const BUCKET = "fotos_vehiculos";

function slugPlaca(placa: string): string {
  const limpio = placa
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return limpio || "sin-placa";
}

export async function subirFotoVehiculo(
  file: File,
  placa: string,
): Promise<string> {
  const supabase = getSupabaseBrowserClient();
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${slugPlaca(placa)}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
