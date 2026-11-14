import { describe, it, expect } from "vitest";
import { defaultLabSettings, mergeLabSettings, triggerForTransition, labIdempotencyKey, renderLabSms, LAB_SMS_TEMPLATES, LAB_TRIGGERS } from "@/lib/labAutomation";
import { countSms } from "@/lib/automation/smsCounter";

const base = { lab_name: "Apex Lab", lab_phone: "08030000000", case_number: "LC-2026-0042", patient_ref: "J.D.", work_type: "Zirconia crown", due_date: "20 Nov", clinic_name: "Smile Clinic", doctor_name: "Ade", hold_reason: "Unclear margin line" };

describe("lab automation step 1", () => {
  it("dispatch email is off by default, others on", () => {
    const s = defaultLabSettings();
    expect(s.case_dispatched_email).toBe(false);
    expect(s.case_on_hold_sms).toBe(true);
  });
  it("saved settings override defaults", () => {
    expect(mergeLabSettings({ case_on_hold_sms: false }).case_on_hold_sms).toBe(false);
  });
  it("maps status changes to triggers", () => {
    expect(triggerForTransition("design", "on_hold")).toBe("case_on_hold");
    expect(triggerForTransition("ready", "delivered")).toBe("case_dispatched");
    expect(triggerForTransition(null, "pending")).toBe("case_received");
    expect(triggerForTransition("on_hold", "on_hold")).toBeNull();
    expect(triggerForTransition("design", "milling")).toBeNull();
  });
  it("hold message refuses to send without a reason", () => {
    const r = renderLabSms("case_on_hold", { ...base, hold_reason: "" });
    expect(r).toEqual({ ok: false, missing: ["hold_reason"] });
  });
  it("hold message names reason and case", () => {
    const r = renderLabSms("case_on_hold", base);
    expect(r.ok && r.text).toContain("ON HOLD: Unclear margin line");
  });
  it("default SMS stays GSM-7 with no links", () => {
    for (const t of LAB_TRIGGERS) {
      expect(countSms(LAB_SMS_TEMPLATES[t]).encoding).toBe("GSM-7");
      expect(LAB_SMS_TEMPLATES[t]).not.toMatch(/https?:/);
    }
  });
  it("idempotency key is stable", () => {
    expect(labIdempotencyKey("c1", "case_on_hold", "sms", "t")).toBe("lab:c1:case_on_hold:sms:t");
  });
});
