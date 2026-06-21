"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/auth-guard";
import { DashboardLayout } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { LoadingSpinner, SuccessAlert, ErrorAlert } from "@/components/page-states";
import { PageHero } from "@/components/page-hero";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

export default function ProfilePage() {
  const { token, user, loading: authLoading, refreshUser } = useAuth();
  const [form, setForm] = useState({ name: "", experience: "0", skills: "", githubUrl: "", linkedinUrl: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        experience: String(user.experience || 0),
        skills: user.skills?.join(", ") || "",
        githubUrl: user.githubUrl || "",
        linkedinUrl: user.linkedinUrl || "",
      });
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !form.name.trim()) {
      setMessage("Name is required");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      await api.updateProfile(token, {
        name: form.name.trim(),
        experience: parseInt(form.experience, 10) || 0,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        githubUrl: form.githubUrl.trim(),
        linkedinUrl: form.linkedinUrl.trim(),
      });
      await refreshUser();
      setMessage("Profile updated successfully");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <DashboardLayout title="Profile">
        <PageHero
          eyebrow="Your developer profile"
          title="Skills & GitHub power every feature"
          description="Keep experience, skills, and GitHub URL updated for accurate scans and salary predictions."
        />
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>Your skills and experience power salary, skill gap, and career growth features</CardDescription>
            </CardHeader>
            <CardContent>
              {authLoading ? (
                <LoadingSpinner className="h-32" />
              ) : (
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="mt-1" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={user?.email || ""} disabled className="mt-1 bg-white/5" />
                  </div>
                  <div>
                    <Label>Years of Experience</Label>
                    <Input type="number" min="0" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <Label>Skills (comma-separated)</Label>
                    <Input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="React, Node.js, MongoDB" className="mt-1" />
                  </div>
                  <div>
                    <Label>GitHub URL</Label>
                    <Input value={form.githubUrl} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} placeholder="https://github.com/username" className="mt-1" />
                  </div>
                  <div>
                    <Label>LinkedIn URL</Label>
                    <Input value={form.linkedinUrl} onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })} placeholder="https://linkedin.com/in/username" className="mt-1" />
                  </div>
                  {message && (message.includes("success") ? (
                    <SuccessAlert message={message} />
                  ) : (
                    <ErrorAlert message={message} />
                  ))}
                  <Button type="submit" disabled={loading} className="btn-glow">
                    {loading ? "Saving..." : "Save Profile"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Quick Links</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Link href="/resume" className="block rounded-lg px-3 py-2 text-sm text-indigo-400 hover:bg-indigo-500/10">→ Resume Analyzer</Link>
              <Link href="/skill-gap" className="block rounded-lg px-3 py-2 text-sm text-indigo-400 hover:bg-indigo-500/10">→ Skill Gap Engine</Link>
              <Link href="/github" className="block rounded-lg px-3 py-2 text-sm text-indigo-400 hover:bg-indigo-500/10">→ GitHub Analyzer</Link>
              <Link href="/career-growth" className="block rounded-lg px-3 py-2 text-sm text-indigo-400 hover:bg-indigo-500/10">→ Career Growth Simulator</Link>
              <Link href="/applications" className="block rounded-lg px-3 py-2 text-sm text-indigo-400 hover:bg-indigo-500/10">→ Application Tracker</Link>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
