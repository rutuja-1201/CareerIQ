"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Bot, Send, Sparkles, Target, Clock, Calendar, ArrowRight, CheckCircle2 } from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { DashboardLayout } from "@/components/layout/sidebar";
import { PageHero } from "@/components/page-hero";
import { AgentPipeline } from "@/components/agent-pipeline";
import { TeamBadge } from "@/components/brand";
import { ErrorAlert, SuccessAlert } from "@/components/page-states";
import { DemoFillButton } from "@/components/demo-actions";
import { DEMO_CAREER_GOAL } from "@/lib/demo-prefill";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea, Badge, Progress } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { api, CareerTwinPlan } from "@/lib/api";

const EXAMPLE_GOALS = [
  DEMO_CAREER_GOAL,
  "Help me become a DevOps Engineer in 6 months.",
  "I need to reach SDE-2 level with React and Node in 8 months.",
];

function TwinResponse({ plan }: { plan: CareerTwinPlan }) {
  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600">
          <Bot className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 rounded-2xl rounded-tl-sm border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 p-5">
          <p className="text-sm font-medium text-violet-300">Career Twin AI</p>
          <p className="mt-2 text-slate-200 leading-relaxed">{plan.twinReply}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-indigo-500/20 bg-gradient-to-br from-[#151d2e] to-indigo-500/5">
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Current readiness</p>
            <p className="text-3xl font-bold text-white">{plan.currentReadiness}%</p>
            <Progress value={plan.currentReadiness} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Expected readiness</p>
            <p className="text-3xl font-bold text-emerald-400">{plan.expectedReadiness}%</p>
            <Progress value={plan.expectedReadiness} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="flex items-center gap-1 text-xs text-slate-500"><Clock className="h-3 w-3" /> Estimated timeline</p>
            <p className="text-3xl font-bold text-indigo-400">{plan.estimatedTimelineMonths} mo</p>
            <p className="mt-1 text-xs text-slate-500">You asked for {plan.timelineMonthsRequested} months</p>
          </CardContent>
        </Card>
        <Card className={plan.onTrack ? "border-emerald-500/20 bg-emerald-500/10" : "border-amber-500/20 bg-amber-500/10"}>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Status</p>
            <p className={`text-lg font-bold ${plan.onTrack ? "text-emerald-400" : "text-amber-400"}`}>
              {plan.onTrack ? "On track" : "Stretch goal"}
            </p>
            <p className="mt-1 text-xs text-slate-400">{plan.interpretedGoal}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4 text-amber-400" /> Missing skills for {plan.targetRole}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {plan.missingSkills.map((s) => (
              <Badge key={s} variant="warning">{s}</Badge>
            ))}
          </div>
          {plan.matchedSkills.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium text-emerald-400">You already have</p>
              <div className="flex flex-wrap gap-2">
                {plan.matchedSkills.map((s) => (
                  <Badge key={s} variant="success">{s}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-indigo-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-400" /> Weekly learning plan generated
          </CardTitle>
          <CardDescription>Personalized week-by-week roadmap — one skill at a time</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {plan.weeklyLearningPlan.map((w) => (
            <div key={w.week} className="flex gap-3 rounded-xl border border-indigo-500/20 bg-[#151d2e] p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-sm font-bold text-indigo-300">
                W{w.week}
              </div>
              <div>
                <p className="font-semibold text-white">{w.skill}</p>
                <p className="mt-1 text-sm text-slate-400">{w.focus}</p>
                {w.resources?.length ? (
                  <ul className="mt-2 space-y-0.5">
                    {w.resources.slice(0, 2).map((r) => (
                      <li key={r} className="flex items-center gap-1 text-xs text-slate-500">
                        <CheckCircle2 className="h-3 w-3 text-indigo-400" /> {r}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link href="/intelligence">
          <Button variant="outline" className="gap-2">
            Run full career scan <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/career-growth">
          <Button className="gap-2">
            <Sparkles className="h-4 w-4" /> Deep dive simulator
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function CareerTwinPage() {
  const { token } = useAuth();
  const [message, setMessage] = useState("");
  const [plan, setPlan] = useState<CareerTwinPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { data: history } = useQuery({
    queryKey: ["career-twin"],
    queryFn: () => api.getCareerTwinHistory(token!),
    enabled: !!token,
  });

  const sendGoal = async (text?: string) => {
    const goal = (text ?? message).trim();
    if (!token || !goal) return;
    setMessage(goal);
    setLoading(true);
    setError("");
    try {
      const { plan: data } = await api.careerTwinChat(token, goal);
      setPlan(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Career Twin could not respond");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <DashboardLayout title="Career Twin AI">
        <PageHero
          eyebrow="Team Bytebrains · Hero feature"
          title="Career Twin AI"
          description="Your autonomous career agent — parse goals in plain English, analyze skills, and generate a week-by-week roadmap."
        >
          <TeamBadge className="mt-4 border-white/20 bg-white/10 text-indigo-100" />
        </PageHero>

        <Card className="mb-6 border-white/[0.08] p-6">
          <p className="mb-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Agent pipeline</p>
          <AgentPipeline active={loading ? 2 : plan ? 4 : -1} />
        </Card>

        <Card className="mx-auto max-w-3xl border-violet-500/20 shadow-lg shadow-indigo-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-400" /> Talk to Career Twin
            </CardTitle>
            <CardDescription>Natural language in → personalized career plan out</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <DemoFillButton
                label="Run demo goal"
                disabled={loading}
                onClick={() => sendGoal(DEMO_CAREER_GOAL)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_GOALS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => sendGoal(g)}
                  disabled={loading}
                  className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-left text-xs text-violet-200 transition hover:bg-violet-500/20 disabled:opacity-50"
                >
                  {g}
                </button>
              ))}
            </div>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="I want to become a Senior Full Stack Engineer in 12 months..."
              rows={3}
              className="resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendGoal();
                }
              }}
            />
            {error && <ErrorAlert message={error} />}
            <Button onClick={() => sendGoal()} disabled={loading || !message.trim()} className="w-full btn-glow gap-2" size="lg">
              <Send className="h-4 w-4" />
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse-soft rounded-full bg-white" />
                  Career Twin is thinking...
                </span>
              ) : (
                "Ask Career Twin"
              )}
            </Button>
          </CardContent>
        </Card>

        {plan && (
          <div className="mt-10 space-y-6">
            <SuccessAlert
              message="Career plan ready — run a full Career Scan next for resume + GitHub intelligence."
              action={
                <Link href="/intelligence">
                  <Button size="sm" variant="outline" className="border-emerald-500/30 text-emerald-200">
                    Career Scan <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              }
            />
            <TwinResponse plan={plan} />
          </div>
        )}

        {!plan && !loading && (
          <p className="mt-8 text-center text-sm text-slate-400">
            No plan yet — use an example above or type your career goal.
          </p>
        )}

        {history?.plans && history.plans.length > 0 && (
          <Card className="mt-10">
            <CardHeader><CardTitle className="text-base">Recent conversations</CardTitle></CardHeader>
            <CardContent className="divide-y divide-white/[0.06]">
              {history.plans.map((p) => (
                <button
                  key={p._id || p.id}
                  type="button"
                  onClick={() => setPlan(p as CareerTwinPlan)}
                  className="flex w-full items-center justify-between py-3 text-left hover:bg-white/5"
                >
                  <div className="min-w-0 pr-4">
                    <p className="truncate text-sm font-medium text-white">{p.userMessage}</p>
                    <p className="text-xs text-slate-500">{p.targetRole} · {p.estimatedTimelineMonths} mo</p>
                  </div>
                  <Badge variant="success">{p.currentReadiness}%</Badge>
                </button>
              ))}
            </CardContent>
          </Card>
        )}
      </DashboardLayout>
    </AuthGuard>
  );
}
