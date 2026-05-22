"use client";

import { useEffect, useState } from "react";
import { CheckSquare, Square, Calendar, Plus, Loader2, AlertTriangle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { cn, formatRelativeTime, getInitials } from "@/lib/utils";

type Task = {
  id: string;
  title: string;
  description?: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";
  dueDate?: string;
  completedAt?: string;
  assignedTo?: {
    id: string;
    fullName: string;
    avatar?: string;
  };
};

interface TasksManagerProps {
  leadId: string;
  initialTasks: Task[];
}

const PRIORITY_BADGES = {
  LOW: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  MEDIUM: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  HIGH: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  URGENT: "bg-rose-500/10 text-rose-600 border-rose-500/20 animate-pulse",
};

export function TasksManager({ leadId, initialTasks }: TasksManagerProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "COMPLETED">("PENDING");
  
  // Create task modal states
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [assignedToId, setAssignedToId] = useState("none");
  const [agents, setAgents] = useState<any[]>([]);

  useEffect(() => {
    // Fetch agents for selection dropdown
    fetch("/api/users")
      .then((res) => res.json())
      .then((json) => setAgents(json.data || []))
      .catch((err) => console.error(err));
  }, []);

  const handleToggleComplete = async (taskId: string, currentStatus: string) => {
    const isCompleted = currentStatus === "DONE";
    const nextStatus = isCompleted ? "TODO" : "DONE";

    // Optimistic Update
    const prevTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus as any, completedAt: nextStatus === "DONE" ? new Date().toISOString() : undefined } : t))
    );

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) throw new Error("Failed to update task");
      const json = await res.json();
      
      toast.success(nextStatus === "DONE" ? "Task completed" : "Task marked incomplete");
      
      // Update with database values
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, ...json.data } : t))
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update task");
      setTasks(prevTasks); // Rollback
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      const payload: any = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        leadId,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      };

      if (assignedToId !== "none") {
        payload.assignedToId = assignedToId;
      }

      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create task");
      const json = await res.json();

      toast.success("Task created");
      setIsOpen(false);
      
      // Reset form
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setDueDate("");
      setAssignedToId("none");

      setTasks((prev) => [json.data, ...prev]);
    } catch (err: any) {
      toast.error(err.message || "Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  const isOverdue = (dateStr?: string) => {
    if (!dateStr) return false;
    const due = new Date(dateStr);
    const now = new Date();
    return due < now;
  };

  // Filter local tasks
  const filteredTasks = tasks.filter((t) => {
    if (filter === "PENDING") return t.status !== "DONE" && t.status !== "CANCELLED";
    if (filter === "COMPLETED") return t.status === "DONE";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filter and Create header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={filter === "PENDING" ? "secondary" : "ghost"}
            onClick={() => setFilter("PENDING")}
            className="text-xs"
          >
            Pending
          </Button>
          <Button
            size="sm"
            variant={filter === "COMPLETED" ? "secondary" : "ghost"}
            onClick={() => setFilter("COMPLETED")}
            className="text-xs"
          >
            Completed
          </Button>
          <Button
            size="sm"
            variant={filter === "ALL" ? "secondary" : "ghost"}
            onClick={() => setFilter("ALL")}
            className="text-xs"
          >
            All
          </Button>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={
            <Button size="sm" className="gap-1.5 shadow-sm">
              <Plus className="h-4 w-4" /> Add Task
            </Button>
          } />
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add CRM Task</DialogTitle>
              <DialogDescription>
                Schedule a follow-up or task associated with this lead.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTask} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Task Title *</label>
                <Input
                  placeholder="e.g. Call client to verify budget"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Description</label>
                <Textarea
                  placeholder="Add context, files needed, or questions to ask..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Priority</label>
                  <Select value={priority} onValueChange={(val: any) => setPriority(val)}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Due Date</label>
                  <Input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Assignee</label>
                <Select value={assignedToId} onValueChange={(val) => setAssignedToId(val || "")}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {agents.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                  Add Task
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Task Listing */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground italic border border-dashed rounded-lg">
            No tasks found matching current filter.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isDone = task.status === "DONE";
            const overdue = !isDone && isOverdue(task.dueDate);

            return (
              <Card key={task.id} className={cn(
                "transition-colors duration-200 border-border/40 bg-card/40",
                isDone && "opacity-60 bg-muted/20"
              )}>
                <CardContent className="p-3.5 flex items-start gap-3">
                  {/* Status Checkbox */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 hover:bg-transparent"
                    onClick={() => handleToggleComplete(task.id, task.status)}
                  >
                    {isDone ? (
                      <CheckSquare className="h-5 w-5 text-primary shrink-0" />
                    ) : (
                      <Square className="h-5 w-5 text-muted-foreground hover:text-primary shrink-0" />
                    )}
                  </Button>

                  {/* Task details */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <h4 className={cn(
                          "font-bold text-sm text-foreground",
                          isDone && "line-through text-muted-foreground"
                        )}>
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-xs text-muted-foreground leading-relaxed mt-1 whitespace-pre-line">
                            {task.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                        <Badge variant="outline" className={cn("text-[10px] uppercase font-bold", PRIORITY_BADGES[task.priority])}>
                          {task.priority}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-1.5 border-t border-border/20 text-[10px] text-muted-foreground font-semibold">
                      {task.dueDate ? (
                        <span className={cn(
                          "flex items-center gap-1",
                          overdue ? "text-rose-500 dark:text-rose-400 font-extrabold" : ""
                        )}>
                          {overdue ? (
                            <AlertTriangle className="h-3 w-3 shrink-0" />
                          ) : (
                            <Calendar className="h-3 w-3 shrink-0" />
                          )}
                          Due: {new Date(task.dueDate).toLocaleDateString()} at {new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {overdue && " (Overdue)"}
                        </span>
                      ) : (
                        <span />
                      )}

                      {task.assignedTo ? (
                        <div className="flex items-center gap-1">
                          <Avatar className="h-3.5 w-3.5">
                            <AvatarFallback className="text-[6px] bg-primary/10 text-primary font-bold">
                              {getInitials(task.assignedTo.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{task.assignedTo.fullName}</span>
                        </div>
                      ) : (
                        <span className="italic flex items-center gap-1">
                          <User className="h-3 w-3" /> Unassigned
                        </span>
                      )}
                    </div>
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
