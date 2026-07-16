"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Mail, Lock, User, Info } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/provider";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/shared/logo";

export function AuthForm() {
  const { t } = useLanguage();
  const ta = t.auth;
  const router = useRouter();
  const params = useSearchParams();
  const [mode, setMode] = React.useState<"signin" | "signup">(
    params.get("mode") === "signup" ? "signup" : "signin"
  );
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const isSignup = mode === "signup";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    if (!supabase) {
      toast.info(ta.demoNote);
      return;
    }
    setLoading(true);
    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        if (error) throw error;
        toast.success(ta.success, { description: ta.checkEmail });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success(ta.success);
        router.push("/dashboard");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    const supabase = createClient();
    if (!supabase) {
      toast.info(ta.demoNote);
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  }

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
        <CardContent className="p-8">
          <div className="mb-6 flex flex-col items-center gap-3 text-center">
            <Logo showText={false} />
            <h1 className="font-display text-2xl font-extrabold text-foreground">
              {isSignup ? ta.signUpTitle : ta.signInTitle}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isSignup ? ta.signUpSubtitle : ta.signInSubtitle}
            </p>
          </div>

          {!isSupabaseConfigured && (
            <div className="mb-5 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
              <Info className="mt-0.5 size-4 shrink-0" />
              <span>{ta.demoNote}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="name">{ta.name}</Label>
                <div className="relative">
                  <User className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-muted-foreground" />
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="ps-10"
                    required
                  />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">{ta.email}</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="ps-10 ltr-nums"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{ta.password}</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="ps-10"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              {isSignup ? ta.signUpBtn : ta.signInBtn}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">{ta.orContinue}</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button type="button" variant="outline" size="lg" className="w-full" onClick={onGoogle}>
            <svg className="size-4" viewBox="0 0 24 24" aria-hidden>
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
              />
            </svg>
            {ta.google}
          </Button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isSignup ? ta.haveAccount : ta.noAccount}{" "}
            <button
              type="button"
              onClick={() => setMode(isSignup ? "signin" : "signup")}
              className="font-semibold text-teal hover:underline"
            >
              {isSignup ? ta.switchToSignIn : ta.switchToSignUp}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
