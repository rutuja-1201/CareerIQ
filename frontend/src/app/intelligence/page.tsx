"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import {
  Upload, Target, Sparkles, ArrowRight, Zap, TrendingUp,
  GitCompare, MessageSquare, Code2, FileText, CheckCircle2,
} from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { DashboardLayout } from "@/components/layout/sidebar";
import { RoleSelect } from "@/components/role-select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Badge, Progress } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { api, IntelligenceReport } from "@/lib/api";
import { JOB_ROLES } from "@/lib/job-roles";
import { extractGithubUsername, ErrorAlert, LoadingCard, SuccessAlert } from "@/components/page-states";
import { PageHero } from "@/components/page-hero";
import { DemoFillButton } from "@/components/demo-actions";
import {
  DEMO_GITHUB_USERNAME,
  DEMO_SALARY_LPA,
  DEMO_TARGET_ROLE,
} from "@/lib/demo-prefill";

function SkillPills({ skills, variant = "default" }: { skills: string[]; variant?: "default" | "missing" | "matched" }) {
  const v = variant === "missing" ? "warning" : variant === "matched" ? "success" : "default";
  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((s) => (
        <Badge key={s} variant={v as "default" | "warning" | "success"}>{s}</Badge>
      ))}
    </div>
  );
}

export default function IntelligencePage() {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [github, setGithub] = useState(user?.githubUrl ? extractGithubUsername(user.githubUrl) : "");
  const [targetRole, setTargetRole] = useState<string>(JOB_ROLES[0]);
  const [currentSalary, setCurrentSalary] = useState("6");
  const [report, setReport] = useState<IntelligenceReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.githubUrl && !github) {
      setGithub(extractGithubUsername(user.githubUrl));
    }
  }, [user?.githubUrl, github]);

  const fillDemo = () => {
    setGithub(user?.githubUrl ? extractGithubUsername(user.githubUrl) : DEMO_GITHUB_USERNAME);
    setTargetRole(DEMO_TARGET_ROLE);
    setCurrentSalary(DEMO_SALARY_LPA);
    setError("");
  };

  const handleScan = async () => {
    if (!token) return;
    if (!file && !github.trim()) {
      setError("Upload your resume and/or enter your GitHub username");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const form = new FormData();
      if (file) form.append("resume", file);
      form.append("githubUsername", github.trim());
      form.append("targetRole", targetRole);
      form.append("currentSalary", currentSalary);
      const { report: data } = await api.runIntelligenceScan(token, form);
      setReport(data);
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <DashboardLayout title="Career Intelligence Scan">
        <PageHero
          eyebrow="GitHub + Resume + Job Market Intelligence"
          title="One scan. Full career picture."
          description="Upload your resume, connect GitHub, pick a target role — get ATS analysis, skill extraction, gap analysis, learning roadmap, salary simulation, and interview prep in one flow."
          icon={<Zap className="h-16 w-16 text-indigo-300/80" />}
        />

        {loading && !report ? (
          <LoadingCard message="Running full intelligence scan — resume, GitHub, skills, salary & interviews…" />
        ) : !report ? (
          <Card className="mx-auto max-w-2xl">
            <CardHeader>
              <CardTitle>Start your intelligence scan</CardTitle>
              <CardDescription>Resume + GitHub + target role → complete developer career report</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex justify-end">
                <DemoFillButton onClick={fillDemo} disabled={loading} />
              </div>
              <div>
                <Label className="flex items-center gap-2"><FileText className="h-4 w-4" /> Resume PDF</Label>
                <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-white/5 p-6 hover:border-indigo-500/40">
                  <Upload className="mb-2 h-7 w-7 text-slate-400" />
                  <span className="text-sm text-slate-400">{file ? file.name : "Upload PDF (optional if GitHub provided)"}</span>
                  <input type="file" accept=".pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </label>
              </div>
              <div>
                <Label className="flex items-center gap-2"><Code2 className="h-4 w-4" /> GitHub profile</Label>
                <Input
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="rutuja or github.com/rutuja"
                  className="mt-1"
                />
              </div>
              <RoleSelect label="Target role" value={targetRole} onChange={setTargetRole} required />
              <div>
                <Label className="flex items-center gap-2"><Target className="h-4 w-4" /> Current salary (LPA)</Label>
                <Input value={currentSalary} onChange={(e) => setCurrentSalary(e.target.value)} placeholder="6" className="mt-1" />
              </div>
              {error && <ErrorAlert message={error} />}
              <Button onClick={handleScan} disabled={loading} className="w-full gap-2 btn-glow" size="lg">
                <Sparkles className="h-4 w-4" />
                Run Career Intelligence Scan
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            <SuccessAlert
              message="Scan complete — your dashboard metrics are updated."
              action={
                <Link href="/dashboard">
                  <Button size="sm" variant="outline" className="border-emerald-500/30 text-emerald-200">
                    View dashboard
                  </Button>
                </Link>
              }
            />
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white">Intelligence Report</h3>
                <p className="text-slate-500">Target: {report.targetRole}</p>
              </div>
              <Button variant="outline" onClick={() => setReport(null)}>New scan</Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-emerald-500/20 bg-emerald-500/10">
                <CardHeader className="pb-2"><CardTitle className="text-base text-emerald-300">Current stack</CardTitle></CardHeader>
                <CardContent><SkillPills skills={report.currentSkills} variant="matched" /></CardContent>
              </Card>
              <Card className="border-indigo-500/20 bg-indigo-500/10">
                <CardHeader className="pb-2"><CardTitle className="text-base text-indigo-300">Target role needs</CardTitle></CardHeader>
                <CardContent><SkillPills skills={report.targetSkills} /></CardContent>
              </Card>
            </div>

            {report.resume && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-indigo-400" /> Resume Intelligence</CardTitle>
                  <CardDescription>ATS score, quality, keywords, and AI bullet upgrades</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-6">
                    <div>
                      <p className="text-sm text-slate-500">ATS Score</p>
                      <p className="text-3xl font-bold text-indigo-400">{report.resume.atsScore}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Quality</p>
                      <Badge variant={report.resume.atsScore >= 70 ? "success" : "warning"}>{report.resume.resumeQuality}</Badge>
                    </div>
                  </div>
                  <Progress value={report.resume.atsScore} />
                  {report.resume.feedback && <p className="rounded-lg bg-indigo-500/10 p-3 text-sm text-indigo-200">{report.resume.feedback}</p>}
                  {report.resume.weakBullets?.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-slate-300">AI bullet upgrades</h4>
                      {report.resume.weakBullets.slice(0, 3).map((b, i) => (
                        <div key={i} className="grid gap-2 rounded-lg border border-white/10 p-3 md:grid-cols-2">
                          <div>
                            <p className="text-xs font-medium text-red-400">Before</p>
                            <p className="text-sm text-slate-400">{b.before}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-emerald-400">After</p>
                            <p className="text-sm text-white">{b.after}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <Link href="/resume" className="inline-flex items-center gap-1 text-sm text-indigo-400 hover:underline">
                    Full resume analysis <ArrowRight className="h-3 w-3" />
                  </Link>
                </CardContent>
              </Card>
            )}

            {report.github && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Code2 className="h-5 w-5 text-white" /> GitHub Skill Extraction</CardTitle>
                  <CardDescription>Languages, frameworks, topics, and activity from @{report.github.username}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <p className="text-3xl font-bold text-indigo-400">{report.github.developerScore}/100</p>
                    <span className="text-sm text-slate-500">Developer score · {report.github.recentActivity} active repos (90d)</span>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium text-slate-400">Detected frameworks & tools</p>
                    <SkillPills skills={report.github.frameworks || []} />
                  </div>
                  {report.github.topics?.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-medium text-slate-400">Repository topics</p>
                      <SkillPills skills={report.github.topics} />
                    </div>
                  )}
                  <Link href="/github" className="inline-flex items-center gap-1 text-sm text-indigo-400 hover:underline">
                    Full GitHub report <ArrowRight className="h-3 w-3" />
                  </Link>
                </CardContent>
              </Card>
            )}

            <Card className="border-amber-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><GitCompare className="h-5 w-5 text-amber-400" /> Skill Gap Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Match score</p>
                    <p className="text-4xl font-bold text-indigo-400">{report.skillGap.match}%</p>
                  </div>
                  <Progress value={report.skillGap.match} className="flex-1" />
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-amber-400">Missing skills</p>
                  <SkillPills skills={report.skillGap.missing} variant="missing" />
                </div>
                <Link href="/skill-gap" className="inline-flex items-center gap-1 text-sm text-indigo-400 hover:underline">
                  Deep dive skill gap <ArrowRight className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>

            <Card className="border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-indigo-500/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-violet-400" /> Career Growth Simulator</CardTitle>
                <CardDescription>The feature judges remember — market readiness & salary projection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl bg-[#151d2e] p-4 shadow-sm">
                    <p className="text-xs text-slate-500">Current readiness</p>
                    <p className="text-2xl font-bold text-white">{report.careerGrowth.marketScore}%</p>
                  </div>
                  <div className="rounded-xl bg-[#151d2e] p-4 shadow-sm">
                    <p className="text-xs text-slate-500">Expected readiness</p>
                    <p className="text-2xl font-bold text-emerald-400">{report.careerGrowth.expectedReadiness}%</p>
                  </div>
                  <div className="rounded-xl bg-[#151d2e] p-4 shadow-sm">
                    <p className="text-xs text-slate-500">Current salary</p>
                    <p className="text-2xl font-bold text-white">{report.careerGrowth.currentSalaryLpa} LPA</p>
                  </div>
                  <div className="rounded-xl bg-[#151d2e] p-4 shadow-sm">
                    <p className="text-xs text-slate-500">Potential range</p>
                    <p className="text-2xl font-bold text-indigo-400">{report.careerGrowth.potentialSalaryRange}</p>
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-400">Learn to close the gap</p>
                  <SkillPills skills={report.careerGrowth.missingSkills} variant="missing" />
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-300">AI learning roadmap</p>
                  {report.careerGrowth.roadmap.slice(0, 6).map((w) => (
                    <div key={w.week} className="flex gap-4 rounded-lg border border-violet-500/20 bg-[#151d2e] p-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-sm font-bold text-violet-300">
                        W{w.week}
                      </div>
                      <div>
                        <p className="font-medium text-white">{w.skill}</p>
                        <p className="text-sm text-slate-400">{w.focus}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/career-growth" className="inline-flex items-center gap-1 text-sm text-indigo-400 hover:underline">
                  Full career simulation <ArrowRight className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>

            {report.skillGap.learningRoadmap?.length > 0 && (
              <Card>
                <CardHeader><CardTitle>AI Learning Roadmap</CardTitle></CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                  {report.skillGap.learningRoadmap.map((w) => (
                    <div key={w.week} className="rounded-lg border border-white/10 p-4">
                      <p className="text-xs font-medium text-indigo-400">Week {w.week}</p>
                      <p className="font-semibold text-white">{w.skill}</p>
                      <p className="mt-1 text-sm text-slate-400">{w.focus}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-indigo-400" /> Interview Preparation</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {[
                  { title: "Technical", items: report.interviewPreview.technical },
                  { title: "HR / Behavioral", items: report.interviewPreview.hr },
                  { title: "Project-based", items: report.interviewPreview.projectBased },
                  { title: "Architecture", items: report.interviewPreview.architecture },
                ].map(({ title, items }) => (
                  <div key={title} className="rounded-lg bg-white/5 p-4">
                    <p className="mb-2 font-medium text-white">{title}</p>
                    <ul className="space-y-2">
                      {items?.map((q, i) => (
                        <li key={i} className="flex gap-2 text-sm text-slate-400">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </DashboardLayout>
    </AuthGuard>
  );
}
