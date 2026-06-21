import { cn } from "@/lib/utils";

export { Select } from "./select";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-xl border border-white/10 bg-[#0b1020] px-3 py-2 text-sm text-slate-100 shadow-sm placeholder:text-slate-500 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "flex min-h-[120px] w-full rounded-xl border border-white/10 bg-[#0b1020] px-3 py-2 text-sm text-slate-100 shadow-sm placeholder:text-slate-500 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30",
        className
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-sm font-medium text-slate-300", className)} {...props} />;
}

export function Badge({ className, variant = "default", ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: "default" | "success" | "warning" | "destructive" }) {
  const variants = {
    default: "bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/20",
    success: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/20",
    warning: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/20",
    destructive: "bg-red-500/15 text-red-300 ring-1 ring-red-500/20",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", variants[variant], className)} {...props} />
  );
}


export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-white/10", className)}>
      <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all" style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
}
