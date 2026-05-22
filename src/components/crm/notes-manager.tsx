"use client";

import { useState } from "react";
import { Pin, Trash2, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { cn, formatRelativeTime, getInitials } from "@/lib/utils";

type Note = {
  id: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  user: {
    fullName: string;
    avatar?: string;
  };
};

interface NotesManagerProps {
  leadId: string;
  initialNotes: Note[];
}

export function NotesManager({ leadId, initialNotes }: NotesManagerProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          leadId,
          isPinned: false,
        }),
      });

      if (!res.ok) throw new Error("Failed to add note");
      const json = await res.json();
      
      toast.success("Note added");
      setContent("");
      
      // Update local state (prepending note)
      setNotes((prev) => [json.data, ...prev]);
    } catch (err: any) {
      toast.error(err.message || "Failed to save note");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePin = async (noteId: string, currentPinned: boolean) => {
    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: !currentPinned }),
      });

      if (!res.ok) throw new Error("Failed to update note");
      const json = await res.json();

      setNotes((prev) =>
        prev
          .map((n) => (n.id === noteId ? { ...n, isPinned: json.data.isPinned } : n))
          .sort((a, b) => {
            // Sort by pinned desc, then created date desc
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          })
      );
      toast.success(json.data.isPinned ? "Note pinned" : "Note unpinned");
    } catch (err) {
      console.error(err);
      toast.error("Failed to pin note");
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete note");

      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      toast.success("Note deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete note");
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Note */}
      <form onSubmit={handleAddNote} className="space-y-3">
        <Textarea
          placeholder="Add an internal note or update about this lead..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="h-24 bg-background/50 focus-visible:ring-1"
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" className="gap-1.5" disabled={!content.trim() || submitting}>
            {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-4 w-4" />}
            Save Note
          </Button>
        </div>
      </form>

      {/* Notes List */}
      <div className="space-y-3">
        {notes.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground italic border border-dashed rounded-lg">
            No notes written yet.
          </div>
        ) : (
          notes.map((note) => (
            <Card key={note.id} className={cn(
              "group transition-all duration-200 border-border/40 hover:shadow-xs",
              note.isPinned ? "bg-amber-500/5 dark:bg-amber-500/2 border-amber-500/20" : "bg-card/40"
            )}>
              <CardContent className="p-4 space-y-3">
                {/* Meta details & action buttons */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[8px] bg-primary/10 text-primary font-bold">
                        {getInitials(note.user.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-foreground/80">{note.user.fullName}</span>
                      <span className="text-[10px] text-muted-foreground">{formatRelativeTime(note.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      className={cn("h-7 w-7", note.isPinned ? "text-amber-500 hover:text-amber-600" : "text-muted-foreground")}
                      onClick={() => handleTogglePin(note.id, note.isPinned)}
                    >
                      <Pin className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteNote(note.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line break-words pl-1">
                  {note.content}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
