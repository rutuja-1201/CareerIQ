"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Code2, Star, GitCommit, FolderGit2 } from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { DashboardLayout } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Badge, Progress } from "@/components/ui/input";
import { HistorySection, extractGithubUsername, ErrorAlert, LoadingCard } from "@/components/page-states";
import { PageHero } from "@/components/page-hero";
import { useAuth } from "@/lib/auth-context";
import { api, GithubReport } from "@/lib/api";

function ReportView({ report }: { report: GithubReport }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900">
          <Code2 className="h-8 w-8 text-white" />
        </div>
        <div>
          <p className="text-lg font-bold text-white">@{report.username}</p>
          <p className="text-3xl font-bold text-indigo-400">{report.developerScore}/100</p>
        </div>
      </div>
      <Progress value={report.developerScore} />
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-white/5 p-3 text-center">
          <FolderGit2 className="mx-auto h-5 w-5 text-slate-400" />
          <p className="mt-1 text-lg font-bold">{report.totalRepos}</p>
          <p className="text-xs text-slate-500">Repos</p>
        </div>
        <div className="rounded-lg bg-white/5 p-3 text-center">
          <Star className="mx-auto h-5 w-5 text-amber-400" />
          <p className="mt-1 text-lg font-bold">{report.totalStars}</p>
          <p className="text-xs text-slate-500">Stars</p>
        </div>
        <div className="rounded-lg bg-white/5 p-3 text-center">
          <GitCommit className="mx-auto h-5 w-5 text-emerald-500" />
          <p className="mt-1 text-lg font-bold">{report.totalCommits}+</p>
          <p className="text-xs text-slate-500">Commits</p>
        </div>
      </div>
      {(report.frameworks?.length || report.strengths?.length) ? (
        <div>
          <h4 className="mb-2 text-sm font-medium text-slate-400">Frameworks & tools detected</h4>
          <div className="flex flex-wrap gap-2">
            {(report.frameworks?.length ? report.frameworks : report.strengths).map((s) => (
              <Badge key={s} variant="success">{s}</Badge>
            ))}
          </div>
        </div>
      ) : null}
      <div>
        <h4 className="mb-2 text-sm font-medium text-slate-400">Languages</h4>
        <div className="flex flex-wrap gap-2">
          {(report.languages?.length ? report.languages.map((l) => l.name) : []).map((s) => (
            <Badge key={s}>{s}</Badge>
          ))}
        </div>
      </div>
      {report.topics && report.topics.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-medium text-slate-400">Repository topics</h4>
          <div className="flex flex-wrap gap-2">
            {report.topics.map((t) => <Badge key={t} variant="warning">{t}</Badge>)}
          </div>
        </div>
      )}
      {report.topRepos?.length ? (
        <div>
          <h4 className="mb-2 text-sm font-medium text-slate-400">Top Repositories</h4>
          <div className="space-y-2">
            {report.topRepos.map((repo) => (
              <div key={repo.name} className="flex items-center justify-between rounded-lg border border-white/[0.06] px-3 py-2">
                <span className="text-sm font-medium text-white">{repo.name}</span>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{repo.language}</span>
                  <span className="flex items-center gap-1"><Star className="h-3 w-3" />{repo.stars}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function GithubPage() {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const [username, setUsername] = useState("");
  const [report, setReport] = useState<GithubReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.githubUrl && !username) {
      setUsername(extractGithubUsername(user.githubUrl));
    }
  }, [user, username]);

  const { data: history } = useQuery({
    queryKey: ["github-reports"],
    queryFn: () => api.getGithubReports(token!),
    enabled: !!token,
  });

  const handleAnalyze = async () => {
    if (!username.trim() || !token) return;
    setLoading(true);
    setError("");
    try {
      const data = await api.analyzeGithub(token, username.trim());
      setReport(data.report);
      queryClient.invalidateQueries({ queryKey: ["github-reports"] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <DashboardLayout title="GitHub Skill Extraction">
        <PageHero
          eyebrow="Feature 2 · GitHub Skill Extraction"
          title="Languages, frameworks & developer score"
          description="Bonus deep-dive — also included in the unified Career Scan."
        />
        {loading && !report && <LoadingCard message="Extracting skills from GitHub repositories…" />}
        <div className={loading && !report ? "hidden" : "grid gap-6 lg:grid-cols-2"}>
          <Card>
            <CardHeader>
              <CardTitle>Connect GitHub</CardTitle>
              <CardDescription>Analyze repositories, languages, stars, and developer score</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>GitHub Username</Label>
                <div className="mt-1 flex gap-2">
                  <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="octocat" />
                  <Button onClick={handleAnalyze} disabled={!username.trim() || loading}>
                    {loading ? "Analyzing..." : "Analyze"}
                  </Button>
                </div>
                {user?.githubUrl && (
                  <p className="mt-1 text-xs text-slate-500">From profile: {user.githubUrl}</p>
                )}
              </div>
              {error && <ErrorAlert message={error} />}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Developer Score</CardTitle></CardHeader>
            <CardContent>
              {report ? <ReportView report={report} /> : <p className="text-slate-400">Enter a GitHub username to analyze</p>}
            </CardContent>
          </Card>
        </div>

        <HistorySection
          title="Previous Analyses"
          emptyMessage="No GitHub analyses yet."
          items={history?.reports || []}
          renderItem={(r: GithubReport) => (
            <button
              key={r._id}
              type="button"
              onClick={() => setReport(r)}
              className="flex w-full items-center justify-between py-3 text-left hover:bg-white/5"
            >
              <span className="font-medium text-white">@{r.username}</span>
              <Badge variant="success">{r.developerScore}/100</Badge>
            </button>
          )}
        />
      </DashboardLayout>
    </AuthGuard>
  );
}
