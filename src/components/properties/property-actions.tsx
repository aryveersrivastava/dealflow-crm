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

interface PropertyActionsProps {
  propertyId: string;
}

export function PropertyActions({ propertyId }: PropertyActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to archive property");
      }

      toast.success("Property archived successfully");
      setOpen(false);
      router.push("/properties");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete property");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2 w-full">
      <Button
        variant="outline"
        className="flex-1 gap-2"
        onClick={() => router.push(`/properties/${propertyId}/edit`)}
      >
        <Edit className="h-4 w-4" /> Edit
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button variant="destructive" className="flex-1 gap-2" />}>
          <Trash className="h-4 w-4" /> Archive
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> Archive Property
            </DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to archive this property? It will be marked as ARCHIVED and won't appear in active matching queries, but will be preserved in database logs.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? "Archiving..." : "Yes, Archive"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
