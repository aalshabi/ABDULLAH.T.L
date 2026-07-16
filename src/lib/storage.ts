"use client";

export type AnalysisType = "hotel" | "destination" | "offer" | "compare";

export interface SavedAnalysis {
  id: string;
  type: AnalysisType;
  title: string;
  score: number;
  createdAt: number;
}

const KEY = "safer-bewae-analyses";
const MAX = 50;

function read(): SavedAnalysis[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedAnalysis[]) : [];
  } catch {
    return [];
  }
}

function write(items: SavedAnalysis[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items.slice(0, MAX)));
    window.dispatchEvent(new Event("safer-bewae-storage"));
  } catch {
    /* ignore quota errors */
  }
}

export function saveAnalysis(input: Omit<SavedAnalysis, "id" | "createdAt">) {
  const item: SavedAnalysis = {
    ...input,
    id: `${input.type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAt: Date.now(),
  };
  write([item, ...read()]);
  return item;
}

export function getAnalyses(): SavedAnalysis[] {
  return read();
}

export function clearAnalyses() {
  write([]);
}
