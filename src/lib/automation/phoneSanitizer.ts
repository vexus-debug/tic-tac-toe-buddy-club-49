/** Normalise Nigerian phone numbers to KudiSMS format: 234XXXXXXXXXX (13 digits, no +). */
const VALID_PREFIXES = ["70", "80", "81", "90", "91"];

export function sanitizeNigerianPhone(input: string | null | undefined): string | null {
  if (!input) return null;
  let d = input.replace(/\D/g, "");
  if (d.startsWith("234")) d = d.slice(3);
  else if (d.startsWith("0")) d = d.slice(1);
  if (d.length !== 10) return null;
  if (!VALID_PREFIXES.includes(d.slice(0, 2))) return null;
  return `234${d}`;
}
