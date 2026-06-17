import { create } from "zustand";
import type { ReviewRecord } from "@/types";
import { mockBus } from "@/data/bus";

interface ReviewState {
  records: ReviewRecord[];
  currentRecord: ReviewRecord | null;
  signature: string;
  reviewerName: string;

  setSignature: (dataUrl: string) => void;
  clearSignature: () => void;
  setReviewerName: (name: string) => void;
  submitReview: (inspectionPassed: boolean, rollcallPassed: boolean) => void;
  resetReview: () => void;
  getLatestRecord: () => ReviewRecord | null;
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  records: [],
  currentRecord: null,
  signature: "",
  reviewerName: "",

  setSignature: (dataUrl) => {
    set({ signature: dataUrl });
  },

  clearSignature: () => {
    set({ signature: "" });
  },

  setReviewerName: (name) => {
    set({ reviewerName: name });
  },

  submitReview: (inspectionPassed, rollcallPassed) => {
    const { signature, reviewerName } = get();
    const passed = inspectionPassed && rollcallPassed;
    const record: ReviewRecord = {
      id: `review-${Date.now()}`,
      busId: mockBus.id,
      createdAt: new Date(),
      reviewerName: reviewerName || "值班人员",
      signature,
      inspectionPassed,
      rollcallPassed,
      passed,
    };
    set((state) => ({
      records: [...state.records, record],
      currentRecord: record,
    }));
  },

  resetReview: () => {
    set({
      currentRecord: null,
      signature: "",
      reviewerName: "",
    });
  },

  getLatestRecord: () => {
    const { records } = get();
    return records.length > 0 ? records[records.length - 1] : null;
  },
}));
