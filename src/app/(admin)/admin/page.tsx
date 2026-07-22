"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Activity, AlertTriangle, Bot, CheckCircle2, MessageSquare, Users } from "lucide-react";
import { AdminHeader } from "@/components/admin";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardPage() {
  const overview = useQuery(api.adminControl.getOverview);
  if (!overview) return <div className="space-y-6"><AdminHeader title="Control center" /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div></div>;
  const cards = [
    ["Users", overview.users, Users],
    ["Test accounts", overview.testUsers, CheckCircle2],
    ["Active inventions", overview.activeInventions, Activity],
    ["Open investigations", overview.openThreads, MessageSquare],
    ["Research running", overview.researchRunning, Bot],
    ["Research failures", overview.researchFailed, AlertTriangle],
    ["Queued agent tasks", overview.queuedTasks, Bot],
    ["Active users", overview.activeUsers, Users],
  ] as const;
  return <div className="space-y-8"><AdminHeader title="Control center" description="Atlas maintenance, user support, agent operations, and release readiness." /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{cards.map(([label, value, Icon]) => <Card key={label}><CardContent className="p-5"><Icon className="h-5 w-5 text-primary" /><p className="mt-4 text-sm text-muted-foreground">{label}</p><p className="mt-1 text-3xl font-semibold">{value}</p></CardContent></Card>)}</div><div className="grid gap-6 lg:grid-cols-2"><Card><CardHeader><CardTitle className="text-lg">Operating rules</CardTitle></CardHeader><CardContent className="space-y-3 text-sm text-muted-foreground"><p>Agents may investigate and recommend fixes. They do not deploy code, alter billing, contact users, or make public launch decisions without approval.</p><p>Use <strong className="text-foreground">Users & test accounts</strong> to isolate acceptance testing from production-like user data.</p><p>Use <strong className="text-foreground">Support & agent chat</strong> to preserve the issue, target a user, and queue a diagnostic task.</p></CardContent></Card><Card><CardHeader><CardTitle className="text-lg">System state</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-2"><Badge variant="secondary">Backend connected</Badge><Badge variant="secondary">Auth enabled</Badge><Badge variant="secondary">Audit logging enabled</Badge><Badge variant="outline">Code changes require approval</Badge></CardContent></Card></div></div>;
}
