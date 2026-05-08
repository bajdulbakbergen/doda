"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Alert } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { createLotAction, lotIdleState } from "../actions/create-lot";
import type { Category } from "../queries/get-categories";

type Props = {
  categories: Category[];
  locale: string;
};

function defaultDeadline() {
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000); // +24h
  d.setSeconds(0, 0);
  // datetime-local format: YYYY-MM-DDTHH:mm
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function LotForm({ categories, locale }: Props) {
  const t = useTranslations("lots.form");
  const [state, formAction, pending] = useActionState(createLotAction, lotIdleState);

  return (
    <form action={formAction} className="space-y-5">
      <FormField label={t("titleLabel")} htmlFor="title" hint={t("titleHint")}>
        <Input id="title" name="title" required minLength={5} maxLength={200} />
      </FormField>

      <FormField
        label={t("descriptionLabel")}
        htmlFor="description"
        hint={t("descriptionHint")}
      >
        <Textarea
          id="description"
          name="description"
          required
          minLength={20}
          maxLength={5000}
          rows={6}
        />
      </FormField>

      <FormField label={t("categoryLabel")} htmlFor="categoryId">
        <select
          id="categoryId"
          name="categoryId"
          required
          defaultValue=""
          className="border-foreground/15 bg-background hover:bg-foreground/[0.02] focus-visible:border-foreground/40 focus-visible:ring-foreground/10 h-11 w-full rounded-xl border px-4 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          <option value="" disabled>
            {t("categoryPlaceholder")}
          </option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {locale === "kk" ? cat.name_kk : cat.name_ru}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label={t("regionLabel")} htmlFor="region" hint={t("regionHint")}>
        <Input id="region" name="region" required maxLength={100} defaultValue="Астана" />
      </FormField>

      <FormField label={t("deadlineLabel")} htmlFor="deadlineAt" hint={t("deadlineHint")}>
        <Input
          id="deadlineAt"
          name="deadlineAt"
          type="datetime-local"
          required
          defaultValue={defaultDeadline()}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label={t("startingPriceLabel")}
          htmlFor="startingPrice"
          hint={t("startingPriceHint")}
        >
          <Input
            id="startingPrice"
            name="startingPrice"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
          />
        </FormField>
        <FormField
          label={t("maxPriceLabel")}
          htmlFor="maxPrice"
          hint={t("maxPriceHint")}
        >
          <Input
            id="maxPrice"
            name="maxPrice"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
          />
        </FormField>
      </div>

      <FormField label={t("isPrivateLabel")} htmlFor="isPrivate" hint={t("isPrivateHint")}>
        <label className="flex items-center gap-2 text-sm">
          <input
            id="isPrivate"
            name="isPrivate"
            type="checkbox"
            className="border-foreground/30 size-4 rounded"
          />
          <span>{t("isPrivateInline")}</span>
        </label>
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
