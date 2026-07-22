import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { isAdmin } from "./authHelpers";

async function requireAdmin(ctx: Parameters<typeof isAdmin>[0]) {
  const userId = await getAuthUserId(ctx);
  if (!userId || !(await isAdmin(ctx))) throw new Error("Admin access required");
  return userId;
}

export const getOverview = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const [users, inventions, research, threads, tasks] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("inventions").collect(),
      ctx.db.query("validationResearch").collect(),
      ctx.db.query("adminSupportThreads").collect(),
      ctx.db.query("adminAgentTasks").collect(),
    ]);

    return {
      users: users.length,
      activeUsers: users.filter((user) => user.accountStatus !== "suspended").length,
      testUsers: users.filter((user) => user.accountType === "test").length,
      inventions: inventions.length,
      activeInventions: inventions.filter((invention) => invention.status === "active").length,
      researchRunning: research.filter((run) => run.researchStatus === "running" || run.overallStatus === "IN_PROGRESS").length,
      researchFailed: research.filter((run) => run.researchStatus === "failed" || run.overallStatus === "FAILED").length,
      openThreads: threads.filter((thread) => thread.status !== "resolved").length,
      queuedTasks: tasks.filter((task) => task.status === "queued" || task.status === "running").length,
    };
  },
});

export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const users = await ctx.db.query("users").collect();
    const inventions = await ctx.db.query("inventions").collect();
    const threads = await ctx.db.query("adminSupportThreads").collect();

    return users
      .map((user) => ({
        _id: user._id,
        email: user.email ?? "",
        name: user.name ?? "",
        role: user.role ?? "user",
        accountType: user.accountType ?? "standard",
        accountStatus: user.accountStatus ?? "active",
        subscriptionTier: user.subscriptionTier ?? "free",
        createdAt: user.createdAt ?? user._creationTime,
        lastSeenAt: user.lastSeenAt,
        inventionCount: inventions.filter((invention) => invention.userId === user._id).length,
        openThreadCount: threads.filter((thread) => thread.targetUserId === user._id && thread.status !== "resolved").length,
      }))
      .sort((a, b) => (b.lastSeenAt ?? b.createdAt) - (a.lastSeenAt ?? a.createdAt));
  },
});

export const listThreads = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const threads = await ctx.db.query("adminSupportThreads").withIndex("by_updatedAt").order("desc").collect();
    const users = await ctx.db.query("users").collect();
    const userById = new Map(users.map((user) => [user._id, user]));

    return threads.map((thread) => ({
      ...thread,
      targetUser: thread.targetUserId ? userById.get(thread.targetUserId) ?? null : null,
      createdBy: userById.get(thread.createdByUserId) ?? null,
    }));
  },
});

export const getThread = query({
  args: { threadId: v.id("adminSupportThreads") },
  handler: async (ctx, { threadId }) => {
    await requireAdmin(ctx);
    const thread = await ctx.db.get(threadId);
    if (!thread) return null;
    const [messages, tasks, targetUser] = await Promise.all([
      ctx.db.query("adminSupportMessages").withIndex("by_threadId", (q) => q.eq("threadId", threadId)).order("asc").collect(),
      ctx.db.query("adminAgentTasks").withIndex("by_threadId", (q) => q.eq("threadId", threadId)).order("desc").collect(),
      thread.targetUserId ? ctx.db.get(thread.targetUserId) : Promise.resolve(null),
    ]);
    return { thread, messages, tasks, targetUser };
  },
});

export const createThread = mutation({
  args: {
    subject: v.string(),
    priority: v.union(v.literal("low"), v.literal("normal"), v.literal("high"), v.literal("urgent")),
    targetUserId: v.optional(v.id("users")),
    initialMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const adminId = await requireAdmin(ctx);
    const now = Date.now();
    const threadId = await ctx.db.insert("adminSupportThreads", {
      createdByUserId: adminId,
      targetUserId: args.targetUserId,
      subject: args.subject.trim() || "Untitled support investigation",
      status: "open",
      priority: args.priority,
      createdAt: now,
      updatedAt: now,
      lastMessageAt: args.initialMessage?.trim() ? now : undefined,
    });

    if (args.initialMessage?.trim()) {
      await ctx.db.insert("adminSupportMessages", {
        threadId,
        authorUserId: adminId,
        authorType: "admin",
        content: args.initialMessage.trim(),
        createdAt: now,
      });
    }

    await ctx.db.insert("adminAuditLog", {
      actorUserId: adminId,
      action: "support_thread_created",
      targetUserId: args.targetUserId,
      targetType: "adminSupportThreads",
      details: { subject: args.subject.trim(), priority: args.priority },
      createdAt: now,
    });
    return threadId;
  },
});

export const sendMessageAndQueueTask = mutation({
  args: {
    threadId: v.id("adminSupportThreads"),
    content: v.string(),
    taskType: v.optional(v.string()),
    queueAgent: v.boolean(),
  },
  handler: async (ctx, args) => {
    const adminId = await requireAdmin(ctx);
    const thread = await ctx.db.get(args.threadId);
    if (!thread) throw new Error("Support thread not found");
    const content = args.content.trim();
    if (!content) throw new Error("Message cannot be empty");
    const now = Date.now();

    await ctx.db.insert("adminSupportMessages", {
      threadId: args.threadId,
      authorUserId: adminId,
      authorType: "admin",
      content,
      createdAt: now,
    });
    await ctx.db.patch(args.threadId, {
      status: thread.status === "resolved" ? "investigating" : thread.status,
      updatedAt: now,
      lastMessageAt: now,
    });

    if (!args.queueAgent) return null;

    const taskId = await ctx.db.insert("adminAgentTasks", {
      threadId: args.threadId,
      requestedByUserId: adminId,
      taskType: args.taskType?.trim() || "investigate_issue",
      instruction: content,
      status: "queued",
      createdAt: now,
    });
    await ctx.db.insert("adminSupportMessages", {
      threadId: args.threadId,
      authorType: "system",
      content: "Agent task queued. Atlas will investigate the selected user context and return findings here.",
      createdAt: now,
      metadata: { taskId },
    });
    await ctx.scheduler.runAfter(0, internal.adminActions.runAdminAgentTask, { taskId });
    return taskId;
  },
});

export const setThreadStatus = mutation({
  args: {
    threadId: v.id("adminSupportThreads"),
    status: v.union(v.literal("open"), v.literal("investigating"), v.literal("resolved")),
  },
  handler: async (ctx, args) => {
    const adminId = await requireAdmin(ctx);
    const thread = await ctx.db.get(args.threadId);
    if (!thread) throw new Error("Support thread not found");
    const now = Date.now();
    await ctx.db.patch(args.threadId, { status: args.status, updatedAt: now });
    await ctx.db.insert("adminAuditLog", {
      actorUserId: adminId,
      action: "support_thread_status_changed",
      targetType: "adminSupportThreads",
      details: { threadId: args.threadId, from: thread.status, to: args.status },
      createdAt: now,
    });
  },
});

export const setUserAccess = mutation({
  args: {
    userId: v.id("users"),
    accountStatus: v.union(v.literal("active"), v.literal("suspended")),
    accountType: v.union(v.literal("standard"), v.literal("test")),
  },
  handler: async (ctx, args) => {
    const adminId = await requireAdmin(ctx);
    const target = await ctx.db.get(args.userId);
    if (!target) throw new Error("User not found");
    if (target.role === "admin" && args.accountStatus === "suspended") throw new Error("An admin account cannot be suspended from this screen");
    await ctx.db.patch(args.userId, { accountStatus: args.accountStatus, accountType: args.accountType });
    await ctx.db.insert("adminAuditLog", {
      actorUserId: adminId,
      action: "user_access_updated",
      targetUserId: args.userId,
      targetType: "users",
      details: { accountStatus: args.accountStatus, accountType: args.accountType },
      createdAt: Date.now(),
    });
  },
});

export const getTaskContext = internalQuery({
  args: { taskId: v.id("adminAgentTasks") },
  handler: async (ctx, { taskId }) => {
    const task = await ctx.db.get(taskId);
    if (!task) throw new Error("Agent task not found");
    const thread = await ctx.db.get(task.threadId);
    if (!thread) throw new Error("Support thread not found");
    const messages = await ctx.db.query("adminSupportMessages").withIndex("by_threadId", (q) => q.eq("threadId", task.threadId)).order("asc").collect();
    const targetUser = thread.targetUserId ? await ctx.db.get(thread.targetUserId) : null;
    const inventions = targetUser
      ? await ctx.db.query("inventions").withIndex("by_userId", (q) => q.eq("userId", targetUser._id)).collect()
      : [];
    const research = await Promise.all(inventions.map((invention) => ctx.db.query("validationResearch").withIndex("by_inventionId", (q) => q.eq("inventionId", invention._id)).order("desc").first()));
    return { task, thread, messages, targetUser, inventions, research: research.filter(Boolean) };
  },
});

export const markAgentTaskRunning = internalMutation({
  args: { taskId: v.id("adminAgentTasks") },
  handler: async (ctx, { taskId }) => {
    const task = await ctx.db.get(taskId);
    if (!task) throw new Error("Agent task not found");
    await ctx.db.patch(taskId, { status: "running" });
  },
});

export const completeAgentTask = internalMutation({
  args: { taskId: v.id("adminAgentTasks"), status: v.union(v.literal("completed"), v.literal("failed")), result: v.optional(v.string()), error: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Agent task not found");
    const now = Date.now();
    await ctx.db.patch(args.taskId, { status: args.status, result: args.result, error: args.error, completedAt: now });
    await ctx.db.insert("adminSupportMessages", {
      threadId: task.threadId,
      authorType: args.status === "completed" ? "agent" : "system",
      content: args.status === "completed" ? args.result ?? "The agent completed without a written result." : `Agent task failed: ${args.error ?? "Unknown error"}`,
      createdAt: now,
      metadata: { taskId: args.taskId },
    });
    await ctx.db.patch(task.threadId, { status: "investigating", updatedAt: now, lastMessageAt: now });
  },
});
