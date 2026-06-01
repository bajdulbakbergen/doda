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
export type DealRole = "customer" | "contractor";

/**
 * Кто подтверждает каждый переход (принимающая сторона):
 *   proposed  → contracted : customer (принимает условия)
 *   contracted → paid      : contractor (получил деньги)
 *   paid      → delivered  : customer (получил товар/услугу)
 *   delivered → closed     : любой
 */
const NEXT_STATUS: Partial<Record<Status, Status>> = {
  proposed: "contracted",
  contracted: "paid",
  paid: "delivered",
  delivered: "closed",
};

function canAdvance(status: Status, role: DealRole): boolean {
  if (status === "proposed") return role === "customer";
  if (status === "contracted") return role === "contractor";
  if (status === "paid") return role === "customer";
  if (status === "delivered") return true;
  return false;
}

export function DealActions({
  dealId,
  status,
  role,
}: {
  dealId: string;
  status: Status;
  role: DealRole;
}) {
  const next = NEXT_STATUS[status];

  if (status === "closed" || status === "cancelled") return null;

  return (
    <div className="space-y-4">
      {next && canAdvance(status, role) ? (
        <AdvanceForm dealId={dealId} nextStatus={next} />
      ) : next ? (
        <AwaitingOther status={status} role={role} />
      ) : null}
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

function AwaitingOther({ status, role }: { status: Status; role: DealRole }) {
  const t = useTranslations("deals.actions");
  const otherRole = role === "customer" ? "contractor" : "customer";
  return (
    <div className="border-foreground/10 bg-foreground/[0.02] rounded-xl border p-3 text-sm">
      <div className="text-foreground/55 text-xs font-medium uppercase tracking-wider">
        {t("awaitingTitle")}
      </div>
      <div className="text-foreground/80 mt-1">
        {t(`awaiting.${status}.${otherRole}`)}
      </div>
    </div>
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
