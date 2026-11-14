import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Eye, EyeOff, MessageSquare, Mail, Bell } from "lucide-react";
import { format } from "date-fns";
import { useAutomationLogs } from "@/hooks/useAutomationWorkflows";
import { PayloadInspectDrawer } from "./PayloadInspectDrawer";

export interface DeliveryLog {
  id: string; channel: string; status: string; sent_at: string;
  recipient?: string | null; rendered_text?: string | null; message?: string | null;
  workflow_type?: string | null; entity_type?: string | null; provider_id?: string | null;
  idempotency_key?: string | null; error_message?: string | null; error_details?: string | null;
}

export function maskRecipient(r?: string | null): string {
  if (!r) return "—";
  if (r.includes("@")) {
    const [u, d] = r.split("@");
    return `${u.slice(0, 1)}•••@${d}`;
  }
  if (r.length <= 6) return "•••";
  return `${r.slice(0, r.length - 7)}•••${r.slice(-4)}`;
}

const ChannelIcon = ({ c }: { c: string }) =>
  c === "sms" ? <MessageSquare className="h-3.5 w-3.5" /> : c === "email" ? <Mail className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />;

export default function DeliveryLogsTab() {
  const { data = [], isLoading } = useAutomationLogs();
  const logs = data as unknown as DeliveryLog[];
  const [search, setSearch] = useState("");
  const [channel, setChannel] = useState("all");
  const [status, setStatus] = useState("all");
  const [workflow, setWorkflow] = useState("all");
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<DeliveryLog | null>(null);

  const workflows = useMemo(
    () => Array.from(new Set(logs.map((l) => (l.entity_type === "test" ? "test" : l.workflow_type)).filter(Boolean))) as string[],
    [logs],
  );

  const filtered = logs.filter((l) => {
    const q = search.toLowerCase();
    if (q && !`${l.recipient ?? ""} ${l.message ?? ""} ${l.rendered_text ?? ""}`.toLowerCase().includes(q)) return false;
    if (channel !== "all" && l.channel !== channel) return false;
    if (status !== "all" && l.status !== status) return false;
    if (workflow !== "all") {
      const w = l.entity_type === "test" ? "test" : l.workflow_type;
      if (w !== workflow) return false;
    }
    return true;
  });

  const sent = logs.filter((l) => l.status === "sent").length;
  const failed = logs.filter((l) => l.status === "failed").length;
  const rate = logs.length ? Math.round((sent / logs.length) * 100) : 0;

  const toggleReveal = (id: string) =>
    setRevealed((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[["Total", logs.length], ["Sent", sent], ["Failed", failed], ["Success rate", `${rate}%`]].map(([k, v]) => (
          <Card key={k as string} className="glass-card"><CardContent className="p-3">
            <p className="text-xs text-muted-foreground">{k}</p>
            <p className="text-xl font-semibold">{v}</p>
          </CardContent></Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search recipient or message" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={channel} onValueChange={setChannel}>
          <SelectTrigger className="sm:w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All channels</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="in_app">In-app</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="sm:w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <Select value={workflow} onValueChange={setWorkflow}>
          <SelectTrigger className="sm:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All workflows</SelectItem>
            {workflows.map((w) => <SelectItem key={w} value={w}>{w === "test" ? "Test sends" : w.replace(/_/g, " ")}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card className="glass-card">
        <CardContent className="p-2">
          {isLoading ? (
            <p className="text-center py-10 text-sm text-muted-foreground">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-center py-10 text-sm text-muted-foreground">No messages match.</p>
          ) : (
            <div className="divide-y divide-border/30 max-h-[560px] overflow-y-auto">
              {filtered.map((l) => (
                <div key={l.id} role="button" tabIndex={0} onClick={() => setSelected(l)}
                  onKeyDown={(e) => e.key === "Enter" && setSelected(l)}
                  className="flex items-center gap-3 p-3 hover:bg-accent/20 cursor-pointer">
                  <ChannelIcon c={l.channel} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-mono truncate">{revealed.has(l.id) ? l.recipient || "—" : maskRecipient(l.recipient)}</span>
                      {l.recipient && (
                        <Button size="icon" variant="ghost" className="h-6 w-6" aria-label="Show recipient"
                          onClick={(e) => { e.stopPropagation(); toggleReveal(l.id); }}>
                          {revealed.has(l.id) ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{l.rendered_text || l.message || "—"}</p>
                    <p className="text-[10px] text-muted-foreground">{format(new Date(l.sent_at), "MMM d, HH:mm")}{l.entity_type === "test" && " · test"}</p>
                  </div>
                  <Badge variant={l.status === "sent" ? "default" : l.status === "failed" ? "destructive" : "secondary"} className="text-[10px]">{l.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <PayloadInspectDrawer log={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
