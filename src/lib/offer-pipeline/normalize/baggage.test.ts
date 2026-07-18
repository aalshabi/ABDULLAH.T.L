import { describe, it, expect } from "vitest";
import { normalizeBaggage } from "./baggage";

describe("normalizeBaggage", () => {
  it("canonicalizes weights (Arabic and English units)", () => {
    expect(normalizeBaggage("٢٠ كجم")).toBe("20kg");
    expect(normalizeBaggage("20 KG")).toBe("20kg");
    expect(normalizeBaggage("30 kilos")).toBe("30kg");
  });

  it("canonicalizes 'none' and 'cabin'", () => {
    expect(normalizeBaggage("بدون أمتعة")).toBe("none");
    expect(normalizeBaggage("no checked baggage")).toBe("none");
    expect(normalizeBaggage("حقيبة يد")).toBe("cabin");
    expect(normalizeBaggage("carry-on")).toBe("cabin");
  });

  it("is idempotent for canonical values", () => {
    expect(normalizeBaggage("20kg")).toBe("20kg");
    expect(normalizeBaggage("none")).toBe("none");
    expect(normalizeBaggage("cabin")).toBe("cabin");
  });
});
