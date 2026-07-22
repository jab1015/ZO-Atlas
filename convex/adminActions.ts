"use node";

import OpenAI from "openai";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const runAdminAgentTask = internalAction({
  args: { taskId: v.id("adminAgentTasks") },
  handler: async (ctx, { taskId }) => {
    await ctx.runMutation(internal.adminControl.markAgentTaskRunning, { taskId });
    try {
      const context = await ctx.runQuery(internal.adminControl.getTaskContext, { taskId });
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) throw new Error("OPENAI_API_KEY is not configured on this Convex deployment");
      const client = new OpenAI({ apiKey });
      const response = await client.chat.completions.create({
        model: process.env.ATLAS_ADMIN_AGENT_MODEL ?? "gpt-4o-mini",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: "You are Atlas Admin Operations, an internal reliability agent. Investigate the reported issue using only the supplied context. Return: findings, likely cause, evidence, safe next actions, and whether a human must approve anything. Never claim to have changed data or deployed code unless the task explicitly gave you an approved tool to do so.",
          },
          {
            role: "user",
            content: JSON.stringify({
              task: context.task.instruction,
              thread: context.thread.subject,
              targetUser: context.targetUser ? { email: context.targetUser.email, name: context.targetUser.name, status: context.targetUser.accountStatus, type: context.targetUser.accountType } : null,
              inventions: context.inventions.map((invention) => ({ title: invention.title, stage: invention.currentStageId, status: invention.status, updatedAt: invention.updatedAt })),
              research: context.research.map((run) => run ? { status: run.researchStatus, overallStatus: run.overallStatus, error: run.error, updatedAt: run.updatedAt, completedSections: run.completedSectionCount, totalSections: run.totalSectionCount } : null),
              priorMessages: context.messages.map((message) => ({ authorType: message.authorType, content: message.content })),
            }, null, 2),
          },
        ],
      });
      const result = response.choices[0]?.message?.content?.trim() || "The agent returned no findings.";
      await ctx.runMutation(internal.adminControl.completeAgentTask, { taskId, status: "completed", result });
    } catch (error) {
      await ctx.runMutation(internal.adminControl.completeAgentTask, {
        taskId,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown admin agent error",
      });
    }
  },
});
