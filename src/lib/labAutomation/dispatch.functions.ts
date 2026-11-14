import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { LAB_TRIGGERS } from "./triggers";

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** Sends the lab's automatic messages for one case event (received / on hold / dispatched). */
export const dispatchLabNotification = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({
    token: z.string().min(10), orgId: z.string().uuid(), caseId: z.string().uuid(),
    trigger: z.enum(LAB_TRIGGERS), stamp: z.string().min(1).max(64).optional(),
  }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    const { data: u, error } = await db.auth.getUser(data.token);
    if (error || !u.user) throw new Error("Please sign in again");
    const { data: ok } = await db.rpc("has_org_access", { _user_id: u.user.id, _org_id: data.orgId });
    if (!ok) throw new Error("You don't have access to this lab");

    const { data: c } = await db.from("lab_cases").select("*").eq("id", data.caseId).eq("org_id", data.orgId).maybeSingle();
    if (!c) throw new Error("Case not found");
    const { data: org } = await db.from("organizations").select("name, phone").eq("id", data.orgId).maybeSingle();
    const { data: st } = await db.from("automation_settings").select("custom_templates").eq("org_id", data.orgId).maybeSingle();
    const { mergeLabSettings } = await import("./triggers");
    const { planLabDispatch } = await import("./dispatchPlan");
    const settings = mergeLabSettings(((st?.custom_templates as any) ?? {}).lab);

    const stamp = data.stamp ?? (data.trigger === "case_on_hold" ? c.hold_at : data.trigger === "case_dispatched" ? c.delivered_date : c.created_at) ?? "0";
    const plan = planLabDispatch({
      caseId: c.id, trigger: data.trigger, stamp: String(stamp), settings,
      contacts: { phone: c.external_client_phone, email: c.external_client_email },
      data: {
        lab_name: org?.name, lab_phone: org?.phone, clinic_name: c.external_client_name,
        doctor_name: c.clinic_doctor_name, case_number: c.case_number, patient_ref: c.external_patient_name,
        work_type: c.work_type, units: c.teeth?.length || undefined, due_date: c.due_date,
        hold_reason: c.hold_reason, hold_note: c.notes, dispatch_note: c.remark,
      },
    });

    const { getPlatformValue, getApiKey, isChannelEnabled, MESSAGING_SETTINGS } = await import("@/lib/apiKeys.server");
    const results: { channel: string; status: string; reason?: string }[] = plan.skipped.map((s) => ({ channel: s.channel, status: "skipped", reason: s.reason }));

    for (const s of plan.sends) {
      const { data: prior } = await db.from("automation_logs").select("id").eq("idempotency_key", s.key).maybeSingle();
      if (prior) { results.push({ channel: s.channel, status: "skipped", reason: "Already sent" }); continue; }
      if (!(await isChannelEnabled(db, s.channel))) { results.push({ channel: s.channel, status: "skipped", reason: "Paused platform-wide" }); continue; }

      let sent = false; let extra: Record<string, unknown> = {};
      try {
        if (s.channel === "sms") {
          const tok = (await getPlatformValue(db, MESSAGING_SETTINGS.kudiToken)) || process.env.KUDISMS_API_KEY;
          const sender = (await getPlatformValue(db, MESSAGING_SETTINGS.kudiSender)) || process.env.KUDISMS_SENDER_ID;
          if (!tok || !sender) throw new Error("SMS not set up");
          const res = await fetch("https://my.kudisms.net/api/corporate", { method: "POST", body: new URLSearchParams({ token: tok, senderID: sender, recipients: s.to, message: s.text }) });
          const txt = await res.text(); let j: any = {}; try { j = JSON.parse(txt); } catch { /* raw */ }
          sent = res.ok && (j.status === "success" || j.error_code === "000");
          extra = sent ? { provider_id: String(j.data ?? j.id ?? "") } : { error_message: j.msg || `HTTP ${res.status}`, error_details: txt.slice(0, 1000) };
        } else {
          const key = await getApiKey(db, "resend", "RESEND_API_KEY");
          const from = await getPlatformValue(db, MESSAGING_SETTINGS.resendFrom);
          if (!from) throw new Error("Email not set up");
          const html = `<div style="font-family:sans-serif;line-height:1.5">${esc(s.text).replace(/\n/g, "<br>")}</div>`;
          const res = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to: [s.to], subject: s.subject, html, text: s.text }) });
          const txt = await res.text(); let j: any = {}; try { j = JSON.parse(txt); } catch { /* raw */ }
          sent = res.ok;
          extra = sent ? { provider_id: j.id ?? null } : { error_message: j.message || `HTTP ${res.status}`, error_details: txt.slice(0, 1000) };
        }
      } catch (e) { extra = { error_message: (e as Error).message }; }

      // Only successful sends claim the key, so a failed attempt can be retried.
      await db.from("automation_logs").insert({
        org_id: data.orgId, channel: s.channel, workflow_type: `lab_${data.trigger}`, status: sent ? "sent" : "failed",
        recipient: s.to, rendered_text: s.channel === "sms" ? s.text : s.subject, message: data.trigger,
        entity_type: "lab_case", entity_id: c.id, idempotency_key: sent ? s.key : null, ...extra,
      } as any);
      results.push({ channel: s.channel, status: sent ? "sent" : "failed", reason: sent ? undefined : String(extra.error_message ?? "") });
    }
    return { results };
  });
