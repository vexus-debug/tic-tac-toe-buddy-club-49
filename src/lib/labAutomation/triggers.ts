// Dental lab automation — trigger registry (Step 1 of Phase 1).
// Each trigger is a lab case event that can send a message to the clinic.

export const LAB_TRIGGERS = ["case_received", "case_on_hold", "case_dispatched"] as const;
export type LabTrigger = (typeof LAB_TRIGGERS)[number];
export type LabChannel = "sms" | "email";
export type LabRecipient = "doctor" | "clinic_desk";

export interface LabTriggerMeta {
  type: LabTrigger;
  title: string;
  /** When it fires, in plain words. */
  timing: string;
  /** Lab case status change that fires it. */
  fromStatus?: string[];
  toStatus: string;
  recipient: LabRecipient;
  /** Enabled out of the box for a new lab. */
  defaults: Record<LabChannel, boolean>;
}

export const LAB_TRIGGER_META: LabTriggerMeta[] = [
  { type: "case_received", title: "Case Received", timing: "Instant when a case is logged", toStatus: "pending", recipient: "clinic_desk", defaults: { sms: true, email: true } },
  { type: "case_on_hold", title: "Case On Hold", timing: "Instant when a case is put on hold", toStatus: "on_hold", recipient: "doctor", defaults: { sms: true, email: true } },
  { type: "case_dispatched", title: "Case Dispatched", timing: "Instant when a case leaves the lab", fromStatus: ["ready", "qc"], toStatus: "delivered", recipient: "clinic_desk", defaults: { sms: true, email: false } },
];

export type LabToggleKey = `${LabTrigger}_${LabChannel}`;
export type LabAutomationSettings = Record<LabToggleKey, boolean>;

export const toggleKey = (t: LabTrigger, c: LabChannel): LabToggleKey => `${t}_${c}`;

export function defaultLabSettings(): LabAutomationSettings {
  const out = {} as LabAutomationSettings;
  for (const m of LAB_TRIGGER_META) for (const c of ["sms", "email"] as const) out[toggleKey(m.type, c)] = m.defaults[c];
  return out;
}

/** Saved values win; anything missing falls back to the default. */
export function mergeLabSettings(saved?: Partial<Record<string, unknown>> | null): LabAutomationSettings {
  const out = defaultLabSettings();
  if (saved) for (const k of Object.keys(out) as LabToggleKey[]) if (typeof saved[k] === "boolean") out[k] = saved[k] as boolean;
  return out;
}

/** Which trigger (if any) a status change fires. Moving to the same status fires nothing. */
export function triggerForTransition(from: string | null | undefined, to: string): LabTrigger | null {
  if (from === to) return null;
  if (to === "on_hold") return "case_on_hold";
  if (to === "delivered") return "case_dispatched";
  if (to === "pending" && !from) return "case_received";
  return null;
}

/** Stable key so one event never sends the same message twice. */
export const labIdempotencyKey = (caseId: string, trigger: LabTrigger, channel: LabChannel, stamp: string) =>
  `lab:${caseId}:${trigger}:${channel}:${stamp}`;
