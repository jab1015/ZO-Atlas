"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export function useAuth() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const user = useQuery(api.authHelpers.getCurrentUser, isAuthenticated ? {} : "skip");
  return {
    user: user ? { id: user._id, email: user.email ?? undefined } : null,
    profile: user ? { name: user.name ?? null, email: user.email ?? null, plan: user.subscriptionTier ?? "free", credits: 0, approved_ids: [] as string[], generated_docs: [] as string[] } : null,
    loading: !isAuthenticated && user === undefined,
    isAdmin: user?.role === "admin",
    signOut,
    updateProfile: async () => undefined,
  };
}
