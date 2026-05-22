"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Building2, Shield, Loader2, CheckCircle2, XCircle, Edit, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

type Brokerage = {
  id: string;
  name: string;
  slug: string;
  subscriptionPlan: "FREE" | "STARTER" | "PROFESSIONAL" | "ENTERPRISE";
  subscriptionStatus: "ACTIVE" | "TRIAL" | "PAST_DUE" | "CANCELLED" | "SUSPENDED";
  maxUsers: number;
  maxProperties: number;
  maxRequirements: number;
  isActive: boolean;
  createdAt: string;
  _count: {
    users: number;
    properties: number;
    requirements: number;
  };
};

export default function BrokerageManagementPage() {
  const [brokerages, setBrokerages] = useState<Brokerage[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // Edit Dialog State
  const [selectedBrokerage, setSelectedBrokerage] = useState<Brokerage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    subscriptionPlan: "FREE" as any,
    subscriptionStatus: "ACTIVE" as any,
    maxUsers: 50,
    maxProperties: 500,
    maxRequirements: 500,
    isActive: true,
  });

  const fetchBrokerages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/brokerages");
      if (!res.ok) throw new Error("Failed to fetch brokerages");
      const json = await res.json();
      setBrokerages(json.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load registered brokerages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrokerages();
  }, []);

  const handleOpenEdit = (brokerage: Brokerage) => {
    setSelectedBrokerage(brokerage);
    setEditForm({
      subscriptionPlan: brokerage.subscriptionPlan,
      subscriptionStatus: brokerage.subscriptionStatus,
      maxUsers: brokerage.maxUsers,
      maxProperties: brokerage.maxProperties,
      maxRequirements: brokerage.maxRequirements,
      isActive: brokerage.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleSaveSettings = async () => {
    if (!selectedBrokerage) return;
    setUpdatingId(selectedBrokerage.id);
    try {
      const res = await fetch("/api/admin/brokerages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brokerageId: selectedBrokerage.id,
          subscriptionPlan: editForm.subscriptionPlan,
          subscriptionStatus: editForm.subscriptionStatus,
          maxUsers: Number(editForm.maxUsers),
          maxProperties: Number(editForm.maxProperties),
          maxRequirements: Number(editForm.maxRequirements),
          isActive: editForm.isActive,
        }),
      });

      if (!res.ok) {
        const errorJson = await res.json();
        throw new Error(errorJson.error || "Failed to update brokerage configuration");
      }

      const updated = (await res.json()).data;
      toast.success("Brokerage configuration updated successfully");
      setBrokerages((prev) =>
        prev.map((b) => (b.id === selectedBrokerage.id ? { ...b, ...updated } : b))
      );
      setIsDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update settings");
    } finally {
      setUpdatingId(null);
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case "ENTERPRISE":
        return <Badge className="bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 border-purple-500/20">Enterprise</Badge>;
      case "PROFESSIONAL":
        return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">Professional</Badge>;
      case "STARTER":
        return <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20">Starter</Badge>;
      default:
        return <Badge variant="outline">Free</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Active</Badge>;
      case "TRIAL":
        return <Badge className="bg-sky-500/10 text-sky-500 border-sky-500/20">Trial</Badge>;
      case "SUSPENDED":
        return <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20">Suspended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
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
        <PageHeader title="Brokerage Management" description="Monitor registered brokerages, adjust plan tiers, limits, and toggle active status." />
      </div>

      <Card className="glass-panel border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold">Registered Brokerages ({brokerages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-2">
              <Loader2 className="h-7 w-7 text-primary animate-spin" />
              <p className="text-xs text-muted-foreground font-semibold">Retrieving brokerage records...</p>
            </div>
          ) : brokerages.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground italic">No brokerages found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border/10 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="pb-3 pr-4">Brokerage / Tenant</th>
                    <th className="pb-3 px-4">Subscription Plan</th>
                    <th className="pb-3 px-4">Status</th>
                    <th className="pb-3 px-4">Usage (Users/Properties/Reqs)</th>
                    <th className="pb-3 px-4">Limits (Users/Properties/Reqs)</th>
                    <th className="pb-3 pl-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/5">
                  {brokerages.map((firm) => (
                    <tr key={firm.id} className="align-middle">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-bold text-foreground">{firm.name}</div>
                            <div className="text-xs text-muted-foreground">slug: {firm.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getPlanBadge(firm.subscriptionPlan)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(firm.subscriptionStatus)}
                          {firm.isActive ? (
                            <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5 bg-emerald-500/5 px-1.5 py-0.5 rounded-full">
                              Active
                            </span>
                          ) : (
                            <span className="text-[10px] text-rose-500 font-bold flex items-center gap-0.5 bg-rose-500/5 px-1.5 py-0.5 rounded-full">
                              Disabled
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-xs">
                        <span className="text-foreground">{firm._count.users}</span>
                        <span className="text-muted-foreground"> / </span>
                        <span className="text-foreground">{firm._count.properties}</span>
                        <span className="text-muted-foreground"> / </span>
                        <span className="text-foreground">{firm._count.requirements}</span>
                      </td>
                      <td className="py-4 px-4 font-semibold text-xs text-muted-foreground">
                        <span>{firm.maxUsers} max</span>
                        <span> / </span>
                        <span>{firm.maxProperties} max</span>
                        <span> / </span>
                        <span>{firm.maxRequirements} max</span>
                      </td>
                      <td className="py-4 pl-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 font-bold flex items-center gap-1.5 ml-auto"
                          onClick={() => handleOpenEdit(firm)}
                          disabled={updatingId === firm.id}
                        >
                          <Settings className="h-3.5 w-3.5" />
                          Configure
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Brokerage Configuration Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="glass-panel border-none max-w-md text-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Configure {selectedBrokerage?.name}
            </DialogTitle>
            <DialogDescription>
              Adjust subscription details, system usage limits, and account lifecycle state.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plan" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Subscription Plan
                </Label>
                <Select
                  value={editForm.subscriptionPlan}
                  onValueChange={(val) => setEditForm((prev) => ({ ...prev, subscriptionPlan: (val || "FREE") as any }))}
                >
                  <SelectTrigger id="plan" className="w-full bg-background border-border/20 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FREE">Free Plan</SelectItem>
                    <SelectItem value="STARTER">Starter Plan</SelectItem>
                    <SelectItem value="PROFESSIONAL">Professional Plan</SelectItem>
                    <SelectItem value="ENTERPRISE">Enterprise Plan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Plan Status
                </Label>
                <Select
                  value={editForm.subscriptionStatus}
                  onValueChange={(val) => setEditForm((prev) => ({ ...prev, subscriptionStatus: (val || "ACTIVE") as any }))}
                >
                  <SelectTrigger id="status" className="w-full bg-background border-border/20 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="TRIAL">Trial</SelectItem>
                    <SelectItem value="PAST_DUE">Past Due</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxUsers" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Max Users Limit (Current: {selectedBrokerage?._count.users})
              </Label>
              <Input
                id="maxUsers"
                type="number"
                value={editForm.maxUsers}
                onChange={(e) => setEditForm((prev) => ({ ...prev, maxUsers: parseInt(e.target.value) || 0 }))}
                className="bg-background border-border/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxProperties" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Max Properties (Current: {selectedBrokerage?._count.properties})
                </Label>
                <Input
                  id="maxProperties"
                  type="number"
                  value={editForm.maxProperties}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, maxProperties: parseInt(e.target.value) || 0 }))}
                  className="bg-background border-border/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxRequirements" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Max Requirements (Current: {selectedBrokerage?._count.requirements})
                </Label>
                <Input
                  id="maxRequirements"
                  type="number"
                  value={editForm.maxRequirements}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, maxRequirements: parseInt(e.target.value) || 0 }))}
                  className="bg-background border-border/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/10">
              <div className="space-y-0.5">
                <Label htmlFor="isActive" className="text-sm font-bold">
                  Tenant Access Active
                </Label>
                <p className="text-xs text-muted-foreground">
                  Instantly block or allow all users within this brokerage to login.
                </p>
              </div>
              <Switch
                id="isActive"
                checked={editForm.isActive}
                onCheckedChange={(checked) => setEditForm((prev) => ({ ...prev, isActive: checked }))}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={updatingId !== null}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings} disabled={updatingId !== null} className="font-bold">
              {updatingId !== null && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
