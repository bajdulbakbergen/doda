"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Alert } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Link } from "@/i18n/navigation";
import { signUpAction } from "../actions/sign-up";
import { idleState } from "../types";

export function SignUpForm() {
  const t = useTranslations("auth");
  const [state, formAction, pending] = useActionState(signUpAction, idleState);

  return (
    <form action={formAction} className="space-y-5">
      <FormField label={t("displayNameLabel")} htmlFor="displayName" hint={t("displayNameHint")}>
        <Input
          id="displayName"
          name="displayName"
          type="text"
          autoComplete="name"
          maxLength={80}
        />
      </FormField>

      <FormField label={t("emailLabel")} htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </FormField>

      <FormField
        label={t("passwordLabel")}
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

      {state.status === "error" ? (
        <Alert variant="error">{t(`errors.${state.errorKey}`)}</Alert>
      ) : null}

      <p className="text-foreground/60 text-xs leading-relaxed">
        {t.rich("legalAgreement", {
          terms: (chunks) => (
            <Link href="/legal/terms" className="text-foreground hover:underline">
              {chunks}
            </Link>
          ),
          privacy: (chunks) => (
            <Link href="/legal/privacy" className="text-foreground hover:underline">
              {chunks}
            </Link>
          ),
        })}
      </p>

      <Button type="submit" isLoading={pending} className="w-full">
        {t("signUpCta")}
      </Button>

      <div className="text-center text-sm">
        <Link
          href="/auth/sign-in"
          className="text-foreground/70 hover:text-foreground transition-colors"
        >
          {t("haveAccount")}
        </Link>
      </div>
    </form>
  );
}
