import type { OpeningRange } from "./menu";

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export interface ZonedMoment {
  weekday: Weekday;
  /** minutos desde 00:00 no fuso do restaurante */
  minutes: number;
}
export interface NextOpening {
  inDays: number;
  weekday: Weekday;
  opensAt: string;
}
export type OpenStatus =
  | { kind: "open"; closesAt: string }
  | { kind: "closed"; next: NextOpening | null };
export interface DaySchedule {
  weekday: Weekday;
  name: string;
  ranges: string[];
}

export const WEEKDAY_NAMES = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
] as const;
const SHORT_DAYS = ["dom.", "seg.", "ter.", "qua.", "qui.", "sex.", "sáb."] as const;
const WEEKDAY_INDEX: Record<string, Weekday> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

const formatters = new Map<string, Intl.DateTimeFormat>();
function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let formatter = formatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });
    formatters.set(timeZone, formatter);
  }
  return formatter;
}

export function zonedMoment(date: Date, timeZone: string): ZonedMoment {
  const parts = formatterFor(timeZone).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  const weekday = WEEKDAY_INDEX[get("weekday")];
  if (weekday === undefined) throw new Error(`Dia da semana inesperado para ${timeZone}`);
  return { weekday, minutes: (Number(get("hour")) % 24) * 60 + Number(get("minute")) };
}

function toMinutes(hhmm: string): number {
  const [h = 0, m = 0] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function currentRange(hours: OpeningRange[], at: ZonedMoment): OpeningRange | undefined {
  return hours.find((r) => {
    const opens = toMinutes(r.opensAt);
    const closes = toMinutes(r.closesAt);
    if (closes > opens) {
      return r.weekday === at.weekday && at.minutes >= opens && at.minutes < closes;
    }
    // faixa que passa da meia-noite
    return (
      (r.weekday === at.weekday && at.minutes >= opens) ||
      ((r.weekday + 1) % 7 === at.weekday && at.minutes < closes)
    );
  });
}

export function nextOpening(hours: OpeningRange[], at: ZonedMoment): NextOpening | null {
  for (let inDays = 0; inDays <= 7; inDays++) {
    const weekday = ((at.weekday + inDays) % 7) as Weekday;
    const opensAt = hours
      .filter((r) => r.weekday === weekday)
      .map((r) => r.opensAt)
      .sort()
      .find((o) => inDays > 0 || toMinutes(o) > at.minutes);
    if (opensAt) return { inDays, weekday, opensAt };
  }
  return null;
}

export function openStatusAt(hours: OpeningRange[], at: ZonedMoment): OpenStatus {
  const range = currentRange(hours, at);
  if (range) return { kind: "open", closesAt: range.closesAt };
  return { kind: "closed", next: nextOpening(hours, at) };
}

export function openStatus(hours: OpeningRange[], date: Date, timeZone: string): OpenStatus {
  return openStatusAt(hours, zonedMoment(date, timeZone));
}

export function formatHour(hhmm: string): string {
  const [h = "0", m = "00"] = hhmm.split(":");
  return m === "00" ? `${Number(h)}h` : `${Number(h)}h${m}`;
}

export function formatOpenStatus(status: OpenStatus): string {
  if (status.kind === "open") return `Aberto agora · fecha às ${formatHour(status.closesAt)}`;
  if (!status.next) return "Fechado";
  const { inDays, weekday, opensAt } = status.next;
  const when = inDays === 0 ? "hoje" : inDays === 1 ? "amanhã" : SHORT_DAYS[weekday];
  return `Fechado · abre ${when} às ${formatHour(opensAt)}`;
}

export function weeklySchedule(hours: OpeningRange[]): DaySchedule[] {
  const order: Weekday[] = [1, 2, 3, 4, 5, 6, 0];
  return order.map((weekday) => ({
    weekday,
    name: WEEKDAY_NAMES[weekday],
    ranges: hours
      .filter((r) => r.weekday === weekday)
      .sort((a, b) => toMinutes(a.opensAt) - toMinutes(b.opensAt))
      .map((r) => `${r.opensAt} – ${r.closesAt}`),
  }));
}
