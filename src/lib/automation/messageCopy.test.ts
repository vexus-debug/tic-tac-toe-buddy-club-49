import { describe, it, expect } from "vitest";
import { countSms } from "./smsCounter";
import { renderTemplate, normalizeGsm, firstName } from "./templateEngine";
import { DEFAULT_SMS_TEMPLATES, type WorkflowType } from "./defaultTemplates";
import { renderEmail, escapeHtml } from "./emailTemplates";

const clinic = { clinic_name: "Apex Dental", clinic_phone: "08021234567" };
const full = { ...clinic, patient_name: "Tunde", doctor_name: "Dr. Amina", appointment_date: "Tue, Nov 11", appointment_time: "10:00 AM", amount: "N45,000", receipt_number: "INV-1042", balance: "N0" };

describe("GSM-7 normalization", () => {
  it("converts curly quotes, dashes, odd spaces and ellipsis", () => {
    expect(normalizeGsm("\u2018a\u2019 \u201Cb\u201D c\u2013d\u2014e f\u00A0g\u202Fh\u2026")).toBe("'a' \"b\" c-d-e f g h...");
  });
  it("pasted punctuation in data keeps SMS at 1 GSM-7 credit", () => {
    const r = renderTemplate(DEFAULT_SMS_TEMPLATES.booking_confirmation, { ...full, patient_name: "O\u2019Neil", doctor_name: "Dr. Ada\u2014Obi" });
    expect(r.ok).toBe(true);
    if (r.ok) { const c = countSms(r.text); expect(c.encoding).toBe("GSM-7"); expect(c.segments).toBe(1); expect(r.text).toContain("O'Neil"); }
  });
  it("email keeps original punctuation", () => {
    const r = renderTemplate("Hi {patient_name}", { ...clinic, patient_name: "O\u2019Neil" }, { channel: "email" });
    expect(r.ok && r.text).toBe("Hi O\u2019Neil");
  });
});

describe("doctor omission", () => {
  for (const empty of [undefined, null, "", "   "]) {
    it(`drops "with {doctor_name}" when doctor is ${JSON.stringify(empty)}`, () => {
      const r = renderTemplate(DEFAULT_SMS_TEMPLATES.booking_confirmation, { ...full, doctor_name: empty });
      expect(r.ok).toBe(true);
      if (r.ok) { expect(r.text).toContain("at 10:00 AM. To reschedule"); expect(r.text).not.toMatch(/with|\{|  /); }
    });
  }
  it("uses 'our clinical team' outside a with-clause", () => {
    const r = renderTemplate("Seen by {doctor_name}. Call {clinic_phone}", clinic);
    expect(r.ok && r.text).toBe("Seen by our clinical team. Call 08021234567");
  });
});

describe("patient name clamping", () => {
  it("firstName takes first token", () => expect(firstName("  Oluwaseun Adebayo-Johnson ")).toBe("Oluwaseun"));
  it("clamps to first name when full name pushes past 160", () => {
    const r = renderTemplate(DEFAULT_SMS_TEMPLATES.booking_confirmation, { ...full, patient_name: "Oluwaseun Adebayo-Johnson Okonkwo" });
    expect(r.ok).toBe(true);
    if (r.ok) { expect(r.nameClamped).toBe(true); expect(r.text).toContain("Hi Oluwaseun,"); expect(countSms(r.text).length).toBeLessThanOrEqual(160); }
  });
  it("keeps full name when it fits", () => {
    const r = renderTemplate(DEFAULT_SMS_TEMPLATES.hygiene_recall, { ...full, patient_name: "Ada Obi" });
    expect(r.ok && r.text).toContain("Hi Ada Obi,");
    expect(r.ok && r.nameClamped).toBeFalsy();
  });
});

describe("SMS guardrails", () => {
  for (const t of ["see http://x.ng", "go www.apex.ng", "visit apexdental.com"])
    it(`blocks link: ${t}`, () => expect(renderTemplate(t, clinic).ok).toBe(false));
  it("blocks when a used merge value is missing", () => {
    const r = renderTemplate(DEFAULT_SMS_TEMPLATES.payment_receipt, { ...clinic, amount: "N1" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.missing).toEqual(expect.arrayContaining(["receipt_number", "balance"]));
  });
});

describe("HTML emails", () => {
  const workflows: WorkflowType[] = ["booking_confirmation", "appointment_reminder", "payment_receipt", "hygiene_recall"];
  for (const w of workflows) {
    it(`${w} renders with no leftover tags and a tel: link`, () => {
      const r = renderEmail(w, full, { clinicAddress: "12 Allen Ave, Ikeja" });
      expect(r.ok).toBe(true);
      if (r.ok) {
        expect(r.subject).not.toMatch(/[{}]/);
        expect(r.html.replace(/<style[\s\S]*?<\/style>/g, "")).not.toMatch(/\{\w+\}/);
        expect(r.html).toContain('href="tel:08021234567"');
        expect(r.html).toContain("12 Allen Ave, Ikeja");
      }
    });
  }
  it("escapes HTML in patient data", () => {
    expect(escapeHtml(`<Ada & "Co">`)).toBe("&lt;Ada &amp; &quot;Co&quot;&gt;");
    const r = renderEmail("booking_confirmation", { ...full, patient_name: "<Ada & Co>" });
    expect(r.ok && r.html).toContain("&lt;Ada &amp; Co&gt;");
    expect(r.ok && r.html).not.toContain("<Ada");
  });
  it("omits the Doctor row when no doctor is assigned", () => {
    const r = renderEmail("booking_confirmation", { ...full, doctor_name: "" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.html).not.toContain(">Doctor<");
  });
  it("refuses to render when required data is missing", () => {
    expect(renderEmail("payment_receipt", { ...clinic, amount: "N1" }).ok).toBe(false);
    expect(renderEmail("hygiene_recall", { clinic_name: "X", patient_name: "A" }).ok).toBe(false);
  });
});
