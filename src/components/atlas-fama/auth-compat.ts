"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export function useAuth() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const user = useQuery(api.authHelpers.getCurrentUser, isAuthenticated ? {} : "skip");
  const profile = user
    ? {
        id: user._id,
        email: user.email ?? null,
        name: user.name ?? null,
        plan: user.subscriptionTier ?? "free",
        credits: 0,
        role: user.role ?? "user",
        approved_ids: [] as string[],
        generated_docs: [] as string[],
      }
    : null;

  return {
    user: user ? { id: user._id, email: user.email ?? undefined } : null,
    profile,
    loading: isLoading || user === undefined,
    isAdmin: user?.role === "admin",
    signOut,
    updateProfile: async () => undefined,
  };
}
