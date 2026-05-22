import { getSessionUser } from "@/lib/supabase/server";
import { getRequirementById } from "@/services/requirement.service";
import { findMatchesForRequirement } from "@/services/matching.service";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ClipboardList, MapPin, IndianRupee, Ruler, User, Calendar, Check, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RequirementActions } from "@/components/requirements/requirement-actions";
import { formatPrice, formatArea, formatRelativeTime, cn } from "@/lib/utils";
import {
  PROPERTY_TYPE_LABELS,
  TRANSACTION_TYPE_LABELS,
  REQUIREMENT_STATUS_LABELS,
  URGENCY_LABELS,
  URGENCY_COLORS,
  FURNISHING_LABELS,
  INVESTMENT_GOAL_LABELS,
} from "@/lib/constants";

const REQUIREMENT_STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  PARTIALLY_FULFILLED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  FULFILLED: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  EXPIRED: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

interface RequirementDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function RequirementDetailPage({ params }: RequirementDetailPageProps) {
  const resolvedParams = await params;
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const requirement = await getRequirementById(user.tenantId, resolvedParams.id);

  if (!requirement) {
    notFound();
  }

  // Fetch matches from matching engine
  const matches = await findMatchesForRequirement(user.tenantId, requirement.id, 5);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500 text-emerald-50";
    if (score >= 60) return "bg-amber-500 text-amber-50";
    return "bg-rose-500 text-rose-50";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return "border-emerald-500/30 text-emerald-600 bg-emerald-500/10";
    if (score >= 60) return "border-amber-500/30 text-amber-600 bg-amber-500/10";
    return "border-rose-500/30 text-rose-600 bg-rose-500/10";
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header / Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/requirements"
            className="flex items-center justify-center h-9 w-9 rounded-md border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Requirements</span>
              <span className="text-xs text-muted-foreground">/</span>
              <span className="text-xs font-medium text-foreground truncate max-w-[200px]">
                {requirement.title}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight mt-1">{requirement.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={cn("text-xs font-semibold px-2.5 py-0.5", REQUIREMENT_STATUS_COLORS[requirement.status])}>
            {REQUIREMENT_STATUS_LABELS[requirement.status]}
          </Badge>
          <Badge variant="outline" className={cn("text-xs font-semibold px-2.5 py-0.5", URGENCY_COLORS[requirement.urgency])}>
            {URGENCY_LABELS[requirement.urgency]}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden glass-panel border-none shadow-md">
            <div className="h-48 bg-gradient-to-br from-primary/10 via-accent/5 to-background flex items-center justify-center border-b relative">
              <ClipboardList className="h-20 w-20 text-primary/20" />
              <div className="absolute bottom-4 left-4 flex gap-4 text-xs bg-black/60 text-white rounded-lg px-4 py-2 backdrop-blur-sm">
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" /> Posted by {requirement.createdBy.fullName}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Created {formatRelativeTime(requirement.createdAt)}
                </span>
              </div>
            </div>

            <CardContent className="p-6 space-y-6">
              {/* Financial & Area Ranges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 border-b">
                <div className="space-y-1 col-span-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Budget Range</span>
                  <div className="flex items-center text-lg font-bold text-primary flex-wrap">
                    <IndianRupee className="h-4.5 w-4.5 inline mr-0.5" />
                    {formatPrice(Number(requirement.budgetMin))} — {formatPrice(Number(requirement.budgetMax))}
                  </div>
                </div>

                <div className="space-y-1 col-span-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Area Range</span>
                  <div className="flex items-center text-lg font-bold text-foreground">
                    <Ruler className="h-4.5 w-4.5 inline mr-1 text-muted-foreground" />
                    {requirement.areaMin || requirement.areaMax ? (
                      <>
                        {requirement.areaMin ? formatArea(Number(requirement.areaMin), "sqft") : "0"} —{" "}
                        {requirement.areaMax ? formatArea(Number(requirement.areaMax), "sqft") : "Any"}
                      </>
                    ) : (
                      "Not Specified"
                    )}
                  </div>
                </div>
              </div>

              {/* Requirement Specifications */}
              <div className="space-y-3">
                <h3 className="font-semibold text-base">Desired Specifications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-muted/40 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground border rounded px-1.5 py-0.5">T</span>
                    <span className="text-sm">
                      Type: <span className="font-semibold">{PROPERTY_TYPE_LABELS[requirement.propertyType]}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground border rounded px-1.5 py-0.5">Tx</span>
                    <span className="text-sm">
                      Transaction: <span className="font-semibold">{TRANSACTION_TYPE_LABELS[requirement.transactionType]}</span>
                    </span>
                  </div>
                  {requirement.bedrooms && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground border rounded px-1.5 py-0.5">B</span>
                      <span className="text-sm">
                        Bedrooms: <span className="font-semibold">{requirement.bedrooms} BHK</span>
                      </span>
                    </div>
                  )}
                  {requirement.furnishing && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground border rounded px-1.5 py-0.5">F</span>
                      <span className="text-sm">
                        Furnishing: <span className="font-semibold">{FURNISHING_LABELS[requirement.furnishing]}</span>
                      </span>
                    </div>
                  )}
                  {requirement.investmentGoal && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground border rounded px-1.5 py-0.5">G</span>
                      <span className="text-sm">
                        Goal: <span className="font-semibold">{INVESTMENT_GOAL_LABELS[requirement.investmentGoal]}</span>
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      City: <span className="font-semibold">{requirement.city}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Preferred Localities */}
              <div className="space-y-2">
                <h3 className="font-semibold text-base">Preferred Localities</h3>
                <div className="flex flex-wrap gap-2">
                  {requirement.locality && (
                    <Badge variant="default" className="px-3 py-1 text-xs">
                      Primary: {requirement.locality}
                    </Badge>
                  )}
                  {requirement.preferredLocalities.map((locality) => (
                    <Badge key={locality} variant="secondary" className="px-3 py-1 text-xs">
                      {locality}
                    </Badge>
                  ))}
                  {!requirement.locality && requirement.preferredLocalities.length === 0 && (
                    <span className="text-sm text-muted-foreground italic">Any locality in {requirement.city}</span>
                  )}
                </div>
              </div>

              {/* Summary / Description */}
              {requirement.description && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-base">Requirement Summary</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                    {requirement.description}
                  </p>
                </div>
              )}

              {/* Internal notes (only visible to firm users) */}
              {requirement.notes && (
                <div className="space-y-2 border-t pt-4">
                  <h3 className="font-semibold text-base flex items-center gap-1.5 text-amber-600 dark:text-amber-500">
                    <Info className="h-4 w-4" /> Agent / Internal Notes
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line bg-amber-500/5 border border-amber-500/10 rounded-lg p-4">
                    {requirement.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column (1/3 width) */}
        <div className="space-y-6">
          {/* Actions & Contact details */}
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Management & Control</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <RequirementActions requirementId={requirement.id} />

              <div className="border-t pt-4 space-y-4">
                <h4 className="font-medium text-sm text-foreground">Buyer Contact Details</h4>
                <div className="bg-muted/40 rounded-lg p-4 space-y-3">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Buyer Name</span>
                    <p className="text-sm font-semibold">{requirement.buyerName}</p>
                  </div>
                  {requirement.buyerPhone && (
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Phone</span>
                      <p className="text-sm font-mono font-medium">{requirement.buyerPhone}</p>
                    </div>
                  )}
                  {requirement.buyerEmail && (
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Email</span>
                      <p className="text-sm font-mono font-medium">{requirement.buyerEmail}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Property Matches */}
          <Card className="glass-panel">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">Top Property Matches</CardTitle>
              <Badge variant="secondary" className="font-bold">
                {matches.length} matches
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {matches.length === 0 ? (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  No matching active listings found. Matching properties in {requirement.city} will appear here.
                </div>
              ) : (
                <div className="space-y-3">
                  {matches.map(({ property, totalScore, breakdown }) => (
                    <div
                      key={property.id}
                      className="group border rounded-lg p-3 hover:bg-muted/30 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Link
                          href={`/properties/${property.id}`}
                          className="font-medium text-sm hover:underline line-clamp-1 hover:text-primary transition-colors flex-1"
                        >
                          {property.title}
                        </Link>
                        <Badge variant="outline" className={cn("text-xs font-mono", getScoreBadgeColor(totalScore))}>
                          {totalScore}%
                        </Badge>
                      </div>

                      {/* Matching Breakdown */}
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>Location Match</span>
                          <span>{breakdown.locationScore}%</span>
                        </div>
                        <Progress value={breakdown.locationScore} className="h-1 bg-muted" />

                        <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
                          <span>Budget Fit</span>
                          <span>{breakdown.budgetScore}%</span>
                        </div>
                        <Progress value={breakdown.budgetScore} className="h-1 bg-muted" />
                      </div>

                      <div className="flex justify-between items-center mt-3 pt-2 border-t text-[11px] text-muted-foreground">
                        <span>Price: {formatPrice(Number(property.price))}</span>
                        <span>Area: {formatArea(Number(property.area), property.areaUnit)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
