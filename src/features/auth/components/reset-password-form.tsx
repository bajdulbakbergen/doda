"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Alert } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { resetPasswordAction } from "../actions/reset-password";
import { idleState } from "../types";

export function ResetPasswordForm() {
  const t = useTranslations("auth");
  const [state, formAction, pending] = useActionState(resetPasswordAction, idleState);

  return (
    <form action={formAction} className="space-y-5">
      <FormField
        label={t("newPasswordLabel")}
        htmlFor="password"
        hint={t("passwordHint")}
      >
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </FormField>

      <FormField label={t("confirmPasswordLabel")} htmlFor="confirmPassword">
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </FormField>

      {state.status === "error" ? (
        <Alert variant="error">{t(`errors.${state.errorKey}`)}</Alert>
      ) : null}

      <Button type="submit" isLoading={pending} className="w-full">
        {t("updatePasswordCta")}
      </Button>
    </form>
  );
}
