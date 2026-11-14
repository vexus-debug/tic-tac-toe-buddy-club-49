import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Workflow, PenLine, Send, ScrollText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { PageSkeleton } from "@/components/dashboard/PageSkeleton";
import { WorkflowTogglesTab } from "@/components/dashboard/automation/WorkflowTogglesTab";
import { MessageDesignerTab } from "@/components/dashboard/automation/MessageDesignerTab";
import { TestDispatcherTab } from "@/components/dashboard/automation/TestDispatcherTab";
import DeliveryLogsTab from "@/components/dashboard/automation/DeliveryLogsTab";
import { useAutomationSettings, WORKFLOW_META } from "@/hooks/useAutomationSettings";
import { useClinicSettings } from "@/hooks/useClinicSettings";
import { useOrg } from "@/hooks/useOrg";
import { supabase } from "@/integrations/supabase/client";
import { getMessagingStatus } from "@/lib/automation.functions";

function useMessagingStatus(orgId?: string) {
  const fn = useServerFn(getMessagingStatus);
  return useQuery({
    queryKey: ["messaging-status", orgId],
    enabled: !!orgId && orgId !== "dev",
    staleTime: 60_000,
    queryFn: async () => {
      const { data: s } = await supabase.auth.getSession();
      const token = s.session?.access_token;
      if (!token) return { sms: false, email: false };
      return (await fn({ data: { token, orgId: orgId! } })) as { sms: boolean; email: boolean };
    },
  });
}

export default function AutomationPage() {
  const { currentOrg } = useOrg();
  const orgId = currentOrg?.org_id;
  const { data: settings, isLoading } = useAutomationSettings();
  const { data: clinic } = useClinicSettings();
  const { data: status } = useMessagingStatus(orgId);

  const clinicName = clinic?.name || currentOrg?.org_name || "Your Clinic";
  const clinicPhone = clinic?.phone || "";
  const total = WORKFLOW_META.length * 2;
  const active = settings ? WORKFLOW_META.reduce((n, w) => n + (settings[w.sms] ? 1 : 0) + (settings[w.email] ? 1 : 0), 0) : 0;

  const header = (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <PageHeader title="Automation" description="Patient messaging workflows, templates, tests and delivery logs" />
      {settings && <Badge variant="secondary" className="shrink-0">{active}/{total} active</Badge>}
    </div>
  );

  if (isLoading || !settings || !orgId) {
    return <div className="space-y-6">{header}<PageSkeleton /></div>;
  }

  return (
    <div className="space-y-6">
      {header}
      <Tabs defaultValue="workflows" className="space-y-4">
        <TabsList className="flex w-full flex-wrap h-auto gap-1 sm:w-auto sm:inline-flex">
          <TabsTrigger value="workflows" className="gap-1.5"><Workflow className="h-4 w-4" />Workflows</TabsTrigger>
          <TabsTrigger value="templates" className="gap-1.5"><PenLine className="h-4 w-4" />Templates</TabsTrigger>
          <TabsTrigger value="test" className="gap-1.5"><Send className="h-4 w-4" />Test Dispatch</TabsTrigger>
          <TabsTrigger value="logs" className="gap-1.5"><ScrollText className="h-4 w-4" />Delivery Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="workflows"><WorkflowTogglesTab settings={settings} status={status} /></TabsContent>
        <TabsContent value="templates"><MessageDesignerTab settings={settings} clinicName={clinicName} clinicPhone={clinicPhone} /></TabsContent>
        <TabsContent value="test"><TestDispatcherTab orgId={orgId} settings={settings} clinicName={clinicName} clinicPhone={clinicPhone} status={status} /></TabsContent>
        <TabsContent value="logs"><DeliveryLogsTab /></TabsContent>
      </Tabs>
    </div>
  );
}
