/**
 * Minimal, privacy-safe server error logging.
 *
 * Logs ONLY operational metadata for server-side failures. It never receives or
 * logs user text, evidence, file names, URLs, or any personal information — the
 * `ServerErrorLog` shape deliberately admits nothing else. No analytics, no
 * third-party monitoring in this phase.
 */

export interface ServerErrorLog {
  requestId: string;
  code: string;
  status: number;
  durationMs: number;
}

export function logServerError(entry: ServerErrorLog): void {
  // eslint-disable-next-line no-console
  console.error(
    JSON.stringify({
      level: "error",
      scope: "offer-api",
      requestId: entry.requestId,
      code: entry.code,
      status: entry.status,
      durationMs: entry.durationMs,
    })
  );
}
