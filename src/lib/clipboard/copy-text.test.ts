import { afterEach, describe, expect, it, vi } from "vitest";
import { copyText } from "./copy-text";

function setClipboard(value: { writeText: (text: string) => Promise<void> } | undefined) {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value,
  });
}

function setSecureContext(value: boolean) {
  Object.defineProperty(window, "isSecureContext", {
    configurable: true,
    value,
  });
}

function setExecCommand(value: ((command: string) => boolean) | undefined) {
  Object.defineProperty(document, "execCommand", {
    configurable: true,
    value,
  });
}

afterEach(() => {
  vi.restoreAllMocks();
  setClipboard(undefined);
  setExecCommand(undefined);
  setSecureContext(true);
  document.querySelectorAll("textarea[aria-hidden='true']").forEach((node) => {
    node.remove();
  });
});

describe("copyText", () => {
  it("uses Clipboard API writeText in a secure context", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setSecureContext(true);
    setClipboard({ writeText });
    const execCommand = vi.fn().mockReturnValue(true);
    setExecCommand(execCommand);

    await expect(copyText("safe text")).resolves.toEqual({
      copied: true,
      method: "clipboard",
    });
    expect(writeText).toHaveBeenCalledOnce();
    expect(writeText).toHaveBeenCalledWith("safe text");
    expect(execCommand).not.toHaveBeenCalled();
  });

  it("falls back locally when Clipboard API fails", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    setSecureContext(true);
    setClipboard({ writeText });
    const execCommand = vi.fn().mockImplementation(() => {
      expect(
        document.querySelector("textarea[aria-hidden='true']")
      ).not.toBeNull();
      return true;
    });
    setExecCommand(execCommand);

    await expect(copyText("fallback text")).resolves.toEqual({
      copied: true,
      method: "fallback",
    });
    expect(writeText).toHaveBeenCalledOnce();
    expect(execCommand).toHaveBeenCalledWith("copy");
  });

  it("uses fallback when Clipboard API is unavailable", async () => {
    setClipboard(undefined);
    const execCommand = vi.fn().mockReturnValue(true);
    setExecCommand(execCommand);

    await expect(copyText("fallback only")).resolves.toEqual({
      copied: true,
      method: "fallback",
    });
    expect(execCommand).toHaveBeenCalledWith("copy");
  });

  it("uses fallback instead of Clipboard API in an insecure context", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setSecureContext(false);
    setClipboard({ writeText });
    const execCommand = vi.fn().mockReturnValue(true);
    setExecCommand(execCommand);

    await expect(copyText("insecure fallback")).resolves.toEqual({
      copied: true,
      method: "fallback",
    });
    expect(writeText).not.toHaveBeenCalled();
    expect(execCommand).toHaveBeenCalledWith("copy");
  });

  it("always removes the temporary textarea", async () => {
    setClipboard(undefined);
    setExecCommand(vi.fn().mockReturnValue(true));

    await copyText("temporary");

    expect(
      document.querySelector("textarea[aria-hidden='true']")
    ).toBeNull();
  });

  it("returns copied false and still cleans up when both methods fail", async () => {
    setSecureContext(true);
    setClipboard({
      writeText: vi.fn().mockRejectedValue(new Error("denied")),
    });
    setExecCommand(vi.fn().mockReturnValue(false));

    await expect(copyText("cannot copy")).resolves.toEqual({
      copied: false,
    });
    expect(
      document.querySelector("textarea[aria-hidden='true']")
    ).toBeNull();
  });
});
