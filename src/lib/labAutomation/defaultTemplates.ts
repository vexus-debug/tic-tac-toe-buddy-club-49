import type { LabTrigger } from "./triggers";

/** Merge tags lab messages can use. */
export const LAB_MERGE_TAGS = [
  "lab_name", "lab_phone", "clinic_name", "doctor_name", "case_number", "patient_ref",
  "work_type", "units", "due_date", "hold_reason", "hold_note", "dispatch_note",
] as const;
export type LabMergeTag = (typeof LAB_MERGE_TAGS)[number];
export type LabMergeData = Partial<Record<LabMergeTag, string | number | null | undefined>>;

/** Tags every template needs or the message can't go out. */
export const LAB_REQUIRED_TAGS: Record<LabTrigger, LabMergeTag[]> = {
  case_received: ["lab_name", "lab_phone", "case_number"],
  case_on_hold: ["lab_name", "lab_phone", "case_number", "hold_reason"],
  case_dispatched: ["lab_name", "lab_phone", "case_number"],
};

/** SMS copy: GSM-7 only, no links, lab phone as the call to action. */
export const LAB_SMS_TEMPLATES: Record<LabTrigger, string> = {
  case_received:
    "[{lab_name}]: Case {case_number} ({work_type}) for {patient_ref} received. Expected ready by {due_date}. Questions? Call {lab_phone}.",
  case_on_hold:
    "[{lab_name}]: Dr. {doctor_name}, case {case_number} ({patient_ref}) is ON HOLD: {hold_reason}. Please call {lab_phone} so we can continue.",
  case_dispatched:
    "[{lab_name}]: Case {case_number} ({patient_ref}) has left the lab and is on its way to {clinic_name}. {dispatch_note} Call {lab_phone}.",
};

export const LAB_EMAIL_SUBJECTS: Record<LabTrigger, string> = {
  case_received: "Case {case_number} received by {lab_name}",
  case_on_hold: "Action needed: case {case_number} is on hold",
  case_dispatched: "Case {case_number} dispatched from {lab_name}",
};

/** Plain-text email body; the sender wraps it in the branded layout. */
export const LAB_EMAIL_BODIES: Record<LabTrigger, string> = {
  case_received:
    "Hello {clinic_name},\n\nWe have received case {case_number} for {patient_ref}: {units} unit(s) of {work_type}.\nExpected ready date: {due_date}.\n\nThank you,\n{lab_name} — {lab_phone}",
  case_on_hold:
    "Hello Dr. {doctor_name},\n\nCase {case_number} ({patient_ref}) is on hold at the lab.\nReason: {hold_reason}\n{hold_note}\n\nPlease reply or call {lab_phone} so we can continue production and keep your delivery date.\n\n{lab_name}",
  case_dispatched:
    "Hello {clinic_name},\n\nCase {case_number} ({patient_ref}) has been dispatched.\n{dispatch_note}\n\nThank you,\n{lab_name} — {lab_phone}",
};

export type LabRender = { ok: true; text: string } | { ok: false; missing: string[] };

/** Fill tags. Required tags must be present; optional empty tags are removed cleanly. */
export function renderLabTemplate(template: string, data: LabMergeData, required: LabMergeTag[] = []): LabRender {
  const missing = required.filter((t) => data[t] === undefined || data[t] === null || String(data[t]).trim() === "");
  if (missing.length) return { ok: false, missing };
  const text = template
    .replace(/\{(\w+)\}/g, (_, k) => String(data[k as LabMergeTag] ?? "").trim())
    .replace(/\(\s*\)/g, "")
    .replace(/Dr\.\s+,/g, "Doctor,")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/ +([.,])/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return { ok: true, text };
}

export function renderLabSms(trigger: LabTrigger, data: LabMergeData, custom?: string) {
  return renderLabTemplate(custom || LAB_SMS_TEMPLATES[trigger], data, LAB_REQUIRED_TAGS[trigger]);
}
