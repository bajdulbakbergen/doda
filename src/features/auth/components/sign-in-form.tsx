"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Alert } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Link } from "@/i18n/navigation";
import { signInAction } from "../actions/sign-in";
import { idleState } from "../types";

type Props = {
  next?: string;
};

export function SignInForm({ next }: Props) {
  const t = useTranslations("auth");
  const [state, formAction, pending] = useActionState(signInAction, idleState);

  return (
    <form action={formAction} className="space-y-5">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      <FormField label={t("emailLabel")} htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </FormField>

      <FormField label={t("passwordLabel")} htmlFor="password">
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
        />
      </FormField>

      {state.status === "error" ? (
        <Alert variant="error">{t(`errors.${state.errorKey}`)}</Alert>
      ) : null}

      <Button type="submit" isLoading={pending} className="w-full">
        {t("signInCta")}
      </Button>

      <div className="flex justify-between text-sm">
        <Link
          href="/auth/forgot-password"
          className="text-foreground/70 hover:text-foreground transition-colors"
        >
          {t("forgotPasswordLink")}
        </Link>
        <Link
          href="/auth/sign-up"
          className="text-foreground/70 hover:text-foreground transition-colors"
        >
          {t("noAccount")}
        </Link>
      </div>
    </form>
  );
}
