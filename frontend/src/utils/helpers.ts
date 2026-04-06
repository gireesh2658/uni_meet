import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday } from "date-fns";

export const formatDate = (date: string | Date): string => {
  return format(new Date(date), "EEE, dd MMM yyyy");
};

export const formatTime = (time: string): string => time;

export const formatRelativeTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const diff = Date.now() - date.getTime();
  if (diff < 60000) return "Just now";
  return formatDistanceToNow(date, { addSuffix: true });
};

export const getGreeting = (): string => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

export const getInitials = (name: string): string => {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
};

export const getAvatarColor = (name: string): string => {
  const colors = [
    "bg-primary", "bg-secondary", "bg-success", "bg-warning",
    "bg-destructive", "bg-indigo-500", "bg-violet-500", "bg-emerald-500"
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

export const truncate = (str: string, len: number): string => {
  return str.length > len ? str.slice(0, len) + "…" : str;
};
