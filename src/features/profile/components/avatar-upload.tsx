"use client";

import { useActionState, useRef } from "react";
import { useTranslations } from "next-intl";
import { Alert } from "@/shared/ui/alert";
import { Avatar } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import {
  uploadAvatarAction,
  avatarIdleState,
} from "../actions/upload-avatar";

type Props = {
  currentUrl: string | null;
  displayName: string;
};

export function AvatarUpload({ currentUrl, displayName }: Props) {
  const t = useTranslations("account.avatar");
  const [state, formAction, pending] = useActionState(uploadAvatarAction, avatarIdleState);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={formAction} className="flex items-start gap-5">
      <Avatar src={currentUrl} alt={displayName} size={80} />

      <div className="flex-1 space-y-3">
        <div>
          <h3 className="text-sm font-medium">{t("title")}</h3>
          <p className="text-foreground/60 text-xs">{t("hint")}</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          name="avatar"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="sr-only"
          onChange={() => formRef.current?.requestSubmit()}
        />

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            isLoading={pending}
            onClick={() => fileInputRef.current?.click()}
          >
            {t("chooseFile")}
          </Button>
        </div>

        {state.status === "error" ? (
          <Alert variant="error">{t(`errors.${state.errorKey}`)}</Alert>
        ) : null}
        {state.status === "success" ? <Alert variant="success">{t("uploaded")}</Alert> : null}
      </div>
    </form>
  );
}
