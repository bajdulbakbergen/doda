"use server";

import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

export type VerificationFormState =
  | { status: "idle" }
  | { status: "error"; errorKey: string };

export const verificationIdleState: VerificationFormState = { status: "idle" };

const BIN_RE = /^\d{12}$/;
const ALLOWED_MIME = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
const MAX_BYTES = 10 * 1024 * 1024;
const MAX_DOCS = 5;

export async function submitVerificationAction(
  _prev: VerificationFormState,
  formData: FormData,
): Promise<VerificationFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", errorKey: "unauthorized" };

  const entityType = String(formData.get("entityType") ?? "");
  const legalName = String(formData.get("legalName") ?? "").trim();
  const bin = String(formData.get("bin") ?? "").trim();
  const documents = formData.getAll("documents").filter((v): v is File => v instanceof File && v.size > 0);

  if (!["IP", "TOO"].includes(entityType)) {
    return { status: "error", errorKey: "entityTypeInvalid" };
  }
  if (legalName.length < 2 || legalName.length > 200) {
    return { status: "error", errorKey: "legalNameInvalid" };
  }
  if (!BIN_RE.test(bin)) {
    return { status: "error", errorKey: "binInvalid" };
  }
  if (documents.length === 0) {
    return { status: "error", errorKey: "noDocuments" };
  }
  if (documents.length > MAX_DOCS) {
    return { status: "error", errorKey: "tooManyDocuments" };
  }
  for (const doc of documents) {
    if (doc.size > MAX_BYTES) return { status: "error", errorKey: "fileTooLarge" };
    if (!ALLOWED_MIME.includes(doc.type)) {
      return { status: "error", errorKey: "invalidFileType" };
    }
  }

  // Загружаем файлы в private bucket
  const paths: string[] = [];
  for (const [i, doc] of documents.entries()) {
    const ext = doc.type.split("/")[1] ?? "bin";
    const safeExt = ext === "pdf" ? "pdf" : ext;
    const path = `${user.id}/${Date.now()}-${i}.${safeExt}`;
    const { error: uploadErr } = await supabase.storage
      .from("verification-docs")
      .upload(path, doc, { contentType: doc.type, upsert: false });
    if (uploadErr) return { status: "error", errorKey: "uploadFailed" };
    paths.push(path);
  }

  const { error } = await supabase.from("verifications").insert({
    user_id: user.id,
    entity_type: entityType as "IP" | "TOO",
    legal_name: legalName,
    bin,
    document_paths: paths,
    status: "pending",
  });

  if (error) {
    if (error.code === "23505") return { status: "error", errorKey: "alreadySubmitted" };
    if (error.message?.includes("bin_blacklisted")) {
      return { status: "error", errorKey: "binBlacklisted" };
    }
    return { status: "error", errorKey: "unknown" };
  }

  revalidatePath("/account");
  revalidatePath("/account/verification");

  const locale = await getLocale();
  redirect({ href: "/account/verification", locale });
}
