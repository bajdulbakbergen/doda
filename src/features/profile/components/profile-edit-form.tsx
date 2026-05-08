"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Alert } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import {
  updateProfileAction,
  profileIdleState,
} from "../actions/update-profile";
import type { Profile } from "../queries/get-profile";

const LOCALES = ["ru", "kk", "en"] as const;

export function ProfileEditForm({ profile }: { profile: Profile }) {
  const t = useTranslations("account");
  const tLocale = useTranslations("locale");
  const [state, formAction, pending] = useActionState(updateProfileAction, profileIdleState);

  return (
    <form action={formAction} className="space-y-5">
      <FormField label={t("displayNameLabel")} htmlFor="displayName">
        <Input
          id="displayName"
          name="displayName"
          defaultValue={profile.display_name}
          required
          maxLength={80}
        />
      </FormField>

      <FormField label={t("slugLabel")} htmlFor="slug" hint={t("slugHint")}>
        <Input
          id="slug"
          name="slug"
          defaultValue={profile.slug}
          required
          pattern="^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])?$"
          maxLength={32}
        />
      </FormField>

      <FormField label={t("cityLabel")} htmlFor="city">
        <Input
          id="city"
          name="city"
          defaultValue={profile.city ?? ""}
          maxLength={80}
        />
      </FormField>

      <FormField label={t("bioLabel")} htmlFor="bio" hint={t("bioHint")}>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={profile.bio ?? ""}
          maxLength={1000}
          rows={5}
        />
      </FormField>

      <FormField label={t("preferredLocaleLabel")} htmlFor="preferredLocale">
        <select
          id="preferredLocale"
          name="preferredLocale"
          defaultValue={profile.preferred_locale}
          className="border-foreground/15 bg-background hover:bg-foreground/[0.02] focus-visible:border-foreground/40 focus-visible:ring-foreground/10 h-11 w-full rounded-xl border px-4 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          {LOCALES.map((code) => (
            <option key={code} value={code}>
              {code === "en" ? "English" : tLocale(code)}
            </option>
          ))}
        </select>
      </FormField>

      {state.status === "error" ? (
        <Alert variant="error">{t(`errors.${state.errorKey}`)}</Alert>
      ) : null}
      {state.status === "success" ? (
        <Alert variant="success">{t("saved")}</Alert>
      ) : null}

      <Button type="submit" isLoading={pending}>
        {t("saveCta")}
      </Button>
    </form>
  );
}
