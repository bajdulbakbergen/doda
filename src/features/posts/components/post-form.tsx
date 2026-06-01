"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { Alert } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { createPostAction, postIdleState } from "../actions/create-post";
import type { Category } from "@/features/lots/queries/get-categories";

type Props = {
  categories: Category[];
  locale: string;
};

const POST_TYPES = ["case", "product", "news", "media"] as const;

export function PostForm({ categories, locale }: Props) {
  const t = useTranslations("posts.form");
  const [type, setType] = useState<(typeof POST_TYPES)[number]>("case");
  const [state, formAction, pending] = useActionState(createPostAction, postIdleState);

  return (
    <form action={formAction} className="space-y-5">
      <FormField label={t("typeLabel")} htmlFor="type">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {POST_TYPES.map((opt) => (
            <label
              key={opt}
              className={`border-foreground/15 hover:bg-foreground/[0.03] cursor-pointer rounded-xl border px-3 py-3 text-center text-sm transition-colors has-[:checked]:border-foreground has-[:checked]:bg-foreground/5`}
            >
              <input
                type="radio"
                name="type"
                value={opt}
                checked={type === opt}
                onChange={() => setType(opt)}
                className="sr-only"
              />
              <span className="font-medium">{t(`types.${opt}.label`)}</span>
              <span className="text-foreground/50 mt-0.5 block text-xs">
                {t(`types.${opt}.hint`)}
              </span>
            </label>
          ))}
        </div>
      </FormField>

      <FormField label={t("titleLabel")} htmlFor="title">
        <Input id="title" name="title" required minLength={5} maxLength={200} />
      </FormField>

      <FormField label={t("bodyLabel")} htmlFor="body" hint={t("bodyHint")}>
        <Textarea id="body" name="body" maxLength={5000} rows={5} />
      </FormField>

      <FormField label={t("imagesLabel")} htmlFor="images" hint={t("imagesHint")}>
        <input
          id="images"
          name="images"
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp"
          className="border-foreground/15 file:border-foreground/15 file:bg-foreground/5 file:text-foreground hover:file:bg-foreground/10 w-full rounded-xl border p-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:px-3 file:py-1.5 file:text-sm"
        />
      </FormField>

      <FormField label={t("categoryLabel")} htmlFor="categoryId">
        <select
          id="categoryId"
          name="categoryId"
          defaultValue=""
          className="border-foreground/15 bg-background h-11 w-full rounded-xl border px-4 text-sm"
        >
          <option value="">{t("categoryPlaceholder")}</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {locale === "kk" ? cat.name_kk : cat.name_ru}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label={t("regionLabel")} htmlFor="region">
        <Input id="region" name="region" maxLength={100} />
      </FormField>

      {type === "product" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label={t("priceLabel")} htmlFor="price" hint={t("priceHint")}>
            <Input id="price" name="price" type="number" inputMode="numeric" min={1} step={1} />
          </FormField>
          <FormField label={t("priceMaxLabel")} htmlFor="priceMax" hint={t("priceMaxHint")}>
            <Input id="priceMax" name="priceMax" type="number" inputMode="numeric" min={1} step={1} />
          </FormField>
        </div>
      ) : null}

      {type === "case" ? (
        <FormField
          label={t("linkedLotLabel")}
          htmlFor="linkedLotId"
          hint={t("linkedLotHint")}
        >
          <Input id="linkedLotId" name="linkedLotId" placeholder={t("linkedLotPlaceholder")} />
        </FormField>
      ) : null}

      {state.status === "error" ? (
        <Alert variant="error">{t(`errors.${state.errorKey}`)}</Alert>
      ) : null}

      <Button type="submit" isLoading={pending}>
        {t("submitCta")}
      </Button>
    </form>
  );
}
