export interface Bus {
  id: string;
  plateNumber: string;
  driverName: string;
  status: "running" | "stopped";
}

export interface ClassItem {
  id: string;
  name: string;
  color: string;
}

export type ChildStatus = "pending" | "picked_up" | "in_class" | "absent";

export interface Child {
  id: string;
  name: string;
  classId: string;
  avatar: string;
  status: ChildStatus;
  updatedAt?: Date;
}

export interface InspectionArea {
  id: string;
  name: string;
  icon: string;
  order: number;
  description: string;
}

export interface AreaCheckResult {
  areaId: string;
  emptySeats: number;
  leftoverItems: string[];
  checked: boolean;
  checkedAt?: Date;
}

export interface InspectionRecord {
  id: string;
  busId: string;
  createdAt: Date;
  inspectorName: string;
  classIds: string[];
  areas: AreaCheckResult[];
  completed: boolean;
  completedAt?: Date;
}

export interface RollcallRecord {
  id: string;
  busId: string;
  createdAt: Date;
  classIds: string[];
  children: { childId: string; status: ChildStatus }[];
  completed: boolean;
  completedAt?: Date;
}

export type ReviewMode = "signature_only" | "release";

export interface ReviewRecord {
  id: string;
  busId: string;
  createdAt: Date;
  reviewerName: string;
  signature: string;
  mode: ReviewMode;
  inspectionPassed: boolean;
  rollcallPassed: boolean;
  passed: boolean;
  releasedAt?: Date;
  notes?: string;
}

export const LEFTOVER_ITEMS = [
  { id: "bag", name: "书包", icon: "🎒" },
  { id: "cup", name: "水杯", icon: "🥤" },
  { id: "coat", name: "外套", icon: "🧥" },
  { id: "hat", name: "帽子", icon: "🧢" },
  { id: "toy", name: "玩具", icon: "🧸" },
  { id: "other", name: "其他物品", icon: "📦" },
] as const;

export const CHILD_STATUS_OPTIONS: {
  value: ChildStatus;
  label: string;
  icon: string;
  color: string;
}[] = [
  { value: "picked_up", label: "已交家长", icon: "👨‍👩‍👧", color: "bg-success-500" },
  { value: "in_class", label: "已进班", icon: "🏫", color: "bg-primary-500" },
  { value: "absent", label: "临时请假", icon: "📝", color: "bg-gray-500" },
];
