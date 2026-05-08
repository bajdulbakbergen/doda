"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { Alert } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { advanceDealAction, dealActionIdleState } from "../actions/advance-deal";
import { cancelDealAction, cancelDealIdleState } from "../actions/cancel-deal";
import type { Database } from "@/lib/supabase/types";

type Status = Database["public"]["Enums"]["deal_status"];

const NEXT_STATUS: Partial<Record<Status, Status>> = {
  proposed: "contracted",
  contracted: "paid",
  paid: "delivered",
  delivered: "closed",
};

export function DealActions({
  dealId,
  status,
}: {
  dealId: string;
  status: Status;
}) {
  const next = NEXT_STATUS[status];

  if (status === "closed" || status === "cancelled") return null;

  return (
    <div className="space-y-4">
      {next ? <AdvanceForm dealId={dealId} nextStatus={next} /> : null}
      <CancelForm dealId={dealId} />
    </div>
  );
}

function AdvanceForm({ dealId, nextStatus }: { dealId: string; nextStatus: Status }) {
  const t = useTranslations("deals.actions");
  const [state, formAction, pending] = useActionState(advanceDealAction, dealActionIdleState);

  return (
    <form action={formAction}>
      <input type="hidden" name="dealId" value={dealId} />
      <input type="hidden" name="newStatus" value={nextStatus} />
      <Button type="submit" isLoading={pending} className="w-full">
        {t(`advance.${nextStatus}`)}
      </Button>
      {state.status === "error" ? (
        <div className="mt-2">
          <Alert variant="error">{t(`errors.${state.errorKey}`) ?? state.errorKey}</Alert>
        </div>
      ) : null}
    </form>
  );
}

function CancelForm({ dealId }: { dealId: string }) {
  const t = useTranslations("deals.actions");
  const [state, formAction, pending] = useActionState(cancelDealAction, cancelDealIdleState);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="text-red-700 hover:bg-red-50 hover:text-red-800 dark:text-red-300 dark:hover:bg-red-950/30 w-full"
      >
        {t("cancelOpen")}
      </Button>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="dealId" value={dealId} />
      <Textarea
        name="reason"
        placeholder={t("cancelReasonPlaceholder")}
        rows={3}
        maxLength={500}
      />
      <div className="flex gap-2">
        <Button
          type="submit"
          variant="danger"
          size="sm"
          isLoading={pending}
          className="flex-1"
        >
          {t("cancelConfirm")}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen(false)}
          className="flex-1"
        >
          {t("cancelDismiss")}
        </Button>
      </div>
      {state.status === "error" ? (
        <Alert variant="error">{t(`errors.${state.errorKey}`) ?? state.errorKey}</Alert>
      ) : null}
    </form>
  );
}
