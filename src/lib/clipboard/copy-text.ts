export type CopyTextResult =
  | { copied: true; method: "clipboard" | "fallback" }
  | { copied: false };

function canUseClipboard(): boolean {
  if (typeof navigator === "undefined") return false;
  if (typeof navigator.clipboard?.writeText !== "function") return false;
  return typeof window === "undefined" || window.isSecureContext !== false;
}

function copyWithFallback(text: string): CopyTextResult {
  if (
    typeof document === "undefined" ||
    !document.body ||
    typeof document.execCommand !== "function"
  ) {
    return { copied: false };
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.setAttribute("aria-hidden", "true");
  textarea.style.position = "fixed";
  textarea.style.insetInlineStart = "-9999px";
  textarea.style.top = "0";

  document.body.appendChild(textarea);

  try {
    textarea.focus();
    textarea.select();
    return document.execCommand("copy")
      ? { copied: true, method: "fallback" }
      : { copied: false };
  } catch {
    return { copied: false };
  } finally {
    textarea.remove();
  }
}

export async function copyText(text: string): Promise<CopyTextResult> {
  if (canUseClipboard()) {
    try {
      await navigator.clipboard.writeText(text);
      return { copied: true, method: "clipboard" };
    } catch {
      // Continue to the local fallback.
    }
  }

  return copyWithFallback(text);
}
