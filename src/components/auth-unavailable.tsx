"use client";

import Link from "next/link";
import { ArrowLeft, UserRoundX } from "lucide-react";
import { useLanguage } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/shared/logo";

export function AuthUnavailable() {
  const { t } = useLanguage();
  const auth = t.auth;

  return (
    <div className="relative flex min-h-[calc(100dvh-4rem)] items-center justify-center overflow-hidden bg-navy px-4 py-16">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(0,167,182,0.28), transparent 45%), radial-gradient(circle at 80% 70%, rgba(0,167,182,0.15), transparent 40%)",
        }}
      />
      <Card className="relative w-full max-w-md shadow-2xl">
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <Logo showText={false} />
            <div className="flex size-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400">
              <UserRoundX className="size-6" aria-hidden />
            </div>
            <h1 className="font-display text-2xl font-extrabold text-foreground">
              {auth.unavailableTitle}
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {auth.unavailableBody}
            </p>
            <Button asChild size="lg" className="mt-2">
              <Link href="/analyze-offer">
                {auth.unavailableAction}
                <ArrowLeft className="size-4 ltr:rotate-180" aria-hidden />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
