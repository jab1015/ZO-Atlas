"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { useState } from "react";
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
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const requestReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const form = new FormData();
      form.set("flow", "reset");
      form.set("email", email);
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
      form.set("email", email);
      form.set("newPassword", newPassword);
      await signIn("password", form);
      router.push("/dashboard");
    } catch {
      setError("This reset link is invalid or expired. Request a new one.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm space-y-8">
          <div className="flex justify-center">
            <Link href="/" className="no-underline hover:opacity-80 transition-opacity">
              <AtlasLogo size="md" className="text-primary" />
            </Link>
          </div>
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold text-foreground">
              {code ? "Choose a new password" : "Reset your password"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {code ? "Use at least eight characters." : "We’ll email you a secure reset link."}
            </p>
          </div>
          {code ? (
            <form onSubmit={completeReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <Input id="newPassword" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength={8} autoComplete="new-password" required />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>{loading ? "Updating…" : "Update password"}</Button>
            </form>
          ) : (
            <form onSubmit={requestReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
              </div>
              {message && <p className="text-sm text-muted-foreground">{message}</p>}
              <Button type="submit" className="w-full" disabled={loading}>{loading ? "Sending…" : "Send reset link"}</Button>
            </form>
          )}
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/sign-in" className="font-medium text-foreground underline-offset-4 hover:underline">Back to sign in</Link>
          </p>
        </div>
      </div>
      <MadeThisBadge />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />} >
      <ResetPasswordForm />
    </Suspense>
  );
}
