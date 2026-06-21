import { AlertCircle, CheckCircle2, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LoadingSpinner({ className = "h-64", label }: { className?: string; label?: string }) {
  return (
    <div className={`flex flex-col ${className} items-center justify-center gap-3`}>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500/30 border-t-indigo-400" />
      {label && <p className="text-sm text-slate-400">{label}</p>}
    </div>
  );
}

export function LoadingCard({ message = "Working…" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/[0.08] bg-[#121826] px-8 py-16">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500/30 border-t-indigo-400" />
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-slate-500">
      <Inbox className="h-10 w-10 opacity-50" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function SuccessAlert({ message, action, onDismiss }: { message: string; action?: React.ReactNode; onDismiss?: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
        {message}
      </div>
      <div className="flex items-center gap-2">
        {action}
        {onDismiss && (
          <Button variant="outline" size="sm" onClick={onDismiss} className="shrink-0 border-emerald-500/30 text-emerald-300">
            Dismiss
          </Button>
        )}
      </div>
    </div>
  );
}

export function ErrorAlert({ message, onRetry, onDismiss }: { message: string; onRetry?: () => void; onDismiss?: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 shrink-0" />
        {message}
      </div>
      {(onRetry || onDismiss) && (
        <Button
          variant="outline"
          size="sm"
          onClick={onDismiss || onRetry}
          className="shrink-0 border-red-500/30 text-red-300"
        >
          {onRetry ? "Retry" : "Dismiss"}
        </Button>
      )}
    </div>
  );
}

export function HistorySection<T>({
  title,
  emptyMessage,
  items,
  renderItem,
}: {
  title: string;
  emptyMessage: string;
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
}) {
  return (
    <div className="mt-6 rounded-2xl border border-white/[0.08] bg-[#121826] shadow-lg shadow-black/20">
      <div className="border-b border-white/[0.06] px-6 py-4">
        <h3 className="font-semibold text-white">{title}</h3>
      </div>
      <div className="px-6 py-2">
        {items.length ? (
          <div className="divide-y divide-white/[0.06]">{items.map(renderItem)}</div>
        ) : (
          <EmptyState message={emptyMessage} />
        )}
      </div>
    </div>
  );
}

export function extractGithubUsername(url: string) {
  const match = url.match(/github\.com\/([a-zA-Z0-9-]+)/i);
  return match?.[1] || url.replace("@", "").trim();
}
