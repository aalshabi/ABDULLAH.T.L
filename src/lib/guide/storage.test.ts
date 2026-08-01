import { describe, expect, it, vi } from "vitest";
import {
  DEFAULT_GUIDE_STATE,
  GUIDE_STORAGE_KEY,
  GUIDE_STORAGE_VERSION,
  parseGuideState,
  readGuideState,
  writeGuideState,
} from "./storage";

describe("guide local state", () => {
  it("uses only the approved SafrBwai guide key", () => {
    expect(GUIDE_STORAGE_KEY).toBe("safrbwai-guide-v1");
  });

  it("round-trips completion, skip, route, and version only", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };

    expect(writeGuideState({ completed: true, skipped: false, lastRoute: "/analyze-offer", version: 1 }, storage)).toBe(true);
    expect([...values.keys()]).toEqual([GUIDE_STORAGE_KEY]);
    expect(JSON.parse(values.get(GUIDE_STORAGE_KEY)!)).toEqual({
      completed: true,
      skipped: false,
      lastRoute: "/analyze-offer",
      version: GUIDE_STORAGE_VERSION,
    });
    expect(readGuideState(storage)).toEqual({
      completed: true,
      skipped: false,
      lastRoute: "/analyze-offer",
      version: GUIDE_STORAGE_VERSION,
    });
  });

  it("ignores extra sensitive-looking properties when writing", () => {
    const setItem = vi.fn();
    writeGuideState(
      {
        completed: false,
        skipped: true,
        version: 1,
        offerText: "secret",
        evidence: "secret",
        requestId: "secret",
      } as never,
      { getItem: () => null, setItem }
    );

    const serialized = setItem.mock.calls[0][1] as string;
    expect(serialized).not.toContain("secret");
    expect(Object.keys(JSON.parse(serialized)).sort()).toEqual(["completed", "skipped", "version"]);
  });

  it("falls back safely for corrupt JSON, unknown routes, and old versions", () => {
    expect(parseGuideState("not-json")).toEqual(DEFAULT_GUIDE_STATE);
    expect(parseGuideState(JSON.stringify({ completed: true, skipped: false, version: 0 }))).toEqual(DEFAULT_GUIDE_STATE);
    expect(parseGuideState(JSON.stringify({ completed: true, skipped: false, lastRoute: "/private", version: 1 }))).toEqual({
      completed: true,
      skipped: false,
      version: 1,
    });
  });

  it("keeps the guide usable when local storage reads or writes fail", () => {
    const unavailable = {
      getItem: () => { throw new DOMException("blocked"); },
      setItem: () => { throw new DOMException("quota"); },
    };
    expect(readGuideState(unavailable)).toEqual(DEFAULT_GUIDE_STATE);
    expect(writeGuideState(DEFAULT_GUIDE_STATE, unavailable)).toBe(false);
  });
});
