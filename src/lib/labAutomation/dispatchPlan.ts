// Step 2: decides exactly which lab messages go out for one case event. Pure — no network.
import { sanitizeNigerianPhone } from "@/lib/automation/phoneSanitizer";
import { LAB_EMAIL_BODIES, LAB_EMAIL_SUBJECTS, renderLabSms, renderLabTemplate, LAB_REQUIRED_TAGS, type LabMergeData } from "./defaultTemplates";
import { labIdempotencyKey, toggleKey, type LabAutomationSettings, type LabChannel, type LabTrigger } from "./triggers";

export const SMS_MAX = 160;

export interface LabContacts { phone?: string | null; email?: string | null }
export type PlannedSend =
  | { channel: "sms"; to: string; text: string; key: string }
  | { channel: "email"; to: string; subject: string; text: string; key: string };
export interface Skip { channel: LabChannel; reason: string }

export function planLabDispatch(input: {
  caseId: string; trigger: LabTrigger; stamp: string;
  settings: LabAutomationSettings; data: LabMergeData; contacts: LabContacts;
}): { sends: PlannedSend[]; skipped: Skip[] } {
  const { caseId, trigger, stamp, settings, data, contacts } = input;
  const sends: PlannedSend[] = []; const skipped: Skip[] = [];

  if (settings[toggleKey(trigger, "sms")]) {
    const phone = contacts.phone ? sanitizeNigerianPhone(contacts.phone) : null;
    const r = renderLabSms(trigger, data);
    if (!phone) skipped.push({ channel: "sms", reason: "No valid phone number" });
    else if (!r.ok) skipped.push({ channel: "sms", reason: `Missing: ${r.missing.join(", ")}` });
    else if (r.text.length > SMS_MAX) skipped.push({ channel: "sms", reason: `Text too long (${r.text.length}/${SMS_MAX})` });
    else sends.push({ channel: "sms", to: phone, text: r.text, key: labIdempotencyKey(caseId, trigger, "sms", stamp) });
  } else skipped.push({ channel: "sms", reason: "Turned off" });

  if (settings[toggleKey(trigger, "email")]) {
    const email = contacts.email?.trim();
    const req = LAB_REQUIRED_TAGS[trigger];
    const s = renderLabTemplate(LAB_EMAIL_SUBJECTS[trigger], data, req);
    const b = renderLabTemplate(LAB_EMAIL_BODIES[trigger], data, req);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) skipped.push({ channel: "email", reason: "No valid email address" });
    else if (!s.ok || !b.ok) skipped.push({ channel: "email", reason: `Missing: ${(!s.ok ? s.missing : !b.ok ? b.missing : []).join(", ")}` });
    else sends.push({ channel: "email", to: email, subject: s.text, text: b.text, key: labIdempotencyKey(caseId, trigger, "email", stamp) });
  } else skipped.push({ channel: "email", reason: "Turned off" });

  return { sends, skipped };
}
