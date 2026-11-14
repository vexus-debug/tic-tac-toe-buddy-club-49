// Step 3: fire-and-forget lab alerts from the browser. Never blocks or breaks the technician's action.
import { supabase } from "@/integrations/supabase/client";
import { dispatchLabNotification } from "./dispatch.functions";
import type { LabTrigger } from "./triggers";

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

/** A move into "delivered" tells the clinic the case has left the lab. */
export function notifyIfDispatched(orgId: string | null | undefined, caseId: string, toStatus: string) {
  if (toStatus === "delivered") void notifyLab(orgId, caseId, "case_dispatched");
}
