import { countSms } from "./smsCounter";

export const MERGE_TAGS = [
  "patient_name", "clinic_name", "clinic_phone", "appointment_date",
  "appointment_time", "doctor_name", "amount", "receipt_number", "balance",
] as const;
export type MergeTag = (typeof MERGE_TAGS)[number];
export type MergeData = Partial<Record<MergeTag, string | null | undefined>>;

export type RenderResult =
  | { ok: true; text: string; nameClamped?: boolean }
  | { ok: false; error: string; missing?: string[] };

const URL_RE = /(https?:\/\/|www\.)\S+|\b[a-z0-9-]+\.(com|ng|net|org|app|io|co)\b/i;
const REQUIRED: MergeTag[] = ["clinic_name", "clinic_phone"];
const SMS_SINGLE_LIMIT = 160;

/** Typographic characters that silently force UCS-2 (70 chars/credit), mapped to GSM-7 safe ASCII. */
const GSM_REPLACEMENTS: Record<string, string> = {
  "\u2018": "'", "\u2019": "'", "\u201A": "'", "\u201B": "'", "\u2032": "'",
  "\u201C": '"', "\u201D": '"', "\u201E": '"', "\u201F": '"', "\u2033": '"',
  "\u2013": "-", "\u2014": "-", "\u2012": "-", "\u2015": "-", "\u2010": "-", "\u2011": "-", "\u2212": "-",
  "\u00A0": " ", "\u2007": " ", "\u202F": " ", "\u2002": " ", "\u2003": " ", "\u2009": " ", "\u200A": " ",
  "\u200B": "", "\u200C": "", "\u200D": "", "\uFEFF": "",
  "\u2026": "...", "\u2022": "-", "\u00B7": "-",
};
const GSM_REPLACE_RE = new RegExp(`[${Object.keys(GSM_REPLACEMENTS).join("")}]`, "g");

/** Convert curly quotes, dashes, odd spaces etc. to GSM-7 safe equivalents. */
export function normalizeGsm(text: string): string {
  return text.replace(GSM_REPLACE_RE, (c) => GSM_REPLACEMENTS[c] ?? c);
}

/** First token of a name, e.g. "Oluwaseun Adebayo-Johnson" -> "Oluwaseun". */
export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name.trim();
}

function isEmpty(v: unknown): boolean {
  return v == null || String(v).trim() === "";
}

/** Remove the doctor clause when no doctor is assigned; fall back to "our clinical team" if it isn't a "with" clause. */
function handleOptionalDoctor(template: string, data: MergeData): string {
  if (!template.includes("{doctor_name}") || !isEmpty(data.doctor_name)) return template;
  const withoutClause = template.replace(/\s*\bwith\s+\{doctor_name\}/gi, "");
  return withoutClause.replace(/\{doctor_name\}/g, "our clinical team");
}

function fill(template: string, data: MergeData, missing: string[]): string {
  return template.replace(/\{(\w+)\}/g, (m, key: string) => {
    const v = (data as Record<string, string | null | undefined>)[key];
    if (isEmpty(v)) { missing.push(key); return m; }
    return String(v).trim();
  });
}

/**
 * Fill merge tags. Refuses to render when a used tag is empty, or (for SMS) when a link is present.
 * SMS: normalizes to GSM-7, and clamps patient_name to first name if the full name exceeds one credit.
 */
export function renderTemplate(template: string, data: MergeData, opts: { channel?: "sms" | "email" } = {}): RenderResult {
  const channel = opts.channel ?? "sms";
  const missingRequired = REQUIRED.filter((k) => isEmpty(data[k]));
  if (missingRequired.length) return { ok: false, error: "Clinic details incomplete", missing: missingRequired };

  const tpl = handleOptionalDoctor(template, data);
  const clean = (s: string) => (channel === "sms" ? normalizeGsm(s) : s);

  const missing: string[] = [];
  let text = clean(fill(tpl, data, missing));
  if (missing.length) return { ok: false, error: "Missing merge values", missing };
  if (channel === "sms" && URL_RE.test(text)) return { ok: false, error: "Links are not allowed in SMS" };

  let nameClamped = false;
  if (channel === "sms" && tpl.includes("{patient_name}") && countSms(text).length > SMS_SINGLE_LIMIT) {
    const short = firstName(String(data.patient_name));
    if (short !== String(data.patient_name).trim()) {
      text = clean(fill(tpl, { ...data, patient_name: short }, []));
      nameClamped = true;
    }
  }
  return nameClamped ? { ok: true, text, nameClamped } : { ok: true, text };
}

export function formatNaira(amount: number): string {
  return `N${Math.round(amount).toLocaleString("en-NG")}`;
}
