import { describe, it, expect } from "vitest";
import { planLabDispatch, defaultLabSettings } from "@/lib/labAutomation";

const base = {
  caseId: "c1", stamp: "t1", settings: defaultLabSettings(),
  contacts: { phone: "08031234567", email: "dr@clinic.ng" },
  data: { lab_name: "Apex Lab", lab_phone: "08030000000", case_number: "L-101", patient_ref: "J.D", doctor_name: "Ade", clinic_name: "Smile", hold_reason: "Unclear margin" },
};

describe("lab dispatch plan", () => {
  it("on-hold sends both SMS and email by default", () => {
    expect(planLabDispatch({ ...base, trigger: "case_on_hold" }).sends.map((s) => s.channel)).toEqual(["sms", "email"]);
  });
  it("on-hold without a reason sends nothing", () => {
    const p = planLabDispatch({ ...base, trigger: "case_on_hold", data: { ...base.data, hold_reason: "" } });
    expect(p.sends).toHaveLength(0);
  });
  it("dispatched sends SMS only by default (email off)", () => {
    expect(planLabDispatch({ ...base, trigger: "case_dispatched" }).sends.map((s) => s.channel)).toEqual(["sms"]);
  });
  it("turned-off channel is skipped", () => {
    const p = planLabDispatch({ ...base, trigger: "case_received", settings: { ...base.settings, case_received_sms: false } });
    expect(p.sends.map((s) => s.channel)).toEqual(["email"]);
  });
  it("SMS never exceeds 160 characters", () => {
    const p = planLabDispatch({ ...base, trigger: "case_on_hold", data: { ...base.data, hold_reason: "x".repeat(150) } });
    expect(p.sends.find((s) => s.channel === "sms")).toBeUndefined();
  });
  it("same event gives the same don't-send-twice key", () => {
    const a = planLabDispatch({ ...base, trigger: "case_on_hold" }).sends[0].key;
    const b = planLabDispatch({ ...base, trigger: "case_on_hold" }).sends[0].key;
    expect(a).toBe(b);
  });
});
