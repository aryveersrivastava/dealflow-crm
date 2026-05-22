"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Phone, Mail, Calendar, DollarSign, User, Building, Landmark, Trash, Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { PageHeader } from "@/components/shared/page-header";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn, formatPrice, formatRelativeTime, getInitials } from "@/lib/utils";
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS } from "@/lib/constants";

const PIPELINE_STAGES = [
  "NEW_LEAD",
  "CONTACTED",
  "INTERESTED",
  "SITE_VISIT",
  "NEGOTIATION",
  "CLOSED_WON",
  "CLOSED_LOST",
] as const;

type Lead = {
  id: string;
  contactName: string;
  contactPhone?: string;
  contactEmail?: string;
  source?: string;
  status: typeof PIPELINE_STAGES[number];
  score: number;
  expectedValue?: number;
  nextFollowUp?: string;
  property?: { id: string; title: string };
  requirement?: { id: string; title: string };
  assignedTo?: { id: string; fullName: string };
  createdAt: string;
};

export default function CRMPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDragStage, setActiveDragStage] = useState<string | null>(null);
  
  // Create lead states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formSource, setFormSource] = useState("");
  const [formValue, setFormValue] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formProperty, setFormProperty] = useState("none");
  const [formRequirement, setFormRequirement] = useState("none");
  const [formAgent, setFormAgent] = useState("none");

  // Selection list states
  const [properties, setProperties] = useState<any[]>([]);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);

  // Fetch leads grouped for pipeline
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/leads?pipeline=true");
      if (!res.ok) throw new Error("Failed to fetch leads");
      const json = await res.json();
      setLeads(json.data || []);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load lead pipeline");
    } finally {
      setLoading(false);
    }
  };

  // Fetch selection dropdown data
  const fetchSelectionData = async () => {
    try {
      const [propRes, reqRes, agentRes] = await Promise.all([
        fetch("/api/properties"),
        fetch("/api/requirements"),
        fetch("/api/users"),
      ]);

      if (propRes.ok) {
        const propJson = await propRes.json();
        setProperties(propJson.data || []);
      }
      if (reqRes.ok) {
        const reqJson = await reqRes.json();
        setRequirements(reqJson.data || []);
      }
      if (agentRes.ok) {
        const agentJson = await agentRes.json();
        setAgents(agentJson.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch selection data", err);
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchSelectionData();
  }, []);

  // HTML5 Drag and Drop event handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    setActiveDragStage(stage);
  };

  const handleDragLeave = () => {
    setActiveDragStage(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStage: typeof PIPELINE_STAGES[number]) => {
    e.preventDefault();
    setActiveDragStage(null);
    const leadId = e.dataTransfer.getData("text/plain");

    if (!leadId) return;

    // Optimistic update
    const previousLeads = [...leads];
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: targetStage } : l))
    );

    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStage }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      
      toast.success(`Moved to ${LEAD_STATUS_LABELS[targetStage]}`);
      
      // Refresh to make sure everything (like score and activity log) is updated
      const json = await res.json();
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, ...json.data } : l))
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update lead status");
      setLeads(previousLeads); // Rollback
    }
  };

  // Submit Lead Form
  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Contact name is required");
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        contactName: formName,
        contactPhone: formPhone || undefined,
        contactEmail: formEmail || undefined,
        source: formSource || undefined,
        notes: formNotes || undefined,
        expectedValue: formValue ? parseFloat(formValue) : undefined,
      };

      if (formProperty !== "none") payload.propertyId = formProperty;
      if (formRequirement !== "none") payload.requirementId = formRequirement;
      if (formAgent !== "none") payload.assignedToId = formAgent;

      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorJson = await res.json();
        throw new Error(errorJson.error || "Failed to create lead");
      }

      toast.success("Lead created successfully");
      setIsCreateOpen(false);
      
      // Reset form
      setFormName("");
      setFormPhone("");
      setFormEmail("");
      setFormSource("");
      setFormValue("");
      setFormNotes("");
      setFormProperty("none");
      setFormRequirement("none");
      setFormAgent("none");

      fetchLeads(); // Refresh
    } catch (err: any) {
      toast.error(err.message || "Failed to create lead");
    } finally {
      setSubmitting(false);
    }
  };

  // Group leads by stage locally
  const groupedLeads = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage] = leads.filter((l) => l.status === stage);
    return acc;
  }, {} as Record<typeof PIPELINE_STAGES[number], Lead[]>);

  // Calculate sum of expected values in pipeline
  const calculatePipelineValue = (stageLeads: Lead[]) => {
    return stageLeads.reduce((sum, l) => sum + Number(l.expectedValue || 0), 0);
  };

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
      <div className="shrink-0 flex items-center justify-between">
        <PageHeader
          title="Deal Pipeline"
          description="Track and manage your brokerage leads through the deal lifecycle"
        />
        
        {/* Create Lead Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger render={
            <Button className="gap-2 shadow-sm">
              <Plus className="h-4 w-4" /> Create Lead
            </Button>
          } />
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Lead</DialogTitle>
              <DialogDescription>
                Create a new CRM lead, optionally linking it to properties, requirements, and assignees.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateLead} className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Contact Name *</label>
                <Input
                  placeholder="e.g. Rajesh Kumar"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">Phone Number</label>
                  <Input
                    placeholder="e.g. +91 9988776655"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
                  <Input
                    type="email"
                    placeholder="e.g. name@domain.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">Lead Source</label>
                  <Input
                    placeholder="e.g. MagicBricks, Referral"
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">Expected Deal Value (INR)</label>
                  <Input
                    type="number"
                    placeholder="e.g. 15000000"
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Link Property</label>
                <Select value={formProperty} onValueChange={(val) => setFormProperty(val || "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a property" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {properties.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.title} ({p.locality})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Link Buyer Requirement</label>
                <Select value={formRequirement} onValueChange={(val) => setFormRequirement(val || "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a requirement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {requirements.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.title} ({r.buyerName})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Assign Agent</label>
                <Select value={formAgent} onValueChange={(val) => setFormAgent(val || "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {agents.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.fullName} ({a.role.replace("_", " ")})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Initial Notes</label>
                <Textarea
                  placeholder="Enter details, preferences, or call summaries..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="h-20"
                />
              </div>

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Lead
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Loading deal pipeline...</span>
          </div>
        </div>
      ) : (
        <ScrollArea className="flex-1 w-full border rounded-lg bg-card/10 backdrop-blur-md">
          <div className="flex gap-4 p-4 min-h-[500px] h-full min-w-max">
            {PIPELINE_STAGES.map((stage) => {
              const stageLeads = groupedLeads[stage] || [];
              const stageColor = LEAD_STATUS_COLORS[stage];
              const pipelineVal = calculatePipelineValue(stageLeads);
              const isOver = activeDragStage === stage;

              return (
                <div
                  key={stage}
                  className="w-[280px] flex flex-col h-full bg-muted/10 rounded-xl"
                  onDragOver={(e) => handleDragOver(e, stage)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, stage)}
                >
                  {/* Column Header */}
                  <div className={cn(
                    "rounded-t-xl px-4 py-3 shrink-0 border-b flex flex-col gap-1.5 transition-all",
                    isOver ? "bg-muted/60 border-primary" : "bg-muted/40"
                  )}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn("h-2.5 w-2.5 rounded-full animate-pulse", stageColor)} />
                        <h3 className="text-sm font-bold tracking-tight text-foreground/90">
                          {LEAD_STATUS_LABELS[stage]}
                        </h3>
                      </div>
                      <Badge variant="secondary" className="text-xs h-5 min-w-5 flex items-center justify-center font-bold">
                        {stageLeads.length}
                      </Badge>
                    </div>
                    {pipelineVal > 0 && (
                      <div className="text-[11px] font-semibold text-muted-foreground flex items-center">
                        <DollarSign className="h-3 w-3 inline" />
                        {formatPrice(pipelineVal)}
                      </div>
                    )}
                  </div>

                  {/* Cards Container */}
                  <div className={cn(
                    "flex-1 overflow-y-auto p-2 space-y-2 min-h-[300px] transition-colors duration-150",
                    isOver ? "bg-primary/5 border border-dashed border-primary/30 rounded-b-xl" : ""
                  )}>
                    {stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                      >
                        <Link href={`/crm/${lead.id}`}>
                          <Card className="group cursor-grab active:cursor-grabbing hover-lift transition-all duration-200 border border-border/40 hover:border-primary/20 bg-card hover:shadow-md">
                            <CardContent className="p-3.5 space-y-3">
                              {/* Contact Name & Score */}
                              <div className="flex items-start justify-between">
                                <div className="space-y-0.5">
                                  <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                    {lead.contactName}
                                  </p>
                                  {lead.property && (
                                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium truncate max-w-[170px]">
                                      <Building className="h-3 w-3 shrink-0" />
                                      <span className="truncate">{lead.property.title}</span>
                                    </div>
                                  )}
                                  {lead.requirement && (
                                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium truncate max-w-[170px]">
                                      <Landmark className="h-3 w-3 shrink-0" />
                                      <span className="truncate">{lead.requirement.title}</span>
                                    </div>
                                  )}
                                </div>
                                <div className={cn(
                                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold shadow-sm border",
                                  lead.score >= 80 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                                  lead.score >= 60 ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                                  lead.score >= 40 ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                                  "bg-rose-500/10 text-rose-600 border-rose-500/20"
                                )}>
                                  {lead.score}
                                </div>
                              </div>

                              {/* Value & Source */}
                              <div className="flex items-center justify-between text-xs pt-1 border-t border-border/20">
                                {lead.source ? (
                                  <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-semibold">
                                    {lead.source}
                                  </span>
                                ) : (
                                  <span />
                                )}
                                {lead.expectedValue ? (
                                  <span className="font-extrabold text-primary">
                                    {formatPrice(lead.expectedValue)}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground text-[10px]">No budget</span>
                                )}
                              </div>

                              {/* Assigned User & Timestamp */}
                              <div className="flex items-center justify-between text-[11px] pt-1">
                                {lead.assignedTo ? (
                                  <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                                    <Avatar className="h-4.5 w-4.5 border">
                                      <AvatarFallback className="text-[8px] font-extrabold bg-primary/10 text-primary">
                                        {getInitials(lead.assignedTo.fullName)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="truncate max-w-[100px]">{lead.assignedTo.fullName.split(" ")[0]}</span>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-muted-foreground italic font-medium">Unassigned</span>
                                )}
                                <span className="text-[10px] text-muted-foreground font-medium">
                                  {formatRelativeTime(lead.createdAt)}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      </div>
                    ))}

                    {stageLeads.length === 0 && (
                      <div className="flex items-center justify-center h-24 text-[11px] text-muted-foreground italic">
                        No leads in this stage
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
    </div>
  );
}
