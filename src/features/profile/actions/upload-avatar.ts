"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AvatarUploadState =
  | { status: "idle" }
  | { status: "error"; errorKey: string }
  | { status: "success" };

export const avatarIdleState: AvatarUploadState = { status: "idle" };

const ALLOWED_MIME = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_BYTES = 5 * 1024 * 1024;

export async function uploadAvatarAction(
  _prev: AvatarUploadState,
  formData: FormData,
): Promise<AvatarUploadState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", errorKey: "unauthorized" };

  const fileRaw = formData.get("avatar");
  if (!(fileRaw instanceof File) || fileRaw.size === 0) {
    return { status: "error", errorKey: "noFile" };
  }
  if (fileRaw.size > MAX_BYTES) {
    return { status: "error", errorKey: "fileTooLarge" };
  }
  if (!ALLOWED_MIME.includes(fileRaw.type)) {
    return { status: "error", errorKey: "invalidFileType" };
  }

  const ext = fileRaw.type.split("/")[1] ?? "png";
  const path = `${user.id}/avatar-${Date.now()}.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from("avatars")
    .upload(path, fileRaw, { upsert: false, contentType: fileRaw.type });

  if (uploadErr) return { status: "error", errorKey: "uploadFailed" };

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", user.id)
    .select("slug")
    .single();

  if (profileErr) return { status: "error", errorKey: "unknown" };

  revalidatePath("/account");
  if (profile?.slug) revalidatePath(`/u/${profile.slug}`);
  return { status: "success" };
}
