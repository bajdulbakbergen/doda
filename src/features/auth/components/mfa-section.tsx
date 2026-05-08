"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Alert } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { createClient } from "@/lib/supabase/client";

type Factor = {
  id: string;
  factor_type: string;
  status: "verified" | "unverified";
  friendly_name?: string | null;
};

type Enrollment = {
  factorId: string;
  qr: string;
  secret: string;
  uri: string;
};

export function MfaSection() {
  const t = useTranslations("security.mfa");
  const supabase = createClient();
  const [factors, setFactors] = useState<Factor[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function loadFactors() {
    const { data } = await supabase.auth.mfa.listFactors();
    const all = (data?.totp ?? []).map((f) => ({
      id: f.id,
      factor_type: f.factor_type,
      status: f.status,
      friendly_name: f.friendly_name,
    }));
    setFactors(all);
  }

  useEffect(() => {
    void loadFactors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startEnroll() {
    setError(null);
    setSuccess(null);
    const { data, error: err } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: `Doda ${new Date().toISOString().slice(0, 10)}`,
    });
    if (err || !data) {
      setError(err?.message ?? "unknown");
      return;
    }
    setEnrollment({
      factorId: data.id,
      qr: data.totp.qr_code,
      secret: data.totp.secret,
      uri: data.totp.uri,
    });
  }

  function verify() {
    if (!enrollment) return;
    setError(null);
    startTransition(async () => {
      const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({
        factorId: enrollment.factorId,
      });
      if (chErr || !ch) {
        setError(chErr?.message ?? "challenge_failed");
        return;
      }
      const { error: vErr } = await supabase.auth.mfa.verify({
        factorId: enrollment.factorId,
        challengeId: ch.id,
        code: code.trim(),
      });
      if (vErr) {
        setError(vErr.message);
        return;
      }
      setEnrollment(null);
      setCode("");
      setSuccess(t("enrolled"));
      await loadFactors();
    });
  }

  function unenroll(factorId: string) {
    setError(null);
    startTransition(async () => {
      const { error: err } = await supabase.auth.mfa.unenroll({ factorId });
      if (err) {
        setError(err.message);
        return;
      }
      setSuccess(t("unenrolled"));
      await loadFactors();
    });
  }

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">{t("title")}</h2>
        <p className="text-foreground/60 text-sm">{t("subtitle")}</p>
      </div>

      {factors.length > 0 ? (
        <div className="space-y-2">
          {factors.map((f) => (
            <div
              key={f.id}
              className="border-foreground/10 bg-foreground/[0.02] flex items-center justify-between gap-3 rounded-2xl border p-4"
            >
              <div className="text-sm">
                <div className="font-medium">{f.friendly_name ?? "TOTP"}</div>
                <div className="text-foreground/50 text-xs">
                  {f.status === "verified" ? "✓ " + t("verified") : "⚠ " + t("unverified")}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                isLoading={pending}
                onClick={() => unenroll(f.id)}
              >
                {t("remove")}
              </Button>
            </div>
          ))}
        </div>
      ) : null}

      {!enrollment ? (
        <Button type="button" variant="outline" onClick={startEnroll} isLoading={pending}>
          {t("addFactor")}
        </Button>
      ) : (
        <div className="border-foreground/10 bg-foreground/[0.02] space-y-4 rounded-2xl border p-5">
          <div>
            <h3 className="text-sm font-semibold">{t("scanQrTitle")}</h3>
            <p className="text-foreground/60 text-xs">{t("scanQrHint")}</p>
          </div>
          <div className="flex flex-wrap items-start gap-4">
            <div
              className="size-40 rounded-xl bg-white p-2"
              dangerouslySetInnerHTML={{ __html: enrollment.qr }}
            />
            <div className="flex-1 space-y-2 text-xs">
              <div>
                <div className="text-foreground/50">{t("manualSecret")}</div>
                <code className="bg-foreground/5 mt-1 block break-all rounded-lg px-2 py-1 font-mono text-xs">
                  {enrollment.secret}
                </code>
              </div>
            </div>
          </div>
          <FormField label={t("codeLabel")} htmlFor="mfa-code" hint={t("codeHint")}>
            <Input
              id="mfa-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              pattern="^\d{6}$"
              maxLength={6}
              autoComplete="one-time-code"
            />
          </FormField>
          <div className="flex gap-2">
            <Button
              onClick={verify}
              isLoading={pending}
              disabled={code.length !== 6}
            >
              {t("verifyCta")}
            </Button>
            <Button variant="outline" onClick={() => setEnrollment(null)}>
              {t("cancel")}
            </Button>
          </div>
        </div>
      )}

      {error ? <Alert variant="error">{error}</Alert> : null}
      {success ? <Alert variant="success">{success}</Alert> : null}
    </section>
  );
}
