import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Mail, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { sendAutomationTest } from "@/lib/automation.functions";
import { renderTemplate } from "@/lib/automation/templateEngine";
import { renderEmail } from "@/lib/automation/emailTemplates";
import { sanitizeNigerianPhone } from "@/lib/automation/phoneSanitizer";
import { countSms } from "@/lib/automation/smsCounter";
import { sampleData } from "@/lib/automation/sampleData";
import { DEFAULT_SMS_TEMPLATES, type WorkflowType } from "@/lib/automation/defaultTemplates";
import { WORKFLOW_META, type AutomationSettings } from "@/hooks/useAutomationSettings";

type Props = { orgId: string; settings: AutomationSettings; clinicName: string; clinicPhone: string; status?: { sms: boolean; email: boolean } };

export function TestDispatcherTab({ orgId, settings, clinicName, clinicPhone, status }: Props) {
  const send = useServerFn(sendAutomationTest);
  const qc = useQueryClient();
  const { user } = useAuth() as any;
  const [workflow, setWorkflow] = useState<WorkflowType>("booking_confirmation");
  const [channel, setChannel] = useState<"sms" | "email">("sms");
  const [to, setTo] = useState("");
  const [noDoctor, setNoDoctor] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const template = settings.custom_templates?.[workflow]?.sms ?? DEFAULT_SMS_TEMPLATES[workflow];
  const data = useMemo(() => sampleData(clinicName, clinicPhone, noDoctor), [clinicName, clinicPhone, noDoctor]);
  const sms = useMemo(() => renderTemplate(template, data, { channel: "sms" }), [template, data]);
  const email = useMemo(() => renderEmail(workflow, data), [workflow, data]);
  const credits = sms.ok ? countSms(sms.text) : null;

  const valid = channel === "sms" ? !!sanitizeNigerianPhone(to) : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to.trim());
  const myValue = channel === "sms" ? user?.phone || user?.user_metadata?.phone : user?.email;
  const paused = status ? !status[channel] : false;

  const dispatch = async () => {
    setError(null); setBusy(true);
    try {
      const { data: s } = await supabase.auth.getSession();
      const token = s.session?.access_token;
      if (!token) throw new Error("Please sign in again");
      const r: any = await send({ data: { token, orgId, workflow, channel, to: to.trim(), template: channel === "sms" ? template : undefined, noDoctor } });
      if (r.ok) toast.success("Test message sent", { description: `Check ${channel === "sms" ? "your phone" : "your inbox"}.` });
      else setError(r.error);
    } catch (e: any) { setError(e.message || "Couldn't send the test"); }
    finally { setBusy(false); qc.invalidateQueries({ queryKey: ["automation-delivery-logs", orgId] }); }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="glass-card">
        <CardHeader className="pb-3"><CardTitle className="text-base">Send a test message</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Message</Label>
            <Select value={workflow} onValueChange={(v) => setWorkflow(v as WorkflowType)}>
              <SelectTrigger className="min-h-11"><SelectValue /></SelectTrigger>
              <SelectContent>{WORKFLOW_META.map((w) => <SelectItem key={w.type} value={w.type}>{w.title}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            {(["sms", "email"] as const).map((c) => (
              <Button key={c} type="button" size="sm" className="flex-1" variant={channel === c ? "default" : "ghost"} onClick={() => { setChannel(c); setTo(""); setError(null); }}>
                {c === "sms" ? <MessageSquare className="mr-1 h-4 w-4" /> : <Mail className="mr-1 h-4 w-4" />}{c === "sms" ? "SMS" : "Email"}
              </Button>
            ))}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{channel === "sms" ? "Your phone number" : "Your email address"}</Label>
            <Input className="min-h-11" value={to} onChange={(e) => setTo(e.target.value)} type={channel === "sms" ? "tel" : "email"} placeholder={channel === "sms" ? "0803 123 4567" : "you@clinic.com"} />
            {to && !valid && <p className="text-xs text-destructive">{channel === "sms" ? "Enter a valid Nigerian mobile number" : "Enter a valid email address"}</p>}
            {myValue && <Button type="button" variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => setTo(myValue)}>Use mine: {myValue}</Button>}
          </div>
          <Label className="flex min-h-11 cursor-pointer items-center justify-between rounded-lg border border-border bg-muted/30 px-3">
            <span className="text-xs">Pretend no doctor is assigned</span>
            <Switch checked={noDoctor} onCheckedChange={setNoDoctor} />
          </Label>
          {paused && <p className="flex items-center gap-1 text-xs text-destructive"><AlertTriangle className="h-3 w-3" />{channel === "sms" ? "SMS" : "Email"} isn't available right now — contact Clinexus.</p>}
          {error && <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">{error}</div>}
          <Button className="min-h-11 w-full" disabled={!valid || busy || paused} onClick={dispatch}>
            <Send className="mr-1 h-4 w-4" />{busy ? "Sending…" : "Send test message"}
          </Button>
          <p className="text-[11px] text-muted-foreground">Tests use sample patient details and are marked [TEST].</p>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="pb-3"><CardTitle className="text-base">What will be sent</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {channel === "sms" ? (sms.ok ? (
            <>
              <div className="whitespace-pre-wrap rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm">{sms.text}</div>
              {credits && <Badge variant={credits.segments > 1 ? "destructive" : "secondary"}>{credits.length} chars • {credits.segments} SMS credit{credits.segments === 1 ? "" : "s"}</Badge>}
            </>
          ) : <p className="text-sm text-destructive">Can't send: {sms.error}{sms.missing ? ` (${sms.missing.join(", ")})` : ""}</p>)
          : email.ok ? (
            <>
              <p className="text-sm font-medium">[TEST] {email.subject}</p>
              <iframe title="Email preview" srcDoc={email.html} sandbox="" className="h-[420px] w-full rounded-lg border border-border bg-background" />
            </>
          ) : <p className="text-sm text-destructive">Can't send: {email.error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
