"use server";

import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type PostFormState =
  | { status: "idle" }
  | { status: "error"; errorKey: string };

export const postIdleState: PostFormState = { status: "idle" };

const ALLOWED_TYPES: Array<Database["public"]["Enums"]["post_type"]> = [
  "case",
  "product",
  "news",
  "media",
];
const ALLOWED_MIME = ["image/png", "image/jpeg", "image/webp"];
const MAX_BYTES = 10 * 1024 * 1024;
const MAX_IMAGES = 5;

export async function createPostAction(
  _prev: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", errorKey: "unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_verified")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.is_verified) return { status: "error", errorKey: "notVerified" };

  const type = String(formData.get("type") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const region = String(formData.get("region") ?? "").trim();
  const linkedLotId = String(formData.get("linkedLotId") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();
  const priceMaxRaw = String(formData.get("priceMax") ?? "").trim();
  const images = formData.getAll("images").filter((v): v is File => v instanceof File && v.size > 0);

  if (!ALLOWED_TYPES.includes(type as (typeof ALLOWED_TYPES)[number])) {
    return { status: "error", errorKey: "typeInvalid" };
  }
  if (title.length < 5 || title.length > 200) {
    return { status: "error", errorKey: "titleInvalid" };
  }
  if (body.length > 5000) return { status: "error", errorKey: "bodyTooLong" };
  if (images.length > MAX_IMAGES) return { status: "error", errorKey: "tooManyImages" };
  for (const img of images) {
    if (img.size > MAX_BYTES) return { status: "error", errorKey: "imageTooLarge" };
    if (!ALLOWED_MIME.includes(img.type)) return { status: "error", errorKey: "imageInvalidType" };
  }

  const price = priceRaw ? Number(priceRaw) : null;
  const priceMax = priceMaxRaw ? Number(priceMaxRaw) : null;
  if (price !== null && (Number.isNaN(price) || price <= 0)) {
    return { status: "error", errorKey: "priceInvalid" };
  }
  if (priceMax !== null && (Number.isNaN(priceMax) || priceMax <= 0)) {
    return { status: "error", errorKey: "priceInvalid" };
  }
  if (price !== null && priceMax !== null && priceMax < price) {
    return { status: "error", errorKey: "priceConsistency" };
  }

  // Загружаем изображения в публичный bucket
  const imagePaths: string[] = [];
  for (const [i, img] of images.entries()) {
    const ext = img.type.split("/")[1] ?? "png";
    const path = `${user.id}/${Date.now()}-${i}.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from("post-images")
      .upload(path, img, { contentType: img.type, upsert: false });
    if (uploadErr) return { status: "error", errorKey: "imageUploadFailed" };
    imagePaths.push(path);
  }

  // Сразу формируем публичные URL для хранения в записи
  const publicUrls = imagePaths.map(
    (p) => supabase.storage.from("post-images").getPublicUrl(p).data.publicUrl,
  );

  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      author_id: user.id,
      type: type as Database["public"]["Enums"]["post_type"],
      title,
      body: body || null,
      images: publicUrls,
      category_id: categoryId || null,
      region: region || null,
      price,
      price_max: priceMax,
      linked_lot_id: linkedLotId || null,
      is_published: true,
    })
    .select("id")
    .single();

  if (error || !post) return { status: "error", errorKey: "createFailed" };

  revalidatePath("/feed");
  const locale = await getLocale();
  redirect({ href: `/posts/${post.id}`, locale });
}
