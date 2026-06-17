import type { Child, ChildStatus } from "@/types";

const avatarColors = [
  "bg-primary-400",
  "bg-success-500",
  "bg-warning-500",
  "bg-blue-400",
  "bg-purple-400",
  "bg-pink-400",
  "bg-amber-400",
  "bg-teal-400",
];

const childNames = [
  "小明", "小红", "小华", "小丽", "小强", "小芳", "小军", "小燕",
  "小龙", "小凤", "小杰", "小敏", "小亮", "小雪", "小伟", "小娟",
  "小刚", "小美", "小鹏", "小英", "小涛", "小婷", "小辉", "小霞",
];

function generateAvatar(index: number): string {
  const emojis = ["👦", "👧", "🧒", "👶"];
  return emojis[index % emojis.length];
}

export const mockChildren: Child[] = childNames.map((name, index) => ({
  id: `child-${String(index + 1).padStart(3, "0")}`,
  name,
  classId: `class-00${(index % 6) + 1}`,
  avatar: generateAvatar(index),
  status: "pending" as ChildStatus,
})).slice(0, 20);

export { avatarColors };
