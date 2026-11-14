import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CalendarCheck, CalendarClock, Receipt, Sparkles, MessageSquare, Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { WORKFLOW_META, useSaveAutomationSettings, type AutomationSettings } from "@/hooks/useAutomationSettings";

const ICONS = { booking_confirmation: CalendarCheck, appointment_reminder: CalendarClock, payment_receipt: Receipt, hygiene_recall: Sparkles };

export function WorkflowTogglesTab({ settings, status }: { settings: AutomationSettings; status?: { sms: boolean; email: boolean } }) {
  const save = useSaveAutomationSettings();
  const flip = (k: keyof AutomationSettings, v: boolean) =>
    save.mutate({ [k]: v } as any, { onError: (e: any) => toast.error("Couldn't save", { description: e.message }) });
  const active = WORKFLOW_META.reduce((n, w) => n + (settings[w.sms] ? 1 : 0) + (settings[w.email] ? 1 : 0), 0);

  return (
    <div className="space-y-4">
      <Card className="glass-card">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <span className="text-sm font-medium">{active} of 8 messages active</span>
          <StatusPill label="SMS service" ok={status?.sms} />
          <StatusPill label="Email service" ok={status?.email} />
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        {WORKFLOW_META.map((w) => {
          const Icon = ICONS[w.type];
          return (
            <Card key={w.type} className="glass-card">
              <CardContent className="space-y-4 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl border border-border bg-primary/10 p-2.5 text-primary"><Icon className="h-5 w-5" /></div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold">{w.title}</h3>
                    <Badge variant="outline" className="mt-1 text-[10px]">{w.timing}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {([["sms", MessageSquare, "SMS"], ["email", Mail, "Email"]] as const).map(([ch, I, label]) => {
                    const k = w[ch];
                    return (
                      <Label key={ch} className="flex min-h-11 cursor-pointer items-center justify-between rounded-lg border border-border bg-muted/30 px-3">
                        <span className="flex items-center gap-2 text-xs"><I className="h-4 w-4" />{label}</span>
                        <Switch checked={settings[k]} onCheckedChange={(v) => flip(k, v)} aria-label={`${w.title} ${label}`} />
                      </Label>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function StatusPill({ label, ok }: { label: string; ok?: boolean }) {
  return (
    <Badge variant={ok ? "secondary" : "outline"} className="gap-1 text-[11px]">
      {ok ? <CheckCircle2 className="h-3 w-3 text-primary" /> : <AlertCircle className="h-3 w-3 text-destructive" />}
      {label}: {ok === undefined ? "checking…" : ok ? "Ready" : "Not set up — contact Clinexus"}
    </Badge>
  );
}
