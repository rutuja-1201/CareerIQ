"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthGuard } from "@/components/auth-guard";
import { DashboardLayout } from "@/components/layout/sidebar";
import { RoleSelect } from "@/components/role-select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, Label } from "@/components/ui/input";
import { HistorySection, ErrorAlert, LoadingCard } from "@/components/page-states";
import { PageHero } from "@/components/page-hero";
import { useAuth } from "@/lib/auth-context";
import { api, InterviewQuestions } from "@/lib/api";
import { JOB_ROLES } from "@/lib/job-roles";

const categories = [
  { key: "frontend" as const, label: "Frontend", color: "border-l-indigo-500" },
  { key: "backend" as const, label: "Backend", color: "border-l-emerald-500" },
  { key: "systemDesign" as const, label: "System Design", color: "border-l-amber-500" },
  { key: "behavioral" as const, label: "Behavioral", color: "border-l-violet-500" },
];

function QuestionsGrid({ questions }: { questions: InterviewQuestions }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {categories.map(({ key, label, color }) => (
        <Card key={key} className={`border-l-4 ${color}`}>
          <CardHeader><CardTitle className="text-base">{label}</CardTitle></CardHeader>
          <CardContent>
            <ol className="list-decimal space-y-3 pl-4">
              {questions[key]?.map((q, i) => (
                <li key={i} className="text-sm text-slate-300">{q}</li>
              ))}
            </ol>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function InterviewsPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [resumeId, setResumeId] = useState("");
  const [useTargetRole, setUseTargetRole] = useState(true);
  const [targetRole, setTargetRole] = useState<string>(JOB_ROLES[0]);
  const [jdId, setJdId] = useState("");
  const [questions, setQuestions] = useState<InterviewQuestions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { data: resumes } = useQuery({ queryKey: ["resumes"], queryFn: () => api.getResumes(token!), enabled: !!token });
  const { data: jds } = useQuery({ queryKey: ["job-descriptions"], queryFn: () => api.getJobDescriptions(token!), enabled: !!token });
  const { data: pastSessions } = useQuery({ queryKey: ["interviews"], queryFn: () => api.getInterviews(token!), enabled: !!token });

  const handleGenerate = async () => {
    if (!token) return;
    if (useTargetRole && !targetRole.trim()) return setError("Select or enter a target role");
    if (!useTargetRole && !jdId) return setError("Select a saved job description or use target role");
    setLoading(true);
    setError("");
    try {
      const data = await api.generateInterview(token, {
        resumeId: resumeId || undefined,
        jobDescriptionId: useTargetRole ? undefined : jdId || undefined,
        targetRole: useTargetRole ? targetRole.trim() : undefined,
      });
      setQuestions(data.questions);
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <DashboardLayout title="AI Interview Generator">
        <PageHero
          eyebrow="Feature 6 · Interview Preparation"
          title="AI-generated interview questions"
          description="Technical, system design, and behavioral questions tailored to your resume and target role."
        />
        {loading && !questions && <LoadingCard message="Generating personalized interview questions…" />}
        <Card className={`mb-6 ${loading && !questions ? "hidden" : ""}`}>
          <CardHeader>
            <CardTitle>Generate Questions</CardTitle>
            <CardDescription>Personalized interview prep based on your resume, experience, and target job</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Resume</Label>
                <Select value={resumeId} onChange={(e) => setResumeId(e.target.value)} className="mt-1">
                  <option value="">Profile skills</option>
                  {resumes?.resumes.map((r) => (
                    <option key={r._id || r.id} value={r._id || r.id}>{r.fileName}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Job source</Label>
                <Select value={useTargetRole ? "role" : "jd"} onChange={(e) => setUseTargetRole(e.target.value === "role")} className="mt-1">
                  <option value="role">Target job role</option>
                  <option value="jd">Saved job description</option>
                </Select>
              </div>
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
            <Button onClick={handleGenerate} disabled={loading} className="btn-glow">
              Generate Questions
            </Button>
          </CardContent>
        </Card>

        {questions ? (
          <QuestionsGrid questions={questions} />
        ) : !loading ? (
          <Card>
            <CardContent className="flex h-48 items-center justify-center text-slate-400">
              Generate questions to start your interview preparation
            </CardContent>
          </Card>
        ) : null}

        <HistorySection
          title="Previous Sessions"
          emptyMessage="No interview sessions yet."
          items={pastSessions?.questions || []}
          renderItem={(q: InterviewQuestions, i) => (
            <button
              key={q._id || i}
              type="button"
              onClick={() => setQuestions(q)}
              className="flex w-full items-center justify-between py-3 text-left hover:bg-white/5"
            >
              <div>
                <p className="font-medium text-white">Session {pastSessions!.questions.length - i}</p>
                <p className="text-sm text-slate-500">
                  {q.createdAt ? new Date(q.createdAt).toLocaleDateString() : "Recent"} · {(q.frontend?.length || 0) * 4} questions
                </p>
              </div>
              <span className="text-xs text-indigo-400">View →</span>
            </button>
          )}
        />
      </DashboardLayout>
    </AuthGuard>
  );
}
