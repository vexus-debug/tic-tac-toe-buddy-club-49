import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AlertTriangle, Smartphone, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { countSms } from "@/lib/automation/smsCounter";
import { normalizeGsm } from "@/lib/automation/templateEngine";
import { DEFAULT_SMS_TEMPLATES, type WorkflowType } from "@/lib/automation/defaultTemplates";
import { sampleData } from "@/lib/automation/sampleData";
import { WORKFLOW_META, useSaveAutomationSettings, type AutomationSettings } from "@/hooks/useAutomationSettings";
import { useIsMobile } from "@/hooks/use-mobile";
import { PhoneSimulator } from "./PhoneSimulator";

const TAGS = ["patient_name", "clinic_name", "appointment_date", "appointment_time", "doctor_name", "clinic_phone", "amount", "receipt_number", "balance"];
const LINK_RE = /(https?:\/\/|www\.)|\b[a-z0-9-]+\.(com|ng|net|org|app|io|co)\b/i;
// Sample values are close to real lengths, so the meter estimates the sent message.

export function MessageDesignerTab({ settings, clinicName, clinicPhone }: { settings: AutomationSettings; clinicName: string; clinicPhone: string }) {
  const [workflow, setWorkflow] = useState<WorkflowType>("booking_confirmation");
  const saved = settings.custom_templates?.[workflow]?.sms ?? DEFAULT_SMS_TEMPLATES[workflow];
  const [text, setText] = useState(saved);
  const ref = useRef<HTMLTextAreaElement>(null);
  const save = useSaveAutomationSettings();
  const isMobile = useIsMobile();
  useEffect(() => setText(saved), [saved]);

  const data = useMemo(() => sampleData(clinicName, clinicPhone), [clinicName, clinicPhone]);
  const filled = useMemo(() => normalizeGsm(text.replace(/\{(\w+)\}/g, (m, k) => (data as any)[k] ?? m)), [text, data]);
  const c = countSms(filled);
  const hasLink = LINK_RE.test(text);
  const tone = c.encoding !== "GSM-7" || c.segments > 1 ? "destructive" : c.length > 145 ? "outline" : "secondary";

  const insert = (tag: string) => {
    const el = ref.current; const t = `{${tag}}`;
    const s = el?.selectionStart ?? text.length, e = el?.selectionEnd ?? text.length;
    setText(text.slice(0, s) + t + text.slice(e));
    requestAnimationFrame(() => { el?.focus(); el?.setSelectionRange(s + t.length, s + t.length); });
  };
  const persist = (value: string | null) => {
    const next = { ...(settings.custom_templates ?? {}) };
    if (value === null) delete next[workflow]; else next[workflow] = { sms: value };
    save.mutate({ custom_templates: next } as any, {
      onSuccess: () => toast.success(value === null ? "Restored default message" : "Message saved"),
      onError: (e: any) => toast.error("Couldn't save", { description: e.message }),
    });
  };

  const preview = <PhoneSimulator template={text} workflow={workflow} data={data} sender={clinicName} />;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
      <Card className="glass-card">
        <CardHeader className="pb-3"><CardTitle className="text-base">Message designer</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Select value={workflow} onValueChange={(v) => setWorkflow(v as WorkflowType)}>
            <SelectTrigger className="min-h-11"><SelectValue /></SelectTrigger>
            <SelectContent>{WORKFLOW_META.map((w) => <SelectItem key={w.type} value={w.type}>{w.title}</SelectItem>)}</SelectContent>
          </Select>
          <div className="flex flex-wrap gap-1.5">
            {TAGS.map((t) => (
              <Button key={t} type="button" size="sm" variant="outline" className="h-8 font-mono text-[11px]" onClick={() => insert(t)}>{`{${t}}`}</Button>
            ))}
          </div>
          <Textarea ref={ref} value={text} onChange={(e) => setText(e.target.value)} className="min-h-[140px] text-sm" />
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={tone as any}>{c.length}/{c.perSegment} chars • {c.segments} SMS credit{c.segments === 1 ? "" : "s"}</Badge>
            {c.encoding !== "GSM-7" && <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />Special characters/emoji cut the limit to 70</Badge>}
            {hasLink && <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />Links are blocked by Nigerian networks — remove them</Badge>}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button className="min-h-11" disabled={hasLink || save.isPending || text === saved} onClick={() => persist(text)}>Save message</Button>
            <Button className="min-h-11" variant="ghost" onClick={() => persist(null)}><RotateCcw className="mr-1 h-4 w-4" />Use default</Button>
            {isMobile && (
              <Sheet>
                <SheetTrigger asChild><Button variant="outline" className="min-h-11"><Smartphone className="mr-1 h-4 w-4" />Preview</Button></SheetTrigger>
                <SheetContent side="bottom" className="h-[92vh] overflow-y-auto"><SheetHeader><SheetTitle>Preview</SheetTitle></SheetHeader><div className="pt-4">{preview}</div></SheetContent>
              </Sheet>
            )}
          </div>
        </CardContent>
      </Card>
      {!isMobile && <div>{preview}</div>}
    </div>
  );
}
