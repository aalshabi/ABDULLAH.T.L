import { describe, it, expect } from "vitest";
import { normalizeBoardCode } from "./board";

describe("normalizeBoardCode", () => {
  it("canonicalizes Arabic board phrases", () => {
    expect(normalizeBoardCode("شامل الإفطار")).toBe("BB");
    expect(normalizeBoardCode("نصف إقامة")).toBe("HB");
    expect(normalizeBoardCode("إقامة كاملة")).toBe("FB");
    expect(normalizeBoardCode("الكل شامل")).toBe("AI");
    expect(normalizeBoardCode("بدون وجبات")).toBe("RO");
  });

  it("canonicalizes English board phrases", () => {
    expect(normalizeBoardCode("bed and breakfast")).toBe("BB");
    expect(normalizeBoardCode("half board")).toBe("HB");
    expect(normalizeBoardCode("all inclusive")).toBe("AI");
  });

  it("is idempotent for canonical codes", () => {
    expect(normalizeBoardCode("bb")).toBe("BB");
    expect(normalizeBoardCode("FB")).toBe("FB");
  });
});
