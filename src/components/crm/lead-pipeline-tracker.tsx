"use client";

import { useState } from "react";
import { Check, ChevronRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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

interface LeadPipelineTrackerProps {
  leadId: string;
  currentStatus: typeof PIPELINE_STAGES[number];
  onStatusChange: (newStatus: typeof PIPELINE_STAGES[number]) => void;
}

export function LeadPipelineTracker({ leadId, currentStatus, onStatusChange }: LeadPipelineTrackerProps) {
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (value: string) => {
    const newStatus = value as typeof PIPELINE_STAGES[number];
    if (newStatus === currentStatus) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update lead stage");
      
      toast.success(`Pipeline stage updated to ${LEAD_STATUS_LABELS[newStatus]}`);
      onStatusChange(newStatus);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update pipeline stage");
    } finally {
      setUpdating(false);
    }
  };

  const currentIdx = PIPELINE_STAGES.indexOf(currentStatus);

  return (
    <div className="glass-panel border-none p-4 rounded-xl space-y-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Visual Pipeline Steps */}
      <div className="flex flex-wrap items-center gap-2 flex-1">
        {PIPELINE_STAGES.map((stage, idx) => {
          const isCurrent = stage === currentStatus;
          const isPast = idx < currentIdx && currentStatus !== "CLOSED_LOST";
          const isClosedLost = currentStatus === "CLOSED_LOST" && stage === "CLOSED_LOST";
          
          if (stage === "CLOSED_LOST" && !isClosedLost) return null; // Only show closed lost if it is the active status

          return (
            <div key={stage} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200",
                  isCurrent && "bg-primary text-primary-foreground shadow-sm",
                  isPast && "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
                  !isCurrent && !isPast && "bg-muted text-muted-foreground border border-transparent"
                )}
              >
                {isPast ? (
                  <Check className="h-3 w-3 shrink-0" />
                ) : (
                  <span className="h-4 w-4 rounded-full flex items-center justify-center text-[10px] border border-current">
                    {idx + 1}
                  </span>
                )}
                <span className="whitespace-nowrap">{LEAD_STATUS_LABELS[stage]}</span>
              </div>
              {idx < PIPELINE_STAGES.length - 2 && stage !== "CLOSED_WON" && (
                <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0 hidden sm:inline" />
              )}
            </div>
          );
        })}
      </div>

      {/* Stage Selector */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Change Stage:</span>
        <Select value={currentStatus} onValueChange={(val) => val && handleStatusChange(val)} disabled={updating}>
          <SelectTrigger className="w-[180px] bg-background">
            {updating ? (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Updating...
              </div>
            ) : (
              <SelectValue placeholder="Select stage" />
            )}
          </SelectTrigger>
          <SelectContent>
            {PIPELINE_STAGES.map((stage) => (
              <SelectItem key={stage} value={stage}>
                {LEAD_STATUS_LABELS[stage]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
