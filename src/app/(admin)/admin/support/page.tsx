"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { AdminHeader } from "@/components/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function AdminSupportPage() {
  const threads = useQuery(api.adminControl.listThreads);
  const users = useQuery(api.adminControl.listUsers);
  const createThread = useMutation(api.adminControl.createThread);
  const sendMessage = useMutation(api.adminControl.sendMessageAndQueueTask);
  const setStatus = useMutation(api.adminControl.setThreadStatus);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [targetUserId, setTargetUserId] = useState("");
  const [priority, setPriority] = useState<"low" | "normal" | "high" | "urgent">("normal");
  const [queueAgent, setQueueAgent] = useState(true);
  const selectedThread = useQuery(api.adminControl.getThread, selectedId ? { threadId: selectedId as never } : "skip");
  const openThreads = useMemo(() => threads ?? [], [threads]);

  async function startThread() {
    if (!subject.trim()) return;
    const id = await createThread({ subject, priority, targetUserId: targetUserId ? targetUserId as never : undefined, initialMessage: message || undefined });
    setSelectedId(id);
    setSubject("");
    setMessage("");
  }

  async function send() {
    if (!selectedId || !message.trim()) return;
    await sendMessage({ threadId: selectedId as never, content: message, queueAgent, taskType: "investigate_user_issue" });
    setMessage("");
  }

  return <div className="space-y-6"><AdminHeader title="Support & agent chat" description="Investigate user issues, preserve the evidence, and queue agents for safe diagnosis." /><div className="grid gap-6 lg:grid-cols-[320px_1fr]"><Card><CardHeader><CardTitle className="text-base">Investigations</CardTitle></CardHeader><CardContent className="space-y-2">{openThreads.map((thread) => <button key={thread._id} className={`w-full rounded-md border p-3 text-left ${selectedId === thread._id ? "border-primary bg-primary/5" : "hover:bg-muted/40"}`} onClick={() => setSelectedId(thread._id)}><div className="flex items-center justify-between gap-2"><span className="truncate font-medium">{thread.subject}</span><Badge variant="outline">{thread.status}</Badge></div><p className="mt-1 text-xs text-muted-foreground">{thread.targetUser?.email || "No user selected"}</p></button>)}{threads?.length === 0 && <p className="text-sm text-muted-foreground">No investigations yet.</p>}<div className="border-t pt-4"><Input placeholder="New investigation subject" value={subject} onChange={(e) => setSubject(e.target.value)} /><select className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm" value={targetUserId} onChange={(e) => setTargetUserId(e.target.value)}><option value="">No target user</option>{users?.map((user) => <option key={user._id} value={user._id}>{user.email || user.name || "Unnamed user"}</option>)}</select><Button className="mt-2 w-full" size="sm" onClick={startThread}>Start investigation</Button></div></CardContent></Card><Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-base">{selectedThread?.thread.subject || "Select an investigation"}</CardTitle>{selectedThread?.thread && <Button size="sm" variant="outline" onClick={() => setStatus({ threadId: selectedThread.thread._id, status: selectedThread.thread.status === "resolved" ? "investigating" : "resolved" })}>{selectedThread.thread.status === "resolved" ? "Reopen" : "Resolve"}</Button>}</CardHeader><CardContent>{selectedThread ? <><div className="max-h-[460px] space-y-3 overflow-y-auto rounded-md border p-4">{selectedThread.messages.map((item) => <div key={item._id} className="rounded-md bg-muted/40 p-3"><div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{item.authorType}</div><p className="whitespace-pre-wrap text-sm">{item.content}</p></div>)}</div><Textarea className="mt-4 min-h-28" placeholder="Describe the issue or ask the agent to investigate…" value={message} onChange={(e) => setMessage(e.target.value)} /><label className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"><input type="checkbox" checked={queueAgent} onChange={(e) => setQueueAgent(e.target.checked)} /> Ask the agent to investigate after sending</label><Button className="mt-3" onClick={send}>Send to thread</Button></> : <p className="text-sm text-muted-foreground">Create or select an investigation to view the evidence and chat with the admin agent.</p>}</CardContent></Card></div></div>;
}
