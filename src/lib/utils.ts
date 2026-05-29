import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getLocalTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseISONEUTRAL(dateStr: string): Date {
  if (!dateStr) return new Date();
  const datePart = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  const parts = datePart.split('-');
  if (parts.length < 3) return new Date(dateStr);
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return new Date(year, month, day, 12, 0, 0, 0);
}

export interface TagStyle {
  bgClass: string;
  textClass: string;
  borderClass: string;
  icon: string;
}

export function getTagStyle(tagName: string, customTags: { name: string; color: string; icon: string }[]): TagStyle {
  const found = customTags.find(
    (ct) => ct.name.trim().toLowerCase() === tagName.trim().toLowerCase()
  );

  const bg = found?.color || 'bg-orange-100';
  const icon = found?.icon || '🏷️';

  // Map light-mode color class to premium style
  let bgClass = bg;
  let textClass = 'text-slate-700 dark:text-slate-300';
  let borderClass = 'border-slate-200/50 dark:border-slate-800/40';

  if (bg.includes('orange')) {
    bgClass = 'bg-orange-50/80 dark:bg-orange-950/15';
    textClass = 'text-[#FF5722] dark:text-[#ff784e]';
    borderClass = 'border-orange-100/60 dark:border-orange-900/30';
  } else if (bg.includes('yellow')) {
    bgClass = 'bg-yellow-50/80 dark:bg-yellow-950/15';
    textClass = 'text-yellow-700 dark:text-yellow-400';
    borderClass = 'border-yellow-100/60 dark:border-yellow-900/30';
  } else if (bg.includes('pink')) {
    bgClass = 'bg-pink-50/80 dark:bg-pink-950/15';
    textClass = 'text-pink-600 dark:text-pink-400';
    borderClass = 'border-pink-100/60 dark:border-pink-900/30';
  } else if (bg.includes('purple')) {
    bgClass = 'bg-purple-50/80 dark:bg-purple-950/15';
    textClass = 'text-purple-600 dark:text-purple-450';
    borderClass = 'border-purple-100/60 dark:border-purple-900/30';
  } else if (bg.includes('emerald')) {
    bgClass = 'bg-emerald-50/80 dark:bg-emerald-950/15';
    textClass = 'text-emerald-700 dark:text-emerald-400';
    borderClass = 'border-emerald-100/60 dark:border-emerald-900/30';
  } else if (bg.includes('blue')) {
    bgClass = 'bg-blue-50/80 dark:bg-blue-950/15';
    textClass = 'text-blue-600 dark:text-blue-400';
    borderClass = 'border-blue-100/60 dark:border-blue-900/30';
  } else if (bg.includes('rose')) {
    bgClass = 'bg-rose-50/80 dark:bg-rose-950/15';
    textClass = 'text-rose-600 dark:text-rose-450';
    borderClass = 'border-rose-100/60 dark:border-rose-900/30';
  } else if (bg.includes('slate')) {
    bgClass = 'bg-slate-50/80 dark:bg-slate-900/30';
    textClass = 'text-slate-600 dark:text-slate-400';
    borderClass = 'border-slate-100/60 dark:border-slate-800/40';
  }

  return {
    bgClass,
    textClass,
    borderClass,
    icon,
  };
}

export function getSelectedTagClass(bgClass: string): string {
  if (bgClass.includes('orange')) return 'bg-orange-600 border-orange-600 text-white';
  if (bgClass.includes('yellow')) return 'bg-yellow-500 border-yellow-500 text-neutral-900';
  if (bgClass.includes('pink')) return 'bg-pink-600 border-pink-600 text-white';
  if (bgClass.includes('purple')) return 'bg-[#8B5CF6] border-[#8B5CF6] text-white';
  if (bgClass.includes('emerald')) return 'bg-[#10B981] border-[#10B981] text-white';
  if (bgClass.includes('blue')) return 'bg-[#3B82F6] border-[#3B82F6] text-white';
  if (bgClass.includes('rose')) return 'bg-rose-600 border-rose-600 text-white';
  if (bgClass.includes('slate')) return 'bg-slate-600 border-slate-600 text-white';
  return 'bg-[#FF5722] border-[#FF5722] text-white';
}
