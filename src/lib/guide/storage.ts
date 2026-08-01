import { isGuideRoute } from "./selectors";
import type { GuideRoute } from "./types";

export const GUIDE_STORAGE_KEY = "safrbwai-guide-v1";
export const GUIDE_STORAGE_VERSION = 1;

export type GuideStorageState = Readonly<{
  completed: boolean;
  skipped: boolean;
  lastRoute?: GuideRoute;
  version: number;
}>;

export const DEFAULT_GUIDE_STATE: GuideStorageState = Object.freeze({
  completed: false,
  skipped: false,
  version: GUIDE_STORAGE_VERSION,
});

type StorageAccess = Pick<Storage, "getItem" | "setItem">;

function browserStorage(): StorageAccess | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function parseGuideState(raw: string | null): GuideStorageState {
  if (!raw) return DEFAULT_GUIDE_STATE;

  try {
    const value = JSON.parse(raw) as Record<string, unknown>;
    if (
      value.version !== GUIDE_STORAGE_VERSION ||
      typeof value.completed !== "boolean" ||
      typeof value.skipped !== "boolean"
    ) {
      return DEFAULT_GUIDE_STATE;
    }

    const lastRoute =
      typeof value.lastRoute === "string" && isGuideRoute(value.lastRoute)
        ? value.lastRoute
        : undefined;

    return {
      completed: value.completed,
      skipped: value.skipped,
      ...(lastRoute ? { lastRoute } : {}),
      version: GUIDE_STORAGE_VERSION,
    };
  } catch {
    return DEFAULT_GUIDE_STATE;
  }
}

export function readGuideState(storage: StorageAccess | null = browserStorage()): GuideStorageState {
  if (!storage) return DEFAULT_GUIDE_STATE;
  try {
    return parseGuideState(storage.getItem(GUIDE_STORAGE_KEY));
  } catch {
    return DEFAULT_GUIDE_STATE;
  }
}

export function writeGuideState(
  state: GuideStorageState,
  storage: StorageAccess | null = browserStorage()
): boolean {
  if (!storage) return false;
  try {
    const safeState: GuideStorageState = {
      completed: state.completed,
      skipped: state.skipped,
      ...(state.lastRoute ? { lastRoute: state.lastRoute } : {}),
      version: GUIDE_STORAGE_VERSION,
    };
    storage.setItem(GUIDE_STORAGE_KEY, JSON.stringify(safeState));
    return true;
  } catch {
    return false;
  }
}
