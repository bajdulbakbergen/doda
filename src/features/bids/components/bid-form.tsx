"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Alert } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { calculateMaxAllowed, calculateMinStep, formatPrice } from "@/shared/lib/format";
import { submitBidAction, bidIdleState } from "../actions/submit-bid";

type Props = {
  lotId: string;
  currency: string;
  lowestBid: number | null;
  startingPrice: number | null;
  myCurrentAmount: number | null;
  myChangeCount: number;
};

export function BidForm({
  lotId,
  currency,
  lowestBid,
  startingPrice,
  myCurrentAmount,
  myChangeCount,
}: Props) {
  const t = useTranslations("bids.form");
  const [state, formAction, pending] = useActionState(submitBidAction, bidIdleState);

  const step = calculateMinStep(lowestBid);
  const maxAllowed = calculateMaxAllowed(lowestBid, startingPrice);

  const isMaxedOut = myCurrentAmount != null && myChangeCount >= 3;

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="lotId" value={lotId} />

      {myCurrentAmount != null ? (
        <div className="border-foreground/10 bg-foreground/[0.02] rounded-xl border px-4 py-3 text-sm">
          <div className="text-foreground/60 text-xs">{t("yourCurrentBid")}</div>
          <div className="font-medium">{formatPrice(myCurrentAmount, currency)}</div>
          <div className="text-foreground/50 mt-1 text-xs">
            {t("changesLeft", { count: 3 - myChangeCount })}
          </div>
        </div>
      ) : null}

      <FormField
        label={t("amountLabel")}
        htmlFor="amount"
        hint={
          maxAllowed != null
            ? t("amountHint", {
                max: formatPrice(maxAllowed, currency),
                step: formatPrice(step, currency),
              })
            : t("amountHintFirst")
        }
      >
        <Input
          id="amount"
          name="amount"
          type="number"
          inputMode="numeric"
          required
          min={1}
          step={1}
          max={maxAllowed ?? undefined}
          disabled={isMaxedOut}
        />
      </FormField>

      {state.status === "error" ? (
        <Alert variant="error">{t(`errors.${state.errorKey}`)}</Alert>
      ) : null}
      {state.status === "success" ? <Alert variant="success">{t("success")}</Alert> : null}

      <Button type="submit" isLoading={pending} disabled={isMaxedOut} className="w-full">
        {myCurrentAmount != null ? t("updateCta") : t("submitCta")}
      </Button>

      {isMaxedOut ? (
        <p className="text-foreground/60 text-xs">{t("changesExhausted")}</p>
      ) : null}
    </form>
  );
}
