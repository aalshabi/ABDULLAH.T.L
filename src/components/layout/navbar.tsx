"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { LanguageToggle } from "@/components/shared/language-toggle";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export function Navbar() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => setOpen(false), [pathname]);

  const links = [
    { href: "/analyze-hotel", label: t.nav.analyzeHotel },
    { href: "/analyze-destination", label: t.nav.analyzeDestination },
    { href: "/analyze-offer", label: t.nav.analyzeOffer },
    { href: "/compare-hotels", label: t.nav.compareHotels },
    { href: "/knowledge", label: t.nav.knowledge },
    { href: "/dashboard", label: t.nav.dashboard },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border glass shadow-sm"
          : "bg-transparent"
      )}
    >
      <nav className="container flex h-16 items-center justify-between gap-4">
        <Logo />

        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                    active
                      ? "text-teal"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-1">
          <LanguageToggle />
          <ThemeToggle />
          <div className="hidden items-center gap-2 sm:flex">
            <Button asChild variant="ghost" size="sm">
              <Link href="/auth">{t.nav.signIn}</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/auth?mode=signup">{t.nav.getStarted}</Link>
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={t.nav.menu}
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          "lg:hidden overflow-hidden border-t border-border glass transition-[max-height] duration-300",
          open ? "max-h-[80vh]" : "max-h-0 border-t-0"
        )}
      >
        <ul className="container flex flex-col gap-1 py-4">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "block rounded-lg px-4 py-3 text-base font-semibold transition-colors",
                  pathname === link.href
                    ? "bg-teal/10 text-teal"
                    : "text-foreground hover:bg-muted"
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="mt-2 flex gap-2">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/auth">{t.nav.signIn}</Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href="/auth?mode=signup">{t.nav.getStarted}</Link>
            </Button>
          </li>
        </ul>
      </div>
    </header>
  );
}
