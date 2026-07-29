import type { FeedbackRecord } from "./schema";

export type FeedbackSaveResult =
  | { stored: true }
  | { stored: false; reason: "disabled" };

export interface FeedbackStore {
  save(record: Readonly<FeedbackRecord>): Promise<FeedbackSaveResult>;
}

export class InMemoryFeedbackStore implements FeedbackStore {
  private records: FeedbackRecord[] = [];

  async save(record: Readonly<FeedbackRecord>): Promise<FeedbackSaveResult> {
    this.records.push({ ...record });
    return { stored: true };
  }

  getAll(): readonly FeedbackRecord[] {
    return this.records.map((record) => ({ ...record }));
  }

  reset(): void {
    this.records = [];
  }
}

export class DisabledFeedbackStore implements FeedbackStore {
  async save(_record: Readonly<FeedbackRecord>): Promise<FeedbackSaveResult> {
    return { stored: false, reason: "disabled" };
  }
}

export function createDefaultFeedbackStore(
  environment = process.env.NODE_ENV
): FeedbackStore {
  return environment === "production"
    ? new DisabledFeedbackStore()
    : new InMemoryFeedbackStore();
}

export const feedbackStore = createDefaultFeedbackStore();
