import Link from "next/link";
import { BrandMark } from "@/components/brand";
import { Sparkles, Bot, Code2, TrendingUp } from "lucide-react";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#070b14]">
      <div className="relative hidden w-1/2 overflow-hidden bg-[#060a12] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(99,102,241,0.35)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(34,211,238,0.12)_0%,transparent_50%)]" />
        <BrandMark dark showTeam />
        <div className="relative z-10 space-y-8">
          <h2 className="max-w-md text-4xl font-bold leading-tight text-white">
            Your AI career <span className="gradient-text">operating system</span>
          </h2>
          <p className="max-w-sm text-slate-400">
            Built for developers who want clarity — not another generic ATS score.
          </p>
          <ul className="space-y-4">
            {[
              { icon: Bot, text: "Career Twin AI — talk in plain English" },
              { icon: Code2, text: "GitHub + resume skill extraction" },
              { icon: TrendingUp, text: "Growth simulator with LPA projections" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-slate-300">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10">
                  <Icon className="h-4 w-4 text-indigo-400" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative z-10 flex items-center gap-2 text-xs text-slate-500">
          <Sparkles className="h-3 w-3 text-cyan-400" /> AI-Powered Career Intelligence
        </p>
      </div>
      <div className="mesh-bg flex flex-1 flex-col items-center justify-center p-6 lg:p-12">
        <Link href="/" className="mb-8 lg:hidden">
          <BrandMark dark showTeam />
        </Link>
        <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#121826] p-8 shadow-xl shadow-black/30">{children}</div>
      </div>
    </div>
  );
}
