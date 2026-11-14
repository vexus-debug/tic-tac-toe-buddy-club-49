import HeroBackdrop from "@/site/components/HeroBackdrop";
import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, MessageCircle, Mail, Phone, PlayCircle, MonitorSmartphone, Wallet } from "lucide-react";
import Layout from "@/site/components/Layout";
import { formatArticleDate, getArticle, getCategory, type ArticleBlock } from "@/site/data/articles";
import { usePublishedArticles } from "@/site/data/usePublishedArticles";

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const Cta = ({ compact }: { compact?: boolean }) => (
  <aside className={`not-prose rounded-lg border border-primary/30 bg-primary/10 ${compact ? "my-10 p-5" : "mt-14 p-7"}`}>
    <p className={`font-semibold text-foreground ${compact ? "text-lg" : "text-2xl"}`}>
      {compact ? "Want this running in your clinic this week?" : "Ready to run a calmer, more profitable clinic?"}
    </p>
    <p className="mt-2 text-muted-foreground">
      {compact
        ? "Clinexus handles appointments, records, billing and stock in one place."
        : "Join clinics using Clinexus to manage patients, payments, labs and staff — set up in minutes."}
    </p>
    <div className="mt-4 flex flex-wrap gap-3">
      <a href="/app/signup" className="inline-flex items-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">Start free</a>
      {!compact && <Link to="/contact" className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted">Talk to us</Link>}
    </div>
  </aside>
);

const Block = ({ block }: { block: ArticleBlock }) => {
  switch (block.type) {
    case "h2":
      return <h2 id={slugify(block.text)} className="mt-12 scroll-mt-28 text-2xl font-semibold tracking-tight">{block.text}</h2>;
    case "h3":
      return <h3 className="mt-8 text-lg font-semibold">{block.text}</h3>;
    case "list":
      return <ul className="mt-5 list-disc space-y-2 pl-5">{block.items.map((i) => <li key={i}>{i}</li>)}</ul>;
    case "quote":
      return (
        <blockquote className="my-10 border-l-2 border-primary pl-6 font-serif text-2xl italic leading-snug text-foreground">
          {block.text}
          {block.cite && <cite className="mt-3 block font-sans text-sm not-italic text-muted-foreground">{block.cite}</cite>}
        </blockquote>
      );
    case "tip":
      return (
        <aside className="my-8 rounded-md border border-primary/30 bg-primary/5 p-5">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-primary">{block.title ?? "In practice"}</p>
          <p className="mt-2 text-foreground">{block.text}</p>
        </aside>
      );
    case "image":
      return (
        <figure className="my-10">
          <img src={block.src} alt={block.alt} loading="lazy" className="w-full rounded-md border border-border/70" />
          {block.caption && <figcaption className="mt-2 text-sm text-muted-foreground">{block.caption}</figcaption>}
        </figure>
      );
    case "cta":
      return (
        <aside className="not-prose my-10 rounded-lg border border-primary/30 bg-primary/10 p-6">
          <p className="text-xl font-semibold text-foreground">{block.title}</p>
          <p className="mt-2 text-muted-foreground">{block.text}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to={block.href} className="inline-flex items-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">{block.label}</Link>
            {block.secondaryHref && block.secondaryLabel && (
              <Link to={block.secondaryHref} className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted">{block.secondaryLabel}</Link>
            )}
          </div>
        </aside>
      );
    case "whatsapp":
      return (
        <aside className="not-prose my-12 rounded-lg border border-border bg-muted/40 p-7 text-center">
          <p className="text-2xl font-semibold text-foreground">{block.title}</p>
          <p className="mt-2 text-muted-foreground">{block.text}</p>
          <a
            href="https://wa.me/2349017758165?text=I%20want%20to%20get%20started%20with%20Clinexus"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center rounded-xl bg-[hsl(var(--whatsapp))] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            Chat with us on WhatsApp
          </a>
        </aside>
      );
    case "phones":
      return (
        <figure className="not-prose my-12 rounded-2xl border border-border/70 bg-muted/40 px-4 py-8 sm:px-8">
          <div className="flex items-center justify-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-primary">
            <MonitorSmartphone className="h-4 w-4" /> Fully mobile responsive
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-6">
            {block.shots.map((s) => (
              <div key={s.src} className="flex flex-col items-center">
                <div className="w-full max-w-[220px] rounded-[1.6rem] border-[6px] border-foreground/90 bg-foreground/90 p-0.5 shadow-xl">
                  <img src={s.src} alt={s.alt} loading="lazy" className="w-full rounded-[1.1rem]" />
                </div>
                <span className="mt-3 text-xs font-semibold text-foreground sm:text-sm">{s.label}</span>
              </div>
            ))}
          </div>
          {block.caption && <figcaption className="mt-5 text-center text-sm text-muted-foreground">{block.caption}</figcaption>}
        </figure>
      );
    case "demoCta":
      return (
        <aside className="not-prose relative my-12 overflow-hidden rounded-2xl bg-primary p-7 text-primary-foreground shadow-lg sm:p-9">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary-foreground/10" />
          <div className="pointer-events-none absolute -bottom-20 right-24 h-40 w-40 rounded-full bg-primary-foreground/5" />
          <div className="relative grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em]">
                <PlayCircle className="h-3.5 w-3.5" /> Live demo
              </p>
              <p className="mt-4 text-2xl font-semibold leading-tight sm:text-3xl">{block.title}</p>
              <p className="mt-3 max-w-xl text-primary-foreground/80">{block.text}</p>
              <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-primary-foreground/90">
                {["No sign-up", "Real demo data", "Desktop or phone"].map((t) => (
                  <li key={t} className="inline-flex items-center gap-1.5"><Check className="h-4 w-4" />{t}</li>
                ))}
              </ul>
            </div>
            <a href="/app/login?tab=demo" className="group inline-flex items-center justify-center gap-2 rounded-xl bg-background px-6 py-3.5 font-semibold text-foreground shadow-md transition hover:-translate-y-0.5">
              Open the demo clinic <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </a>
          </div>
        </aside>
      );
    case "pricingCta":
      return (
        <aside className="not-prose my-12 overflow-hidden rounded-2xl border border-primary/30 bg-card shadow-sm">
          <div className="grid sm:grid-cols-[1.3fr_1fr]">
            <div className="p-7 sm:p-8">
              <p className="inline-flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-primary"><Wallet className="h-4 w-4" /> Simple pricing</p>
              <p className="mt-3 text-2xl font-semibold leading-tight text-foreground">{block.title}</p>
              <p className="mt-3 text-muted-foreground">{block.text}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/industries/dental-clinics/pricing" className="group inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">
                  See full pricing <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </Link>
                <a href="/app/login?tab=demo" className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted">Try the demo first</a>
              </div>
            </div>
            <div className="flex flex-col justify-center gap-4 border-t border-primary/20 bg-primary/5 p-7 sm:border-l sm:border-t-0">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">One-time setup</p>
                <p className="text-3xl font-bold text-primary">₦20,000</p>
                <p className="text-xs text-muted-foreground">Includes 10 free visits</p>
              </div>
              <div className="h-px bg-primary/20" />
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Then per patient visit</p>
                <p className="text-3xl font-bold text-primary">₦400</p>
                <p className="text-xs text-muted-foreground">No monthly subscription</p>
              </div>
            </div>
          </div>
        </aside>
      );
    case "contactCta":
      return (
        <aside className="not-prose my-14 rounded-2xl border border-border bg-muted/40 p-7 sm:p-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-primary">Get started now</p>
            <p className="mt-3 text-2xl font-semibold leading-tight text-foreground sm:text-3xl">{block.title}</p>
            <p className="mt-3 text-muted-foreground">{block.text}</p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <a href="https://wa.me/2349017758165?text=Hello%20Clinexus%2C%20I%20run%20a%20dental%20clinic%20and%20I%20want%20to%20get%20started" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center rounded-xl border border-border bg-card p-5 text-center transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[hsl(var(--whatsapp))]/15 text-[hsl(var(--whatsapp))]"><MessageCircle className="h-5 w-5" /></span>
              <span className="mt-3 font-semibold text-foreground">WhatsApp us</span>
              <span className="mt-1 text-xs text-muted-foreground">Fastest reply</span>
            </a>
            <a href="tel:+2349017758165" className="group flex flex-col items-center rounded-xl border border-border bg-card p-5 text-center transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary"><Phone className="h-5 w-5" /></span>
              <span className="mt-3 font-semibold text-foreground">Call directly</span>
              <span className="mt-1 text-xs text-muted-foreground">+234 901 775 8165</span>
            </a>
            <Link to="/contact" className="group flex flex-col items-center rounded-xl border border-border bg-card p-5 text-center transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary"><Mail className="h-5 w-5" /></span>
              <span className="mt-3 font-semibold text-foreground">Book a walkthrough</span>
              <span className="mt-1 text-xs text-muted-foreground">30 minutes, your workflow</span>
            </Link>
          </div>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <a href="/app/login?tab=demo" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90">Open the demo <ArrowRight className="h-4 w-4" /></a>
            <Link to="/industries/dental-clinics/pricing" className="inline-flex items-center justify-center rounded-xl border border-primary px-6 py-3 font-semibold text-primary hover:bg-primary/10">View pricing</Link>
          </div>
        </aside>
      );
    default:
      return <p className="mt-5">{block.text}</p>;
  }
};

const ArticleDetail = () => {
  const { slug } = useParams();
  const { articles: all, loaded } = usePublishedArticles();
  const article = getArticle(slug) ?? all.find((a) => a.slug === slug);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? Math.min(1, window.scrollY / h) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (article) document.title = `${article.title} | Clinexus Articles`;
  }, [article]);

  if (!article) return loaded ? <Navigate to="/articles" replace /> : <Layout><div className="min-h-screen" /></Layout>;
  const category = getCategory(article.category);
  const toc = article.body.filter((b): b is Extract<ArticleBlock, { type: "h2" }> => b.type === "h2");
  const related = all
    .filter((a) => a.slug !== article.slug)
    .sort((a, b) => Number(b.category === article.category) - Number(a.category === article.category))
    .slice(0, 3);

  return (
    <Layout>
      <div className="fixed left-0 top-0 z-50 h-0.5 bg-primary" style={{ width: `${progress * 100}%` }} />
      <article className="pb-20">
        <div className="relative overflow-hidden bg-[hsl(var(--medical-blue-dark))] pb-16 pt-32 md:pb-20 md:pt-40">
        <HeroBackdrop />
        <header className="container relative z-10 max-w-3xl">
          <Link to="/articles" className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> All articles
          </Link>
          <p className="mt-8 text-[0.7rem] font-semibold uppercase tracking-[0.14em]">
            <Link to={`/articles/category/${article.category}`} className="text-primary">{category?.name}</Link>
            <span className="mx-2 text-white/40">·</span>
            <span className="text-white/50">{article.readMinutes} min read</span>
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.08] tracking-tight text-white md:text-5xl">{article.title}</h1>
          <p className="mt-5 text-lg leading-relaxed text-white/60">{article.excerpt}</p>
          <p className="mt-6 border-t border-white/10 pt-4 text-sm text-white/50">
            <span className="font-medium text-white">{article.author.name}</span>, {article.author.role} · {formatArticleDate(article.publishedAt)}
          </p>
        </header>
        </div>

        {article.cover && (
          <div className="container mt-10 max-w-5xl">
            <img src={article.cover} alt="" className="aspect-[16/8] w-full rounded-md border border-border/70 object-cover" />
          </div>
        )}

        <div className="container mt-12 grid max-w-5xl gap-12 lg:grid-cols-[1fr_200px]">
          <div className="max-w-[68ch] text-[1.05rem] leading-[1.75] text-foreground/85">
            {article.body.map((b, i) => (
              <div key={i}>
                {b.type === "h2" && i > 0 && b === toc[Math.floor(toc.length / 2)] && <Cta compact />}
                <Block block={b} />
              </div>
            ))}
            <Cta />
          </div>
          {toc.length > 1 && (
            <aside className="hidden lg:block">
              <div className="sticky top-28">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">On this page</p>
                <ul className="mt-3 space-y-2 border-l border-border pl-4 text-sm">
                  {toc.map((h) => (
                    <li key={h.text}><a href={`#${slugify(h.text)}`} className="text-muted-foreground hover:text-foreground">{h.text}</a></li>
                  ))}
                </ul>
              </div>
            </aside>
          )}
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-border/70 py-16">
          <div className="container max-w-5xl">
            <h2 className="text-xl font-semibold tracking-tight">Keep reading</h2>
            <div className="mt-8 grid gap-8 md:grid-cols-3">
              {related.map((a) => (
                <Link key={a.slug} to={`/articles/${a.slug}`} className="group">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-primary">{getCategory(a.category)?.name}</p>
                  <h3 className="mt-2 font-semibold leading-snug group-hover:text-primary">{a.title}</h3>
                  <p className="mt-2 text-xs text-muted-foreground">{a.readMinutes} min read</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default ArticleDetail;
