"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TrendingUp, Target, Clock, DollarSign, CheckCircle2 } from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { DashboardLayout } from "@/components/layout/sidebar";
import { RoleSelect } from "@/components/role-select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Badge, Progress } from "@/components/ui/input";
import { HistorySection, ErrorAlert, LoadingCard } from "@/components/page-states";
import { PageHero } from "@/components/page-hero";
import { useAuth } from "@/lib/auth-context";
import { api, CareerGrowthPlan } from "@/lib/api";
import { JOB_ROLES } from "@/lib/job-roles";

export default function CareerGrowthPage() {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const [skillsInput, setSkillsInput] = useState(user?.skills?.join(", ") || "");
  const [currentSalary, setCurrentSalary] = useState("6");
  const [targetRole, setTargetRole] = useState<string>(JOB_ROLES[0]);
  const [plan, setPlan] = useState<CareerGrowthPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { data: history } = useQuery({
    queryKey: ["career-growth"],
    queryFn: () => api.getCareerGrowthPlans(token!),
    enabled: !!token,
  });

  const handleSimulate = async () => {
    if (!token || !targetRole.trim()) {
      setError("Please select or enter a target role");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const currentSkills = skillsInput.split(",").map((s) => s.trim()).filter(Boolean);
      const data = await api.simulateCareerGrowth(token, {
        currentSkills,
        targetRole: targetRole.trim(),
        currentSalary,
      });
      setPlan(data);
      queryClient.invalidateQueries({ queryKey: ["career-growth"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Simulation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <DashboardLayout title="Career Growth Simulator">
        <PageHero
          eyebrow="Feature 5 · Career Growth Simulator"
          title="Readiness & salary projection"
          description="Simulate your path to your dream role with market readiness, LPA range, and a weekly learning plan."
          icon={<TrendingUp className="h-14 w-14 text-indigo-300/80" />}
        />
        {loading && !plan && <LoadingCard message="Running career growth simulation…" />}
        <div className={loading && !plan ? "hidden" : "grid gap-6 lg:grid-cols-2"}>
          <Card>
            <CardHeader>
              <CardTitle>Your Current State</CardTitle>
              <CardDescription>Input your skills and target role</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Current Skills (comma-separated)</Label>
                <Input value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} placeholder="React, Node, MongoDB" className="mt-1" />
              </div>
              <RoleSelect label="Target Role" value={targetRole} onChange={setTargetRole} required />
              <div>
                <Label>Current Salary (LPA)</Label>
                <Input value={currentSalary} onChange={(e) => setCurrentSalary(e.target.value)} placeholder="6" className="mt-1" />
              </div>
              {error && <ErrorAlert message={error} />}
              <Button onClick={handleSimulate} disabled={loading} className="w-full btn-glow">
                Run Career Simulation
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Growth Plan Summary</CardTitle></CardHeader>
            <CardContent>
              {plan ? (
                <div className="space-y-6">
                  <div className="rounded-lg bg-indigo-500/10 px-4 py-3">
                    <p className="text-xs font-medium text-indigo-400">Target Role</p>
                    <p className="font-semibold text-white">{plan.targetRole}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-white/5 p-4">
                      <p className="text-xs text-slate-500">Current readiness</p>
                      <p className="text-2xl font-bold text-white">{plan.marketScore}%</p>
                      <Progress value={plan.marketScore} className="mt-2" />
                    </div>
                    <div className="rounded-lg bg-emerald-500/10 p-4">
                      <p className="text-xs text-slate-500">Expected readiness</p>
                      <p className="text-2xl font-bold text-emerald-400">{plan.expectedReadiness ?? plan.marketScore}%</p>
                      <Progress value={plan.expectedReadiness ?? plan.marketScore} className="mt-2" />
                    </div>
                  </div>
                  {plan.potentialSalaryRange && (
                    <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-4 text-center">
                      <p className="text-xs font-medium text-violet-300">Potential salary range after upskilling</p>
                      <p className="text-2xl font-bold text-violet-900">{plan.potentialSalaryRange}</p>
                      {plan.currentSalaryLpa && (
                        <p className="mt-1 text-sm text-slate-500">From {plan.currentSalaryLpa} LPA today</p>
                      )}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-white/5 p-4">
                      <Clock className="h-5 w-5 text-indigo-400" />
                      <p className="mt-2 text-lg font-bold text-white">{plan.estimatedLearningMonths} months</p>
                      <p className="text-xs text-slate-500">Estimated learning time</p>
                    </div>
                    <div className="rounded-lg bg-emerald-500/10 p-4">
                      <DollarSign className="h-5 w-5 text-emerald-400" />
                      <p className="mt-2 text-lg font-bold text-emerald-400">{plan.salaryIncrease}</p>
                      <p className="text-xs text-slate-500">Expected salary increase</p>
                    </div>
                  </div>
                  {plan.matchedSkills?.length ? (
                    <div>
                      <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-400"><CheckCircle2 className="h-4 w-4" /> Skills You Already Have</h4>
                      <div className="flex flex-wrap gap-2">
                        {plan.matchedSkills.map((s) => <Badge key={s} variant="success">{s}</Badge>)}
                      </div>
                    </div>
                  ) : null}
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-slate-400">Missing Skills ({plan.missingSkills.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {plan.missingSkills.map((s) => <Badge key={s} variant="warning">{s}</Badge>)}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400">Run a simulation to see your personalized growth plan</p>
              )}
            </CardContent>
          </Card>
        </div>

        {plan?.roadmap?.length ? (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Complete Weekly Roadmap</CardTitle>
              <CardDescription>{plan.roadmap.length} weeks — one skill per week until job-ready</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {plan.roadmap.map((item) => (
                  <div key={`${item.week}-${item.skill}`} className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-400">Week {item.week}</p>
                    <p className="mt-1 text-base font-bold text-white">{item.skill}</p>
                    <p className="mt-2 text-sm text-slate-300">{item.focus}</p>
                    {item.resources?.length ? (
                      <ul className="mt-3 space-y-1 border-t border-indigo-500/20 pt-3">
                        {item.resources.map((r) => (
                          <li key={r} className="text-xs text-slate-500">• {r}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {history?.plans.length ? (
          <HistorySection
            title="Previous Simulations"
            emptyMessage="No simulations yet."
            items={history.plans}
            renderItem={(p: CareerGrowthPlan) => (
              <button
                key={p._id}
                type="button"
                onClick={() => setPlan(p)}
                className="flex w-full items-center justify-between py-3 text-left hover:bg-white/5"
              >
                <div>
                  <p className="font-medium text-white">{p.targetRole}</p>
                  <p className="text-sm text-slate-500">{p.currentSkills.slice(0, 4).join(", ")} · {p.roadmap?.length || 0} weeks</p>
                </div>
                <Badge variant="success">{p.marketScore}% ready</Badge>
              </button>
            )}
          />
        ) : (
          <HistorySection title="Previous Simulations" emptyMessage="No simulations yet." items={[]} renderItem={() => null} />
        )}
      </DashboardLayout>
    </AuthGuard>
  );
}
