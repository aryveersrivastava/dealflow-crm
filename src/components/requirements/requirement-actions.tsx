"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Edit, Trash, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface RequirementActionsProps {
  requirementId: string;
}

export function RequirementActions({ requirementId }: RequirementActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleCancel = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/requirements/${requirementId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to cancel requirement");
      }

      toast.success("Requirement cancelled successfully");
      setOpen(false);
      router.push("/requirements");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel requirement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2 w-full">
      <Button
        variant="outline"
        className="flex-1 gap-2"
        onClick={() => router.push(`/requirements/${requirementId}/edit`)}
      >
        <Edit className="h-4 w-4" /> Edit
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button variant="destructive" className="flex-1 gap-2" />}>
          <Trash className="h-4 w-4" /> Cancel
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> Cancel Requirement
            </DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to cancel this buyer requirement? It will be marked as CANCELLED and will no longer search for property matches.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Keep Active
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={loading}>
              {loading ? "Cancelling..." : "Yes, Cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
