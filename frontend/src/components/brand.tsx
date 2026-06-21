import { Brain } from "lucide-react";
import { cn } from "@/lib/utils";

export function BrandLogo({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-12 w-12" };
  const icons = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-6 w-6" };
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 shadow-lg shadow-indigo-500/25",
        sizes[size],
        className
      )}
    >
      <Brain className={cn("text-white", icons[size])} />
    </div>
  );
}

export function BrandMark({
  showTeam = true,
  dark = false,
  className,
}: {
  showTeam?: boolean;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <BrandLogo />
      <div>
        <p className={cn("text-lg font-bold tracking-tight", dark ? "text-white" : "text-slate-100")}>
          Career<span className="gradient-text">IQ</span>
        </p>
        {showTeam && (
          <p className={cn("text-[10px] font-medium uppercase tracking-widest", dark ? "text-indigo-300/80" : "text-slate-400")}>
            by Bytebrains
          </p>
        )}
      </div>
    </div>
  );
}

export function TeamBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-300",
        className
      )}
    >
      Team Bytebrains
    </span>
  );
}
