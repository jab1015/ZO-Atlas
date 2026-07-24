"use client";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Project } from "./data";
export function useProjects() {
  const { isAuthenticated } = useConvexAuth();
  const inventions = useQuery(api.journeyEngine.getUserInventions, isAuthenticated ? {} : "skip");
  const projects: Project[] = (inventions ?? []).map((item) => ({ id: item._id, name: item.title, tagline: item.solutionDescription ?? "", stageIndex: Math.max(0, item.currentStageId - 1), health: 0, risk: 0, image: "", estCompletion: "Not estimated", activity: item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : "", nextMilestone: "Continue the invention journey", updated: item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : "", favorite: false, archived: item.status !== "active" }));
  return { projects, setProjects: (_next: Project[] | ((current: Project[]) => Project[])) => {}, loaded: inventions !== undefined, dbSave: (_project: Project) => {}, dbDelete: async (_id: string) => {} };
}
