"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthGuard } from "@/components/auth-guard";
import { DashboardLayout } from "@/components/layout/sidebar";
import { RoleSelect } from "@/components/role-select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea, Label, Badge } from "@/components/ui/input";
import { HistorySection, ErrorAlert } from "@/components/page-states";
import { PageHero } from "@/components/page-hero";
import { useAuth } from "@/lib/auth-context";
import { api, JobDescription } from "@/lib/api";
import { JOB_ROLES } from "@/lib/job-roles";

export default function JobDescriptionPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [title, setTitle] = useState<string>(JOB_ROLES[3]);
  const [result, setResult] = useState<JobDescription | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { data: history } = useQuery({
    queryKey: ["job-descriptions"],
    queryFn: () => api.getJobDescriptions(token!),
    enabled: !!token,
  });

  const handleAnalyze = async () => {
    if (!text.trim() || !token) return;
    if (!title.trim()) return setError("Please select or enter a job role");
    setLoading(true);
    setError("");
    try {
      const data = await api.createJobDescription(token, text, title.trim());
      setResult(data.jobDescription);
      setText("");
      queryClient.invalidateQueries({ queryKey: ["job-descriptions"] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const loadHistoryItem = async (id: string) => {
    if (!token) return;
    try {
      const { jobDescription } = await api.getJobDescription(token, id);
      setResult(jobDescription);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load JD");
    }
  };

  return (
    <AuthGuard>
      <DashboardLayout title="Job Description Analyzer">
        <PageHero
          eyebrow="Job description analyzer"
          title="Extract skills from any JD"
          description="Paste a job posting — get required skills, experience level, and a reusable profile for skill gap matching."
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Paste Job Description</CardTitle>
              <CardDescription>Extract required skills and experience using AI + algorithmic parsing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RoleSelect label="Job Role / Title" value={title} onChange={setTitle} required />
              <div>
                <Label>Job Description</Label>
                <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="React Developer&#10;3 years experience&#10;AWS, Docker, PostgreSQL..." className="mt-1 min-h-[200px]" />
              </div>
              {error && <ErrorAlert message={error} />}
              <Button onClick={handleAnalyze} disabled={!text.trim() || loading} className="w-full">
                {loading ? "Extracting skills..." : "Analyze JD"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Extracted Skills</CardTitle></CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-500">Role</p>
                    <p className="text-lg font-semibold text-white">{result.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Experience Required</p>
                    <p className="font-medium text-white">{result.experienceRequired} years</p>
                  </div>
                  <div>
                    <p className="mb-2 text-sm text-slate-500">Skills ({result.skills.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {result.skills.map((s) => <Badge key={s}>{s}</Badge>)}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400">Paste a job description to extract skills</p>
              )}
            </CardContent>
          </Card>
        </div>

        <HistorySection
          title="Saved Job Descriptions"
          emptyMessage="No saved job descriptions yet."
          items={history?.jobDescriptions || []}
          renderItem={(jd: JobDescription) => (
            <button
              key={jd._id || jd.id}
              type="button"
              onClick={() => loadHistoryItem(jd._id || jd.id!)}
              className="flex w-full items-center justify-between py-3 text-left hover:bg-white/5"
            >
              <div>
                <p className="font-medium text-white">{jd.title}</p>
                <p className="text-sm text-slate-500">{jd.skills.slice(0, 5).join(", ")}{jd.skills.length > 5 ? "..." : ""}</p>
              </div>
              <Badge>{jd.skills.length} skills</Badge>
            </button>
          )}
        />
      </DashboardLayout>
    </AuthGuard>
  );
}
