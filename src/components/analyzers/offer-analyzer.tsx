"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Tag, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n/provider";
import {
  buildOfferInput,
  canSubmit,
  methodHasContent,
  validateText,
  validateUrl,
  type OfferInputValues,
} from "@/lib/offer-input/validation";
import type { OfferErrorCode, TravelOfferInput, TravelOfferInputType } from "@/lib/offer-input/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { TravelOfferInputSelector } from "@/components/offer-input/travel-offer-input-selector";
import { TextOfferInput } from "@/components/offer-input/text-offer-input";
import { FileOfferInput } from "@/components/offer-input/file-offer-input";
import { ImageOfferInput } from "@/components/offer-input/image-offer-input";
import { UrlOfferInput } from "@/components/offer-input/url-offer-input";
import { TravelOfferReview } from "@/components/offer-input/travel-offer-review";

export function OfferAnalyzer() {
  const { t } = useLanguage();
  const v1 = t.analyzeOffer.v1;

  const [step, setStep] = React.useState<"input" | "review">("input");
  const [method, setMethod] = React.useState<TravelOfferInputType>("text");
  const [text, setText] = React.useState("");
  const [url, setUrl] = React.useState("");
  const [pdf, setPdf] = React.useState<File | null>(null);
  const [image, setImage] = React.useState<File | null>(null);
  const [pending, setPending] = React.useState<TravelOfferInputType | null>(null);
  const [submitted, setSubmitted] = React.useState<TravelOfferInput | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const resultRef = React.useRef<HTMLDivElement>(null);

  const values: OfferInputValues = { text, url, pdf, image };

  React.useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  function clearMethod(m: TravelOfferInputType) {
    if (m === "text") setText("");
    else if (m === "url") setUrl("");
    else if (m === "pdf") setPdf(null);
    else setImage(null);
  }

  function performSwitch(next: TravelOfferInputType) {
    clearMethod(method); // enforce a single active method
    setMethod(next);
    setPending(null);
  }

  function onSelect(next: TravelOfferInputType) {
    if (next === method) return;
    if (methodHasContent(method, values)) setPending(next);
    else performSwitch(next);
  }

  function onStart(e: React.FormEvent) {
    e.preventDefault();
    const input = buildOfferInput(method, values, new Date());
    if (!input) return; // button is disabled when invalid; guard anyway
    if (input.type === "image" && image) {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(URL.createObjectURL(image));
    }
    setSubmitted(input);
    setStep("review");
    requestAnimationFrame(() =>
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
  }

  function onEdit() {
    setStep("input");
  }

  const textError: OfferErrorCode | null =
    text.trim().length > 0 && !validateText(text).ok
      ? (validateText(text) as { ok: false; code: OfferErrorCode }).code
      : null;
  const urlError: OfferErrorCode | null =
    url.trim().length > 0 && !validateUrl(url).ok
      ? (validateUrl(url) as { ok: false; code: OfferErrorCode }).code
      : null;

  const submittable = canSubmit(method, values);

  return (
    <>
      <PageHeader icon={Tag} title={v1.title} subtitle={v1.subtitle} />
      <div className="container -mt-8 pb-20">
        {step === "input" && (
          <Card className="mx-auto max-w-2xl shadow-xl">
            <CardContent className="p-6 md:p-8">
              <form onSubmit={onStart} className="space-y-5">
                <TravelOfferInputSelector method={method} onSelect={onSelect} />

                <div>
                  {method === "text" && <TextOfferInput value={text} onChange={setText} error={textError} />}
                  {method === "pdf" && <FileOfferInput file={pdf} onFile={setPdf} />}
                  {method === "image" && <ImageOfferInput file={image} onFile={setImage} />}
                  {method === "url" && <UrlOfferInput value={url} onChange={setUrl} error={urlError} />}
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={!submittable}>
                  <Sparkles className="size-4" />
                  {v1.startAnalysis}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div ref={resultRef} className="mx-auto mt-8 max-w-2xl scroll-mt-24">
          {step === "review" && submitted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <TravelOfferReview input={submitted} previewUrl={imagePreview} onEdit={onEdit} />
            </motion.div>
          )}
        </div>
      </div>

      {/* Switch-confirmation modal */}
      {pending && (
        <SwitchConfirm
          title={v1.switchTitle}
          body={v1.switchBody}
          confirmLabel={v1.switchConfirm}
          cancelLabel={v1.switchCancel}
          onConfirm={() => performSwitch(pending)}
          onCancel={() => setPending(null)}
        />
      )}
    </>
  );
}

function SwitchConfirm({
  title,
  body,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: {
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const confirmRef = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-navy/50 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="switch-title"
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="switch-title" className="font-display text-lg font-bold text-foreground">
          {title}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{body}</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button ref={confirmRef} type="button" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
