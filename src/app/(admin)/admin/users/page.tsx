"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { AdminHeader } from "@/components/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminUsersPage() {
  const users = useQuery(api.adminControl.listUsers);
  const setUserAccess = useMutation(api.adminControl.setUserAccess);

  return <div className="space-y-6"><AdminHeader title="Users & test accounts" description="Manage access and mark isolated accounts for acceptance testing." /><Card><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b bg-muted/40"><th className="px-4 py-3 text-left">User</th><th className="px-4 py-3 text-left">Role</th><th className="px-4 py-3 text-left">Type</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-left">Usage</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody>{users?.map((user) => <tr className="border-b last:border-0" key={user._id}><td className="px-4 py-3"><div className="font-medium">{user.name || "Unnamed user"}</div><div className="text-xs text-muted-foreground">{user.email || "No email"}</div></td><td className="px-4 py-3"><Badge variant={user.role === "admin" ? "default" : "outline"}>{user.role}</Badge></td><td className="px-4 py-3"><Badge variant="outline">{user.accountType}</Badge></td><td className="px-4 py-3"><Badge variant={user.accountStatus === "suspended" ? "destructive" : "secondary"}>{user.accountStatus}</Badge></td><td className="px-4 py-3 text-muted-foreground">{user.inventionCount} inventions · {user.openThreadCount} open issues</td><td className="px-4 py-3 text-right"><div className="flex justify-end gap-2"><Button size="sm" variant="outline" disabled={user.role === "admin"} onClick={() => setUserAccess({ userId: user._id, accountType: user.accountType === "test" ? "standard" : "test", accountStatus: user.accountStatus })}>{user.accountType === "test" ? "Mark standard" : "Mark test"}</Button><Button size="sm" variant="outline" disabled={user.role === "admin"} onClick={() => setUserAccess({ userId: user._id, accountType: user.accountType, accountStatus: user.accountStatus === "suspended" ? "active" : "suspended" })}>{user.accountStatus === "suspended" ? "Restore" : "Suspend"}</Button></div></td></tr>)}</tbody></table></div>{users === undefined && <p className="p-8 text-sm text-muted-foreground">Loading users…</p>}{users?.length === 0 && <p className="p-8 text-sm text-muted-foreground">No users yet.</p>}</CardContent></Card></div>;
}
