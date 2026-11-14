import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { DeliveryLog } from "./DeliveryLogsTab";

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-border/30 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-right break-all font-mono text-xs">{value || "—"}</span>
    </div>
  );
}

export function PayloadInspectDrawer({ log, onClose }: { log: DeliveryLog | null; onClose: () => void }) {
  const text = log?.rendered_text || log?.message || "";
  return (
    <Sheet open={!!log} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        {log && (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                Message details
                <Badge variant={log.status === "sent" ? "default" : log.status === "failed" ? "destructive" : "secondary"}>{log.status}</Badge>
              </SheetTitle>
              <SheetDescription>{format(new Date(log.sent_at), "MMM d, yyyy HH:mm:ss")}</SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6 px-1">
              <section>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold">Message sent</h4>
                  <Button size="sm" variant="ghost" disabled={!text}
                    onClick={() => { navigator.clipboard.writeText(text); toast.success("Message copied"); }}>
                    <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                  </Button>
                </div>
                <pre className="whitespace-pre-wrap text-sm rounded-md bg-muted/40 p-3 border border-border/40">{text || "No message text recorded."}</pre>
              </section>

              <section>
                <h4 className="text-sm font-semibold mb-2">Delivery</h4>
                <Row label="Channel" value={log.channel} />
                <Row label="Recipient" value={log.recipient} />
                <Row label="Workflow" value={log.workflow_type} />
                <Row label="Related to" value={log.entity_type} />
                <Row label="Provider ID" value={log.provider_id} />
                <Row label="Idempotency key" value={log.idempotency_key} />
              </section>

              {log.status === "failed" && (
                <section className="rounded-md border border-destructive/40 bg-destructive/10 p-3">
                  <h4 className="text-sm font-semibold flex items-center gap-1.5 text-destructive mb-1">
                    <AlertTriangle className="h-4 w-4" /> Why it failed
                  </h4>
                  <p className="text-sm">{log.error_message || "Unknown error"}</p>
                  {log.error_details && (
                    <pre className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground max-h-48 overflow-y-auto">{log.error_details}</pre>
                  )}
                </section>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
