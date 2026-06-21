"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { FileText, GitCompare, Kanban, MessageSquare, Trophy, Target, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/auth-guard";
import { DashboardLayout } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress, Badge } from "@/components/ui/input";
import { LoadingSpinner, ErrorAlert } from "@/components/page-states";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

function StatCard({ title, value, icon: Icon, suffix = "" }: { title: string; value: string | number; icon: React.ElementType; suffix?: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10">
          <Icon className="h-6 w-6 text-indigo-400" />
        </div>
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-white">{value}{suffix}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { token, loading: authLoading } = useAuth();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["dashboard", token],
    queryFn: () => api.getDashboard(token!),
    enabled: !!token && !authLoading,
    retry: (count, err) => count < 1 && !(err instanceof Error && err.message.includes("Session expired")),
  });

  return (
    <AuthGuard>
      <DashboardLayout title="Dashboard">
        {isLoading ? (
          <LoadingSpinner />
        ) : isError ? (
          <ErrorAlert
            message={error instanceof Error ? error.message : "Failed to load dashboard"}
            onRetry={() => refetch()}
          />
        ) : (
          <div className="space-y-8">
            {!data?.cards.atsScore && !data?.cards.matchScore && (
              <Card className="border-indigo-500/20 bg-indigo-500/5">
                <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-300">
                    New here? Start with <strong className="text-white">Career Twin</strong>, then run a <strong className="text-white">Career Scan</strong> — your metrics will populate on this dashboard.
                  </p>
                  <Link href="/career-twin">
                    <Button size="sm" className="gap-1 shrink-0">Start demo <ArrowRight className="h-3.5 w-3.5" /></Button>
                  </Link>
                </CardContent>
              </Card>
            )}
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="flex flex-col gap-4 rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-violet-200">Career Twin AI · Bytebrains</p>
                  <h2 className="text-xl font-bold">Ask in plain English</h2>
                  <p className="mt-1 text-sm text-violet-100">&ldquo;Senior Full Stack Engineer in 12 months&rdquo; → plan in seconds</p>
                </div>
                <Link href="/career-twin">
                  <Button size="lg" variant="outline" className="gap-2 border-white/25 bg-white/10 text-white hover:bg-white/15">
                    <Zap className="h-4 w-4" /> Open Career Twin
                  </Button>
                </Link>
              </div>
              <div className="flex flex-col gap-4 rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-indigo-200">Full intelligence scan</p>
                  <h2 className="text-xl font-bold">Resume + GitHub + role</h2>
                  <p className="mt-1 text-sm text-indigo-100">Complete report with salary & interviews</p>
                </div>
                <Link href="/intelligence">
                  <Button size="lg" variant="outline" className="gap-2 border-white/25 bg-white/10 text-white hover:bg-white/15">
                    <Zap className="h-4 w-4" /> Career Scan
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <StatCard title="ATS Score" value={data?.cards.atsScore ?? "—"} icon={FileText} suffix={data?.cards.atsScore ? "%" : ""} />
              <StatCard title="Match Score" value={data?.cards.matchScore ?? "—"} icon={GitCompare} suffix={data?.cards.matchScore ? "%" : ""} />
              <StatCard title="Applications" value={data?.cards.totalApplications ?? 0} icon={Kanban} />
              <StatCard title="Interviews" value={data?.cards.interviews ?? 0} icon={MessageSquare} />
              <StatCard title="Offers" value={data?.cards.offers ?? 0} icon={Trophy} />
              <StatCard title="Skill Gaps" value={data?.cards.skillGaps ?? 0} icon={Target} />
            </div>

            {data?.recent && (
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-base">Latest Resume</CardTitle></CardHeader>
                  <CardContent>
                    {data.recent.latestResume ? (
                      <Link href="/resume" className="group flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">{data.recent.latestResume.fileName}</p>
                          <Badge variant={data.recent.latestResume.atsScore >= 70 ? "success" : "warning"}>{data.recent.latestResume.atsScore}% ATS</Badge>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-400" />
                      </Link>
                    ) : (
                      <Link href="/resume" className="text-sm text-indigo-400 hover:underline">Upload your first resume →</Link>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-base">Latest Skill Gap</CardTitle></CardHeader>
                  <CardContent>
                    {data.recent.latestAnalysis ? (
                      <Link href="/skill-gap" className="group flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">{data.recent.latestAnalysis.match}% match</p>
                          <p className="text-sm text-slate-500">{data.recent.latestAnalysis.missing.length} skills to learn</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-400" />
                      </Link>
                    ) : (
                      <Link href="/skill-gap" className="text-sm text-indigo-400 hover:underline">Run skill gap analysis →</Link>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-base">Interview Prep</CardTitle></CardHeader>
                  <CardContent>
                    <Link href="/interviews" className="group flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-white">{data.recent.interviewSessions}</p>
                        <p className="text-sm text-slate-500">sessions generated</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-400" />
                    </Link>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader><CardTitle>Applications per Month</CardTitle></CardHeader>
                <CardContent className="h-72 min-w-0">
                  {data?.charts.applicationsPerMonth.length ? (
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={288}>
                      <BarChart data={data.charts.applicationsPerMonth}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                        <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} />
                        <Tooltip contentStyle={{ background: "#151d2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#e2e8f0" }} />
                        <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400">No application data yet — <Link href="/applications" className="ml-1 text-indigo-400 hover:underline">track applications</Link></div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Skill Growth Trend</CardTitle></CardHeader>
                <CardContent className="h-72 min-w-0">
                  {data?.charts.skillGrowthTrend.length ? (
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={288}>
                      <LineChart data={data.charts.skillGrowthTrend.map((d) => ({ ...d, date: new Date(d.date).toLocaleDateString() }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                        <Tooltip contentStyle={{ background: "#151d2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#e2e8f0" }} />
                        <Line type="monotone" dataKey="match" stroke="#818cf8" strokeWidth={2} dot={{ r: 4, fill: "#818cf8" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400">Run a skill gap analysis to see trends</div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader><CardTitle>Interview Conversion Rate</CardTitle></CardHeader>
                <CardContent>
                  <div className="mb-2 flex items-end justify-between">
                    <span className="text-3xl font-bold text-indigo-400">{data?.charts.interviewConversionRate ?? 0}%</span>
                    <span className="text-sm text-slate-500">Applications → Interviews</span>
                  </div>
                  <Progress value={data?.charts.interviewConversionRate ?? 0} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Application Status</CardTitle></CardHeader>
                <CardContent>
                  {data?.charts.statusBreakdown && Object.keys(data.charts.statusBreakdown).length ? (
                    <div className="space-y-3">
                      {Object.entries(data.charts.statusBreakdown).map(([status, count]) => (
                        <div key={status} className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">{status}</span>
                          <span className="font-semibold text-white">{count}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400">No applications tracked yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </DashboardLayout>
    </AuthGuard>
  );
}
