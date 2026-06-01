"use client";

import { useActionState, useState } from "react";
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
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPersonalData, setAcceptPersonalData] = useState(false);
  const canSubmit = acceptTerms && acceptPersonalData;

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

      <FormField label={t("passwordLabel")} htmlFor="password" hint={t("passwordHint")}>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </FormField>

      <div className="border-foreground/10 bg-foreground/[0.02] space-y-3 rounded-xl border p-4">
        <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed">
          <input
            type="checkbox"
            name="acceptTerms"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            required
            className="mt-0.5 size-4 shrink-0"
          />
          <span>
            {t.rich("consentTerms", {
              terms: (chunks) => (
                <Link
                  href="/legal/terms"
                  target="_blank"
                  className="text-foreground underline underline-offset-2"
                >
                  {chunks}
                </Link>
              ),
              offer: (chunks) => (
                <Link
                  href="/legal/offer"
                  target="_blank"
                  className="text-foreground underline underline-offset-2"
                >
                  {chunks}
                </Link>
              ),
            })}
          </span>
        </label>

        <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed">
          <input
            type="checkbox"
            name="acceptPersonalData"
            checked={acceptPersonalData}
            onChange={(e) => setAcceptPersonalData(e.target.checked)}
            required
            className="mt-0.5 size-4 shrink-0"
          />
          <span>
            {t.rich("consentPersonalData", {
              consent: (chunks) => (
                <Link
                  href="/legal/personal-data"
                  target="_blank"
                  className="text-foreground underline underline-offset-2"
                >
                  {chunks}
                </Link>
              ),
              privacy: (chunks) => (
                <Link
                  href="/legal/privacy"
                  target="_blank"
                  className="text-foreground underline underline-offset-2"
                >
                  {chunks}
                </Link>
              ),
            })}
          </span>
        </label>
      </div>

      {state.status === "error" ? (
        <Alert variant="error">{t(`errors.${state.errorKey}`)}</Alert>
      ) : null}

      <Button
        type="submit"
        isLoading={pending}
        disabled={!canSubmit}
        className="w-full"
      >
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
