"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Alert } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Link } from "@/i18n/navigation";
import { forgotPasswordAction } from "../actions/forgot-password";
import { idleState } from "../types";

export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const [state, formAction, pending] = useActionState(forgotPasswordAction, idleState);

  if (state.status === "success") {
    return (
      <div className="space-y-4">
        <Alert variant="success">{t(`messages.${state.messageKey}`)}</Alert>
        <Link
          href="/auth/sign-in"
          className="text-foreground/70 hover:text-foreground block text-center text-sm transition-colors"
        >
          {t("backToSignIn")}
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <FormField
        label={t("emailLabel")}
        htmlFor="email"
        hint={t("forgotPasswordHint")}
      >
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </FormField>

      {state.status === "error" ? (
        <Alert variant="error">{t(`errors.${state.errorKey}`)}</Alert>
      ) : null}

      <Button type="submit" isLoading={pending} className="w-full">
        {t("sendResetLinkCta")}
      </Button>

      <div className="text-center text-sm">
        <Link
          href="/auth/sign-in"
          className="text-foreground/70 hover:text-foreground transition-colors"
        >
          {t("backToSignIn")}
        </Link>
      </div>
    </form>
  );
}
