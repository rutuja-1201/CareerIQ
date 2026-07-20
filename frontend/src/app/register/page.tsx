"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { ErrorAlert, LoadingSpinner } from "@/components/page-states";

export default function RegisterPage() {
  const { register, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && token) router.replace("/career-twin");
  }, [authLoading, token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(name, email, password);
      router.push("/career-twin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <AuthShell>
        <LoadingSpinner className="h-48" label="Loading…" />
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div>
        <h2 className="text-2xl font-bold text-white">Create account</h2>
        <p className="mt-1 text-sm text-slate-400">Join CareerIQ</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1.5 rounded-xl" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1.5 rounded-xl" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="mt-1.5 rounded-xl" />
          </div>
          {error && <ErrorAlert message={error} />}
          <Button type="submit" className="w-full btn-glow" size="lg" disabled={loading}>
            {loading ? "Creating account..." : "Get started free"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          Have an account?{" "}
          <Link href="/login" className="font-semibold text-indigo-400 hover:underline">Sign in</Link>
        </p>
      </div>
    </AuthShell>
  );
}
