import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/** Super-admin only: reads the remaining KudiSMS wallet balance. Never returns the token. */
export const getKudiSmsBalance = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ token: z.string().min(10) }).parse(d))
  .handler(async ({ data }) => {
    const { requireSuperAdminClient, getPlatformValue, MESSAGING_SETTINGS } = await import("./apiKeys.server");
    const { db } = await requireSuperAdminClient(data.token);
    const kt = (await getPlatformValue(db, MESSAGING_SETTINGS.kudiToken)) || process.env.KUDISMS_API_KEY;
    if (!kt) return { ok: false as const, error: "No KudiSMS token saved yet" };
    try {
      const res = await fetch(`https://my.kudisms.net/api/balance?token=${encodeURIComponent(kt)}`);
      const txt = await res.text();
      let j: any = {}; try { j = JSON.parse(txt); } catch { /* raw */ }
      const bal = j.balance ?? j.data?.balance ?? j.data;
      if (!res.ok || bal === undefined || bal === null || typeof bal === "object") {
        console.error("KudiSMS balance error", res.status, txt.slice(0, 300));
        return { ok: false as const, error: j.msg || "Couldn't read balance from KudiSMS" };
      }
      return { ok: true as const, balance: String(bal) };
    } catch (e) {
      console.error("KudiSMS balance fetch failed", e);
      return { ok: false as const, error: "Couldn't reach KudiSMS" };
    }
  });
