/** GSM-7 vs UCS-2 character and credit calculator. */
const GSM_BASIC =
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
const GSM_EXT = "^{}\\[~]|€\f";

export type SmsEncoding = "GSM-7" | "UCS-2";
export interface SmsCount { encoding: SmsEncoding; length: number; perSegment: number; segments: number; }

export function countSms(text: string): SmsCount {
  const chars = Array.from(text);
  const isGsm = chars.every((c) => GSM_BASIC.includes(c) || GSM_EXT.includes(c));
  if (isGsm) {
    const length = chars.reduce((n, c) => n + (GSM_EXT.includes(c) ? 2 : 1), 0);
    const perSegment = length <= 160 ? 160 : 153;
    return { encoding: "GSM-7", length, perSegment, segments: length === 0 ? 0 : Math.ceil(length / perSegment) };
  }
  const length = Array.from(text).reduce((n, c) => n + (c.length > 1 ? 2 : 1), 0);
  const perSegment = length <= 70 ? 70 : 67;
  return { encoding: "UCS-2", length, perSegment, segments: Math.ceil(length / perSegment) };
}
