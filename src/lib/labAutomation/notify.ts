// Step 3: fire-and-forget lab alerts from the browser. Never blocks or breaks the technician's action.
import { supabase } from "@/integrations/supabase/client";
import { dispatchLabNotification } from "./dispatch.functions";
import { triggerForTransition, type LabTrigger } from "./triggers";

export async function notifyLab(orgId: string | null | undefined, caseId: string, trigger: LabTrigger) {
  if (!orgId) return;
  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;
    await dispatchLabNotification({ data: { token, orgId, caseId, trigger } });
  } catch (e) {
    console.warn("Lab alert not sent", trigger, (e as Error).message);
  }
}

/** Sends the alert a status change calls for (on hold → hold alert, delivered → dispatch alert). */
export function notifyLabTransition(orgId: string | null | undefined, caseId: string, from: string | null | undefined, to: string) {
  const t = triggerForTransition(from, to);
  if (t && t !== "case_on_hold") void notifyLab(orgId, caseId, t);
}
