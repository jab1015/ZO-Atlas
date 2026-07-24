"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MadeThisBadge } from "@/components/atlas/made-this-badge";
import { AtlasLogo } from "@/components/atlas/atlas-logo";

function ResetPasswordForm() {
  const { signIn } = useAuthActions();
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code");
  const emailFromLink = searchParams.get("email") ?? "";
  const [email, setEmail] = useState(emailFromLink);
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (emailFromLink) setEmail(emailFromLink);
  }, [emailFromLink]);

  const requestReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const form = new FormData();
      form.set("flow", "reset");
      form.set("email", email.trim().toLowerCase());
      form.set("redirectTo", "/reset-password");
      await signIn("password", form);
      setMessage("Check your email for a password-reset link.");
    } catch {
      setMessage("If an account exists for that email, a reset link will be sent.");
    } finally {
      setLoading(false);
    }
  };

  const completeReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const form = new FormData();
      form.set("flow", "reset-verification");
      form.set("code", code ?? "");
      form.set("email", email.trim().toLowerCase());
      form.set("newPassword", newPassword);
      await signIn("password", form);
      router.push("/dashboard");
    } catch {
      setError("This reset link is invalid or expired. Request a new one.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#071426]">
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
          <div className="bg-gradient-to-r from-[#0A1628] to-[#0d2a52] px-6 py-5 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-lg font-bold">A</div>
              <div>
                <div className="text-base font-bold">{code ? "Choose a new password" : "Reset your Atlas password"}</div>
                <div className="text-xs text-slate-300">Your AI invention company is ready when you are.</div>
              </div>
            </div>
          </div>
          <div className="space-y-5 p-6">
            {code ? (
              <form onSubmit={completeReset} className="space-y-4">
                <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
                <div className="space-y-2"><Label htmlFor="newPassword">New password</Label><Input id="newPassword" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength={8} autoComplete="new-password" required /></div>
                {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">{error}</p>}
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>{loading ? "Updating…" : "Update password"}</Button>
              </form>
            ) : (
              <form onSubmit={requestReset} className="space-y-4">
                <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></div>
                {message && <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{message}</p>}
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>{loading ? "Sending…" : "Send reset link"}</Button>
              </form>
            )}
            <p className="text-center text-sm text-slate-500 dark:text-slate-400"><Link href="/sign-in" className="font-semibold text-blue-600 hover:text-blue-700">Back to sign in</Link></p>
          </div>
        </div>
      </div>
      <MadeThisBadge />
    </div>
  );
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#f8fafc]" />}><ResetPasswordForm /></Suspense>;
}
