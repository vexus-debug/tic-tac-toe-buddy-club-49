import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/hooks/useOrg";
import type { WorkflowType } from "@/lib/automation/defaultTemplates";

export type ToggleKey =
  | "booking_confirm_sms" | "booking_confirm_email" | "reminder_24h_sms" | "reminder_24h_email"
  | "receipt_sms" | "receipt_email" | "recall_6m_sms" | "recall_6m_email";

export const WORKFLOW_META: { type: WorkflowType; title: string; timing: string; sms: ToggleKey; email: ToggleKey }[] = [
  { type: "booking_confirmation", title: "Booking Confirmation", timing: "Instant on booking", sms: "booking_confirm_sms", email: "booking_confirm_email" },
  { type: "appointment_reminder", title: "24-Hour Reminder", timing: "24h before visit", sms: "reminder_24h_sms", email: "reminder_24h_email" },
  { type: "payment_receipt", title: "Payment Receipt", timing: "Instant on payment", sms: "receipt_sms", email: "receipt_email" },
  { type: "hygiene_recall", title: "6-Month Recall", timing: "180 days after visit", sms: "recall_6m_sms", email: "recall_6m_email" },
];

export type AutomationSettings = Record<ToggleKey, boolean> & { custom_templates: Record<string, { sms?: string }> };

export function useAutomationSettings() {
  const { currentOrg } = useOrg();
  const orgId = currentOrg?.org_id;
  return useQuery({
    queryKey: ["automation-settings", orgId],
    enabled: !!orgId && orgId !== "dev",
    queryFn: async (): Promise<AutomationSettings> => {
      const { data, error } = await supabase.from("automation_settings").select("*").eq("org_id", orgId!).maybeSingle();
      if (error) throw error;
      const d: any = data ?? {};
      const out: any = { custom_templates: (d.custom_templates as any) ?? {} };
      WORKFLOW_META.forEach((w) => { out[w.sms] = !!d[w.sms]; out[w.email] = !!d[w.email]; });
      return out;
    },
  });
}

export function useSaveAutomationSettings() {
  const { currentOrg } = useOrg();
  const qc = useQueryClient();
  const orgId = currentOrg?.org_id;
  const key = ["automation-settings", orgId];
  return useMutation({
    mutationFn: async (patch: Partial<AutomationSettings>) => {
      const { error } = await supabase.from("automation_settings").upsert({ org_id: orgId!, ...patch } as any, { onConflict: "org_id" });
      if (error) throw error;
    },
    onMutate: async (patch) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<AutomationSettings>(key);
      if (prev) qc.setQueryData(key, { ...prev, ...patch });
      return { prev };
    },
    onError: (_e, _p, ctx) => { if (ctx?.prev) qc.setQueryData(key, ctx.prev); },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });
}

export function useDeliveryLogs() {
  const { currentOrg } = useOrg();
  const orgId = currentOrg?.org_id;
  return useQuery({
    queryKey: ["automation-delivery-logs", orgId],
    enabled: !!orgId && orgId !== "dev",
    queryFn: async () => {
      const { data, error } = await supabase.from("automation_logs").select("*")
        .eq("org_id", orgId!).in("channel", ["sms", "email"]).order("created_at", { ascending: false }).limit(300);
      if (error) throw error;
      return data ?? [];
    },
  });
}
