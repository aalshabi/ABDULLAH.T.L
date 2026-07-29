import { createFeedbackHandler } from "@/lib/feedback/handler";
import { feedbackStore } from "@/lib/feedback/store";
import { feedbackRateLimiter } from "@/lib/feedback/rate-limit";
import { isServerBetaFeedbackEnabled } from "@/lib/feedback/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = createFeedbackHandler({
  store: feedbackStore,
  rateLimiter: feedbackRateLimiter,
  enabled: isServerBetaFeedbackEnabled(),
});
