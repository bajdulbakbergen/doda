"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Alert } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { inviteToLotAction } from "../actions/invite-to-lot";
import type { InvitableLot } from "../queries/get-my-private-lots";

type Props = {
  invitableLots: InvitableLot[];
  inviteeId: string;
  inviteeName: string;
};

export function InvitePicker({ invitableLots, inviteeId, inviteeName }: Props) {
  const t = useTranslations("lotInvites.picker");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (invitableLots.length === 0) return null;

  function invite(lotId: string) {
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("lotId", lotId);
      fd.set("inviteeId", inviteeId);
      const res = await inviteToLotAction(fd);
      if (!res.ok) {
        setError(res.error);
      } else {
        setOpen(false);
        router.refresh();
      }
    });
  }

  if (!open) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        + {t("openCta")}
      </Button>
    );
  }

  return (
    <div className="border-foreground/10 bg-foreground/[0.02] space-y-3 rounded-2xl border p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold">{t("title", { name: inviteeName })}</div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-foreground/60 hover:text-foreground text-sm transition-colors"
        >
          ×
        </button>
      </div>
      <div className="space-y-2">
        {invitableLots.map((lot) => (
          <div
            key={lot.id}
            className="border-foreground/10 flex items-center justify-between gap-3 rounded-xl border bg-background p-3"
          >
            <div className="min-w-0 text-sm">
              <div className="truncate font-medium">{lot.title}</div>
              <div className="text-foreground/50 text-xs">{lot.status}</div>
            </div>
            <Button
              type="button"
              size="sm"
              isLoading={pending}
              onClick={() => invite(lot.id)}
            >
              {t("inviteCta")}
            </Button>
          </div>
        ))}
      </div>
      {error ? <Alert variant="error">{t(`errors.${error}`) ?? error}</Alert> : null}
    </div>
  );
}
