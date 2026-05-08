"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Alert } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import {
  submitVerificationAction,
  verificationIdleState,
} from "../actions/submit-verification";

export function VerificationForm() {
  const t = useTranslations("verification");
  const [state, formAction, pending] = useActionState(
    submitVerificationAction,
    verificationIdleState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <FormField label={t("entityTypeLabel")} htmlFor="entityType" hint={t("entityTypeHint")}>
        <select
          id="entityType"
          name="entityType"
          required
          defaultValue=""
          className="border-foreground/15 bg-background hover:bg-foreground/[0.02] focus-visible:border-foreground/40 focus-visible:ring-foreground/10 h-11 w-full rounded-xl border px-4 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          <option value="" disabled>
            {t("entityTypePlaceholder")}
          </option>
          <option value="IP">{t("entityTypeIP")}</option>
          <option value="TOO">{t("entityTypeTOO")}</option>
        </select>
      </FormField>

      <FormField label={t("legalNameLabel")} htmlFor="legalName" hint={t("legalNameHint")}>
        <Input id="legalName" name="legalName" required minLength={2} maxLength={200} />
      </FormField>

      <FormField label={t("binLabel")} htmlFor="bin" hint={t("binHint")}>
        <Input
          id="bin"
          name="bin"
          required
          inputMode="numeric"
          pattern="^\d{12}$"
          maxLength={12}
        />
      </FormField>

      <FormField label={t("documentsLabel")} htmlFor="documents" hint={t("documentsHint")}>
        <input
          id="documents"
          name="documents"
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp,application/pdf"
          required
          className="border-foreground/15 file:border-foreground/15 file:bg-foreground/5 file:text-foreground hover:file:bg-foreground/10 w-full rounded-xl border p-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:px-3 file:py-1.5 file:text-sm"
        />
      </FormField>

      {state.status === "error" ? (
        <Alert variant="error">{t(`errors.${state.errorKey}`)}</Alert>
      ) : null}

      <Button type="submit" isLoading={pending}>
        {t("submitCta")}
      </Button>
    </form>
  );
}
