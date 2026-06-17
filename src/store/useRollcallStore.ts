import { create } from "zustand";
import type { Child, ChildStatus, RollcallRecord } from "@/types";
import { mockChildren } from "@/data/children";
import { mockBus } from "@/data/bus";
import { storage, defaultRecords, type PersistedRecords } from "@/utils/storage";

interface RollcallState {
  record: RollcallRecord | null;
  allChildren: Child[];
  selectedClassIds: string[];
  historyRecords: RollcallRecord[];

  startRollcall: (classIds: string[]) => void;
  setChildStatus: (childId: string, status: ChildStatus) => void;
  resetChildStatus: (childId: string) => void;
  completeRollcall: () => void;
  resetRollcall: () => void;
  getFilteredChildren: () => Child[];
  getPendingChildren: () => Child[];
  getCompletedCount: () => number;
  getTotalCount: () => number;
  isRollcallComplete: () => boolean;
  addToHistory: (record: RollcallRecord) => void;
  clearHistory: () => void;
}

function reviveDates(obj: any): any {
  if (!obj) return obj;
  if (Array.isArray(obj)) return obj.map(reviveDates);
  if (typeof obj !== "object") return obj;
  const result: any = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if ((key.includes("At") || key === "createdAt") && typeof val === "string") {
      result[key] = new Date(val);
    } else if (Array.isArray(val)) {
      result[key] = val.map(reviveDates);
    } else {
      result[key] = reviveDates(val);
    }
  }
  return result;
}

const persistedState = storage.loadRollcall<any>(null);
const persistedRecords = storage.loadRecords<PersistedRecords>(defaultRecords);

let initialChildren: Child[] = persistedState?.allChildren
  ? persistedState.allChildren.map(reviveDates)
  : mockChildren;

const initialRecord: RollcallRecord | null = persistedState?.record
  ? reviveDates(persistedState.record)
  : null;

if (initialRecord && initialRecord.children.length > 0) {
  initialChildren = initialChildren.map((c) => {
    const match = initialRecord.children.find((rc) => rc.childId === c.id);
    return match ? { ...c, status: match.status } : c;
  });
}

export const useRollcallStore = create<RollcallState>((set, get) => ({
  record: initialRecord,
  allChildren: initialChildren,
  selectedClassIds: persistedState?.selectedClassIds ?? [],
  historyRecords: (persistedRecords.rollcalls || []).map(reviveDates),

  startRollcall: (classIds) => {
    const children = mockChildren.filter((c) => classIds.includes(c.classId));
    const initialC = children.map((c) => ({ ...c, status: "pending" as ChildStatus }));
    const newRecord: RollcallRecord = {
      id: `rollcall-${Date.now()}`,
      busId: mockBus.id,
      createdAt: new Date(),
      classIds,
      children: children.map((c) => ({
        childId: c.id,
        status: "pending" as ChildStatus,
      })),
      completed: false,
    };
    set({
      selectedClassIds: classIds,
      allChildren: initialC,
      record: newRecord,
    });
    storage.saveRollcall({
      selectedClassIds: classIds,
      allChildren: initialC,
      record: newRecord,
    });
  },

  setChildStatus: (childId, status) => {
    set((state) => {
      const updatedChildren = state.allChildren.map((c) =>
        c.id === childId ? { ...c, status, updatedAt: new Date() } : c
      );
      const updatedRecord = state.record
        ? {
            ...state.record,
            children: state.record.children.map((c) =>
              c.childId === childId ? { ...c, status } : c
            ),
          }
        : state.record;
      storage.saveRollcall({
        selectedClassIds: state.selectedClassIds,
        allChildren: updatedChildren,
        record: updatedRecord,
      });
      return { allChildren: updatedChildren, record: updatedRecord };
    });
  },

  resetChildStatus: (childId) => {
    get().setChildStatus(childId, "pending");
  },

  completeRollcall: () => {
    set((state) => {
      if (!state.record) return state;
      const completedRecord: RollcallRecord = {
        ...state.record,
        completed: true,
        completedAt: new Date(),
      };
      const newHistory = [completedRecord, ...state.historyRecords].slice(0, 50);
      storage.saveRollcall({
        selectedClassIds: state.selectedClassIds,
        allChildren: state.allChildren,
        record: completedRecord,
      });
      const records = storage.loadRecords<PersistedRecords>(defaultRecords);
      storage.saveRecords({ ...records, rollcalls: newHistory });
      return { record: completedRecord, historyRecords: newHistory };
    });
  },

  resetRollcall: () => {
    set({
      record: null,
      allChildren: mockChildren,
      selectedClassIds: [],
    });
    storage.clearRollcall();
  },

  getFilteredChildren: () => {
    const { allChildren, record, selectedClassIds } = get();
    const classIds = record && record.classIds.length > 0
      ? record.classIds
      : selectedClassIds;
    if (classIds.length === 0) return allChildren;
    return allChildren.filter((c) => classIds.includes(c.classId));
  },

  getPendingChildren: () => {
    return get().getFilteredChildren().filter((c) => c.status === "pending");
  },

  getCompletedCount: () => {
    return get()
      .getFilteredChildren()
      .filter((c) => c.status !== "pending").length;
  },

  getTotalCount: () => {
    return get().getFilteredChildren().length;
  },

  isRollcallComplete: () => {
    return get().getPendingChildren().length === 0;
  },

  addToHistory: (record) => {
    set((state) => {
      const newHistory = [record, ...state.historyRecords].slice(0, 50);
      const records = storage.loadRecords<PersistedRecords>(defaultRecords);
      storage.saveRecords({ ...records, rollcalls: newHistory });
      return { historyRecords: newHistory };
    });
  },

  clearHistory: () => {
    set({ historyRecords: [] });
    const records = storage.loadRecords<PersistedRecords>(defaultRecords);
    storage.saveRecords({ ...records, rollcalls: [] });
  },
}));
