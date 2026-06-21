"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, Zap, LayoutDashboard, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { href: "/career-twin", label: "Career Twin", icon: Bot },
  { href: "/intelligence", label: "Career Scan", icon: Zap },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
] as const;

export function DemoFlowBanner() {
  const pathname = usePathname();
  const activeIndex = STEPS.findIndex((s) => s.href === pathname);

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-4 py-3">
      <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-indigo-300">Demo flow</span>
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const isActive = pathname === step.href;
        const isPast = activeIndex > i;
        return (
          <div key={step.href} className="flex items-center gap-2">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-600" />}
            <Link
              href={step.href}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition",
                isActive && "bg-indigo-500/20 text-indigo-200 ring-1 ring-indigo-500/30",
                !isActive && isPast && "text-emerald-400 hover:text-emerald-300",
                !isActive && !isPast && "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {step.label}
            </Link>
          </div>
        );
      })}
    </div>
  );
}
