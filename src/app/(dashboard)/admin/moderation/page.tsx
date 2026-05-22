"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Check, Ban, AlertTriangle, Building2, User, Landmark, Tag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { toast } from "sonner";

type FlaggedProperty = {
  id: string;
  title: string;
  city: string;
  locality: string;
  propertyType: string;
  transactionType: string;
  price: string;
  status: string;
  updatedAt: string;
  createdBy: {
    id: string;
    fullName: string;
    email: string;
  };
  tenant: {
    name: string;
  };
};

export default function ModerationPage() {
  const [flaggedProperties, setFlaggedProperties] = useState<FlaggedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const fetchFlagged = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/moderation");
      if (!res.ok) throw new Error("Failed to load flagged properties");
      const json = await res.json();
      setFlaggedProperties(json.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load flagged content");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlagged();
  }, []);

  const handleModerate = async (propertyId: string, action: "approve" | "reject") => {
    setActingId(propertyId);
    try {
      const res = await fetch("/api/admin/moderation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId, action }),
      });

      if (!res.ok) {
        const errorJson = await res.json();
        throw new Error(errorJson.error || "Moderation request failed");
      }

      toast.success(
        action === "approve"
          ? "Listing approved and returned to public directory."
          : "Listing rejected and moved to archives."
      );

      // Remove from the local state
      setFlaggedProperties((prev) => prev.filter((p) => p.id !== propertyId));
    } catch (err: any) {
      toast.error(err.message || "Failed to moderate listing");
    } finally {
      setActingId(null);
    }
  };

  const formatPrice = (priceStr: string) => {
    const num = parseFloat(priceStr);
    if (isNaN(num)) return priceStr;
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
    return `₹${num.toLocaleString("en-IN")}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/admin">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader title="Content Moderation" description="Review property listings flagged for policy violations, incorrect pricing, or invalid details." />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-2">
          <Loader2 className="h-7 w-7 text-primary animate-spin" />
          <p className="text-xs text-muted-foreground font-semibold">Scanning system for flagged listings...</p>
        </div>
      ) : flaggedProperties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center glass-panel p-8 rounded-xl border-none">
          <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-3">
            <Check className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-foreground mb-1">Queue is Clear</h3>
          <p className="text-sm text-muted-foreground">All property listings are compliant. No flagged items found.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {flaggedProperties.map((property) => (
            <Card key={property.id} className="glass-panel border-none shadow-sm flex flex-col justify-between hover-lift">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="text-xs font-bold text-rose-500 bg-rose-500/5 border-rose-500/10 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Flagged
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    Updated {new Date(property.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <CardTitle className="text-base font-bold line-clamp-1">{property.title}</CardTitle>
                <CardDescription className="text-xs flex items-center gap-1 text-muted-foreground">
                  <Landmark className="h-3 w-3" /> {property.locality}, {property.city}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pb-3 text-xs">
                <div className="grid grid-cols-2 gap-2 bg-background/40 p-2.5 rounded-lg">
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-wider">Type</span>
                    <span className="font-bold text-foreground">{property.propertyType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-wider">Pricing</span>
                    <span className="font-bold text-foreground">{formatPrice(property.price)} ({property.transactionType})</span>
                  </div>
                </div>

                <div className="space-y-2 border-t border-border/5 pt-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5 text-primary/60" />
                    <span>Brokerage: <strong className="text-foreground">{property.tenant.name}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-3.5 w-3.5 text-primary/60" />
                    <span>Created by: <strong className="text-foreground">{property.createdBy.fullName}</strong></span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-2 border-t border-border/5 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-9 font-bold text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/5 border-emerald-500/20"
                  onClick={() => handleModerate(property.id, "approve")}
                  disabled={actingId !== null}
                >
                  {actingId === property.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5 mr-1" />
                  )}
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-9 font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-500/5 border-rose-500/20"
                  onClick={() => handleModerate(property.id, "reject")}
                  disabled={actingId !== null}
                >
                  {actingId === property.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Ban className="h-3.5 w-3.5 mr-1" />
                  )}
                  Reject
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
