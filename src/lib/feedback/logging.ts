export interface FeedbackServerErrorLog {
  requestId: string;
  code: "STORAGE_UNAVAILABLE" | "INTERNAL_ERROR";
  status: 500;
  durationMs: number;
}

export function logFeedbackServerError(entry: FeedbackServerErrorLog): void {
  // eslint-disable-next-line no-console
  console.error(
    JSON.stringify({
      level: "error",
      scope: "feedback-api",
      requestId: entry.requestId,
      code: entry.code,
      status: entry.status,
      durationMs: entry.durationMs,
    })
  );
}
