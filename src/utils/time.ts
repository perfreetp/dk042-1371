export function formatTime(date: Date): string {
  return date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatDateTime(date: Date): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}
