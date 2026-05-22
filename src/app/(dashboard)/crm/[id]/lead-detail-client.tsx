"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  User, 
  Building, 
  FileText, 
  Calendar, 
  DollarSign, 
  Clock,
  Activity, 
  CheckSquare, 
  Zap, 
  MapPin, 
  ExternalLink,
  Tag
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { formatPrice, cn } from "@/lib/utils";
import { 
  PROPERTY_TYPE_LABELS, 
  TRANSACTION_TYPE_LABELS, 
  LEAD_STATUS_LABELS, 
  LEAD_STATUS_COLORS 
} from "@/lib/constants";

// Imports for our CRM Managers
import { LeadPipelineTracker } from "@/components/crm/lead-pipeline-tracker";
import { ActivityTimeline } from "@/components/crm/activity-timeline";
import { TasksManager } from "@/components/crm/tasks-manager";
import { NotesManager } from "@/components/crm/notes-manager";
import { VisitsManager } from "@/components/crm/visits-manager";

type LeadDetailClientProps = {
  lead: any;
  initialMatches: any[];
  matchType: "property" | "requirement" | null;
};

function ScoreCircle({ score, size = "md" }: { score: number; size?: "sm" | "md" | "lg" }) {
  const sizeMap = { sm: 40, md: 56, lg: 72 };
  const s = sizeMap[size];
  const strokeWidth = size === "sm" ? 3 : 4;
  const radius = (s - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  const color = score >= 80 ? "text-emerald-500" : score >= 60 ? "text-blue-500" : score >= 40 ? "text-amber-500" : "text-red-500";

  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: s, height: s }}>
      <svg className="transform -rotate-90" width={s} height={s}>
        <circle cx={s / 2} cy={s / 2} r={radius} className="fill-none stroke-muted" strokeWidth={strokeWidth} />
        <circle
          cx={s / 2} cy={s / 2} r={radius}
          className={`fill-none ${color}`}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
        />
      </svg>
      <span className={cn("absolute font-bold text-foreground", size === "sm" && "text-[10px]", size === "md" && "text-xs", size === "lg" && "text-sm")}>
        {score}%
      </span>
    </div>
  );
}

export function LeadDetailClient({ lead: initialLead, initialMatches, matchType }: LeadDetailClientProps) {
  const [lead, setLead] = useState(initialLead);

  const handleStatusChange = (newStatus: any) => {
    setLead((prev: any) => ({ ...prev, status: newStatus }));
  };

  const statusLabel = LEAD_STATUS_LABELS[lead.status as keyof typeof LEAD_STATUS_LABELS] || lead.status;
  const statusColorClass = LEAD_STATUS_COLORS[lead.status as keyof typeof LEAD_STATUS_COLORS] || "bg-gray-500/10 text-gray-500";

  return (
    <div className="space-y-6">
      {/* Header and Back Link */}
      <div className="space-y-2">
        <Link 
          href="/crm" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Pipeline
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
              {lead.contactName}
              <Badge className={cn("px-2.5 py-1 text-xs font-bold border-none", statusColorClass)}>
                {statusLabel}
              </Badge>
            </h1>
            <p className="text-sm text-muted-foreground">
              Lead created {new Date(lead.createdAt).toLocaleDateString()} · Assigned to {lead.assignedTo?.fullName || "Unassigned"}
            </p>
          </div>
          {lead.expectedValue && (
            <div className="glass-panel py-2 px-4 rounded-xl flex flex-col items-end border-none">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Deal Value</span>
              <span className="text-xl font-black text-primary">{formatPrice(lead.expectedValue)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Pipeline Status Indicator bar */}
      <LeadPipelineTracker 
        leadId={lead.id} 
        currentStatus={lead.status} 
        onStatusChange={handleStatusChange} 
      />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Contact details & Connections */}
        <div className="space-y-6">
          <Card className="glass-panel border-none rounded-2xl shadow-sm">
            <CardHeader className="pb-3 border-b border-border/10">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <User className="h-4.5 w-4.5 text-muted-foreground" /> Contact Info
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {lead.contactEmail && (
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted/60 p-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Email</span>
                    <a href={`mailto:${lead.contactEmail}`} className="text-sm text-foreground/80 hover:text-primary transition-colors block truncate font-medium">
                      {lead.contactEmail}
                    </a>
                  </div>
                </div>
              )}

              {lead.contactPhone && (
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted/60 p-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Phone</span>
                    <a href={`tel:${lead.contactPhone}`} className="text-sm text-foreground/80 hover:text-primary transition-colors block truncate font-medium">
                      {lead.contactPhone}
                    </a>
                  </div>
                </div>
              )}

              {lead.source && (
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted/60 p-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Lead Source</span>
                    <span className="text-sm text-foreground/80 font-medium block">
                      {lead.source}
                    </span>
                  </div>
                </div>
              )}

              {lead.notes && (
                <div className="pt-2 border-t border-border/10">
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Lead Context</span>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                    {lead.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Connections Card */}
          <Card className="glass-panel border-none rounded-2xl shadow-sm">
            <CardHeader className="pb-3 border-b border-border/10">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Building className="h-4.5 w-4.5 text-muted-foreground" /> Connections
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {lead.property && (
                <div className="space-y-2">
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Linked Listing</span>
                  <div className="rounded-xl border border-border/40 p-3 bg-muted/20 hover:bg-muted/40 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-foreground leading-snug line-clamp-1">{lead.property.title}</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{lead.property.locality}, {lead.property.city}</p>
                      </div>
                      <Link href={`/properties/${lead.property.id}`} className="text-primary hover:text-primary-hover shrink-0">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                    <p className="text-xs font-black text-primary mt-2">{formatPrice(lead.property.price)}</p>
                  </div>
                </div>
              )}

              {lead.requirement && (
                <div className="space-y-2">
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Linked Buyer Requirement</span>
                  <div className="rounded-xl border border-border/40 p-3 bg-muted/20 hover:bg-muted/40 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-foreground leading-snug line-clamp-1">{lead.requirement.title}</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{lead.requirement.city}</p>
                      </div>
                      <Link href={`/requirements/${lead.requirement.id}`} className="text-primary hover:text-primary-hover shrink-0">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                    <p className="text-xs font-semibold text-primary mt-2">
                      {formatPrice(lead.requirement.budgetMin)} - {formatPrice(lead.requirement.budgetMax)}
                    </p>
                  </div>
                </div>
              )}

              {!lead.property && !lead.requirement && (
                <div className="text-center py-6 text-xs text-muted-foreground italic">
                  No property or requirement associated with this lead.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Tabbed workspace (Timeline, Notes, Tasks, Visits, Matches) */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="timeline" className="w-full">
            <TabsList className="grid grid-cols-5 w-full bg-muted/40 p-1 rounded-xl">
              <TabsTrigger value="timeline" className="text-xs font-semibold py-2">
                <Activity className="h-3.5 w-3.5 mr-1" /> Feed
              </TabsTrigger>
              <TabsTrigger value="tasks" className="text-xs font-semibold py-2">
                <CheckSquare className="h-3.5 w-3.5 mr-1" /> Tasks
              </TabsTrigger>
              <TabsTrigger value="notes" className="text-xs font-semibold py-2">
                <FileText className="h-3.5 w-3.5 mr-1" /> Notes
              </TabsTrigger>
              <TabsTrigger value="visits" className="text-xs font-semibold py-2">
                <Calendar className="h-3.5 w-3.5 mr-1" /> Visits
              </TabsTrigger>
              <TabsTrigger value="matches" className="text-xs font-semibold py-2">
                <Zap className="h-3.5 w-3.5 mr-1" /> Matches
              </TabsTrigger>
            </TabsList>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="mt-4 pt-1 focus-visible:outline-none">
              <Card className="glass-panel border-none rounded-2xl p-4">
                <ActivityTimeline leadId={lead.id} initialActivities={lead.activities || []} />
              </Card>
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="tasks" className="mt-4 pt-1 focus-visible:outline-none">
              <Card className="glass-panel border-none rounded-2xl p-4">
                <TasksManager leadId={lead.id} initialTasks={lead.taskItems || []} />
              </Card>
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="mt-4 pt-1 focus-visible:outline-none">
              <Card className="glass-panel border-none rounded-2xl p-4">
                <NotesManager leadId={lead.id} initialNotes={lead.noteItems || []} />
              </Card>
            </TabsContent>

            {/* Visits Tab */}
            <TabsContent value="visits" className="mt-4 pt-1 focus-visible:outline-none">
              <Card className="glass-panel border-none rounded-2xl p-4">
                <VisitsManager leadId={lead.id} initialVisits={lead.visits || []} />
              </Card>
            </TabsContent>

            {/* Matches Tab */}
            <TabsContent value="matches" className="mt-4 pt-1 focus-visible:outline-none">
              <Card className="glass-panel border-none rounded-2xl p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-border/10 pb-3">
                  <div>
                    <h3 className="font-bold text-base text-foreground">AI-Driven Real Estate Matching</h3>
                    <p className="text-xs text-muted-foreground">Scored based on location, budget, property type, transaction type, and area.</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] py-1 border-amber-500/30 bg-amber-500/5 text-amber-600 font-extrabold uppercase tracking-wide flex items-center gap-1 shrink-0">
                    <Zap className="h-3 w-3 text-amber-500 fill-amber-500" /> Scoring Engine
                  </Badge>
                </div>

                {initialMatches.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground border border-dashed rounded-xl">
                    <Zap className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-sm font-medium">No matches found with score &gt; 20%</p>
                    <p className="text-xs text-muted-foreground/80 mt-1">Make sure properties and buyer requirements are active in the same city.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {initialMatches.map((match: any, index: number) => {
                      const item = matchType === "property" ? match.property : match.requirement;
                      const itemId = item.id;
                      const itemTitle = item.title;
                      const isProperty = matchType === "property";

                      return (
                        <div key={itemId || index} className="flex flex-col sm:flex-row border border-border/40 rounded-xl overflow-hidden bg-card/20 hover:border-border/80 transition-all duration-200">
                          {/* Circle score side */}
                          <div className="flex items-center justify-center p-4 bg-muted/20 border-b sm:border-b-0 sm:border-r border-border/40 w-full sm:w-24 shrink-0">
                            <ScoreCircle score={match.totalScore} size="md" />
                          </div>

                          {/* Info side */}
                          <div className="p-4 flex-1 space-y-3 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h4 className="font-bold text-sm text-foreground truncate leading-snug">{itemTitle}</h4>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                  <MapPin className="h-3 w-3 shrink-0" />
                                  {isProperty ? `${item.locality}, ${item.city}` : item.city}
                                </div>
                              </div>
                              <span className="font-black text-sm text-primary whitespace-nowrap">
                                {isProperty 
                                  ? formatPrice(item.price) 
                                  : `${formatPrice(item.budgetMin)} - ${formatPrice(item.budgetMax)}`
                                }
                              </span>
                            </div>

                            {/* Attributes */}
                            <div className="flex flex-wrap gap-1.5">
                              <Badge variant="secondary" className="text-[10px] font-bold px-2">
                                {PROPERTY_TYPE_LABELS[item.propertyType as keyof typeof PROPERTY_TYPE_LABELS] || item.propertyType}
                              </Badge>
                              <Badge variant="outline" className="text-[10px] font-semibold px-2">
                                {TRANSACTION_TYPE_LABELS[item.transactionType as keyof typeof TRANSACTION_TYPE_LABELS] || item.transactionType}
                              </Badge>
                              {item.area && (
                                <Badge variant="outline" className="text-[10px] font-semibold px-2">
                                  {item.area} {item.areaUnit || "sqft"}
                                </Badge>
                              )}
                            </div>

                            {/* Score details */}
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-border/10">
                              {[
                                { label: "Location", score: match.breakdown.locationScore },
                                { label: "Budget", score: match.breakdown.budgetScore },
                                { label: "Type", score: match.breakdown.propertyTypeScore },
                                { label: "Txn", score: match.breakdown.transactionScore },
                                { label: "Area", score: match.breakdown.areaScore },
                              ].map((dim) => (
                                <div key={dim.label} className="space-y-1">
                                  <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground">
                                    <span>{dim.label}</span>
                                    <span>{dim.score}%</span>
                                  </div>
                                  <Progress value={dim.score} className="h-1 bg-muted" />
                                </div>
                              ))}
                            </div>

                            {/* Action to View details */}
                            <div className="flex justify-end pt-1">
                              <Link 
                                href={isProperty ? `/properties/${itemId}` : `/requirements/${itemId}`}
                                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover"
                              >
                                View Detailed Match <ExternalLink className="h-3 w-3" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>

      </div>
    </div>
  );
}
