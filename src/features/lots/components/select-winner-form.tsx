"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Alert } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import {
  selectWinnerAction,
  selectWinnerIdleState,
} from "../actions/select-winner";

type Props = {
  lotId: string;
  bidId: string;
};

export function SelectWinnerForm({ lotId, bidId }: Props) {
  const t = useTranslations("lots.actions");
  const [state, formAction, pending] = useActionState(selectWinnerAction, selectWinnerIdleState);

  return (
    <form action={formAction} className="inline-flex flex-col gap-2">
      <input type="hidden" name="lotId" value={lotId} />
      <input type="hidden" name="bidId" value={bidId} />
      <Button type="submit" size="sm" isLoading={pending}>
        {t("selectWinner")}
      </Button>
      {state.status === "error" ? (
        <Alert variant="error">{t(`errors.${state.errorKey}`) ?? state.errorKey}</Alert>
      ) : null}
    </form>
  );
}
