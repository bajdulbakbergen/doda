"use client";

import { useActionState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Alert } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { sendMessageAction, sendMessageIdleState } from "../actions/send-message";

export function MessageForm({ conversationId }: { conversationId: string }) {
  const t = useTranslations("messages.form");
  const [state, formAction, pending] = useActionState(sendMessageAction, sendMessageIdleState);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success" && textareaRef.current) {
      textareaRef.current.value = "";
    }
  }, [state]);

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-2">
      <input type="hidden" name="conversationId" value={conversationId} />
      <Textarea
        ref={textareaRef}
        name="body"
        placeholder={t("placeholder")}
        rows={3}
        maxLength={4000}
        onKeyDown={onKeyDown}
        required
      />
      <div className="flex items-center justify-between gap-3">
        <span className="text-foreground/50 text-xs">{t("hint")}</span>
        <Button type="submit" size="sm" isLoading={pending}>
          {t("sendCta")}
        </Button>
      </div>
      {state.status === "error" ? (
        <Alert variant="error">{t(`errors.${state.errorKey}`) ?? state.errorKey}</Alert>
      ) : null}
    </form>
  );
}
