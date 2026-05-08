"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Alert } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Textarea } from "@/shared/ui/textarea";
import { submitReviewAction, reviewIdleState } from "../actions/submit-review";
import { StarRatingInput } from "./star-rating-input";

type Props = {
  dealId: string;
  revieweeId: string;
  revieweeName: string;
};

export function ReviewForm({ dealId, revieweeId, revieweeName }: Props) {
  const t = useTranslations("reviews.form");
  const [state, formAction, pending] = useActionState(submitReviewAction, reviewIdleState);

  if (state.status === "success") {
    return <Alert variant="success">{t("success")}</Alert>;
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="dealId" value={dealId} />
      <input type="hidden" name="revieweeId" value={revieweeId} />

      <div>
        <h3 className="text-base font-semibold">
          {t("title", { name: revieweeName })}
        </h3>
        <p className="text-foreground/60 text-xs">{t("subtitle")}</p>
      </div>

      <FormField label={t("ratingLabel")} htmlFor="rating">
        <StarRatingInput name="rating" required />
      </FormField>

      <FormField label={t("commentLabel")} htmlFor="comment" hint={t("commentHint")}>
        <Textarea id="comment" name="comment" rows={4} maxLength={1000} />
      </FormField>

      {state.status === "error" ? (
        <Alert variant="error">{t(`errors.${state.errorKey}`) ?? state.errorKey}</Alert>
      ) : null}

      <Button type="submit" isLoading={pending}>
        {t("submitCta")}
      </Button>
    </form>
  );
}
