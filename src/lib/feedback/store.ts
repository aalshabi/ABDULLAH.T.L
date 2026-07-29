import type { FeedbackRecord } from "./schema";

export interface FeedbackStore {
  save(record: Readonly<FeedbackRecord>): Promise<void>;
}

export class InMemoryFeedbackStore implements FeedbackStore {
  private records: FeedbackRecord[] = [];

  async save(record: Readonly<FeedbackRecord>): Promise<void> {
    this.records.push({ ...record });
  }

  getAll(): readonly FeedbackRecord[] {
    return this.records.map((record) => ({ ...record }));
  }

  reset(): void {
    this.records = [];
  }
}

export class NoopFeedbackStore implements FeedbackStore {
  async save(_record: Readonly<FeedbackRecord>): Promise<void> {
    return;
  }
}

export function createDefaultFeedbackStore(
  environment = process.env.NODE_ENV
): FeedbackStore {
  return environment === "production"
    ? new NoopFeedbackStore()
    : new InMemoryFeedbackStore();
}

export const feedbackStore = createDefaultFeedbackStore();
