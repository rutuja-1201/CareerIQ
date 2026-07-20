"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DemoFlowBanner } from "@/components/demo-flow-banner";
import {
  LayoutDashboard, FileText, Briefcase, GitCompare, Sparkles,
  MessageSquare, DollarSign, Kanban, Code2, TrendingUp, User, LogOut, Zap, Bot, FileEdit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { BrandLogo } from "@/components/brand";

const navItems = [
  { href: "/career-twin", label: "Career Twin AI", icon: Bot, featured: true },
  { href: "/intelligence", label: "Career Scan", icon: Zap, featured: true },
  { href: "/resume-builder", label: "Resume Builder", icon: FileEdit, featured: true },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/resume", label: "Resume", icon: FileText },
  { href: "/github", label: "GitHub Skills", icon: Code2 },
  { href: "/skill-gap", label: "Skill Gap", icon: GitCompare },
  { href: "/career-growth", label: "Growth Simulator", icon: TrendingUp },
  { href: "/interviews", label: "Interviews", icon: MessageSquare },
  { href: "/job-description", label: "Job Description", icon: Briefcase },
  { href: "/resume-bullets", label: "Bullets", icon: Sparkles },
  { href: "/salary", label: "Salary", icon: DollarSign },
  { href: "/applications", label: "Applications", icon: Kanban },
  { href: "/profile", label: "Profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-white/[0.06] bg-[#060a12]">
      <div className="border-b border-white/[0.06] px-5 py-5">
        <Link href="/career-twin" className="flex items-center gap-3">
          <BrandLogo size="md" />
          <div>
            <p className="text-base font-bold text-white">
              Career<span className="text-indigo-400">IQ</span>
            </p>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">AI Career OS</p>
          </div>
        </Link>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Intelligence</p>
        {navItems.slice(0, 3).map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
              pathname === href
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-900/40"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
        <p className="mb-2 mt-4 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Tools</p>
        {navItems.slice(3).map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
              pathname === href
                ? "bg-white/10 text-white ring-1 ring-white/10"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <Icon className="h-4 w-4 shrink-0 opacity-70" />
            <span className="truncate">{label}</span>
          </Link>
        ))}
      </nav>
      <div className="border-t border-white/[0.06] p-3">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}

const DEMO_FLOW_PATHS = ["/career-twin", "/intelligence", "/dashboard"];

export function DashboardLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const showDemoFlow = DEMO_FLOW_PATHS.includes(pathname);
  return (
    <div className="mesh-bg min-h-screen">
      <Sidebar />
      <div className="pl-[260px]">
        <header className="sticky top-0 z-30 flex h-[4.25rem] items-center justify-between border-b border-white/[0.06] bg-[#070b14]/90 px-8 backdrop-blur-xl">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400">CareerIQ</p>
            <h1 className="text-lg font-bold text-white">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300 sm:inline">
              AI Career OS
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-bold text-white">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
          </div>
        </header>
        <main className="p-6 lg:p-8">
          {showDemoFlow && <DemoFlowBanner />}
          {children}
        </main>
      </div>
    </div>
  );
}
