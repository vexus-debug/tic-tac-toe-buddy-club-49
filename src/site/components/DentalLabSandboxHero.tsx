import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Check, MessageCircle, ClipboardList, Palette, MessageSquare, Send, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

const STAGES = [
  { id: "scan", label: "Scan verified", tech: "Ngozi A. · Intake desk", equip: "STL scan checked · margins clear", status: "Received" },
  { id: "cad", label: "CAD design", tech: "Tobi K. · Design station 1", equip: "exocad design · awaiting approval", status: "In production" },
  { id: "mill", label: "Milling & sinter", tech: "Emeka O. · Bench 3", equip: "Disc lot #ZR-402 · Furnace cycle #2", status: "In production" },
  { id: "ceram", label: "Ceramics & glaze", tech: "Funmi B. · Ceramics bench", equip: "Stain & glaze · shade A2 body", status: "In production" },
  { id: "qc", label: "QC station", tech: "Chidi E. · QC inspector", equip: "Margins, contacts, occlusion, shade ✓", status: "QC passed" },
  { id: "ship", label: "Dispatched", tech: "Musa · Dispatch rider", equip: "Out for delivery · ETA 2:15 PM", status: "Dispatched" },
];

const MATERIALS = [
  { id: "zr", label: "Monolithic zirconia", price: 35000 },
  { id: "emax", label: "Layered E.max", price: 45000 },
  { id: "pfm", label: "PFM", price: 25000 },
];
const TEETH = [13, 14, 15, 16, 17];
const ZONES = [
  { id: "cervical", label: "Cervical", options: ["A3", "A3.5", "B3"] },
  { id: "body", label: "Body", options: ["A1", "A2", "B2"] },
  { id: "incisal", label: "Incisal", options: ["Translucent", "Bleach", "I2"] },
] as const;

type Tab = "board" | "shade" | "sms";
const TABS: { id: Tab; label: string; icon: typeof ClipboardList }[] = [
  { id: "board", label: "Case board", icon: ClipboardList },
  { id: "shade", label: "Shade & material", icon: Palette },
  { id: "sms", label: "Text the clinic", icon: MessageSquare },
];

const fade = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.25 } };

const Sandbox = () => {
  const [tab, setTab] = useState<Tab>("board");
  const [stage, setStage] = useState(2);
  const [mat, setMat] = useState("zr");
  const [teeth, setTeeth] = useState<number[]>([14, 15, 16]);
  const [shade, setShade] = useState<Record<string, string>>({ cervical: "A3.5", body: "A2", incisal: "Translucent" });
  const [sent, setSent] = useState(false);

  const s = STAGES[stage];
  const m = MATERIALS.find((x) => x.id === mat)!;
  const total = m.price * teeth.length;
  const toggleTooth = (n: number) => setTeeth((t) => (t.includes(n) ? (t.length > 1 ? t.filter((x) => x !== n) : t) : [...t, n].sort()));
  const unitsLabel = `${teeth.length}-unit ${m.label.toLowerCase()}`;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-primary/10">
      <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
          <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
          <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
        </div>
        <span className="text-[11px] text-muted-foreground">Case #DL-4821 · Dr. Alabi, SmileCare</span>
      </div>
      <div className="flex gap-1 border-b border-border p-1.5">
        {TABS.map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)}
            className={`flex min-w-0 flex-1 items-center justify-center gap-1 rounded-md px-1.5 py-2 text-[11px] font-medium transition-colors sm:gap-1.5 sm:px-2 sm:text-xs ${tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
            <t.icon className="h-3.5 w-3.5" />
            <span className="truncate">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="min-h-[360px] p-4 sm:p-5">
        <AnimatePresence mode="wait">
          {tab === "board" && (
            <motion.div key="board" {...fade}>
              <p className="mb-2 text-[11px] text-muted-foreground">Tap a stage to move the case</p>
              <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
                {STAGES.map((st, i) => (
                  <button key={st.id} type="button" onClick={() => setStage(i)} aria-pressed={stage === i}
                    className={`relative rounded-md border px-1.5 py-2 text-[10px] font-semibold leading-tight transition-all sm:text-[11px] ${i < stage ? "border-primary/40 bg-primary/10 text-primary" : i === stage ? "scale-105 border-primary bg-primary text-primary-foreground shadow-md" : "border-border bg-background text-muted-foreground hover:-translate-y-0.5"}`}>
                    {i < stage && <Check className="mx-auto mb-0.5 h-3 w-3" />}
                    {st.label}
                  </button>
                ))}
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <motion.div className="h-full bg-primary" animate={{ width: `${((stage + 1) / STAGES.length) * 100}%` }} transition={{ duration: 0.4 }} />
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={stage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="mt-4 rounded-lg border border-border bg-background p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{unitsLabel} bridge · #{teeth[0]}–#{teeth[teeth.length - 1]}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">Patient: Tunde B. · Shade {shade.body}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${stage >= 4 ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>{s.status}</span>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-border pt-3 text-xs">
                    <div><dt className="text-muted-foreground">Who has it</dt><dd className="mt-0.5 font-medium text-foreground">{s.tech}</dd></div>
                    <div><dt className="text-muted-foreground">Details</dt><dd className="mt-0.5 font-medium text-foreground">{s.equip}</dd></div>
                  </dl>
                  <Button size="sm" disabled={stage === STAGES.length - 1} onClick={() => setStage((x) => Math.min(x + 1, STAGES.length - 1))} className="mt-3 w-full gap-1.5">
                    {stage === STAGES.length - 1 ? <><Check className="h-3.5 w-3.5" /> Delivered on time</> : <>Move to {STAGES[stage + 1].label} <ChevronRight className="h-3.5 w-3.5" /></>}
                  </Button>
                </motion.div>
              </AnimatePresence>
              <p className="mt-3 text-right text-xs text-muted-foreground">Due: <span className="font-semibold text-foreground">Tomorrow, 2:00 PM · on schedule</span></p>
            </motion.div>
          )}

          {tab === "shade" && (
            <motion.div key="shade" {...fade} className="space-y-3">
              <div>
                <p className="mb-1.5 text-[11px] text-muted-foreground">Material</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {MATERIALS.map((x) => (
                    <button key={x.id} type="button" onClick={() => setMat(x.id)} aria-pressed={mat === x.id}
                      className={`rounded-md border px-2 py-2 text-left text-[11px] transition-colors ${mat === x.id ? "border-primary bg-primary/10 text-foreground" : "border-border bg-background text-muted-foreground hover:bg-muted"}`}>
                      <span className="block font-semibold">{x.label}</span>
                      <span>{naira(x.price)}/unit</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-[11px] text-muted-foreground">Teeth</p>
                <div className="flex gap-1.5">
                  {TEETH.map((n) => (
                    <button key={n} type="button" onClick={() => toggleTooth(n)} aria-pressed={teeth.includes(n)}
                      className={`h-10 flex-1 rounded-md border text-xs font-semibold tabular-nums transition-all ${teeth.includes(n) ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:-translate-y-0.5"}`}>{n}</button>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="mb-2 text-[11px] text-muted-foreground">3-zone shade map · tap to change</p>
                <div className="space-y-1.5">
                  {ZONES.map((z) => (
                    <div key={z.id} className="flex items-center gap-2">
                      <span className="w-16 text-[11px] font-medium text-foreground">{z.label}</span>
                      <div className="flex flex-1 gap-1">
                        {z.options.map((o) => (
                          <button key={o} type="button" onClick={() => setShade((sh) => ({ ...sh, [z.id]: o }))}
                            className={`flex-1 rounded px-1 py-1 text-[10px] font-semibold transition-colors ${shade[z.id] === o ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>{o}</button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-primary/10 px-4 py-3">
                <span className="text-xs font-medium text-foreground">{teeth.length} × {naira(m.price)}</span>
                <span className="text-lg font-semibold text-primary">{naira(total)}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">Captured once, printed on the job ticket, and billed to the clinic automatically.</p>
            </motion.div>
          )}

          {tab === "sms" && (
            <motion.div key="sms" {...fade}>
              <div className="rounded-lg border border-border bg-muted/40 p-4">
                <p className="mb-3 text-center text-[10px] uppercase tracking-wider text-muted-foreground">Text message · Dr. Alabi</p>
                <div className="ml-auto max-w-[88%] rounded-2xl rounded-br-sm bg-primary p-3 text-xs leading-relaxed text-primary-foreground">
                  Hello Dr. Alabi, case #DL-4821 ({unitsLabel}, patient Tunde B.) has passed final QC and is out with our rider. ETA at SmileCare: 2:15 PM.
                  <p className="mt-1 text-right text-[10px] opacity-80">{sent ? "Delivered" : "Ready to send"}</p>
                </div>
                <AnimatePresence>
                  {sent && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="mt-2 max-w-[70%] rounded-2xl rounded-bl-sm bg-card p-3 text-xs text-foreground shadow-sm">
                      Received! Patient is booked for 2:30 PM. Perfect timing 👍
                      <p className="mt-1 text-[10px] text-muted-foreground">Dr. Alabi · just now</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <Button size="sm" onClick={() => { setSent(true); setStage(5); }} disabled={sent} className="mt-4 w-full gap-1.5">
                {sent ? <><Check className="h-3.5 w-3.5" /> Sent · 42 clinics updated this week, 0 phone calls</> : <><Send className="h-3.5 w-3.5" /> Send dispatch text</>}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

type Cta = { label: string; href: string; external?: boolean };

export const DentalLabSandboxHero = ({ primary, points, title, description }: { primary: Cta; points: { value: string; label: string }[]; title?: string; description?: string }) => (
  <section className="relative isolate overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(var(--brand-deep)) 0%, hsl(var(--brand-teal)) 100%)" }}>
    <div aria-hidden className="absolute inset-0 -z-10 opacity-20 [background-image:radial-gradient(hsl(0_0%_100%/0.5)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />
    <div aria-hidden className="absolute -right-32 top-10 -z-10 h-96 w-96 rounded-full bg-[hsl(var(--stage-live)/0.35)] blur-3xl" />
    <div className="container grid items-center gap-12 py-14 md:py-20 lg:grid-cols-12 lg:gap-10">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="lg:col-span-5">
        <p className="inline-flex items-center gap-2 rounded-full border border-hero-on px-3 py-1 text-xs font-medium text-hero-on">
          <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[hsl(var(--stage-live))] opacity-60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-[hsl(var(--stage-live))]" /></span>
          Live demo · no signup needed
        </p>
        <h1 className="mt-5 text-[2rem] leading-[1.08] !text-hero-on sm:text-4xl md:text-[2.75rem]" style={{ textWrap: "balance" }}>
          {title ?? "Every case on time. Every shade right. No more \"is it ready?\" calls."}
        </h1>
        <p className="mt-5 max-w-lg text-base leading-relaxed text-hero-on-muted">
          {description ?? "Try it right here. Move a case through production, set the shade and material, then text the clinic when it ships — the same way your team will at the bench."}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link to="/signup" className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-card px-6 text-sm font-semibold text-[hsl(var(--brand-deep))] shadow-lg transition-opacity hover:opacity-90">
            Get started <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/login?tab=demo" className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-hero-on px-6 text-sm font-semibold text-hero-on transition-colors hover:bg-[hsl(0_0%_100%/0.1)]">
            See demo <ArrowUpRight className="h-4 w-4" />
          </Link>
          <a href={primary.href} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[hsl(var(--whatsapp))] px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
            <MessageCircle className="h-4 w-4" /> {primary.label}
          </a>
        </div>
        <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-hero-on pt-6">
          {points.map((p) => (
            <div key={p.label}>
              <dt className="text-2xl font-semibold tracking-tight text-hero-on">{p.value}</dt>
              <dd className="mt-1 text-[11px] leading-tight text-hero-on-muted sm:text-xs">{p.label}</dd>
            </div>
          ))}
        </dl>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }} className="lg:col-span-7">
        <Sandbox />
      </motion.div>
    </div>
  </section>
);
