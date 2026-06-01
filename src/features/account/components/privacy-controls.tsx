"use client";

import { useActionState, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Alert } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import {
  requestAccountDeletionAction,
  cancelAccountDeletionAction,
  deleteAccountIdleState,
} from "../actions/delete-account";
import { exportMyDataAction } from "../actions/export-data";

type Props = {
  existingDeletion: {
    scheduledFor: string;
    cancelledAt: string | null;
  } | null;
};

export function PrivacyControls({ existingDeletion }: Props) {
  const t = useTranslations("account.privacy");
  const [state, formAction, pending] = useActionState(
    requestAccountDeletionAction,
    deleteAccountIdleState,
  );
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [exporting, startExporting] = useTransition();
  const [exportError, setExportError] = useState<string | null>(null);

  function exportData() {
    setExportError(null);
    startExporting(async () => {
      const result = await exportMyDataAction();
      if (!result.ok) {
        setExportError(result.error);
        return;
      }
      const blob = new Blob([result.data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  const hasActiveDeletion = existingDeletion && !existingDeletion.cancelledAt;

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("exportTitle")}</h2>
        <p className="text-foreground/65 text-sm leading-relaxed">{t("exportBody")}</p>
        <Button variant="outline" onClick={exportData} isLoading={exporting}>
          {t("exportCta")}
        </Button>
        {exportError ? <Alert variant="error">{exportError}</Alert> : null}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("deleteTitle")}</h2>
        <p className="text-foreground/65 text-sm leading-relaxed">{t("deleteBody")}</p>

        {hasActiveDeletion ? (
          <Alert variant="warning">
            <div className="space-y-3">
              <div>
                {t.rich("deletionScheduled", {
                  date: new Date(existingDeletion!.scheduledFor).toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }),
                  strong: (chunks) => <strong>{chunks}</strong>,
                })}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () => {
                  await cancelAccountDeletionAction();
                  window.location.reload();
                }}
              >
                {t("cancelDeletion")}
              </Button>
            </div>
          </Alert>
        ) : showDeleteForm ? (
          <form action={formAction} className="border-foreground/15 space-y-3 rounded-xl border p-4">
            <Alert variant="warning">{t("graceWarning")}</Alert>
            <input type="hidden" name="expectedConfirm" value={t("confirmWord")} />
            <FormField
              label={t("confirmLabel")}
              htmlFor="confirm"
              hint={t("confirmHint")}
            >
              <Input id="confirm" name="confirm" required />
            </FormField>
            <FormField label={t("reasonLabel")} htmlFor="reason" hint={t("reasonHint")}>
              <Textarea id="reason" name="reason" rows={3} maxLength={500} />
            </FormField>
            {state.status === "error" ? (
              <Alert variant="error">{t(`errors.${state.errorKey}`) ?? state.errorKey}</Alert>
            ) : null}
            <div className="flex gap-2">
              <Button type="submit" variant="danger" isLoading={pending}>
                {t("deleteConfirmCta")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteForm(false)}
              >
                {t("cancel")}
              </Button>
            </div>
          </form>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowDeleteForm(true)}
            className="text-red-700 dark:text-red-300"
          >
            {t("deleteCta")}
          </Button>
        )}
      </section>
    </div>
  );
}
