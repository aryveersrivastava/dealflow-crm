import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="rounded-full bg-primary/10 p-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-bold text-foreground">Syncing DealFlow CRM</p>
        <p className="text-xs text-muted-foreground">Retrieving secure tenant records...</p>
      </div>
    </div>
  );
}
