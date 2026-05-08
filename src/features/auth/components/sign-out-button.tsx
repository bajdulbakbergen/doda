"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/button";
import { signOutAction } from "../actions/sign-out";

export function SignOutButton({ className }: { className?: string }) {
  const t = useTranslations("auth");
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      isLoading={pending}
      onClick={() => startTransition(() => signOutAction())}
      className={className}
    >
      {t("signOut")}
    </Button>
  );
}
