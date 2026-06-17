import type { InspectionArea } from "@/types";

export const inspectionAreas: InspectionArea[] = [
  {
    id: "area-front",
    name: "车头区域",
    icon: "🚗",
    order: 1,
    description: "司机座位、副驾驶、车门附近",
  },
  {
    id: "area-front-seats",
    name: "前排座位",
    icon: "🪑",
    order: 2,
    description: "前两排座椅及下方",
  },
  {
    id: "area-middle",
    name: "中部区域",
    icon: "🚍",
    order: 3,
    description: "中间排座椅及过道",
  },
  {
    id: "area-back-seats",
    name: "后排座位",
    icon: "🛋️",
    order: 4,
    description: "后两排座椅及下方",
  },
  {
    id: "area-back",
    name: "车尾区域",
    icon: "🚐",
    order: 5,
    description: "最后排、后车门、后备箱",
  },
  {
    id: "area-aisle",
    name: "过道检查",
    icon: "🚶",
    order: 6,
    description: "全车过道、台阶",
  },
  {
    id: "area-gaps",
    name: "座椅缝隙",
    icon: "🔍",
    order: 7,
    description: "座椅之间、靠背缝隙",
  },
];
