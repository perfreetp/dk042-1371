import { create } from "zustand";
import type { ReviewRecord, ReviewMode } from "@/types";
import { mockBus } from "@/data/bus";
import { storage, defaultRecords, type PersistedRecords } from "@/utils/storage";

interface ReviewState {
  records: ReviewRecord[];
  currentRecord: ReviewRecord | null;
  signature: string;
  reviewerName: string;
  notes: string;

  setSignature: (dataUrl: string) => void;
  clearSignature: () => void;
  setReviewerName: (name: string) => void;
  setNotes: (notes: string) => void;
  submitReview: (
    inspectionPassed: boolean,
    rollcallPassed: boolean,
    mode: ReviewMode
  ) => ReviewRecord | null;
  resetReview: () => void;
  getLatestRecord: () => ReviewRecord | null;
  getLatestReleaseRecord: () => ReviewRecord | null;
  clearHistory: () => void;
}

function reviveDates(obj: any): any {
  if (!obj) return obj;
  if (Array.isArray(obj)) return obj.map(reviveDates);
  if (typeof obj !== "object") return obj;
  const result: any = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (
      (key.includes("At") || key === "createdAt") &&
      typeof val === "string"
    ) {
      result[key] = new Date(val);
    } else if (Array.isArray(val)) {
      result[key] = val.map(reviveDates);
    } else {
      result[key] = reviveDates(val);
    }
  }
  return result;
}

const persistedState = storage.loadReview<any>(null);
const persistedRecords = storage.loadRecords<PersistedRecords>(defaultRecords);

export const useReviewStore = create<ReviewState>((set, get) => ({
  records: (persistedRecords.reviews || []).map(reviveDates),
  currentRecord: persistedState?.currentRecord
    ? reviveDates(persistedState.currentRecord)
    : null,
  signature: persistedState?.signature || "",
  reviewerName: persistedState?.reviewerName || "",
  notes: persistedState?.notes || "",

  setSignature: (dataUrl) => {
    set({ signature: dataUrl });
    const { currentRecord, reviewerName, notes } = get();
    storage.saveReview({ signature: dataUrl, reviewerName, notes, currentRecord });
  },

  clearSignature: () => {
    set({ signature: "" });
    const { currentRecord, reviewerName, notes } = get();
    storage.saveReview({ signature: "", reviewerName, notes, currentRecord });
  },

  setReviewerName: (name) => {
    set({ reviewerName: name });
    const { currentRecord, signature, notes } = get();
    storage.saveReview({ signature, reviewerName: name, notes, currentRecord });
  },

  setNotes: (notes) => {
    set({ notes });
    const { currentRecord, signature, reviewerName } = get();
    storage.saveReview({ signature, reviewerName, notes, currentRecord });
  },

  submitReview: (inspectionPassed, rollcallPassed, mode) => {
    const { signature, reviewerName, records, notes } = get();
    if (!signature || !reviewerName.trim()) return null;

    const allPassed = inspectionPassed && rollcallPassed;
    const isRelease = mode === "release" && allPassed;

    const record: ReviewRecord = {
      id: `review-${Date.now()}`,
      busId: mockBus.id,
      createdAt: new Date(),
      reviewerName: reviewerName || "值班人员",
      signature,
      mode: isRelease ? "release" : "signature_only",
      inspectionPassed,
      rollcallPassed,
      passed: isRelease,
      releasedAt: isRelease ? new Date() : undefined,
      notes: notes || undefined,
    };

    const newRecords = [record, ...records].slice(0, 50);
    set({
      records: newRecords,
      currentRecord: record,
      signature: "",
      notes: "",
    });

    const recordPersist = storage.loadRecords<PersistedRecords>(defaultRecords);
    storage.saveRecords({ ...recordPersist, reviews: newRecords });
    storage.saveReview({
      signature: "",
      reviewerName,
      notes: "",
      currentRecord: record,
    });

    return record;
  },

  resetReview: () => {
    set({
      currentRecord: null,
      signature: "",
      notes: "",
    });
    const { reviewerName } = get();
    storage.saveReview({
      signature: "",
      reviewerName,
      notes: "",
      currentRecord: null,
    });
  },

  getLatestRecord: () => {
    const { records } = get();
    return records.length > 0 ? records[0] : null;
  },

  getLatestReleaseRecord: () => {
    const { records } = get();
    return records.find((r) => r.mode === "release") || null;
  },

  clearHistory: () => {
    set({ records: [] });
    const rec = storage.loadRecords<PersistedRecords>(defaultRecords);
    storage.saveRecords({ ...rec, reviews: [] });
  },
}));
