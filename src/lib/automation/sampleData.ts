import type { MergeData } from "./templateEngine";

/** Realistic sample values used by the preview phone and test sends. */
export function sampleData(clinicName: string, clinicPhone: string, noDoctor = false): MergeData {
  const d = new Date(Date.now() + 86400000);
  return {
    patient_name: "Adaeze Okafor",
    clinic_name: clinicName,
    clinic_phone: clinicPhone,
    appointment_date: d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }),
    appointment_time: "10:30 AM",
    doctor_name: noDoctor ? "" : "Dr. Bello",
    amount: "N25,000",
    receipt_number: "1042",
    balance: "N0",
  };
}

/** Mask a phone/email for privacy, e.g. 234803***89. */
export function maskRecipient(r: string | null | undefined): string {
  if (!r) return "—";
  if (r.includes("@")) { const [u, d] = r.split("@"); return `${u.slice(0, 2)}***@${d}`; }
  return r.length > 8 ? `${r.slice(0, 6)}***${r.slice(-2)}` : "***";
}
