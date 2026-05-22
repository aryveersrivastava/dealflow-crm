"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-6">
      <div className="rounded-full bg-rose-500/10 p-4 text-rose-500">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <div className="space-y-2 max-w-md">
        <h2 className="text-xl font-bold text-foreground">Workspace Error</h2>
        <p className="text-sm text-muted-foreground">
          An unexpected error occurred while rendering this dashboard view. This could be due to a database network exception or dynamic route configuration issue.
        </p>
        {error.message && (
          <p className="text-xs font-mono bg-muted/50 text-muted-foreground border border-border/10 p-3 rounded-lg overflow-x-auto text-left max-w-full">
            {error.message}
          </p>
        )}
      </div>
      <Button onClick={() => reset()} className="font-bold flex items-center gap-1.5 shadow-sm">
        <RefreshCw className="h-4 w-4" /> Reset View
      </Button>
    </div>
  );
}
