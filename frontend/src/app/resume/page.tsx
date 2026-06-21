"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { DashboardLayout } from "@/components/layout/sidebar";
import { RoleSelect } from "@/components/role-select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea, Label, Badge, Progress, Select } from "@/components/ui/input";
import { HistorySection, ErrorAlert, LoadingCard } from "@/components/page-states";
import { PageHero } from "@/components/page-hero";
import { useAuth } from "@/lib/auth-context";
import { api, ResumeAnalysis } from "@/lib/api";
import { JOB_ROLES, getRoleSkillsText } from "@/lib/job-roles";

function ResultView({ result }: { result: ResumeAnalysis }) {
  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-400">ATS Score</span>
          <span className="text-2xl font-bold text-indigo-400">{result.atsScore}%</span>
        </div>
        <Progress value={result.atsScore} />
      </div>
      {result.resumeQuality && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Resume quality</span>
          <Badge variant={result.atsScore >= 70 ? "success" : "warning"}>{result.resumeQuality}</Badge>
        </div>
      )}
      {result.feedback && <p className="rounded-lg bg-indigo-500/10 p-4 text-sm text-indigo-200">{result.feedback}</p>}
      {result.weakBullets && result.weakBullets.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-slate-300">AI bullet upgrades</h4>
          {result.weakBullets.map((b, i) => (
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
      <div>
        <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-400"><CheckCircle className="h-4 w-4" /> Strengths</h4>
        <div className="flex flex-wrap gap-2">
          {result.strengths?.map((s) => <Badge key={s} variant="success">{s}</Badge>)}
        </div>
      </div>
      <div>
        <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-amber-400"><AlertCircle className="h-4 w-4" /> Missing Keywords</h4>
        <div className="flex flex-wrap gap-2">
          {result.missingKeywords?.length ? result.missingKeywords.map((s) => <Badge key={s} variant="warning">{s}</Badge>) : <span className="text-sm text-slate-400">None detected</span>}
        </div>
      </div>
      <div>
        <h4 className="mb-2 text-sm font-medium text-slate-400">Detected Skills</h4>
        <div className="flex flex-wrap gap-2">
          {result.skills?.map((s) => <Badge key={s}>{s}</Badge>)}
        </div>
      </div>
    </div>
  );
}

export default function ResumePage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState("");
  const [targetRole, setTargetRole] = useState<string>(JOB_ROLES[0]);
  const [useRoleCompare, setUseRoleCompare] = useState(false);
  const [result, setResult] = useState<ResumeAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { data: history } = useQuery({
    queryKey: ["resumes"],
    queryFn: () => api.getResumes(token!),
    enabled: !!token,
  });

  const handleFileChange = (f: File | null) => {
    if (!f) return setFile(null);
    if (f.type !== "application/pdf") return setError("Only PDF files are allowed");
    if (f.size > 5 * 1024 * 1024) return setError("File must be under 5MB");
    setError("");
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file || !token) return;
    setLoading(true);
    setError("");
    try {
      const data = await api.uploadResume(token, file, useRoleCompare ? getRoleSkillsText(targetRole) : jdText || undefined);
      setResult(data.resume);
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const loadHistoryItem = async (id: string) => {
    if (!token) return;
    try {
      const { resume } = await api.getResume(token, id);
      setResult(resume);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load resume");
    }
  };

  return (
    <AuthGuard>
      <DashboardLayout title="Resume Analyzer">
        <PageHero
          eyebrow="Feature 1 · Resume Intelligence"
          title="ATS score + AI bullet upgrades"
          description="Upload a PDF for keyword gaps, quality rating, and before/after bullet improvements."
        />
        {loading && !result && <LoadingCard message="Analyzing resume with AI…" />}
        <div className={loading && !result ? "hidden" : "grid gap-6 lg:grid-cols-2"}>
          <Card>
            <CardHeader>
              <CardTitle>Resume Intelligence</CardTitle>
              <CardDescription>ATS score, quality, missing keywords, and AI bullet upgrades — not just a score</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Resume PDF</Label>
                <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-white/5 p-8 transition-colors hover:border-indigo-500/40 hover:bg-indigo-500/10">
                  <Upload className="mb-2 h-8 w-8 text-slate-400" />
                  <span className="text-sm text-slate-400">{file ? file.name : "Click to upload PDF (max 5MB)"}</span>
                  <input type="file" accept=".pdf" className="hidden" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
                </label>
              </div>
              <div>
                <Label>Compare against job (optional)</Label>
                <Select value={useRoleCompare ? "role" : "jd"} onChange={(e) => setUseRoleCompare(e.target.value === "role")} className="mt-1">
                  <option value="jd">Paste job description</option>
                  <option value="role">Select target role</option>
                </Select>
              </div>
              {useRoleCompare ? (
                <RoleSelect label="Target Role" value={targetRole} onChange={setTargetRole} />
              ) : (
                <div>
                  <Label>Job Description</Label>
                  <Textarea value={jdText} onChange={(e) => setJdText(e.target.value)} placeholder="Paste job description for targeted analysis..." className="mt-1" />
                </div>
              )}
              {error && <ErrorAlert message={error} />}
              <Button onClick={handleUpload} disabled={!file || loading} className="w-full">
                {loading ? "Analyzing..." : "Analyze Resume"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Analysis Results</CardTitle></CardHeader>
            <CardContent>
              {result ? <ResultView result={result} /> : <p className="text-slate-400">Upload a resume to see analysis results</p>}
            </CardContent>
          </Card>
        </div>

        <HistorySection
          title="Previous Analyses"
          emptyMessage="No resume analyses yet. Upload your first PDF above."
          items={history?.resumes || []}
          renderItem={(r: ResumeAnalysis) => (
            <button
              key={r._id || r.id}
              type="button"
              onClick={() => loadHistoryItem(r._id || r.id!)}
              className="flex w-full items-center justify-between py-3 text-left hover:bg-white/5"
            >
              <span className="text-sm text-slate-300">{r.fileName}</span>
              <Badge variant={r.atsScore >= 70 ? "success" : "warning"}>{r.atsScore}% ATS</Badge>
            </button>
          )}
        />
      </DashboardLayout>
    </AuthGuard>
  );
}
