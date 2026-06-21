"use client";

import { useState, useRef, useEffect } from "react";
import {
  FileText, Sparkles, Download, ArrowRight, CheckCircle2,
  TrendingUp, Clipboard, Upload, Eye, X, Pencil
} from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { DashboardLayout } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, Label, Textarea } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import {
  api,
  ResumeBuilderResult,
  OptimizedResume,
  ResumeStylePrefs,
  downloadResumePdf,
} from "@/lib/api";
import { ErrorAlert, LoadingCard, SuccessAlert } from "@/components/page-states";
import { PageHero } from "@/components/page-hero";
import { ResumeEditorModal } from "@/components/resume-builder/ResumeEditorModal";

export default function ResumeBuilderPage() {
  const { token } = useAuth();
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<ResumeBuilderResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => {
    if (previewUrl) window.URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const closePreview = () => setPreviewUrl(null);

  const fetchPdfBlob = async (): Promise<Blob> => {
    if (!result || !token) throw new Error("No resume to generate");
    return downloadResumePdf(token, result.id);
  };

  const fillDemoData = () => {
    setResumeText(`Alex Developer
alex@email.com | 123-456-7890
linkedin.com/in/alexdev | github.com/alexdev

PROFESSIONAL SUMMARY
Software Developer with 2 years of experience building web applications.

EXPERIENCE
Software Developer | Tech Startup | 2022 - Present
• Built web applications with React and Node.js
• Worked on API development
• Collaborated with team members

SKILLS
JavaScript, React, Node.js, HTML, CSS, Git, MongoDB

EDUCATION
B.S. Computer Science | University | 2022`);

    setJobDescription(`Senior Full Stack Developer

We're looking for an experienced engineer with:
• 5+ years React, Node.js experience
• Strong Docker, Kubernetes skills
• AWS cloud expertise
• System design knowledge
• CI/CD pipeline experience
• Microservices architecture`);

    setSuccess("Demo data filled! Click Optimize Resume with AI to see the transformation.");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !token) return;

    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const response = await api.uploadResume(token, file);
      setResumeText(response.resume.extractedText || "");
      setSuccess("PDF uploaded and text extracted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to upload PDF. Try pasting your resume text instead.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleOptimize = async () => {
    if (!token) return;
    if (!resumeText.trim()) {
      setError("Please enter your resume text");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Please enter the job description");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.optimizeResume(token, { resumeText, jobDescription });
      setResult(response.data);
      setSuccess("Resume optimized successfully!");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to optimize resume");
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewPDF = async () => {
    if (!result) return;

    setPreviewLoading(true);
    setError("");

    try {
      const blob = await fetchPdfBlob();
      setPreviewUrl((prev) => {
        if (prev) window.URL.revokeObjectURL(prev);
        return window.URL.createObjectURL(blob);
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to preview PDF");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!result) return;

    setPdfLoading(true);
    setError("");

    try {
      const blob = await fetchPdfBlob();
      const candidateName = result.optimizedResume.contact?.name || "Resume";
      const safeFilename = candidateName.replace(/[^a-zA-Z0-9]/g, "_");
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${safeFilename}_Resume_Optimized.pdf`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
      setSuccess("PDF downloaded successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to download PDF");
    } finally {
      setPdfLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess("Copied to clipboard!");
    setTimeout(() => setSuccess(""), 2000);
  };

  return (
    <AuthGuard>
      <DashboardLayout title="AI Resume Builder">
        <div className="mx-auto max-w-7xl space-y-6">
          <PageHero
            icon={<Sparkles className="h-12 w-12 text-purple-400" />}
            title="AI Resume Builder"
            description="Optimize your resume for any job with AI-powered keyword injection and ATS scoring"
          />

          {error && <ErrorAlert message={error} onDismiss={() => setError("")} />}
          {success && <SuccessAlert message={success} onDismiss={() => setSuccess("")} />}

          {loading && !result && (
            <LoadingCard message="Optimizing your resume with AI — injecting keywords and improving ATS score…" />
          )}

          {!result && !loading && (
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={fillDemoData}>
                <Sparkles className="mr-2 h-4 w-4" />
                Fill Demo Data
              </Button>
            </div>
          )}

          {!result && !loading ? (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Your Current Resume
                  </CardTitle>
                  <CardDescription>Upload a PDF or paste your resume text below</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handlePdfUpload}
                      className="hidden"
                      id="pdf-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex-1"
                    >
                      {uploading ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current" />
                          Extracting Text...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload PDF
                        </>
                      )}
                    </Button>
                    <span className="text-sm text-slate-500">or paste below</span>
                  </div>

                  <div>
                    <Label htmlFor="resume-text">Resume Text</Label>
                    <Textarea
                      id="resume-text"
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder="Paste your full resume text here..."
                      rows={15}
                      className="mt-1 font-mono text-xs"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Target Job Description
                  </CardTitle>
                  <CardDescription>Paste the job description you are applying for</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="job-description">Job Description</Label>
                    <Textarea
                      id="job-description"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the full job description here..."
                      rows={15}
                      className="mt-1 font-mono text-xs"
                    />
                  </div>

                  <Button
                    onClick={handleOptimize}
                    disabled={loading || !resumeText.trim() || !jobDescription.trim()}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Optimize Resume with AI
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : result ? (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400">ATS Score</p>
                        <p className="text-3xl font-bold text-purple-400">{result.atsScoreAfter}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          was {result.atsScoreBefore}
                          <span className="ml-1 text-emerald-400">
                            (+{result.atsScoreAfter - result.atsScoreBefore})
                          </span>
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-emerald-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400">Keywords Added</p>
                        <p className="text-3xl font-bold text-purple-400">{result.addedKeywords.length}</p>
                        <p className="mt-1 text-xs text-slate-500">Missing keywords injected</p>
                      </div>
                      <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400">Target Role</p>
                        <p className="text-xl font-bold text-purple-400">{result.targetRole}</p>
                        <p className="mt-1 text-xs text-slate-500">Optimized for this role</p>
                      </div>
                      <FileText className="h-8 w-8 text-purple-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-400" />
                    Improvements Made
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.improvements.map((imp, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-300">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {result.addedKeywords.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Keywords Added to Your Resume</CardTitle>
                    <CardDescription>These missing keywords were naturally integrated</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {result.addedKeywords.map((keyword) => (
                        <Badge key={keyword} variant="success" className="px-3 py-1">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <span className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Optimized Resume
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(JSON.stringify(result.optimizedResume, null, 2))}
                      >
                        <Clipboard className="mr-2 h-4 w-4" />
                        Copy All
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePreviewPDF}
                        disabled={previewLoading || pdfLoading}
                      >
                        {previewLoading ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <Eye className="mr-2 h-4 w-4" />
                            Preview PDF
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleDownloadPDF}
                        disabled={pdfLoading || previewLoading}
                        className="bg-gradient-to-r from-purple-500 to-pink-500"
                      >
                        {pdfLoading ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                          </>
                        )}
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border-b border-white/[0.06] pb-4 text-center">
                    <h2 className="text-2xl font-bold text-white">{result.optimizedResume.contact.name}</h2>
                    <p className="text-sm text-slate-400">
                      {result.optimizedResume.contact.email}
                      {result.optimizedResume.contact.phone && ` | ${result.optimizedResume.contact.phone}`}
                    </p>
                    {(result.optimizedResume.contact.linkedin || result.optimizedResume.contact.github) && (
                      <p className="text-sm text-slate-400">
                        {result.optimizedResume.contact.linkedin && `LinkedIn: ${result.optimizedResume.contact.linkedin}`}
                        {result.optimizedResume.contact.linkedin && result.optimizedResume.contact.github && " | "}
                        {result.optimizedResume.contact.github && `GitHub: ${result.optimizedResume.contact.github}`}
                      </p>
                    )}
                  </div>

                  {result.optimizedResume.summary && (
                    <div>
                      <h3 className="mb-2 text-lg font-semibold text-white">Professional Summary</h3>
                      <p className="text-sm text-slate-400">{result.optimizedResume.summary}</p>
                    </div>
                  )}

                  {result.optimizedResume.skills.length > 0 && (
                    <div>
                      <h3 className="mb-2 text-lg font-semibold text-white">Technical Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {result.optimizedResume.skills.map((skill) => (
                          <Badge key={skill}>{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.optimizedResume.experience.length > 0 && (
                    <div>
                      <h3 className="mb-3 text-lg font-semibold text-white">Professional Experience</h3>
                      <div className="space-y-4">
                        {result.optimizedResume.experience.map((exp, idx) => (
                          <div key={idx} className="border-l-2 border-purple-500 pl-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold text-white">{exp.title}</p>
                                <p className="text-sm text-slate-400">{exp.company}</p>
                              </div>
                              <p className="text-sm text-slate-500">{exp.duration}</p>
                            </div>
                            {exp.bullets.length > 0 && (
                              <ul className="mt-2 list-inside list-disc space-y-1">
                                {exp.bullets.map((bullet, bidx) => (
                                  <li key={bidx} className="text-sm text-slate-300">{bullet}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.optimizedResume.education.length > 0 && (
                    <div>
                      <h3 className="mb-3 text-lg font-semibold text-white">Education</h3>
                      <div className="space-y-2">
                        {result.optimizedResume.education.map((edu, idx) => (
                          <div key={idx} className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-white">{edu.degree}</p>
                              <p className="text-sm text-slate-400">{edu.institution}</p>
                            </div>
                            <p className="text-sm text-slate-500">{edu.year}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setResult(null);
                    setResumeText("");
                    setJobDescription("");
                    setSuccess("");
                    setError("");
                  }}
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Optimize Another Resume
                </Button>
              </div>
            </>
          ) : null}

          {editOpen && result && token && (
            <ResumeEditorModal
              resumeId={result.id}
              token={token}
              initialResume={result.optimizedResume}
              initialStyle={result.pdfStyle}
              onClose={() => setEditOpen(false)}
              onSave={(resume: OptimizedResume, style: ResumeStylePrefs) => {
                setResult((prev) => (prev ? { ...prev, optimizedResume: resume, pdfStyle: style } : prev));
                setSuccess("Resume updated successfully!");
                setTimeout(() => setSuccess(""), 3000);
              }}
            />
          )}

          {previewUrl && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
              onClick={closePreview}
            >
              <div
                className="flex h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">PDF Preview</h3>
                    <p className="text-xs text-gray-500">This is how your resume will look when downloaded</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleDownloadPDF}
                      disabled={pdfLoading}
                      className="bg-gradient-to-r from-purple-500 to-pink-500"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm" onClick={closePreview}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <iframe src={previewUrl} title="Resume PDF Preview" className="w-full flex-1 bg-gray-100" />
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
