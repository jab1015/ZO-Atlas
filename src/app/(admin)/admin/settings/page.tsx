"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { ShieldCheck, Wrench } from "lucide-react";
import { AdminHeader } from "@/components/admin";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  const overview = useQuery(api.adminControl.getOverview);
  return (
    <div className="space-y-6">
      <AdminHeader title="Maintenance settings" description="Operational controls for the Atlas admin team" />
      <div className="grid gap-4 md:grid-cols-2">
        <Card><CardHeader><ShieldCheck className="mb-2 h-5 w-5 text-primary" /><CardTitle className="text-lg">Access policy</CardTitle><CardDescription>Admin-only controls are enforced in Convex functions, not just hidden in the UI.</CardDescription></CardHeader><CardContent className="space-y-2 text-sm"><p>Admin role: <Badge>Required</Badge></p><p>Destructive account actions: <Badge variant="outline">Audit logged</Badge></p><p>Agent output: <Badge variant="secondary">Investigation only</Badge></p></CardContent></Card>
        <Card><CardHeader><Wrench className="mb-2 h-5 w-5 text-primary" /><CardTitle className="text-lg">Runtime watch</CardTitle><CardDescription>Use Support & agent chat to investigate before making a controlled change.</CardDescription></CardHeader><CardContent className="space-y-2 text-sm"><p>Open support threads: <strong>{overview?.openThreads ?? "—"}</strong></p><p>Research failures: <strong>{overview?.researchFailed ?? "—"}</strong></p><p>Queued agent tasks: <strong>{overview?.queuedTasks ?? "—"}</strong></p></CardContent></Card>
      </div>
      <div className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">Future maintenance actions—feature flags, safe retries, provider configuration, and controlled upgrades—will be added here only with explicit audit events and approval boundaries.</div>
    </div>
  );
}
