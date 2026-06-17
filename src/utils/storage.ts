const STORAGE_KEYS = {
  INSPECTION: "bus_inspection_state",
  ROLLCALL: "bus_rollcall_state",
  REVIEW: "bus_review_state",
  RECORDS: "bus_records_history",
} as const;

function safeParse<T>(data: string | null, fallback: T): T {
  if (!data) return fallback;
  try {
    return JSON.parse(data) as T;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
  }
}

function loadFromStorage<T>(key: string, fallback: T): T {
  const data = localStorage.getItem(key);
  return safeParse(data, fallback);
}

function removeFromStorage(key: string) {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error("Failed to remove from localStorage:", e);
  }
}

export const storage = {
  saveInspection: <T>(state: T) => saveToStorage(STORAGE_KEYS.INSPECTION, state),
  loadInspection: <T>(fallback: T) => loadFromStorage<T>(STORAGE_KEYS.INSPECTION, fallback),
  clearInspection: () => removeFromStorage(STORAGE_KEYS.INSPECTION),

  saveRollcall: <T>(state: T) => saveToStorage(STORAGE_KEYS.ROLLCALL, state),
  loadRollcall: <T>(fallback: T) => loadFromStorage<T>(STORAGE_KEYS.ROLLCALL, fallback),
  clearRollcall: () => removeFromStorage(STORAGE_KEYS.ROLLCALL),

  saveReview: <T>(state: T) => saveToStorage(STORAGE_KEYS.REVIEW, state),
  loadReview: <T>(fallback: T) => loadFromStorage<T>(STORAGE_KEYS.REVIEW, fallback),
  clearReview: () => removeFromStorage(STORAGE_KEYS.REVIEW),

  saveRecords: <T>(records: T) => saveToStorage(STORAGE_KEYS.RECORDS, records),
  loadRecords: <T>(fallback: T) => loadFromStorage<T>(STORAGE_KEYS.RECORDS, fallback),

  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach(removeFromStorage);
  },
};

export type PersistedRecords = {
  inspections: any[];
  rollcalls: any[];
  reviews: any[];
};

export const defaultRecords: PersistedRecords = {
  inspections: [],
  rollcalls: [],
  reviews: [],
};
