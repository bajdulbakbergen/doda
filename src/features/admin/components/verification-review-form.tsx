"use client";

import { useState, useTransition } from "react";
import { Alert } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import {
  approveVerificationAction,
  rejectVerificationAction,
} from "../actions/review-verification";

const ERROR_LABELS: Record<string, string> = {
  notes_required: "Комментарий обязателен (для approve и reject)",
  missing_id: "Не передан id заявки",
};

export function VerificationReviewForm({ verificationId }: { verificationId: string }) {
  const [notes, setNotes] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit(action: typeof approveVerificationAction) {
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", verificationId);
      fd.set("notes", notes);
      const res = await action(fd);
      if (!res.ok) setError(ERROR_LABELS[res.error] ?? res.error);
    });
  }

  return (
    <div className="space-y-3">
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Комментарий ревьюера (обязателен)"
        rows={2}
        maxLength={500}
      />
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          isLoading={pending}
          disabled={!notes.trim()}
          onClick={() => submit(approveVerificationAction)}
        >
          ✓ Approve
        </Button>
        <Button
          type="button"
          size="sm"
          variant="danger"
          isLoading={pending}
          disabled={!notes.trim()}
          onClick={() => submit(rejectVerificationAction)}
        >
          × Reject
        </Button>
      </div>
      {error ? <Alert variant="error">{error}</Alert> : null}
    </div>
  );
}
