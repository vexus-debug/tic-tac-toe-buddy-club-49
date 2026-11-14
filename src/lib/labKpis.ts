// Step 4: deterministic lab KPIs. Pure — pass `now` for repeatable results.
import { isWorkingDay, DEFAULT_WORK_CALENDAR, type WorkCalendar } from "@/lib/labCalendar";

export interface KpiCase {
  id: string;
  status: string;
  due_date?: string | null;
  delivered_date?: string | null;
  completed_date?: string | null;
  created_at?: string | null;
  parent_case_id?: string | null;
  hold_at?: string | null;
  hold_reason?: string | null;
  teeth?: string[] | null;
}

const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const day = (s?: string | null) => (s ? s.slice(0, 10) : "");
const HOUR = 36e5;

/** A due date on a closed day really means the next working day. */
export function effectiveDueYmd(due: string, cal: WorkCalendar = DEFAULT_WORK_CALENDAR): string {
  const d = new Date(due.slice(0, 10) + "T00:00:00");
  for (let i = 0; i < 30 && !isWorkingDay(d, cal); i++) d.setDate(d.getDate() + 1);
  return ymd(d);
}

/** On-time delivery % for cases delivered in the last `days` days. Cases without a due date are left out. Null when nothing qualifies. */
export function onTimeDelivery(cases: KpiCase[], opts: { now?: Date; days?: number; cal?: WorkCalendar } = {}) {
  const now = opts.now ?? new Date();
  const from = new Date(now); from.setDate(from.getDate() - (opts.days ?? 30));
  const fromY = ymd(from), toY = ymd(now);
  const delivered = cases.filter((c) => {
    const d = day(c.delivered_date || c.completed_date);
    return c.status === "delivered" && !!c.due_date && d >= fromY && d <= toY;
  });
  const onTime = delivered.filter((c) => day(c.delivered_date || c.completed_date) <= effectiveDueYmd(c.due_date!, opts.cal)).length;
  return { delivered: delivered.length, onTime, late: delivered.length - onTime, pct: delivered.length ? Math.round((onTime / delivered.length) * 100) : null };
}

export type Fault = "lab" | "clinic" | "material";
export interface RemakeClaim { case_id?: string | null; record_date?: string | null; data?: { fault?: string | null } | null }

/** Remakes opened ÷ originals delivered in the window, plus who was at fault. */
export function remakeSplit(cases: KpiCase[], claims: RemakeClaim[], opts: { now?: Date; days?: number } = {}) {
  const now = opts.now ?? new Date();
  const from = new Date(now); from.setDate(from.getDate() - (opts.days ?? 90));
  const fromY = ymd(from), toY = ymd(now);
  const inP = (s?: string | null) => { const d = day(s); return !!d && d >= fromY && d <= toY; };
  const live = cases.filter((c) => c.status !== "cancelled");
  const delivered = live.filter((c) => !c.parent_case_id && c.status === "delivered" && inP(c.delivered_date || c.completed_date)).length;
  const remakes = live.filter((c) => c.parent_case_id && inP(c.created_at)).length;
  const faults: Record<Fault, number> = { lab: 0, clinic: 0, material: 0 };
  for (const cl of claims) {
    const f = cl.data?.fault as Fault | undefined;
    if (f && f in faults && inP(cl.record_date)) faults[f]++;
  }
  const n = faults.lab + faults.clinic + faults.material;
  const share = (k: Fault) => (n ? Math.round((faults[k] / n) * 100) : 0);
  return {
    delivered, remakes, pct: delivered ? Math.round((remakes / delivered) * 1000) / 10 : 0,
    faults, share: { lab: share("lab"), clinic: share("clinic"), material: share("material") },
  };
}

/** Hours a case has been on hold (0 when not on hold). */
export const holdHours = (c: KpiCase, now = new Date()) =>
  c.status === "on_hold" && c.hold_at ? Math.max(0, (now.getTime() - new Date(c.hold_at).getTime()) / HOUR) : 0;

export const STALLED_HOURS = 24;

/** Cases on hold, how many waited over 24h, and the average wait. Oldest first. */
export function holdAging(cases: KpiCase[], now = new Date()) {
  const held = cases.filter((c) => c.status === "on_hold")
    .map((c) => ({ c, hours: holdHours(c, now) }))
    .sort((a, b) => b.hours - a.hours);
  const stalled = held.filter((h) => h.hours > STALLED_HOURS);
  const avg = held.length ? held.reduce((a, h) => a + h.hours, 0) / held.length : 0;
  return { count: held.length, stalled: stalled.length, avgHours: Math.round(avg * 10) / 10, rows: held };
}

/** "3h", "2d 4h". */
export function formatHold(hours: number) {
  if (hours < 1) return "<1h";
  if (hours < 24) return `${Math.floor(hours)}h`;
  const d = Math.floor(hours / 24), h = Math.floor(hours % 24);
  return h ? `${d}d ${h}h` : `${d}d`;
}

/** Open cases and restoration units (teeth, min 1 per case) still in the lab. */
export function inFlight(cases: KpiCase[]) {
  const open = cases.filter((c) => !["delivered", "cancelled", "remake_spawned"].includes(c.status));
  return { cases: open.length, units: open.reduce((a, c) => a + Math.max(1, c.teeth?.length || 0), 0) };
}

export const VELOCITY_STAGES = ["design", "milling", "ceramics", "qc"] as const;
export interface StatusChange { case_id: string; from_status: string | null; to_status: string | null; created_at: string }

/** Average hours a case spends in each bench stage, from the status history. Unfinished stays are left out. */
export function stageVelocity(history: StatusChange[]) {
  const byCase = new Map<string, StatusChange[]>();
  for (const h of history) { if (!h.to_status) continue; (byCase.get(h.case_id) ?? byCase.set(h.case_id, []).get(h.case_id)!).push(h); }
  const sums: Record<string, { total: number; n: number }> = {};
  for (const s of VELOCITY_STAGES) sums[s] = { total: 0, n: 0 };
  for (const list of byCase.values()) {
    list.sort((a, b) => a.created_at.localeCompare(b.created_at));
    for (let i = 0; i < list.length - 1; i++) {
      const st = list[i].to_status!;
      if (!(st in sums)) continue;
      sums[st].total += (new Date(list[i + 1].created_at).getTime() - new Date(list[i].created_at).getTime()) / HOUR;
      sums[st].n++;
    }
  }
  return VELOCITY_STAGES.map((s) => ({ stage: s, avgHours: sums[s].n ? Math.round((sums[s].total / sums[s].n) * 10) / 10 : null, samples: sums[s].n }));
}
