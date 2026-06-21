"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { DashboardLayout } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Badge } from "@/components/ui/input";
import { HistorySection, ErrorAlert, LoadingCard } from "@/components/page-states";
import { PageHero } from "@/components/page-hero";
import { useAuth } from "@/lib/auth-context";
import { api, SalaryReport } from "@/lib/api";

const cityOrder = ["Bangalore", "Pune", "Mumbai", "Hyderabad", "Delhi", "Nagpur", "Remote"];

function PredictionsView({ predictions }: { predictions: Record<string, string> }) {
  return (
    <div className="space-y-3">
      {cityOrder.filter((c) => predictions[c]).map((city) => (
        <div key={city} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/5 px-4 py-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-indigo-400" />
            <span className="font-medium text-white">{city}</span>
          </div>
          <Badge variant="success">{predictions[city]}</Badge>
        </div>
      ))}
    </div>
  );
}

export default function SalaryPage() {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const [experience, setExperience] = useState("0");
  const [skillsInput, setSkillsInput] = useState("");
  const [predictions, setPredictions] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setExperience(String(user.experience || 0));
      setSkillsInput(user.skills?.join(", ") || "");
    }
  }, [user]);

  const { data: history } = useQuery({
    queryKey: ["salary-reports"],
    queryFn: () => api.getSalaryReports(token!),
    enabled: !!token,
  });

  const handlePredict = async () => {
    if (!token) return;
    const skills = skillsInput.split(",").map((s) => s.trim()).filter(Boolean);
    if (!skills.length) return setError("Enter at least one skill");
    setLoading(true);
    setError("");
    try {
      const data = await api.predictSalary(token, {
        experience: parseInt(experience, 10) || 0,
        skills,
      });
      setPredictions(data.predictions);
      queryClient.invalidateQueries({ queryKey: ["salary-reports"] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <DashboardLayout title="Salary Prediction Engine">
        <PageHero
          eyebrow="Salary prediction"
          title="City-wise LPA estimates"
          description="Rule-based salary bands by experience and skills — fast and transparent for demo."
        />
        {loading && !predictions && <LoadingCard message="Calculating salary predictions…" />}
        <div className={loading && !predictions ? "hidden" : "grid gap-6 lg:grid-cols-2"}>
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>Rule-based salary prediction — no AI, pure engineering logic</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Years of Experience</Label>
                <Input type="number" min="0" value={experience} onChange={(e) => setExperience(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Skills (comma-separated)</Label>
                <Input value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} placeholder="React, Node, AWS" className="mt-1" />
              </div>
              {error && <ErrorAlert message={error} />}
              <Button onClick={handlePredict} disabled={loading} className="w-full">
                {loading ? "Calculating..." : "Predict Salary"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Salary by City</CardTitle></CardHeader>
            <CardContent>
              {predictions ? (
                <PredictionsView predictions={predictions} />
              ) : (
                <p className="text-slate-400">Enter your profile to see salary predictions</p>
              )}
            </CardContent>
          </Card>
        </div>

        <HistorySection
          title="Previous Predictions"
          emptyMessage="No salary predictions yet."
          items={history?.reports || []}
          renderItem={(r: SalaryReport) => (
            <button
              key={r._id}
              type="button"
              onClick={() => setPredictions(r.predictions)}
              className="w-full py-3 text-left hover:bg-white/5"
            >
              <p className="text-sm text-slate-500">{r.experience} yrs · {r.skills.slice(0, 4).join(", ")}</p>
              <p className="text-sm font-medium text-white">Bangalore: {r.predictions.Bangalore} · Pune: {r.predictions.Pune}</p>
            </button>
          )}
        />
      </DashboardLayout>
    </AuthGuard>
  );
}
