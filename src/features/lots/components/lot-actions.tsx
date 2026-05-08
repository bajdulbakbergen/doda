"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Alert } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { closeLotAction, closeLotIdleState } from "../actions/close-lot";

type Props = {
  lotId: string;
};

export function CloseLotForm({ lotId }: Props) {
  const t = useTranslations("lots.actions");
  const [state, formAction, pending] = useActionState(closeLotAction, closeLotIdleState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="lotId" value={lotId} />
      <Button type="submit" variant="outline" size="sm" isLoading={pending}>
        {t("close")}
      </Button>
      {state.status === "error" ? (
        <Alert variant="error">{t(`errors.${state.errorKey}`) ?? state.errorKey}</Alert>
      ) : null}
    </form>
  );
}
