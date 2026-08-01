"use client";

import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/lib/i18n/provider";
import { Toaster } from "@/components/ui/sonner";
import { GuideProvider } from "@/components/guide/guide-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <LanguageProvider>
        <GuideProvider>{children}</GuideProvider>
        <Toaster />
      </LanguageProvider>
    </ThemeProvider>
  );
}
