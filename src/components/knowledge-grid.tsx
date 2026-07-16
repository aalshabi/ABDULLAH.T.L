"use client";

import * as React from "react";
import { BookOpen, Clock, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/i18n/provider";
import { articles, type KnowledgeCategory } from "@/lib/knowledge";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { Reveal } from "@/components/shared/reveal";

type Filter = "all" | KnowledgeCategory;

export function KnowledgeGrid() {
  const { t, locale } = useLanguage();
  const tk = t.knowledge;
  const [filter, setFilter] = React.useState<Filter>("all");

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: tk.categories.all },
    { key: "hotels", label: tk.categories.hotels },
    { key: "flights", label: tk.categories.flights },
    { key: "pricing", label: tk.categories.pricing },
    { key: "reviews", label: tk.categories.reviews },
  ];

  const visible = articles.filter((a) => filter === "all" || a.category === filter);

  return (
    <>
      <PageHeader icon={BookOpen} title={tk.title} subtitle={tk.subtitle} />
      <div className="container py-14">
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                filter === f.key
                  ? "bg-navy text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((a, i) => (
            <Reveal key={a.slug} index={i % 3}>
              <Card className="group h-full cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-teal/40 hover:shadow-xl hover:shadow-teal/5">
                <CardContent className="flex h-full flex-col p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <Badge variant="navy">{tk.categories[a.category]}</Badge>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3.5" />
                      <span className="ltr-nums">{a.readTime}</span> {tk.readTime}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold leading-snug text-foreground">
                    {a.title[locale]}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {a.excerpt[locale]}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-teal">
                    {tk.readArticle}
                    <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1 ltr:rotate-180 ltr:group-hover:translate-x-1" />
                  </span>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </>
  );
}
