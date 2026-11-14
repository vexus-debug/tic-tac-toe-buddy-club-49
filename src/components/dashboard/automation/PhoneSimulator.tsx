import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { renderTemplate, type MergeData } from "@/lib/automation/templateEngine";
import { renderEmail } from "@/lib/automation/emailTemplates";
import type { WorkflowType } from "@/lib/automation/defaultTemplates";

export function PhoneSimulator({ template, workflow, data, sender }: { template: string; workflow: WorkflowType; data: MergeData; sender: string }) {
  const [view, setView] = useState<"sms" | "email">("sms");
  const sms = useMemo(() => renderTemplate(template, data, { channel: "sms" }), [template, data]);
  const email = useMemo(() => renderEmail(workflow, data), [workflow, data]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        <Button size="sm" variant={view === "sms" ? "default" : "ghost"} onClick={() => setView("sms")}>SMS</Button>
        <Button size="sm" variant={view === "email" ? "default" : "ghost"} onClick={() => setView("email")}>Email</Button>
      </div>
      <div className="relative h-[560px] w-[280px] rounded-[2.5rem] border-[10px] border-foreground/90 bg-background shadow-2xl">
        <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-foreground/90" />
        <div className="flex h-full flex-col overflow-hidden rounded-[1.8rem]">
          <div className="flex justify-between px-5 pt-2 text-[10px] font-semibold"><span>9:41</span><span>5G ▮▮▮</span></div>
          {view === "sms" ? (
            <>
              <div className="border-b border-border px-4 pb-2 pt-6 text-center">
                <div className="mx-auto mb-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">{sender.slice(0, 1)}</div>
                <p className="text-xs font-semibold">{sender}</p>
              </div>
              <div className="flex-1 overflow-y-auto bg-muted/30 p-3">
                <p className="mb-2 text-center text-[9px] text-muted-foreground">Text Message • Today</p>
                {sms.ok ? (
                  <div className="max-w-[90%] whitespace-pre-wrap rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-[12px] leading-snug">{sms.text}</div>
                ) : (
                  <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-[11px] text-destructive">
                    Can't preview: {sms.error}{sms.missing ? ` (${sms.missing.join(", ")})` : ""}
                  </div>
                )}
              </div>
            </>
          ) : email.ok ? (
            <div className="flex-1 overflow-hidden pt-4">
              <p className="truncate border-b border-border px-3 pb-2 text-[11px] font-semibold">{email.subject}</p>
              <iframe title="Email preview" srcDoc={email.html} sandbox="" className="h-full w-full origin-top-left scale-[0.85] bg-background" style={{ width: "118%", height: "118%" }} />
            </div>
          ) : (
            <div className="m-3 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-[11px] text-destructive">Can't preview: {email.error}</div>
          )}
        </div>
      </div>
    </div>
  );
}
