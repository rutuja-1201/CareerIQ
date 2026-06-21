"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Sparkles, ArrowRight, Copy, Check } from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { DashboardLayout } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea, Label } from "@/components/ui/input";
import { HistorySection, ErrorAlert, LoadingCard } from "@/components/page-states";
import { PageHero } from "@/components/page-hero";
import { useAuth } from "@/lib/auth-context";
import { api, ResumeBullet } from "@/lib/api";

export default function ResumeBulletsPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [bullet, setBullet] = useState("");
  const [optimized, setOptimized] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { data: history } = useQuery({
    queryKey: ["bullet-history"],
    queryFn: () => api.getBulletHistory(token!),
    enabled: !!token,
  });

  const handleOptimize = async () => {
    if (!bullet.trim() || !token) return;
    setLoading(true);
    setError("");
    try {
      const data = await api.optimizeBullet(token, bullet);
      setOptimized(data.optimized);
      queryClient.invalidateQueries({ queryKey: ["bullet-history"] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Optimization failed");
    } finally {
      setLoading(false);
    }
  };

  const copyOptimized = async () => {
    await navigator.clipboard.writeText(optimized);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AuthGuard>
      <DashboardLayout title="Resume Bullet Optimizer">
        <PageHero
          eyebrow="Resume bullet optimizer"
          title="Make every bullet recruiter-ready"
          description="Convert vague statements into quantified impact in one click."
        />
        {loading && !optimized && <LoadingCard message="Optimizing bullet with AI…" />}
        <div className={loading && !optimized ? "hidden" : "grid gap-6 lg:grid-cols-2"}>
          <Card>
            <CardHeader>
              <CardTitle>Original Bullet</CardTitle>
              <CardDescription>Transform weak bullets into impactful achievements with Hugging Face AI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Resume Bullet Point</Label>
                <Textarea value={bullet} onChange={(e) => setBullet(e.target.value)} placeholder="Worked on React application." className="mt-1" />
              </div>
              {error && <ErrorAlert message={error} />}
              <Button onClick={handleOptimize} disabled={!bullet.trim() || loading} className="w-full gap-2">
                <Sparkles className="h-4 w-4" />
                {loading ? "Optimizing..." : "Optimize with AI"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Optimized Bullet</CardTitle>
                {optimized && (
                  <Button variant="ghost" size="sm" onClick={copyOptimized} className="gap-1">
                    {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {optimized ? (
                <div className="space-y-4">
                  <div className="rounded-lg bg-white/5 p-4 text-sm text-slate-500 line-through">{bullet}</div>
                  <div className="flex items-start gap-2">
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-indigo-400" />
                    <p className="text-white">{optimized}</p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400">Enter a bullet point to see the AI-optimized version</p>
              )}
            </CardContent>
          </Card>
        </div>

        <HistorySection
          title="Optimization History"
          emptyMessage="No optimized bullets yet."
          items={history?.bullets || []}
          renderItem={(b: ResumeBullet) => (
            <button
              key={b._id}
              type="button"
              onClick={() => { setBullet(b.original); setOptimized(b.optimized); }}
              className="w-full rounded-lg border border-transparent py-3 text-left hover:border-white/10 hover:bg-white/5"
            >
              <p className="text-sm text-slate-400 line-through">{b.original}</p>
              <p className="mt-1 text-sm text-white">{b.optimized}</p>
              <p className="mt-1 text-xs text-slate-400">{new Date(b.createdAt).toLocaleDateString()}</p>
            </button>
          )}
        />
      </DashboardLayout>
    </AuthGuard>
  );
}
