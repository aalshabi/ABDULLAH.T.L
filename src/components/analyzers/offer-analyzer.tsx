"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Tag, Sparkles, FileSearch, Info } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/provider";
import { ANALYSIS_DELAY_MS } from "@/lib/analysis/engine";
import { isOfferExtractionEnabled } from "@/lib/offer-extraction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { AnalyzerLoading } from "@/components/analyzers/analyzer-loading";
import { DemoNotice } from "@/components/shared/demo-notice";

export function OfferAnalyzer() {
  const { t } = useLanguage();
  const to = t.analyzeOffer;
  const u = to.upload;

  const [tab, setTab] = React.useState("upload");
  const [file, setFile] = React.useState<File | null>(null);
  const [text, setText] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const resultRef = React.useRef<HTMLDivElement>(null);

  const extractionEnabled = isOfferExtractionEnabled();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const hasInput = (tab === "upload" && file) || text.trim().length > 0;
    if (!hasInput) {
      toast.error(u.needInput);
      return;
    }
    setLoading(true);
    setSubmitted(false);
    await new Promise((r) => setTimeout(r, ANALYSIS_DELAY_MS));
    setLoading(false);
    // Extraction is disabled: we deliberately do NOT generate any analytical
    // report from the file (no OCR / no PDF parsing / no name-size heuristics).
    setSubmitted(true);
    requestAnimationFrame(() =>
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
  }

  return (
    <>
      <PageHeader icon={Tag} title={to.title} subtitle={to.subtitle} />
      <div className="container -mt-8 pb-20">
        <Card className="mx-auto max-w-2xl shadow-xl">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={onSubmit} className="space-y-5">
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">{u.tabUpload}</TabsTrigger>
                  <TabsTrigger value="paste">{u.tabPaste}</TabsTrigger>
                </TabsList>
                <TabsContent value="upload">
                  <FileDropzone
                    file={file}
                    onFile={setFile}
                    labels={{
                      dropTitle: u.dropTitle,
                      dropHint: u.dropHint,
                      browse: u.browse,
                      selected: u.selected,
                      remove: u.remove,
                      formatError: u.formatError,
                      sizeError: u.sizeError,
                    }}
                  />
                </TabsContent>
                <TabsContent value="paste">
                  <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={to.inputPlaceholder}
                    className="min-h-[160px]"
                  />
                </TabsContent>
              </Tabs>

              <div className="space-y-2">
                <Label htmlFor="offer-price">{to.priceLabel}</Label>
                <Input
                  id="offer-price"
                  type="number"
                  inputMode="numeric"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder={to.pricePlaceholder}
                  className="ltr-nums"
                />
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? (
                  u.extracting
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    {u.extractCta}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div ref={resultRef} className="mx-auto mt-8 max-w-2xl scroll-mt-24">
          {loading && <AnalyzerLoading />}
          {submitted && !loading && !extractionEnabled && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <DemoNotice />
              <Card>
                <CardContent className="flex flex-col items-center gap-4 p-8 text-center md:flex-row md:text-start">
                  <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-amber-500/10 text-amber-600">
                    <FileSearch className="size-7" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold text-foreground">
                      {t.demo.offerTitle}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {t.demo.offerBody}
                    </p>
                    {file && (
                      <p className="mt-3 inline-flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground">
                        <Info className="size-3.5" />
                        {u.selected}: <span className="font-medium text-foreground">{file.name}</span>
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
