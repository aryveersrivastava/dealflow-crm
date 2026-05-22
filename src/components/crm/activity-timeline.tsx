"use client";

import { useState } from "react";
import { FileText, Phone, Mail, Users, Eye, Calendar, RefreshCw, DollarSign, MessageSquare, Plus, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn, formatRelativeTime, getInitials } from "@/lib/utils";

type Activity = {
  id: string;
  type: string;
  title: string;
  description?: string;
  createdAt: string;
  user: {
    fullName: string;
    avatar?: string;
  };
};

interface ActivityTimelineProps {
  leadId: string;
  initialActivities: Activity[];
  onActivityAdded?: (newActivity: Activity) => void;
}

const ACTIVITY_TYPE_ICONS: Record<string, any> = {
  NOTE: FileText,
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Users,
  SITE_VISIT: Eye,
  FOLLOW_UP: Calendar,
  STATUS_CHANGE: RefreshCw,
  DEAL_UPDATE: DollarSign,
};

const ACTIVITY_TYPE_COLORS: Record<string, string> = {
  NOTE: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  CALL: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  EMAIL: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  MEETING: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  SITE_VISIT: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  FOLLOW_UP: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  STATUS_CHANGE: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  DEAL_UPDATE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
};

export function ActivityTimeline({ leadId, initialActivities, onActivityAdded }: ActivityTimelineProps) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [type, setType] = useState("CALL");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Activity title/subject is required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId,
          type,
          title,
          description: description || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to log activity");
      const json = await res.json();
      
      toast.success("Activity logged successfully");
      setIsLogOpen(false);
      setTitle("");
      setDescription("");
      
      // Update local and parent state
      // Note: the backend route POST /api/activities doesn't exist yet, we will create it next. Wait, we just created it! Wait, let's verify if POST is supported in `/api/activities/route.ts`. Oh, we only added GET. Let's make sure it handles POST too!
      // Ah! In GET /api/activities/route.ts we did not implement POST. Let's implement POST in C:\Users\aryve\OneDrive\Desktop\REAL STATE\dealflow-crm\src\app\api\activities\route.ts as well to avoid failures.
      
      // Let's call the callback
      onActivityAdded?.(json.data);
      setActivities((prev) => [json.data, ...prev]);
    } catch (err: any) {
      toast.error(err.message || "Failed to log activity");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Activity Timeline</h3>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setIsLogOpen(!isLogOpen)}>
          <Plus className="h-4 w-4" /> Log Activity
        </Button>
      </div>

      {isLogOpen && (
        <Card className="glass-panel border-none p-4 rounded-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Activity Type</label>
                <Select value={type} onValueChange={(val) => setType(val || "")}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CALL">Call</SelectItem>
                    <SelectItem value="EMAIL">Email</SelectItem>
                    <SelectItem value="MEETING">Meeting</SelectItem>
                    <SelectItem value="SITE_VISIT">Site Visit</SelectItem>
                    <SelectItem value="FOLLOW_UP">Follow Up</SelectItem>
                    <SelectItem value="NOTE">Note</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Subject / Title *</label>
                <Input
                  placeholder="e.g. Initial intro call, Emailed agreement draft"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Details / Notes</label>
              <Textarea
                placeholder="Discussed budget constraints, client wants to visit site next Sunday..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-20"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsLogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={submitting}>
                {submitting && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                Log
              </Button>
            </div>
          </form>
        </Card>
      )}

      {activities.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground italic border border-dashed rounded-lg">
          No activities logged yet.
        </div>
      ) : (
        <div className="relative border-l pl-6 space-y-6 ml-3">
          {activities.map((activity) => {
            const Icon = ACTIVITY_TYPE_ICONS[activity.type] || MessageSquare;
            const badgeColor = ACTIVITY_TYPE_COLORS[activity.type] || "bg-muted text-muted-foreground border-border";

            return (
              <div key={activity.id} className="relative group">
                {/* Bullet circle indicator */}
                <div className={cn(
                  "absolute -left-[37px] top-0.5 rounded-full p-1.5 border shrink-0 transition-transform duration-200 group-hover:scale-110",
                  badgeColor
                )}>
                  <Icon className="h-3.5 w-3.5" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-4">
                    <h4 className="font-bold text-sm text-foreground">
                      {activity.title}
                    </h4>
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      {formatRelativeTime(activity.createdAt)}
                    </span>
                  </div>

                  {activity.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line bg-muted/20 rounded-lg p-2.5">
                      {activity.description}
                    </p>
                  )}

                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <Avatar className="h-4 w-4">
                      <AvatarFallback className="text-[6px] bg-primary/10 text-primary font-bold">
                        {getInitials(activity.user.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-foreground/80">{activity.user.fullName}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
