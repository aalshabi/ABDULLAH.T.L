"use client";

import * as React from "react";
import { MessageSquareText, ThumbsDown, ThumbsUp } from "lucide-react";
import { useLanguage } from "@/lib/i18n/provider";
import {
  FEEDBACK_COMMENT_MAX_CHARS,
  FEEDBACK_SCHEMA_VERSION,
  type FeedbackReasonCode,
  type FeedbackSubmission,
  type FeedbackValue,
} from "@/lib/feedback/schema";
import type { TravelOfferInputType } from "@/lib/offer-input/types";
import { formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type SubmissionStatus = "idle" | "submitting" | "success" | "error";

export function BetaFeedback({
  analysisRequestId,
  sourceType,
  alreadySubmitted = false,
  onSubmitted,
}: {
  analysisRequestId?: string;
  sourceType: TravelOfferInputType;
  alreadySubmitted?: boolean;
  onSubmitted?: () => void;
}) {
  const { t, locale } = useLanguage();
  const copy = t.analyzeOffer.v2.feedback;
  const [feedback, setFeedback] = React.useState<FeedbackValue | null>(null);
  const [reasonCode, setReasonCode] = React.useState<FeedbackReasonCode | null>(null);
  const [comment, setComment] = React.useState("");
  const [status, setStatus] = React.useState<SubmissionStatus>("idle");
  const submittingRef = React.useRef(false);

  const complete = alreadySubmitted || status === "success";
  const reasonOptions: Array<{ code: FeedbackReasonCode; label: string }> = [
    { code: "missed_information", label: copy.reasons.missedInformation },
    { code: "incorrect_information", label: copy.reasons.incorrectInformation },
    { code: "irrelevant_question", label: copy.reasons.irrelevantQuestion },
    { code: "missing_question", label: copy.reasons.missingQuestion },
    { code: "unclear_result", label: copy.reasons.unclearResult },
    { code: "other", label: copy.reasons.other },
  ];

  async function submit(value: FeedbackValue) {
    if (complete || submittingRef.current) return;
    submittingRef.current = true;
    setStatus("submitting");

    const safeComment = comment.slice(0, FEEDBACK_COMMENT_MAX_CHARS).trim();
    const payload: FeedbackSubmission = {
      ...(analysisRequestId ? { requestId: analysisRequestId } : {}),
      feedback: value,
      ...(value === "not_helpful" && reasonCode ? { reasonCode } : {}),
      ...(value === "not_helpful" && reasonCode === "other" && safeComment
        ? { comment: safeComment }
        : {}),
      locale,
      sourceType,
      schemaVersion: FEEDBACK_SCHEMA_VERSION,
    };

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        setStatus("error");
        return;
      }
      setStatus("success");
      onSubmitted?.();
    } catch {
      setStatus("error");
    } finally {
      submittingRef.current = false;
    }
  }

  if (complete) {
    return (
      <Card>
        <CardContent className="p-5">
          <p
            role="status"
            aria-live="polite"
            className="flex items-center gap-2 text-sm font-medium text-teal-700 dark:text-teal-300"
          >
            <MessageSquareText className="size-4 shrink-0" aria-hidden />
            {copy.thanks}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div>
          <h2 className="font-display text-base font-bold text-foreground">
            {copy.question}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{copy.optional}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFeedback("helpful");
              void submit("helpful");
            }}
            disabled={status === "submitting"}
            aria-pressed={feedback === "helpful"}
          >
            <ThumbsUp className="size-4" aria-hidden />
            {copy.yes}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFeedback("not_helpful");
              setStatus("idle");
            }}
            disabled={status === "submitting"}
            aria-pressed={feedback === "not_helpful"}
          >
            <ThumbsDown className="size-4" aria-hidden />
            {copy.no}
          </Button>
        </div>

        {feedback === "not_helpful" && (
          <div className="space-y-4">
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-foreground">
                {copy.reasonPrompt}
              </legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {reasonOptions.map((option) => (
                  <Label
                    key={option.code}
                    className="flex cursor-pointer items-start gap-2 rounded-lg border border-border p-3 text-sm font-normal"
                  >
                    <input
                      type="radio"
                      name="feedback-reason"
                      value={option.code}
                      checked={reasonCode === option.code}
                      onChange={() => {
                        setReasonCode(option.code);
                        if (option.code !== "other") setComment("");
                      }}
                      className="mt-0.5 size-4 accent-teal"
                    />
                    <span>{option.label}</span>
                  </Label>
                ))}
              </div>
            </fieldset>

            {reasonCode === "other" && (
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <Label htmlFor="feedback-comment">{copy.commentLabel}</Label>
                  <span className="text-xs text-muted-foreground">
                    {formatNumber(comment.length, locale)} /{" "}
                    {formatNumber(FEEDBACK_COMMENT_MAX_CHARS, locale)}
                  </span>
                </div>
                <Textarea
                  id="feedback-comment"
                  value={comment}
                  onChange={(event) =>
                    setComment(
                      event.target.value.slice(0, FEEDBACK_COMMENT_MAX_CHARS)
                    )
                  }
                  maxLength={FEEDBACK_COMMENT_MAX_CHARS}
                  placeholder={copy.commentPlaceholder}
                  className="min-h-24"
                />
              </div>
            )}

            <Button
              type="button"
              onClick={() => void submit("not_helpful")}
              disabled={status === "submitting"}
            >
              {status === "submitting" ? copy.sending : copy.submit}
            </Button>
          </div>
        )}

        <div role="status" aria-live="polite" className="min-h-5 text-sm">
          {status === "error" && (
            <span className="text-alarm">{copy.error}</span>
          )}
          {status === "submitting" && feedback === "helpful" && (
            <span className="text-muted-foreground">{copy.sending}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
