"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Alert } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { acceptInviteAction, declineInviteAction } from "../actions/respond-invite";

type Props = {
  inviteId: string;
  status: "pending" | "accepted";
};

export function InviteBanner({ inviteId, status }: Props) {
  const t = useTranslations("lotInvites.banner");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function respond(action: "accept" | "decline") {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("inviteId", inviteId);
      const res = action === "accept" ? await acceptInviteAction(fd) : await declineInviteAction(fd);
      if (res.ok) router.refresh();
    });
  }

  if (status === "accepted") {
    return <Alert variant="success">{t("accepted")}</Alert>;
  }

  return (
    <Alert variant="info">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span>{t("pending")}</span>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            isLoading={pending}
            onClick={() => respond("accept")}
          >
            {t("accept")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            isLoading={pending}
            onClick={() => respond("decline")}
          >
            {t("decline")}
          </Button>
        </div>
      </div>
    </Alert>
  );
}
