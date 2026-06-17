import { create } from "zustand";
import type { AreaCheckResult, InspectionRecord } from "@/types";
import { inspectionAreas } from "@/data/areas";
import { mockBus } from "@/data/bus";

interface InspectionState {
  record: InspectionRecord | null;
  currentAreaIndex: number;
  selectedClassIds: string[];
  warningVisible: boolean;

  startInspection: () => void;
  selectClass: (classId: string, selected: boolean) => void;
  setCurrentArea: (index: number) => void;
  updateAreaResult: (areaId: string, result: Partial<AreaCheckResult>) => void;
  confirmCurrentArea: () => void;
  goToNextArea: () => void;
  goToPrevArea: () => void;
  setWarningVisible: (visible: boolean) => void;
  completeInspection: () => void;
  resetInspection: () => void;
  getAllUncheckedAreas: () => string[];
  isAllAreasChecked: () => boolean;
  canStartInspection: () => boolean;
}

function createInitialAreas(): AreaCheckResult[] {
  return inspectionAreas.map((area) => ({
    areaId: area.id,
    emptySeats: 0,
    leftoverItems: [],
    checked: false,
  }));
}

export const useInspectionStore = create<InspectionState>((set, get) => ({
  record: null,
  currentAreaIndex: 0,
  selectedClassIds: [],
  warningVisible: false,

  startInspection: () => {
    const { selectedClassIds } = get();
    set({
      record: {
        id: `inspection-${Date.now()}`,
        busId: mockBus.id,
        createdAt: new Date(),
        inspectorName: "李老师",
        classIds: selectedClassIds,
        areas: createInitialAreas(),
        completed: false,
      },
      currentAreaIndex: 0,
      warningVisible: false,
    });
  },

  selectClass: (classId, selected) => {
    set((state) => {
      if (selected) {
        return { selectedClassIds: [...state.selectedClassIds, classId] };
      }
      return {
        selectedClassIds: state.selectedClassIds.filter((id) => id !== classId),
      };
    });
  },

  setCurrentArea: (index) => {
    set({ currentAreaIndex: index });
  },

  updateAreaResult: (areaId, result) => {
    set((state) => {
      if (!state.record) return state;
      return {
        record: {
          ...state.record,
          areas: state.record.areas.map((a) =>
            a.areaId === areaId ? { ...a, ...result } : a
          ),
        },
      };
    });
  },

  confirmCurrentArea: () => {
    const { record, currentAreaIndex } = get();
    if (!record) return;
    const currentArea = inspectionAreas[currentAreaIndex];
    get().updateAreaResult(currentArea.id, {
      checked: true,
      checkedAt: new Date(),
    });
  },

  goToNextArea: () => {
    const { currentAreaIndex } = get();
    if (currentAreaIndex < inspectionAreas.length - 1) {
      set({ currentAreaIndex: currentAreaIndex + 1 });
    }
  },

  goToPrevArea: () => {
    const { currentAreaIndex } = get();
    if (currentAreaIndex > 0) {
      set({ currentAreaIndex: currentAreaIndex - 1 });
    }
  },

  setWarningVisible: (visible) => {
    set({ warningVisible: visible });
  },

  completeInspection: () => {
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

  resetInspection: () => {
    set({
      record: null,
      currentAreaIndex: 0,
      selectedClassIds: [],
      warningVisible: false,
    });
  },

  getAllUncheckedAreas: () => {
    const { record } = get();
    if (!record) return inspectionAreas.map((a) => a.name);
    const uncheckedIds = record.areas
      .filter((a) => !a.checked)
      .map((a) => a.areaId);
    return inspectionAreas
      .filter((a) => uncheckedIds.includes(a.id))
      .map((a) => a.name);
  },

  isAllAreasChecked: () => {
    const { record } = get();
    if (!record) return false;
    return record.areas.every((a) => a.checked);
  },

  canStartInspection: () => {
    return get().selectedClassIds.length > 0;
  },
}));
