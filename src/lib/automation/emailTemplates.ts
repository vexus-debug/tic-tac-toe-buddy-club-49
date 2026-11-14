import type { WorkflowType } from "./defaultTemplates";
import { DEFAULT_EMAIL_SUBJECTS } from "./defaultTemplates";
import { renderTemplate, type MergeData, type MergeTag } from "./templateEngine";

export type EmailRenderResult =
  | { ok: true; subject: string; html: string }
  | { ok: false; error: string; missing?: string[] };

export interface EmailOptions {
  clinicAddress?: string;
  logoUrl?: string;
  unsubscribeText?: string;
}

/** Escape user-supplied values so names like "<Ada>" can't break the email markup. */
export function escapeHtml(v: string): string {
  return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

interface Spec {
  banner: string;
  intro: string;
  rows: [string, string][];
  note?: string;
  cta: string;
}

const SPECS: Record<WorkflowType, Spec> = {
  booking_confirmation: {
    banner: "Appointment confirmed",
    intro: "Hi {patient_name}, your appointment at {clinic_name} is booked. We look forward to seeing you.",
    rows: [["Date", "{appointment_date}"], ["Time", "{appointment_time}"], ["Doctor", "{doctor_name}"]],
    note: "Please arrive 10 minutes early. To reschedule, call us.",
    cta: "Call to reschedule",
  },
  appointment_reminder: {
    banner: "Your visit is tomorrow",
    intro: "Hi {patient_name}, this is a friendly reminder of your visit to {clinic_name} tomorrow.",
    rows: [["Time", "{appointment_time}"]],
    note: "Please arrive 10 minutes early. Need help? Our front desk is happy to assist.",
    cta: "Call the clinic",
  },
  payment_receipt: {
    banner: "Payment received",
    intro: "Thank you. We have received your payment to {clinic_name}.",
    rows: [["Invoice", "#{receipt_number}"], ["Amount paid", "{amount}"], ["Balance", "{balance}"]],
    note: "Keep this email for your records. For billing questions, call our desk.",
    cta: "Billing questions? Call us",
  },
  hygiene_recall: {
    banner: "Time for your check-up",
    intro: "Hi {patient_name}, it has been 6 months since your last dental clean at {clinic_name}.",
    rows: [],
    note: "Regular cleans keep your smile healthy and catch problems early.",
    cta: "Call to book your check-up",
  },
};

const C = { brand: "#0f766e", ink: "#1f2937", muted: "#6b7280", bg: "#f3f4f6", card: "#f9fafb", line: "#e5e7eb" };
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

function layout(p: { clinic: string; phone: string; tel: string; spec: Spec; rows: [string, string][]; intro: string; note?: string; opts: EmailOptions }): string {
  const { clinic, phone, tel, spec, rows, intro, note, opts } = p;
  const header = opts.logoUrl
    ? `<img src="${escapeHtml(opts.logoUrl)}" alt="${clinic}" height="40" style="display:block;border:0;height:40px;">`
    : `<span style="font-size:20px;font-weight:700;color:#ffffff;">${clinic}</span>`;
  const rowsHtml = rows.length
    ? `<tr><td style="padding:0 32px 24px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.card};border:1px solid ${C.line};border-radius:8px;">${rows
        .map(([k, v], i) => `<tr><td style="padding:12px 16px;font-size:14px;color:${C.muted};${i ? `border-top:1px solid ${C.line};` : ""}">${k}</td><td align="right" style="padding:12px 16px;font-size:15px;font-weight:600;color:${C.ink};${i ? `border-top:1px solid ${C.line};` : ""}">${v}</td></tr>`)
        .join("")}</table></td></tr>`
    : "";
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${spec.banner}</title></head>
<body style="margin:0;padding:0;background:${C.bg};font-family:${FONT};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg};"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;">
<tr><td style="background:${C.brand};padding:20px 32px;">${header}</td></tr>
<tr><td style="padding:28px 32px 8px;"><h1 style="margin:0;font-size:22px;line-height:1.3;color:${C.ink};">${spec.banner}</h1></td></tr>
<tr><td style="padding:8px 32px 24px;font-size:15px;line-height:1.6;color:${C.ink};">${intro}</td></tr>
${rowsHtml}
${note ? `<tr><td style="padding:0 32px 24px;font-size:14px;line-height:1.6;color:${C.muted};">${note}</td></tr>` : ""}
<tr><td align="center" style="padding:0 32px 32px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:${C.brand};border-radius:8px;"><a href="tel:${tel}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">${spec.cta}: ${phone}</a></td></tr></table></td></tr>
<tr><td style="padding:20px 32px;border-top:1px solid ${C.line};font-size:12px;line-height:1.6;color:${C.muted};text-align:center;">
<strong>${clinic}</strong>${opts.clinicAddress ? `<br>${escapeHtml(opts.clinicAddress)}` : ""}<br>${phone}<br><br>${escapeHtml(opts.unsubscribeText ?? "You received this because you are a patient of this clinic. To stop these emails, reply STOP or call the clinic.")}
</td></tr></table></td></tr></table></body></html>`;
}

/** Render a branded, mobile-friendly HTML email for a workflow. Refuses to render if any used merge value is missing. */
export function renderEmail(workflow: WorkflowType, data: MergeData, opts: EmailOptions = {}): EmailRenderResult {
  const spec = SPECS[workflow];
  const rawSubject = renderTemplate(DEFAULT_EMAIL_SUBJECTS[workflow], data, { channel: "email" });
  if (!rawSubject.ok) return rawSubject;

  const safe: MergeData = {};
  for (const [k, v] of Object.entries(data)) if (v != null) safe[k as MergeTag] = escapeHtml(String(v));

  const rows: [string, string][] = [];
  const missing: string[] = [];
  for (const [label, tpl] of spec.rows) {
    if (tpl === "{doctor_name}" && !String(data.doctor_name ?? "").trim()) continue; // optional doctor
    const r = renderTemplate(tpl, safe, { channel: "email" });
    if (!r.ok) { missing.push(...(r.missing ?? [])); continue; }
    rows.push([label, r.text]);
  }
  const intro = renderTemplate(spec.intro, safe, { channel: "email" });
  if (!intro.ok) missing.push(...(intro.missing ?? []));
  if (missing.length || !intro.ok) return { ok: false, error: "Missing merge values", missing: [...new Set(missing)] };

  const phone = safe.clinic_phone as string;
  const html = layout({
    clinic: safe.clinic_name as string, phone, tel: String(data.clinic_phone).replace(/[^\d+]/g, ""),
    spec, rows, intro: intro.text, note: spec.note, opts,
  });
  return { ok: true, subject: rawSubject.text, html };
}
