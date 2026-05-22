"use client";

import { useEffect, useState } from "react";
import { Calendar, Eye, Star, Plus, Loader2, Check, X, Ban, ThumbsUp, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn, formatPrice } from "@/lib/utils";

type Visit = {
  id: string;
  scheduledAt: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  feedback?: string;
  rating?: number;
  property: {
    id: string;
    title: string;
    city: string;
    locality: string;
    price: number;
  };
  user: {
    id: string;
    fullName: string;
  };
};

interface VisitsManagerProps {
  leadId: string;
  initialVisits: Visit[];
}

const VISIT_STATUS_LABELS = {
  SCHEDULED: "Scheduled",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No Show",
};

const VISIT_STATUS_COLORS = {
  SCHEDULED: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  COMPLETED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  CANCELLED: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  NO_SHOW: "bg-amber-500/10 text-amber-600 border-amber-500/20",
};

export function VisitsManager({ leadId, initialVisits }: VisitsManagerProps) {
  const [visits, setVisits] = useState<Visit[]>(initialVisits);
  
  // Schedule modal states
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [propertyId, setPropertyId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [properties, setProperties] = useState<any[]>([]);

  // Update outcome dialog states
  const [isOutcomeOpen, setIsOutcomeOpen] = useState(false);
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [outcomeStatus, setOutcomeStatus] = useState<"COMPLETED" | "CANCELLED" | "NO_SHOW">("COMPLETED");
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState("5");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    // Fetch properties for selection
    fetch("/api/properties")
      .then((res) => res.json())
      .then((json) => setProperties(json.data || []))
      .catch((err) => console.error(err));
  }, []);

  const handleScheduleVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId || !scheduledAt) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          leadId,
          scheduledAt: new Date(scheduledAt).toISOString(),
        }),
      });

      if (!res.ok) throw new Error("Failed to schedule visit");
      const json = await res.json();

      toast.success("Site visit scheduled successfully");
      setIsOpen(false);
      
      // Reset form
      setPropertyId("");
      setScheduledAt("");

      // Refresh locally (we'll fetch visits list again to get fully populated relations)
      fetchVisitsList();
    } catch (err: any) {
      toast.error(err.message || "Failed to schedule visit");
    } finally {
      setSubmitting(false);
    }
  };

  const fetchVisitsList = async () => {
    try {
      const res = await fetch(`/api/visits?leadId=${leadId}`);
      if (res.ok) {
        const json = await res.json();
        setVisits(json.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openOutcomeModal = (visitId: string, currentStatus: string) => {
    setSelectedVisitId(visitId);
    setOutcomeStatus(currentStatus === "SCHEDULED" ? "COMPLETED" : currentStatus as any);
    const existingVisit = visits.find((v) => v.id === visitId);
    setFeedback(existingVisit?.feedback || "");
    setRating(String(existingVisit?.rating || 5));
    setIsOutcomeOpen(true);
  };

  const handleUpdateOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVisitId) return;

    setUpdating(true);
    try {
      const payload: any = {
        status: outcomeStatus,
      };

      if (outcomeStatus === "COMPLETED") {
        payload.feedback = feedback.trim() || undefined;
        payload.rating = parseInt(rating);
      } else {
        payload.feedback = feedback.trim() || undefined;
      }

      const res = await fetch(`/api/visits/${selectedVisitId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to record visit outcome");
      const json = await res.json();

      toast.success("Visit outcome updated");
      setIsOutcomeOpen(false);
      
      setVisits((prev) =>
        prev.map((v) => (v.id === selectedVisitId ? { ...v, ...json.data } : v))
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to update visit outcome");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with schedule button */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Scheduled Site Visits</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={
            <Button size="sm" className="gap-1.5 shadow-sm">
              <Plus className="h-4 w-4" /> Schedule Visit
            </Button>
          } />
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule Site Visit</DialogTitle>
              <DialogDescription>
                Schedule a site visit for this lead at one of your listings.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleScheduleVisit} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Select Property *</label>
                <Select value={propertyId} onValueChange={(val) => setPropertyId(val || "")} required>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Choose property listing" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.title} - {p.locality}, {p.city} ({formatPrice(Number(p.price))})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Scheduled Date & Time *</label>
                <Input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  required
                />
              </div>

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                  Schedule
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Outcome Recording Dialog */}
      <Dialog open={isOutcomeOpen} onOpenChange={setIsOutcomeOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Visit Outcome</DialogTitle>
            <DialogDescription>
              Record the feedback and outcome of the property site visit.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateOutcome} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Status Outcome *</label>
              <Select value={outcomeStatus} onValueChange={(val: any) => setOutcomeStatus(val)}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="NO_SHOW">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {outcomeStatus === "COMPLETED" && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Client Interest Rating (1-5 Stars)</label>
                <Select value={rating} onValueChange={(val) => setRating(val || "")}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">⭐⭐⭐⭐⭐ (Highly Interested)</SelectItem>
                    <SelectItem value="4">⭐⭐⭐⭐ (Interested)</SelectItem>
                    <SelectItem value="3">⭐⭐⭐ (Neutral / Thinking)</SelectItem>
                    <SelectItem value="2">⭐⭐ (Low Interest)</SelectItem>
                    <SelectItem value="1">⭐ (Not Interested)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Feedback / Notes</label>
              <Textarea
                placeholder="How did the visit go? What did they like/dislike? Did they make an offer?"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="h-24"
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOutcomeOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updating}>
                {updating && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                Record
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Visits List */}
      <div className="space-y-3">
        {visits.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground italic border border-dashed rounded-lg">
            No site visits scheduled yet.
          </div>
        ) : (
          visits.map((visit) => {
            const isScheduled = visit.status === "SCHEDULED";

            return (
              <Card key={visit.id} className="border-border/40 bg-card/40 hover:shadow-xs transition-shadow duration-200">
                <CardContent className="p-4 space-y-4">
                  {/* Property title, status, and edit outcome */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn("text-[10px] uppercase font-bold", VISIT_STATUS_COLORS[visit.status])}>
                          {VISIT_STATUS_LABELS[visit.status]}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(visit.scheduledAt).toLocaleString()}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-foreground pt-1">
                        {visit.property.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {visit.property.locality}, {visit.property.city} · <span className="font-bold text-primary">{formatPrice(Number(visit.property.price))}</span>
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 h-8 text-xs font-semibold shrink-0"
                      onClick={() => openOutcomeModal(visit.id, visit.status)}
                    >
                      {isScheduled ? (
                        <>
                          <ThumbsUp className="h-3.5 w-3.5" /> Record Outcome
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-3.5 w-3.5" /> Update Outcome
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Feedback summary if outcome is set */}
                  {!isScheduled && (visit.feedback || visit.rating) && (
                    <div className="bg-muted/30 rounded-lg p-3 space-y-2 border border-border/20 text-xs">
                      {visit.rating && (
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          <span>Rating:</span>
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "h-3.5 w-3.5 fill-current",
                                  i < (visit.rating || 0) ? "text-amber-500" : "text-muted-foreground/30 fill-transparent"
                                )}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      {visit.feedback && (
                        <div className="text-muted-foreground leading-relaxed">
                          <span className="font-bold text-foreground/80 block mb-0.5">Feedback:</span>
                          &ldquo;{visit.feedback}&rdquo;
                        </div>
                      )}
                    </div>
                  )}

                  {/* Host info */}
                  <div className="text-[10px] text-muted-foreground font-semibold pt-1 border-t border-border/10">
                    Host agent: <span className="text-foreground/85">{visit.user.fullName}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
