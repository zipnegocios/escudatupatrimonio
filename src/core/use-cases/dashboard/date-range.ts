export type DateRangePreset = "today" | "week" | "month" | "year";

export const DATE_RANGE_PRESETS: readonly DateRangePreset[] = ["today", "week", "month", "year"];

export function isDateRangePreset(value: string | undefined): value is DateRangePreset {
  return value !== undefined && (DATE_RANGE_PRESETS as readonly string[]).includes(value);
}

export interface DateRange {
  from: Date;
  to: Date;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// "to" siempre es el momento actual — todas las ventanas son "desde el inicio
// del período hasta ahora", no períodos cerrados del pasado.
export function resolveDateRange(preset: DateRangePreset, now: Date = new Date()): DateRange {
  const to = now;
  switch (preset) {
    case "today":
      return { from: startOfDay(now), to };
    case "week":
      return { from: new Date(startOfDay(now).getTime() - 6 * 24 * 60 * 60 * 1000), to };
    case "month":
      return { from: new Date(now.getFullYear(), now.getMonth(), 1), to };
    case "year":
      return { from: new Date(now.getFullYear(), 0, 1), to };
  }
}
