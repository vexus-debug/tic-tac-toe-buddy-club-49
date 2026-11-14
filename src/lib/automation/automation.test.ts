import { describe, it, expect } from "vitest";
import { sanitizeNigerianPhone } from "./phoneSanitizer";
import { countSms } from "./smsCounter";
import { renderTemplate } from "./templateEngine";
import { DEFAULT_SMS_TEMPLATES } from "./defaultTemplates";
import { buildIdempotencyKey } from "./idempotency";

const clinic = { clinic_name: "Apex Dental", clinic_phone: "08021234567" };

describe("phone sanitizer", () => {
  it("converts local and +234 formats", () => {
    expect(sanitizeNigerianPhone("0801 234 5678")).toBe("2348012345678");
    expect(sanitizeNigerianPhone("+234-801-234-5678")).toBe("2348012345678");
  });
  it("rejects short or invalid prefixes", () => {
    expect(sanitizeNigerianPhone("080123")).toBeNull();
    expect(sanitizeNigerianPhone("05012345678")).toBeNull();
  });
});

describe("sms counter", () => {
  it("160 GSM chars is 1 credit, 161 is 2", () => {
    expect(countSms("a".repeat(160)).segments).toBe(1);
    expect(countSms("a".repeat(161)).segments).toBe(2);
  });
  it("em dash switches to UCS-2 with a 70 limit", () => {
    const r = countSms("a".repeat(70) + "—");
    expect(r.encoding).toBe("UCS-2");
    expect(r.segments).toBe(2);
  });
});

describe("template engine", () => {
  it("blocks sending when clinic phone is missing", () => {
    expect(renderTemplate("{clinic_phone}", { clinic_name: "X" }).ok).toBe(false);
  });
  it("blocks links in SMS", () => {
    expect(renderTemplate("Visit clinexus.com", clinic).ok).toBe(false);
  });
  it("default SMS templates fit in one GSM-7 credit with realistic data", () => {
    const data = { ...clinic, doctor_name: "Dr. Amina", balance: "N0", patient_name: "Tunde", appointment_date: "Tue, Nov 11", appointment_time: "10:00 AM", amount: "N45,000", receipt_number: "INV-1042" };
    for (const t of Object.values(DEFAULT_SMS_TEMPLATES)) {
      const r = renderTemplate(t, data);
      expect(r.ok).toBe(true);
      if (r.ok) { const c = countSms(r.text); expect(c.encoding).toBe("GSM-7"); expect(c.segments).toBe(1); }
    }
  });
});

it("idempotency key is deterministic", () => {
  const p = { orgId: "o", workflow: "payment_receipt" as const, channel: "sms" as const, entityId: "i1" };
  expect(buildIdempotencyKey(p)).toBe(buildIdempotencyKey(p));
});
