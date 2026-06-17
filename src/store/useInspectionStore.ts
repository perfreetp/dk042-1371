import { create } from "zustand";
import type { AreaCheckResult, InspectionRecord } from "@/types";
import { inspectionAreas } from "@/data/areas";
import { mockBus } from "@/data/bus";
import { storage, defaultRecords, type PersistedRecords } from "@/utils/storage";

interface InspectionState {
  record: InspectionRecord | null;
  currentAreaIndex: number;
  selectedClassIds: string[];
  warningVisible: boolean;
  historyRecords: InspectionRecord[];

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
  addToHistory: (record: InspectionRecord) => void;
  clearHistory: () => void;
}

function createInitialAreas(): AreaCheckResult[] {
  return inspectionAreas.map((area) => ({
    areaId: area.id,
    emptySeats: 0,
    leftoverItems: [],
    checked: false,
  }));
}

function reviveDates(obj: any): any {
  if (!obj) return obj;
  if (Array.isArray(obj)) return obj.map(reviveDates);
  if (typeof obj !== "object") return obj;
  const result: any = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (key.includes("At") && typeof val === "string") {
      result[key] = new Date(val);
    } else if (key === "createdAt" && typeof val === "string") {
      result[key] = new Date(val);
    } else if (key === "areas" && Array.isArray(val)) {
      result[key] = val.map(reviveDates);
    } else {
      result[key] = reviveDates(val);
    }
  }
  return result;
}

const persistedState = storage.loadInspection<any>(null);
const persistedRecords = storage.loadRecords<PersistedRecords>(defaultRecords);

const initialRecord: InspectionRecord | null = persistedState?.record
  ? reviveDates(persistedState.record)
  : null;

export const useInspectionStore = create<InspectionState>((set, get) => ({
  record: initialRecord,
  currentAreaIndex: persistedState?.currentAreaIndex ?? 0,
  selectedClassIds: persistedState?.selectedClassIds ?? [],
  warningVisible: false,
  historyRecords: (persistedRecords.inspections || []).map(reviveDates),

  startInspection: () => {
    const { selectedClassIds, historyRecords } = get();
    const newRecord: InspectionRecord = {
      id: `inspection-${Date.now()}`,
      busId: mockBus.id,
      createdAt: new Date(),
      inspectorName: "李老师",
      classIds: selectedClassIds,
      areas: createInitialAreas(),
      completed: false,
    };
    set({
      record: newRecord,
      currentAreaIndex: 0,
      warningVisible: false,
    });
    storage.saveInspection({
      record: newRecord,
      currentAreaIndex: 0,
      selectedClassIds,
    });
    storage.saveRecords({ ...defaultRecords, ...persistedRecords, inspections: historyRecords });
  },

  selectClass: (classId, selected) => {
    set((state) => {
      const newClassIds = selected
        ? [...state.selectedClassIds, classId]
        : state.selectedClassIds.filter((id) => id !== classId);
      storage.saveInspection({
        record: state.record,
        currentAreaIndex: state.currentAreaIndex,
        selectedClassIds: newClassIds,
      });
      return { selectedClassIds: newClassIds };
    });
  },

  setCurrentArea: (index) => {
    set({ currentAreaIndex: index });
    const { record, selectedClassIds } = get();
    storage.saveInspection({
      record,
      currentAreaIndex: index,
      selectedClassIds,
    });
  },

  updateAreaResult: (areaId, result) => {
    set((state) => {
      if (!state.record) return state;
      const newRecord = {
        ...state.record,
        areas: state.record.areas.map((a) =>
          a.areaId === areaId ? { ...a, ...result } : a
        ),
      };
      storage.saveInspection({
        record: newRecord,
        currentAreaIndex: state.currentAreaIndex,
        selectedClassIds: state.selectedClassIds,
      });
      return { record: newRecord };
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
      get().setCurrentArea(currentAreaIndex + 1);
    }
  },

  goToPrevArea: () => {
    const { currentAreaIndex } = get();
    if (currentAreaIndex > 0) {
      get().setCurrentArea(currentAreaIndex - 1);
    }
  },

  setWarningVisible: (visible) => {
    set({ warningVisible: visible });
  },

  completeInspection: () => {
    set((state) => {
      if (!state.record) return state;
      const completedRecord: InspectionRecord = {
        ...state.record,
        completed: true,
        completedAt: new Date(),
      };
      const newHistory = [completedRecord, ...state.historyRecords].slice(0, 50);
      storage.saveInspection({
        record: completedRecord,
        currentAreaIndex: state.currentAreaIndex,
        selectedClassIds: state.selectedClassIds,
      });
      const records = storage.loadRecords<PersistedRecords>(defaultRecords);
      storage.saveRecords({ ...records, inspections: newHistory });
      return { record: completedRecord, historyRecords: newHistory };
    });
  },

  resetInspection: () => {
    set({
      record: null,
      currentAreaIndex: 0,
      selectedClassIds: [],
      warningVisible: false,
    });
    storage.clearInspection();
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

  addToHistory: (record) => {
    set((state) => {
      const newHistory = [record, ...state.historyRecords].slice(0, 50);
      const records = storage.loadRecords<PersistedRecords>(defaultRecords);
      storage.saveRecords({ ...records, inspections: newHistory });
      return { historyRecords: newHistory };
    });
  },

  clearHistory: () => {
    set({ historyRecords: [] });
    const records = storage.loadRecords<PersistedRecords>(defaultRecords);
    storage.saveRecords({ ...records, inspections: [] });
  },
}));
