import { MessageSquare, Search, GitCompare, Map, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { icon: MessageSquare, label: "Parse goal", desc: "Natural language" },
  { icon: Search, label: "Scan profile", desc: "Skills & GitHub" },
  { icon: GitCompare, label: "Gap analysis", desc: "vs target role" },
  { icon: Map, label: "Roadmap", desc: "Weekly plan" },
  { icon: Sparkles, label: "Deliver plan", desc: "Readiness & salary" },
];

export function AgentPipeline({ active = -1, className }: { active?: number; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-2", className)}>
      {steps.map((step, i) => {
        const Icon = step.icon;
        const isActive = active === i;
        const isDone = active > i;
        return (
          <div key={step.label} className="flex min-w-[72px] flex-1 flex-col items-center">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl border transition-all",
                isActive && "scale-110 border-indigo-400 bg-indigo-500 text-white shadow-lg shadow-indigo-500/30",
                isDone && "border-emerald-500/30 bg-emerald-500/15 text-emerald-400",
                !isActive && !isDone && "border-white/10 bg-[#0b1020] text-slate-500"
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <p className={cn("mt-2 text-center text-xs font-semibold", isActive ? "text-indigo-300" : "text-slate-300")}>
              {step.label}
            </p>
            <p className="text-center text-[10px] text-slate-500">{step.desc}</p>
          </div>
        );
      })}
    </div>
  );
}
