import "server-only";
import { createClient } from "@supabase/supabase-js";
export function imageStorage() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  const bucket = process.env.SUPABASE_BUCKET;
  if (!url || !key || !bucket) throw new Error("Supabase URL, secret key and bucket are required");
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return { supabase, bucket, storage: supabase.storage.from(bucket) };
}
export async function imageUrls(paths: string[]) {
  if (!paths.length) return [];
  const { supabase, bucket, storage } = imageStorage();
  const { data: info, error } = await supabase.storage.getBucket(bucket);
  if (error) throw error;
  if (info.public) return paths.map(path => storage.getPublicUrl(path).data.publicUrl);
  const result = await storage.createSignedUrls(paths, 3600);
  if (result.error) throw result.error;
  return result.data.map(item => {
    if (item.error || !item.signedUrl) throw new Error("Could not create image URL");
    return item.signedUrl;
  });
}
