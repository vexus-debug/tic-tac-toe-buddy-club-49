import { describe, it, expect } from "vitest";
import { onTimeDelivery, remakeSplit, holdAging, inFlight, stageVelocity, effectiveDueYmd, formatHold } from "@/lib/labKpis";

const now = new Date("2026-11-14T12:00:00");

describe("lab KPIs", () => {
  it("OTD counts delivered on or before due date", () => {
    const r = onTimeDelivery([
      { id: "a", status: "delivered", due_date: "2026-11-10", delivered_date: "2026-11-10T09:00:00Z" },
      { id: "b", status: "delivered", due_date: "2026-11-10", delivered_date: "2026-11-12T09:00:00Z" },
      { id: "c", status: "delivered", due_date: null, delivered_date: "2026-11-12" },
      { id: "d", status: "design", due_date: "2026-11-10" },
    ], { now });
    expect(r).toEqual({ delivered: 2, onTime: 1, late: 1, pct: 50 });
  });
  it("a Saturday due date is met by Monday delivery", () => {
    expect(effectiveDueYmd("2026-11-14")).toBe("2026-11-16");
    expect(onTimeDelivery([{ id: "a", status: "delivered", due_date: "2026-11-07", delivered_date: "2026-11-09" }], { now }).pct).toBe(100);
  });
  it("OTD is null with nothing delivered", () => {
    expect(onTimeDelivery([], { now }).pct).toBeNull();
  });
  it("remake rate and fault split", () => {
    const cases = [
      ...Array.from({ length: 10 }, (_, i) => ({ id: `o${i}`, status: "delivered", delivered_date: "2026-11-01" })),
      { id: "r1", status: "design", parent_case_id: "o1", created_at: "2026-11-02" },
    ];
    const claims = [{ record_date: "2026-11-02", data: { fault: "clinic" } }, { record_date: "2026-11-03", data: { fault: "clinic" } }, { record_date: "2026-11-03", data: { fault: "lab" } }, { record_date: "2026-11-04", data: { fault: "material" } }];
    const r = remakeSplit(cases, claims, { now });
    expect(r.pct).toBe(10);
    expect(r.faults).toEqual({ lab: 1, clinic: 2, material: 1 });
    expect(r.share.clinic).toBe(50);
  });
  it("holds over 24 hours count as stalled", () => {
    const r = holdAging([
      { id: "a", status: "on_hold", hold_at: "2026-11-14T02:00:00" },
      { id: "b", status: "on_hold", hold_at: "2026-11-12T12:00:00" },
      { id: "c", status: "design" },
    ], now);
    expect(r.count).toBe(2);
    expect(r.stalled).toBe(1);
    expect(r.avgHours).toBe(29);
    expect(r.rows[0].c.id).toBe("b");
    expect(formatHold(50)).toBe("2d 2h");
  });
  it("in-flight units exclude delivered and cancelled", () => {
    expect(inFlight([
      { id: "a", status: "design", teeth: ["11", "12", "13"] },
      { id: "b", status: "pending", teeth: [] },
      { id: "c", status: "delivered", teeth: ["21"] },
      { id: "d", status: "cancelled" },
    ])).toEqual({ cases: 2, units: 4 });
  });
  it("stage velocity averages time between status changes", () => {
    const v = stageVelocity([
      { case_id: "a", from_status: "pending", to_status: "design", created_at: "2026-11-01T08:00:00Z" },
      { case_id: "a", from_status: "design", to_status: "milling", created_at: "2026-11-01T12:00:00Z" },
      { case_id: "b", from_status: "pending", to_status: "design", created_at: "2026-11-01T08:00:00Z" },
      { case_id: "b", from_status: "design", to_status: "milling", created_at: "2026-11-01T10:00:00Z" },
    ]);
    expect(v.find((s) => s.stage === "design")!.avgHours).toBe(3);
    expect(v.find((s) => s.stage === "milling")!.avgHours).toBeNull();
  });
});
