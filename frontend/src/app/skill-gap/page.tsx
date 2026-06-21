"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthGuard } from "@/components/auth-guard";
import { DashboardLayout } from "@/components/layout/sidebar";
import { RoleSelect } from "@/components/role-select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, Label, Badge, Progress } from "@/components/ui/input";
import { HistorySection, ErrorAlert, LoadingCard } from "@/components/page-states";
import { PageHero } from "@/components/page-hero";
import { useAuth } from "@/lib/auth-context";
import { api, SkillAnalysis } from "@/lib/api";
import { JOB_ROLES } from "@/lib/job-roles";

function GapResult({ result }: { result: SkillAnalysis }) {
  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium">Match Score</span>
          <span className="text-2xl font-bold text-indigo-400">{result.match}%</span>
        </div>
        <Progress value={result.match} />
      </div>
      <div>
        <h4 className="mb-2 text-sm font-medium text-emerald-400">Matched Skills ({result.matched.length})</h4>
        <div className="flex flex-wrap gap-2">
          {result.matched.length ? result.matched.map((s) => <Badge key={s} variant="success">{s}</Badge>) : <span className="text-sm text-slate-400">No matches</span>}
        </div>
      </div>
      <div>
        <h4 className="mb-2 text-sm font-medium text-red-700">Missing Skills ({result.missing.length})</h4>
        <div className="flex flex-wrap gap-2">
          {result.missing.length ? result.missing.map((s) => <Badge key={s} variant="destructive">{s}</Badge>) : <span className="text-sm text-slate-400">No gaps!</span>}
        </div>
      </div>
      {result.learningRoadmap?.length ? (
        <div>
          <h4 className="mb-3 text-sm font-medium text-slate-300">Complete Learning Roadmap ({result.learningRoadmap.length} weeks)</h4>
          <div className="max-h-80 space-y-3 overflow-y-auto">
            {result.learningRoadmap.map((item) => (
              <div key={`${item.week}-${item.skill}`} className="rounded-lg border border-white/[0.06] bg-white/5 p-3">
                <p className="text-xs font-medium text-indigo-400">Week {item.week} — {item.skill}</p>
                {item.focus && <p className="text-sm text-slate-300">{item.focus}</p>}
                {item.resources?.length ? <p className="mt-1 text-xs text-slate-500">{item.resources.join(" · ")}</p> : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function SkillGapPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [resumeId, setResumeId] = useState("");
  const [jdId, setJdId] = useState("");
  const [useTargetRole, setUseTargetRole] = useState(true);
  const [targetRole, setTargetRole] = useState<string>(JOB_ROLES[0]);
  const [result, setResult] = useState<SkillAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { data: resumes } = useQuery({ queryKey: ["resumes"], queryFn: () => api.getResumes(token!), enabled: !!token });
  const { data: jds } = useQuery({ queryKey: ["job-descriptions"], queryFn: () => api.getJobDescriptions(token!), enabled: !!token });
  const { data: pastAnalyses } = useQuery({ queryKey: ["skill-analyses"], queryFn: () => api.getSkillAnalyses(token!), enabled: !!token });

  const handleAnalyze = async () => {
    if (!token) return;
    if (!useTargetRole && !jdId) return setError("Select a saved job description or switch to target role");
    if (useTargetRole && !targetRole.trim()) return setError("Select or enter a target role");
    setLoading(true);
    setError("");
    try {
      const data = await api.analyzeSkillGap(token, {
        resumeId: resumeId || undefined,
        jobDescriptionId: useTargetRole ? undefined : jdId || undefined,
        targetRole: useTargetRole ? targetRole.trim() : undefined,
      });
      setResult(data.analysis);
      queryClient.invalidateQueries({ queryKey: ["skill-analyses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <DashboardLayout title="Skill Gap Engine">
        <PageHero
          eyebrow="Feature 3 · Skill Gap Analysis"
          title="Your stack vs target role"
          description="Match percentage, missing skills, and a week-by-week learning roadmap."
        />
        {loading && !result && <LoadingCard message="Comparing your skills to the target role…" />}
        <div className={loading && !result ? "hidden" : "grid gap-6 lg:grid-cols-2"}>
          <Card>
            <CardHeader>
              <CardTitle>Compare Skills</CardTitle>
              <CardDescription>Pure algorithmic matching — compare against a target role or saved JD</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Resume (optional)</Label>
                <Select value={resumeId} onChange={(e) => setResumeId(e.target.value)} className="mt-1">
                  <option value="">Use profile skills</option>
                  {resumes?.resumes.map((r) => (
                    <option key={r._id || r.id} value={r._id || r.id}>{r.fileName}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Compare against</Label>
                <Select value={useTargetRole ? "role" : "jd"} onChange={(e) => setUseTargetRole(e.target.value === "role")} className="mt-1">
                  <option value="role">Target job role</option>
                  <option value="jd">Saved job description</option>
                </Select>
              </div>
              {useTargetRole ? (
                <RoleSelect label="Target Role" value={targetRole} onChange={setTargetRole} required />
              ) : (
                <div>
                  <Label>Saved Job Description</Label>
                  <Select value={jdId} onChange={(e) => setJdId(e.target.value)} className="mt-1">
                    <option value="">Select a JD</option>
                    {jds?.jobDescriptions.map((jd) => (
                      <option key={jd._id || jd.id} value={jd._id || jd.id}>{jd.title}</option>
                    ))}
                  </Select>
                </div>
              )}
              {error && <ErrorAlert message={error} />}
              <Button onClick={handleAnalyze} disabled={loading} className="w-full btn-glow">
                Run Skill Gap Analysis
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Gap Analysis</CardTitle></CardHeader>
            <CardContent>
              {result ? <GapResult result={result} /> : <p className="text-slate-400">Run analysis to see skill gaps and learning roadmap</p>}
            </CardContent>
          </Card>
        </div>

        <HistorySection
          title="Previous Analyses"
          emptyMessage="No skill gap analyses yet."
          items={pastAnalyses?.analyses || []}
          renderItem={(a: SkillAnalysis) => (
            <button
              key={a._id || a.id}
              type="button"
              onClick={() => setResult(a)}
              className="flex w-full items-center justify-between py-3 text-left hover:bg-white/5"
            >
              <div>
                <p className="font-medium text-white">{a.match}% match · {a.missing.length} gaps</p>
                <p className="text-sm text-slate-500">
                  {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "Recent"} · {a.jdSkills?.slice(0, 3).join(", ")}
                </p>
              </div>
              <Badge variant={a.match >= 70 ? "success" : "warning"}>{a.match}%</Badge>
            </button>
          )}
        />
      </DashboardLayout>
    </AuthGuard>
  );
}
