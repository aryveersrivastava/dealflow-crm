"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, User, Shield, ShieldAlert, Loader2, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type AdminUser = {
  id: string;
  email: string;
  fullName: string;
  role: "SUPER_ADMIN" | "BROKERAGE_ADMIN" | "BROKER" | "AGENT";
  isActive: boolean;
  tenant: { name: string };
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const json = await res.json();
      setUsers(json.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load brokerage users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "updateRole", role: newRole }),
      });

      if (!res.ok) {
        const errorJson = await res.json();
        throw new Error(errorJson.error || "Failed to update role");
      }

      toast.success("User role updated successfully");
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole as any } : u))
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to change user role");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    setUpdatingId(userId);
    const action = currentStatus ? "deactivate" : "activate";
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });

      if (!res.ok) {
        const errorJson = await res.json();
        throw new Error(errorJson.error || `Failed to ${action} user`);
      }

      toast.success(`User successfully ${currentStatus ? "deactivated" : "activated"}`);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isActive: !currentStatus } : u))
      );
    } catch (err: any) {
      toast.error(err.message || `Failed to update status`);
    } finally {
      setUpdatingId(null);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <Badge className="bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border-rose-500/20">Super Admin</Badge>;
      case "BROKERAGE_ADMIN":
        return <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20">Brokerage Admin</Badge>;
      case "BROKER":
        return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">Broker</Badge>;
      default:
        return <Badge variant="outline">Agent</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/admin">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader title="User Management" description="Manage roles, access levels, and active status for agents and brokers." />
      </div>

      <Card className="glass-panel border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold">Brokerage Members ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-2">
              <Loader2 className="h-7 w-7 text-primary animate-spin" />
              <p className="text-xs text-muted-foreground font-semibold">Retrieving member roster...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground italic">No team users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border/10 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="pb-3 pr-4">User</th>
                    <th className="pb-3 px-4">Role</th>
                    <th className="pb-3 px-4">Status</th>
                    <th className="pb-3 pl-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/5">
                  {users.map((member) => (
                    <tr key={member.id} className="align-middle">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {member.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-foreground">{member.fullName}</div>
                            <div className="text-xs text-muted-foreground">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {getRoleBadge(member.role)}
                          {member.role !== "SUPER_ADMIN" && (
                            <Select
                              value={member.role}
                              onValueChange={(val) => handleRoleChange(member.id, val || "")}
                              disabled={updatingId === member.id}
                            >
                              <SelectTrigger className="w-[150px] h-8 text-xs bg-background">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="BROKERAGE_ADMIN">Brokerage Admin</SelectItem>
                                <SelectItem value="BROKER">Broker</SelectItem>
                                <SelectItem value="AGENT">Agent</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {member.isActive ? (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-bold">
                            <CheckCircle2 className="h-4 w-4" /> Active
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold">
                            <XCircle className="h-4 w-4" /> Deactivated
                          </div>
                        )}
                      </td>
                      <td className="py-4 pl-4 text-right">
                        {member.role !== "SUPER_ADMIN" && (
                          <Button
                            variant={member.isActive ? "destructive" : "outline"}
                            size="sm"
                            className="h-8 font-bold"
                            onClick={() => handleToggleActive(member.id, member.isActive)}
                            disabled={updatingId === member.id}
                          >
                            {updatingId === member.id && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
                            {member.isActive ? "Deactivate" : "Activate"}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
