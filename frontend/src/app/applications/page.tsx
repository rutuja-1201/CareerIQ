"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Pencil } from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { DashboardLayout } from "@/components/layout/sidebar";
import { RoleSelect } from "@/components/role-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Badge } from "@/components/ui/input";
import { LoadingSpinner, EmptyState, ErrorAlert } from "@/components/page-states";
import { PageHero } from "@/components/page-hero";
import { useAuth } from "@/lib/auth-context";
import { api, Application } from "@/lib/api";
import { JOB_ROLES } from "@/lib/job-roles";

const STATUSES = ["Applied", "OA", "Interview", "Rejected", "Offer", "Joined"] as const;
const statusVariant: Record<string, "default" | "success" | "warning" | "destructive"> = {
  Applied: "default", OA: "warning", Interview: "warning", Rejected: "destructive", Offer: "success", Joined: "success",
};

export default function ApplicationsPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<{ company: string; role: string; status: Application["status"]; salary: string; notes: string }>({
    company: "", role: JOB_ROLES[0], status: "Applied", salary: "", notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["applications"],
    queryFn: () => api.getApplications(token!),
    enabled: !!token,
  });

  const resetForm = () => {
    setForm({ company: "", role: JOB_ROLES[0], status: "Applied", salary: "", notes: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      if (editingId) {
        await api.updateApplication(token, editingId, form);
      } else {
        await api.createApplication(token, form);
      }
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (app: Application) => {
    setForm({ company: app.company, role: app.role, status: app.status, salary: app.salary, notes: app.notes });
    setEditingId(app._id);
    setShowForm(true);
  };

  const handleStatusChange = async (id: string, status: Application["status"]) => {
    if (!token) return;
    try {
      await api.updateApplication(token, id, { status });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm("Delete this application?")) return;
    try {
      await api.deleteApplication(token, id);
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <AuthGuard>
      <DashboardLayout title="Application Tracker">
        <PageHero
          eyebrow="Application tracker"
          title="Track your job pipeline"
          description="Log applications and status — feeds dashboard charts and conversion metrics."
        />
        <div className="mb-6 flex justify-between">
          <p className="text-slate-500">{data?.applications.length ?? 0} total applications</p>
          <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-2">
            <Plus className="h-4 w-4" /> Add Application
          </Button>
        </div>

        {error && <div className="mb-4"><ErrorAlert message={error} /></div>}

        {showForm && (
          <Card className="mb-6">
            <CardHeader><CardTitle>{editingId ? "Edit Application" : "New Application"}</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                <div><Label>Company</Label><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required className="mt-1" /></div>
                <RoleSelect label="Role" value={form.role} onChange={(role) => setForm({ ...form, role })} required />
                <div><Label>Status</Label><Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Application["status"] })} className="mt-1">{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</Select></div>
                <div><Label>Salary</Label><Input value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder="12 LPA" className="mt-1" /></div>
                <div className="md:col-span-2"><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Recruiter name, next steps..." className="mt-1" /></div>
                <div className="flex gap-2 md:col-span-2">
                  <Button type="submit" disabled={loading}>{loading ? "Saving..." : editingId ? "Update" : "Save Application"}</Button>
                  <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <LoadingSpinner className="h-48" />
            ) : isError ? (
              <div className="p-6"><ErrorAlert message="Failed to load applications" onRetry={() => refetch()} /></div>
            ) : data?.applications.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-left">
                      <th className="px-6 py-3 font-medium text-slate-400">Company</th>
                      <th className="px-6 py-3 font-medium text-slate-400">Role</th>
                      <th className="px-6 py-3 font-medium text-slate-400">Applied</th>
                      <th className="px-6 py-3 font-medium text-slate-400">Status</th>
                      <th className="px-6 py-3 font-medium text-slate-400">Salary</th>
                      <th className="px-6 py-3 font-medium text-slate-400">Notes</th>
                      <th className="px-6 py-3 font-medium text-slate-400"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.applications.map((app) => (
                      <tr key={app._id} className="border-b border-white/[0.06] hover:bg-white/5">
                        <td className="px-6 py-4 font-medium text-white">{app.company}</td>
                        <td className="px-6 py-4 text-slate-400">{app.role}</td>
                        <td className="px-6 py-4 text-slate-500">{new Date(app.appliedDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <Select value={app.status} onChange={(e) => handleStatusChange(app._id, e.target.value as Application["status"])} className="h-8 w-32 text-xs">
                            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </Select>
                        </td>
                        <td className="px-6 py-4"><Badge variant={statusVariant[app.status]}>{app.salary || "—"}</Badge></td>
                        <td className="max-w-[160px] truncate px-6 py-4 text-slate-500" title={app.notes}>{app.notes || "—"}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => startEdit(app)} className="text-slate-400 hover:text-indigo-400"><Pencil className="h-4 w-4" /></button>
                            <button onClick={() => handleDelete(app._id)} className="text-slate-400 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState message="No applications yet. Add your first one!" />
            )}
          </CardContent>
        </Card>
      </DashboardLayout>
    </AuthGuard>
  );
}
