/**
 * Shared pure helper for "included vs excluded" boolean signals (insurance,
 * visa, transfers). The EXCLUDED pattern is checked first because a negation
 * such as "غير مشمول" / "not included" contains the affirmative substring. When
 * neither a clear inclusion nor exclusion is found, returns null (no guess).
 */

export interface InclusionMatch {
  value: boolean;
  evidence: string;
}

export function detectInclusion(
  text: string,
  includeRe: RegExp,
  excludeRe: RegExp
): InclusionMatch | null {
  const ex = excludeRe.exec(text);
  if (ex) return { value: false, evidence: text.slice(ex.index, ex.index + ex[0].length) };

  const inc = includeRe.exec(text);
  if (inc) return { value: true, evidence: text.slice(inc.index, inc.index + inc[0].length) };

  return null;
}
