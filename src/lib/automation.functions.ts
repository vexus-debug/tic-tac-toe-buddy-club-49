import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const WORKFLOWS = ["booking_confirmation", "appointment_reminder", "payment_receipt", "hygiene_recall"] as const;

async function requireClinicMember(token: string, orgId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: u, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !u.user) throw new Error("Please sign in again");
  const { data: ok } = await supabaseAdmin.rpc("has_org_access", { _user_id: u.user.id, _org_id: orgId });
  if (!ok) throw new Error("You don't have access to this clinic");
  return supabaseAdmin;
}

/** Tells a clinic whether platform messaging is ready — never returns keys. */
export const getMessagingStatus = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ token: z.string().min(10), orgId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const db = await requireClinicMember(data.token, data.orgId);
    const { getPlatformValue, isChannelEnabled, MESSAGING_SETTINGS } = await import("./apiKeys.server");
    const [kt, ks, rk, rf, smsOn, emailOn] = await Promise.all([
      getPlatformValue(db, MESSAGING_SETTINGS.kudiToken), getPlatformValue(db, MESSAGING_SETTINGS.kudiSender),
      getPlatformValue(db, "resend_api_key"), getPlatformValue(db, MESSAGING_SETTINGS.resendFrom),
      isChannelEnabled(db, "sms"), isChannelEnabled(db, "email"),
    ]);
    return { sms: smsOn && (!!(kt && ks) || !!process.env.KUDISMS_API_KEY), email: emailOn && !!(rk || process.env.RESEND_API_KEY) && !!rf };
  });

/** Sends one test message to a staff member's own phone/email using sample data. */
export const sendAutomationTest = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      token: z.string().min(10), orgId: z.string().uuid(),
      workflow: z.enum(WORKFLOWS), channel: z.enum(["sms", "email"]),
      to: z.string().trim().min(5).max(255), template: z.string().max(1000).optional(),
      noDoctor: z.boolean().optional(),
    }).parse(d))
  .handler(async ({ data }) => {
    const db = await requireClinicMember(data.token, data.orgId);
    const { getPlatformValue, getApiKey, isChannelEnabled, MESSAGING_SETTINGS } = await import("./apiKeys.server");
    if (!(await isChannelEnabled(db, data.channel))) return { ok: false, error: `${data.channel === "sms" ? "SMS" : "Email"} delivery is paused platform-wide. Please contact Clinexus support.` };
    const { renderTemplate } = await import("./automation/templateEngine");
    const { renderEmail } = await import("./automation/emailTemplates");
    const { sanitizeNigerianPhone } = await import("./automation/phoneSanitizer");
    const { DEFAULT_SMS_TEMPLATES } = await import("./automation/defaultTemplates");
    const { sampleData } = await import("./automation/sampleData");

    const { data: org } = await db.from("organizations").select("name, phone, address").eq("id", data.orgId).maybeSingle();
    const merge = sampleData(org?.name ?? "Your Clinic", org?.phone ?? "08030000000", data.noDoctor);
    const log = async (status: string, recipient: string, text: string | null, extra: Record<string, unknown> = {}) => {
      await db.from("automation_logs").insert({
        org_id: data.orgId, channel: data.channel, workflow_type: data.workflow, status, recipient,
        rendered_text: text, message: `[TEST] ${data.workflow}`, entity_type: "test", ...extra,
      } as any);
    };

    if (data.channel === "sms") {
      const phone = sanitizeNigerianPhone(data.to);
      if (!phone) return { ok: false, error: "Enter a valid Nigerian mobile number" };
      const r = renderTemplate(data.template || DEFAULT_SMS_TEMPLATES[data.workflow], merge, { channel: "sms" });
      if (!r.ok) return { ok: false, error: r.error + (r.missing ? `: ${r.missing.join(", ")}` : "") };
      const token = (await getPlatformValue(db, MESSAGING_SETTINGS.kudiToken)) || process.env.KUDISMS_API_KEY;
      const sender = (await getPlatformValue(db, MESSAGING_SETTINGS.kudiSender)) || process.env.KUDISMS_SENDER_ID;
      if (!token || !sender) return { ok: false, error: "SMS is not set up on the platform yet. Please contact Clinexus support." };
      const body = new URLSearchParams({ token, senderID: sender, recipients: phone, message: r.text });
      const res = await fetch("https://my.kudisms.net/api/corporate", { method: "POST", body });
      const txt = await res.text();
      let j: any = {}; try { j = JSON.parse(txt); } catch { /* raw */ }
      const okSend = res.ok && (j.status === "success" || j.error_code === "000");
      await log(okSend ? "sent" : "failed", phone, r.text, okSend ? { provider_id: String(j.data ?? j.id ?? "") } : { error_message: j.msg || `HTTP ${res.status}`, error_details: txt.slice(0, 1000) });
      return okSend ? { ok: true } : { ok: false, error: "SMS provider rejected the message. Please contact Clinexus support." };
    }

    const email = z.string().email().safeParse(data.to);
    if (!email.success) return { ok: false, error: "Enter a valid email address" };
    const e = renderEmail(data.workflow, merge, { clinicAddress: org?.address ?? undefined });
    if (!e.ok) return { ok: false, error: e.error };
    let key: string;
    try { key = await getApiKey(db, "resend", "RESEND_API_KEY"); } catch { return { ok: false, error: "Email is not set up on the platform yet. Please contact Clinexus support." }; }
    const from = await getPlatformValue(db, MESSAGING_SETTINGS.resendFrom);
    if (!from) return { ok: false, error: "Email is not set up on the platform yet. Please contact Clinexus support." };
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [data.to], subject: `[TEST] ${e.subject}`, html: e.html }),
    });
    const txt = await res.text();
    let j: any = {}; try { j = JSON.parse(txt); } catch { /* raw */ }
    await log(res.ok ? "sent" : "failed", data.to, e.subject, res.ok ? { provider_id: j.id ?? null } : { error_message: j.message || `HTTP ${res.status}`, error_details: txt.slice(0, 1000) });
    return res.ok ? { ok: true } : { ok: false, error: "Email provider rejected the message. Please contact Clinexus support." };
  });
