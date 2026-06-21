import { API_URL } from "./utils";

type RequestOptions = RequestInit & { token?: string | null; skipRefresh?: boolean };

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers, skipRefresh, ...rest } = options;

  const doFetch = (authToken?: string | null) =>
    fetch(`${API_URL}${endpoint}`, {
      ...rest,
      headers: {
        ...(rest.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...headers,
      },
    });

  let authToken =
    token ?? (typeof window !== "undefined" ? localStorage.getItem("accessToken") : null);

  let res: Response;
  try {
    res = await doFetch(authToken);
  } catch {
    throw new Error(`Cannot reach the API at ${API_URL}. Make sure the backend is running (port 5001).`);
  }

  if (res.status === 401 && !skipRefresh && typeof window !== "undefined") {
    const refresh = localStorage.getItem("refreshToken");
    if (refresh) {
      try {
        const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: refresh }),
        });
        const refreshData = await refreshRes.json().catch(() => ({}));
        if (refreshRes.ok && refreshData.accessToken) {
          localStorage.setItem("accessToken", refreshData.accessToken);
          window.dispatchEvent(new CustomEvent("auth-token-refreshed", { detail: refreshData.accessToken }));
          authToken = refreshData.accessToken;
          res = await doFetch(authToken);
        }
      } catch {}
    }
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      data.message ||
      (res.status === 401 ? "Session expired. Please sign in again." : `Request failed (${res.status})`);
    throw new Error(message);
  }
  return data as T;
}

export const api = {
  register: (body: { name: string; email: string; password: string }) =>
    request<{ user: User; access_token?: string; accessToken?: string; refreshToken: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<{ user: User; accessToken: string; refreshToken: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  refreshToken: (refreshToken: string) =>
    request<{ accessToken: string }>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
      skipRefresh: true,
    }),

  me: (token: string) =>
    request<{ user: User }>("/auth/me", { token }),

  updateProfile: (token: string, body: Partial<User>) =>
    request<{ user: User }>("/auth/profile", { method: "PUT", token, body: JSON.stringify(body) }),

  uploadResume: (token: string, file: File, jobDescription?: string) => {
    const form = new FormData();
    form.append("resume", file);
    if (jobDescription) form.append("jobDescription", jobDescription);
    return request<{ resume: ResumeAnalysis }>("/resumes/upload", { method: "POST", token, body: form });
  },

  getResumes: (token: string) => request<{ resumes: ResumeAnalysis[] }>("/resumes", { token }),

  getResume: (token: string, id: string) => request<{ resume: ResumeAnalysis }>(`/resumes/${id}`, { token }),

  createJobDescription: (token: string, text: string, title?: string) =>
    request<{ jobDescription: JobDescription }>("/job-descriptions", {
      method: "POST",
      token,
      body: JSON.stringify({ text, title }),
    }),

  getJobDescriptions: (token: string) =>
    request<{ jobDescriptions: JobDescription[] }>("/job-descriptions", { token }),

  getJobDescription: (token: string, id: string) =>
    request<{ jobDescription: JobDescription & { rawText?: string } }>(`/job-descriptions/${id}`, { token }),

  analyzeSkillGap: (token: string, body: { resumeId?: string; jobDescriptionId?: string; targetRole?: string; resumeSkills?: string[]; jdSkills?: string[] }) =>
    request<{ analysis: SkillAnalysis }>("/skill-gap/analyze", { method: "POST", token, body: JSON.stringify(body) }),

  getSkillAnalyses: (token: string) => request<{ analyses: SkillAnalysis[] }>("/skill-gap", { token }),

  optimizeBullet: (token: string, bullet: string) =>
    request<{ id: string; original: string; optimized: string }>("/resume-bullets/optimize", {
      method: "POST",
      token,
      body: JSON.stringify({ bullet }),
    }),

  getBulletHistory: (token: string) =>
    request<{ bullets: ResumeBullet[] }>("/resume-bullets/history", { token }),

  generateInterview: (token: string, body: { resumeId?: string; jobDescriptionId?: string; targetRole?: string }) =>
    request<{ questions: InterviewQuestions }>("/interviews/generate", { method: "POST", token, body: JSON.stringify(body) }),

  getInterviews: (token: string) => request<{ questions: InterviewQuestions[] }>("/interviews", { token }),

  predictSalary: (token: string, body?: { experience?: number; skills?: string[] }) =>
    request<{ id: string; experience: number; skills: string[]; predictions: Record<string, string> }>("/salary/predict", {
      method: "POST",
      token,
      body: JSON.stringify(body || {}),
    }),

  getSalaryReports: (token: string) => request<{ reports: SalaryReport[] }>("/salary", { token }),

  getApplications: (token: string) => request<{ applications: Application[] }>("/applications", { token }),

  createApplication: (token: string, body: Partial<Application>) =>
    request<{ application: Application }>("/applications", { method: "POST", token, body: JSON.stringify(body) }),

  updateApplication: (token: string, id: string, body: Partial<Application>) =>
    request<{ application: Application }>(`/applications/${id}`, { method: "PUT", token, body: JSON.stringify(body) }),

  deleteApplication: (token: string, id: string) =>
    request<{ message: string }>(`/applications/${id}`, { method: "DELETE", token }),

  analyzeGithub: (token: string, username: string) =>
    request<{ report: GithubReport }>("/github/analyze", { method: "POST", token, body: JSON.stringify({ username }) }),

  getGithubReports: (token: string) => request<{ reports: GithubReport[] }>("/github", { token }),

  simulateCareerGrowth: (token: string, body: { currentSkills: string[]; targetRole: string; currentSalary?: string }) =>
    request<CareerGrowthPlan>("/career-growth/simulate", { method: "POST", token, body: JSON.stringify(body) }),

  getCareerGrowthPlans: (token: string) => request<{ plans: CareerGrowthPlan[] }>("/career-growth", { token }),

  runIntelligenceScan: (token: string, form: FormData) =>
    request<{ report: IntelligenceReport }>("/intelligence/scan", { method: "POST", token, body: form }),

  careerTwinChat: (token: string, message: string) =>
    request<{ plan: CareerTwinPlan }>("/career-twin/chat", {
      method: "POST",
      token,
      body: JSON.stringify({ message }),
    }),

  getCareerTwinHistory: (token: string) =>
    request<{ plans: CareerTwinPlan[] }>("/career-twin/history", { token }),

  getDashboard: (token: string) => request<DashboardData>("/dashboard", { token }),

  optimizeResume: (token: string, body: { resumeText: string; jobDescription: string }) =>
    request<{ data: ResumeBuilderResult }>("/resume-builder/optimize", {
      method: "POST",
      token,
      body: JSON.stringify(body),
    }),

  getResumeBuilderHistory: (token: string) =>
    request<{ data: ResumeBuilderResult[] }>("/resume-builder/history", { token }),

  getResumeBuilder: (token: string, id: string) =>
    request<{ data: ResumeBuilderResult }>(`/resume-builder/${id}`, { token }),

  updateResumeBuilder: (
    token: string,
    id: string,
    body: { optimizedResume?: OptimizedResume; pdfStyle?: ResumeStylePrefs }
  ) =>
    request<{ data: { id: string; optimizedResume: OptimizedResume; pdfStyle: ResumeStylePrefs } }>(
      `/resume-builder/${id}`,
      { method: "PATCH", token, body: JSON.stringify(body) }
    ),
};

export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  experience?: number;
  skills?: string[];
  githubUrl?: string;
  linkedinUrl?: string;
}

export interface ResumeAnalysis {
  id?: string;
  _id?: string;
  fileName: string;
  extractedText?: string;
  atsScore: number;
  missingKeywords: string[];
  strengths: string[];
  skills: string[];
  feedback?: string;
  resumeQuality?: string;
  weakBullets?: { before: string; after: string }[];
}

export interface JobDescription {
  id?: string;
  _id?: string;
  title: string;
  skills: string[];
  experienceRequired: number;
}

export interface SkillAnalysis {
  id?: string;
  _id?: string;
  match: number;
  missing: string[];
  matched: string[];
  resumeSkills: string[];
  jdSkills: string[];
  learningRoadmap?: { week: number; skill: string; focus?: string; resources?: string[] }[];
  createdAt?: string;
}

export interface ResumeBullet {
  _id: string;
  original: string;
  optimized: string;
  createdAt: string;
}

export interface InterviewQuestions {
  _id?: string;
  frontend: string[];
  backend: string[];
  systemDesign: string[];
  behavioral: string[];
  createdAt?: string;
}

export interface SalaryReport {
  _id: string;
  experience: number;
  skills: string[];
  predictions: Record<string, string>;
}

export interface Application {
  _id: string;
  company: string;
  role: string;
  appliedDate: string;
  status: "Applied" | "OA" | "Interview" | "Rejected" | "Offer" | "Joined";
  salary: string;
  notes: string;
}

export interface GithubReport {
  _id?: string;
  username: string;
  developerScore: number;
  strengths: string[];
  frameworks?: string[];
  topics?: string[];
  languages: { name: string; bytes: number }[];
  totalRepos: number;
  totalStars: number;
  totalCommits: number;
  recentActivity?: number;
  topRepos: { name: string; stars: number; language: string; topics?: string[] }[];
}

export interface CareerGrowthPlan {
  id?: string;
  _id?: string;
  currentSkills: string[];
  targetRole: string;
  currentSalaryLpa?: number;
  marketScore: number;
  expectedReadiness?: number;
  potentialSalaryRange?: string;
  missingSkills: string[];
  estimatedLearningMonths: number;
  salaryIncrease: string;
  roadmap: { week: number; skill: string; focus: string; resources?: string[] }[];
  matchedSkills?: string[];
}

export interface CareerTwinPlan {
  id?: string;
  _id?: string;
  userMessage: string;
  interpretedGoal: string;
  targetRole: string;
  timelineMonthsRequested: number;
  estimatedTimelineMonths: number;
  onTrack: boolean;
  currentReadiness: number;
  expectedReadiness: number;
  currentSkills: string[];
  missingSkills: string[];
  matchedSkills: string[];
  weeklyLearningPlan: { week: number; skill: string; focus: string; resources?: string[] }[];
  twinReply: string;
}

export interface IntelligenceReport {
  targetRole: string;
  currentSkills: string[];
  targetSkills: string[];
  resume: {
    id: string;
    fileName: string;
    atsScore: number;
    resumeQuality: string;
    missingKeywords: string[];
    strengths: string[];
    skills: string[];
    feedback: string;
    weakBullets: { before: string; after: string }[];
  } | null;
  github: {
    id: string;
    username: string;
    developerScore: number;
    frameworks: string[];
    languages: { name: string; bytes: number }[];
    topics: string[];
    totalRepos: number;
    totalStars: number;
    totalCommits: number;
    recentActivity: number;
    topRepos: { name: string; stars: number; language: string }[];
  } | null;
  skillGap: {
    id: string;
    match: number;
    missing: string[];
    matched: string[];
    learningRoadmap: { week: number; skill: string; focus?: string; resources?: string[] }[];
  };
  careerGrowth: {
    id: string;
    currentSalaryLpa: number;
    marketScore: number;
    expectedReadiness: number;
    missingSkills: string[];
    matchedSkills: string[];
    estimatedLearningMonths: number;
    salaryIncrease: string;
    potentialSalaryRange: string;
    roadmap: { week: number; skill: string; focus: string; resources?: string[] }[];
  };
  interviewPreview: {
    technical: string[];
    hr: string[];
    projectBased: string[];
    architecture: string[];
  };
}

export interface DashboardData {
  cards: {
    atsScore: number | null;
    matchScore: number | null;
    totalApplications: number;
    interviews: number;
    offers: number;
    skillGaps: number;
  };
  charts: {
    applicationsPerMonth: { month: string; count: number }[];
    interviewConversionRate: number;
    skillGrowthTrend: { date: string; match: number }[];
    statusBreakdown: Record<string, number>;
  };
  recent: {
    latestResume: { id: string; atsScore: number; fileName: string } | null;
    latestAnalysis: { id: string; match: number; missing: string[] } | null;
    interviewSessions: number;
  };
}

export interface OptimizedResume {
  contact: {
    name: string;
    email: string;
    phone?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    location?: string;
    duration: string;
    bullets: string[];
  }>;
  skills: string[];
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    details?: string;
  }>;
  certifications?: string[];
}

export interface ResumeStylePrefs {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  sectionSpacing: number;
  nameFontSize: number;
  pagePadding: number;
}

export const DEFAULT_RESUME_STYLE: ResumeStylePrefs = {
  fontFamily: "Helvetica Neue",
  fontSize: 10.5,
  lineHeight: 1.4,
  sectionSpacing: 18,
  nameFontSize: 28,
  pagePadding: 40,
};

export interface ResumeBuilderResult {
  id: string;
  optimizedResume: OptimizedResume;
  pdfStyle?: ResumeStylePrefs;
  atsScoreBefore: number;
  atsScoreAfter: number;
  addedKeywords: string[];
  improvements: string[];
  targetRole: string;
}

async function fetchPdfBlob(response: Response): Promise<Blob> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error((errorData as { message?: string }).message || "Failed to generate PDF");
  }

  const contentType = response.headers.get("content-type");
  if (!contentType?.includes("application/pdf")) {
    throw new Error("Invalid response format. Expected PDF.");
  }

  const blob = await response.blob();
  if (blob.size === 0) throw new Error("PDF file is empty");
  return blob;
}

export async function previewResumePdf(
  token: string,
  body: { optimizedResume: OptimizedResume; pdfStyle?: ResumeStylePrefs }
): Promise<Blob> {
  const response = await fetch(`${API_URL}/resume-builder/preview-pdf`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return fetchPdfBlob(response);
}

export async function downloadResumePdf(token: string, id: string): Promise<Blob> {
  const response = await fetch(`${API_URL}/resume-builder/generate-pdf/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return fetchPdfBlob(response);
}

