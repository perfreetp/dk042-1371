import { create } from "zustand";
import type { Child, ChildStatus, RollcallRecord } from "@/types";
import { mockChildren } from "@/data/children";
import { mockBus } from "@/data/bus";

interface RollcallState {
  record: RollcallRecord | null;
  allChildren: Child[];
  selectedClassIds: string[];

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
}

export const useRollcallStore = create<RollcallState>((set, get) => ({
  record: null,
  allChildren: mockChildren,
  selectedClassIds: [],

  startRollcall: (classIds) => {
    const children = mockChildren.filter((c) => classIds.includes(c.classId));
    set({
      selectedClassIds: classIds,
      allChildren: children.map((c) => ({ ...c, status: "pending" as ChildStatus })),
      record: {
        id: `rollcall-${Date.now()}`,
        busId: mockBus.id,
        createdAt: new Date(),
        classIds,
        children: children.map((c) => ({
          childId: c.id,
          status: "pending" as ChildStatus,
        })),
        completed: false,
      },
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
      return { allChildren: updatedChildren, record: updatedRecord };
    });
  },

  resetChildStatus: (childId) => {
    get().setChildStatus(childId, "pending");
  },

  completeRollcall: () => {
    set((state) => {
      if (!state.record) return state;
      return {
        record: {
          ...state.record,
          completed: true,
          completedAt: new Date(),
        },
      };
    });
  },

  resetRollcall: () => {
    set({
      record: null,
      allChildren: mockChildren,
      selectedClassIds: [],
    });
  },

  getFilteredChildren: () => {
    const { allChildren, selectedClassIds } = get();
    if (selectedClassIds.length === 0) return allChildren;
    return allChildren.filter((c) => selectedClassIds.includes(c.classId));
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
}));
