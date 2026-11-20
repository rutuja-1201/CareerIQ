import Link from "next/link";
import {
  ArrowRight, Sparkles, FileText, GitCompare, TrendingUp, MessageSquare, Code2, Zap, Bot, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark, TeamBadge } from "@/components/brand";

const features = [
  { icon: Bot, title: "Career Twin AI", desc: "Plain English goals → readiness, gaps, timeline, weekly plan.", featured: true },
  { icon: FileText, title: "Resume Intelligence", desc: "ATS score, quality, keywords, AI bullet upgrades." },
  { icon: Code2, title: "GitHub Skills", desc: "Languages, frameworks, topics, commit activity." },
  { icon: GitCompare, title: "Skill Gap", desc: "Your stack vs target role — match % & missing skills." },
  { icon: TrendingUp, title: "Growth Simulator", desc: "68% → 89% readiness · 6 LPA → 10–14 LPA." },
  { icon: MessageSquare, title: "Interview Prep", desc: "Technical, HR, project & architecture questions." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#030712] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.35),transparent)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_100%_0%,rgba(34,211,238,0.12),transparent)]" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <BrandMark dark showTeam />
        <div className="flex items-center gap-3">
          <Link href="/login"><Button variant="ghost" className="text-slate-300 hover:bg-white/5 hover:text-white">Login</Button></Link>
          <Link href="/register"><Button className="btn-glow">Get Started</Button></Link>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-8 text-center md:pt-16">
        <TeamBadge className="border-white/10 bg-white/5 text-indigo-200" />
        <h1 className="mx-auto mt-8 max-w-4xl text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl lg:text-7xl">
          The AI career{" "}
          <span className="gradient-text">operating system</span>
          <br className="hidden sm:block" /> for developers
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 md:text-xl">
          CareerIQ — talk to Career Twin AI,
          connect GitHub + resume, and get a personalized path to your dream role.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/register">
            <Button size="lg" className="btn-glow h-12 gap-2 px-8 text-base">
              Start free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="h-12 border-white/15 bg-white/5 px-8 text-base text-white hover:bg-white/10">
              Sign in
            </Button>
          </Link>
        </div>

        <div className="animate-float relative mx-auto mt-16 max-w-4xl">
          <div className="glass-card rounded-3xl border border-white/10 bg-slate-900/60 p-6 text-left shadow-2xl shadow-indigo-500/10 backdrop-blur-xl md:p-8">
            <div className="flex items-center gap-2 text-xs font-medium text-violet-300">
              <Bot className="h-4 w-4" /> Career Twin AI
            </div>
            <p className="mt-4 rounded-2xl bg-white/5 p-4 text-sm italic text-slate-300 ring-1 ring-white/10">
              &ldquo;I want to become a Senior Full Stack Engineer in 12 months.&rdquo;
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-4">
              {[
                { label: "Readiness", value: "68%", color: "text-white" },
                { label: "Timeline", value: "5 mo", color: "text-emerald-400" },
                { label: "Target", value: "Senior FS", color: "text-indigo-300" },
                { label: "After plan", value: "89%", color: "text-cyan-300" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">{s.label}</p>
                  <p className={`mt-1 text-xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Docker", "AWS", "System Design", "Redis"].map((s) => (
                <span key={s} className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-200 ring-1 ring-amber-500/20">
                  + {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-t border-white/5 bg-slate-950/50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Everything in one platform</h2>
            <p className="mt-3 text-slate-400">Built for HackIndia · designed to win on demo day</p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, desc, featured }) => (
              <div
                key={title}
                className={`group rounded-2xl border p-6 transition hover:-translate-y-0.5 ${
                  featured
                    ? "border-violet-500/40 bg-gradient-to-br from-violet-500/15 to-indigo-500/10 shadow-lg shadow-violet-500/10"
                    : "border-white/8 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
                }`}
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${featured ? "bg-violet-500/30" : "bg-white/5"}`}>
                  <Icon className={`h-5 w-5 ${featured ? "text-violet-300" : "text-indigo-400"}`} />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-wrap items-center justify-center gap-8 text-center text-sm text-slate-500">
            {["Next.js", "Node.js", "MongoDB", "Hugging Face", "Docker", "TypeScript"].map((t) => (
              <span key={t} className="font-medium">{t}</span>
            ))}
          </div>
          <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-cyan-400" />
            <h3 className="mt-4 text-xl font-bold">Ready for your demo?</h3>
            <p className="mt-2 text-slate-400">Open Career Twin AI and run the example prompt in under 60 seconds.</p>
            <Link href="/register" className="mt-6 inline-block">
              <Button size="lg" className="btn-glow gap-2">
                Launch CareerIQ <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/5 py-10 text-center">
        <p className="text-sm font-semibold text-slate-300">CareerIQ</p>
        <p className="mt-1 text-xs text-slate-500">AI Career Operating System for Developers</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
          {["Resume", "GitHub", "Skill Gap", "Roadmap", "Salary", "Interviews"].map((i) => (
            <span key={i} className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-500/60" /> {i}
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
}
