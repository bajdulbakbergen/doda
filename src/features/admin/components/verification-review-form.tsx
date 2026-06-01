"use client";

import { useState, useTransition } from "react";
import { Alert } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import {
  approveVerificationAction,
  rejectVerificationAction,
} from "../actions/review-verification";

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
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <div className="space-y-3">
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Комментарий ревьюера (для reject обязателен)"
        rows={2}
        maxLength={500}
      />
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          isLoading={pending}
          onClick={() => submit(approveVerificationAction)}
        >
          ✓ Approve
        </Button>
        <Button
          type="button"
          size="sm"
          variant="danger"
          isLoading={pending}
          onClick={() => submit(rejectVerificationAction)}
        >
          × Reject
        </Button>
      </div>
      {error ? <Alert variant="error">{error}</Alert> : null}
    </div>
  );
}
