import { createFeedbackHandler } from "@/lib/feedback/handler";
import { feedbackStore } from "@/lib/feedback/store";
import { feedbackRateLimiter } from "@/lib/feedback/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = createFeedbackHandler({
  store: feedbackStore,
  rateLimiter: feedbackRateLimiter,
});
