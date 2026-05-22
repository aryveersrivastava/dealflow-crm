import { getSessionUser } from "@/lib/supabase/server";
import { getPropertyById } from "@/services/property.service";
import { findMatchesForProperty } from "@/services/matching.service";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, MapPin, IndianRupee, Ruler, Bed, Bath, User, Calendar, Check, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PropertyActions } from "@/components/properties/property-actions";
import { PropertyGallery } from "@/components/properties/property-gallery";
import { formatPrice, formatArea, formatRelativeTime, cn } from "@/lib/utils";
import {
  PROPERTY_TYPE_LABELS,
  TRANSACTION_TYPE_LABELS,
  PROPERTY_STATUS_LABELS,
  PROPERTY_STATUS_COLORS,
  FURNISHING_LABELS,
} from "@/lib/constants";

interface PropertyDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const resolvedParams = await params;
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const property = await getPropertyById(user.tenantId, resolvedParams.id);

  if (!property) {
    notFound();
  }

  // Fetch matches from matching engine
  const matches = await findMatchesForProperty(user.tenantId, property.id, 5);

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
      {/* Header / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/properties"
            className="flex items-center justify-center h-9 w-9 rounded-md border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Properties</span>
              <span className="text-xs text-muted-foreground">/</span>
              <span className="text-xs font-medium text-foreground truncate max-w-[200px]">
                {property.title}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight mt-1">{property.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={cn("text-xs font-semibold px-2.5 py-0.5", PROPERTY_STATUS_COLORS[property.status])}>
            {PROPERTY_STATUS_LABELS[property.status]}
          </Badge>
          <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5">
            {TRANSACTION_TYPE_LABELS[property.transactionType]}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Visual/Banner card with Gallery */}
          <Card className="overflow-hidden glass-panel border-none shadow-md">
            <div className="p-6 pb-0">
              <PropertyGallery images={property.images} />
            </div>

            <CardContent className="p-6 space-y-6">
              <div className="flex gap-4 text-xs bg-muted/65 rounded-lg px-3 py-1.5 w-fit">
                <span className="flex items-center gap-1 text-muted-foreground font-semibold">
                  <User className="h-3.5 w-3.5" /> Listed by {property.createdBy.fullName}
                </span>
                <span className="flex items-center gap-1 text-muted-foreground font-semibold">
                  <Calendar className="h-3.5 w-3.5" /> Listed {formatRelativeTime(property.createdAt)}
                </span>
              </div>
              {/* Financial & Dimensions summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 border-b">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Price</span>
                  <div className="flex items-center text-lg font-bold text-primary">
                    <IndianRupee className="h-4.5 w-4.5 inline mr-0.5" />
                    {formatPrice(Number(property.price))}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Area</span>
                  <div className="flex items-center text-lg font-bold text-foreground">
                    <Ruler className="h-4.5 w-4.5 inline mr-1 text-muted-foreground" />
                    {formatArea(Number(property.area), property.areaUnit)}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Type</span>
                  <div className="text-base font-semibold text-foreground">
                    {PROPERTY_TYPE_LABELS[property.propertyType]}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Furnishing</span>
                  <div className="text-base font-semibold text-foreground">
                    {property.furnishing ? FURNISHING_LABELS[property.furnishing] : "N/A"}
                  </div>
                </div>
              </div>

              {/* Specifications grid */}
              <div className="space-y-3">
                <h3 className="font-semibold text-base">Key Specifications</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-muted/40 rounded-lg p-4">
                  {property.bedrooms && (
                    <div className="flex items-center gap-2">
                      <Bed className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Bedrooms: <span className="font-semibold">{property.bedrooms} BHK</span>
                      </span>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex items-center gap-2">
                      <Bath className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Bathrooms: <span className="font-semibold">{property.bathrooms}</span>
                      </span>
                    </div>
                  )}
                  {property.floor && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground border rounded px-1.5 py-0.5">F</span>
                      <span className="text-sm">
                        Floor: <span className="font-semibold">{property.floor} / {property.totalFloors || "Any"}</span>
                      </span>
                    </div>
                  )}
                  {property.facing && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground border rounded px-1.5 py-0.5">D</span>
                      <span className="text-sm">
                        Facing: <span className="font-semibold">{property.facing}</span>
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      City: <span className="font-semibold">{property.city}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {property.description && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-base">Description</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                    {property.description}
                  </p>
                </div>
              )}

              {/* Amenities */}
              {property.amenities.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-base">Amenities</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {property.amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center justify-center h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-600">
                          <Check className="h-3 w-3" />
                        </div>
                        {amenity}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column (1/3 width) */}
        <div className="space-y-6">
          {/* Actions & Contacts Card */}
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Management & Control</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <PropertyActions propertyId={property.id} />

              <div className="border-t pt-4 space-y-4">
                <h4 className="font-medium text-sm text-foreground">Contact & Owner Details</h4>
                <div className="bg-muted/40 rounded-lg p-4 space-y-3">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Owner Name</span>
                    <p className="text-sm font-semibold">{property.ownerName || "Not Provided"}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Owner Phone</span>
                    <p className="text-sm font-mono font-medium">{property.ownerPhone || "Not Provided"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Matches & Lead pipeline engine card */}
          <Card className="glass-panel">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">Top Buyer Matches</CardTitle>
              <Badge variant="secondary" className="font-bold">
                {matches.length} matches
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {matches.length === 0 ? (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  No matches found yet. Buyers with matching budgets and location will appear here.
                </div>
              ) : (
                <div className="space-y-3">
                  {matches.map(({ requirement, totalScore, breakdown }) => (
                    <div
                      key={requirement.id}
                      className="group border rounded-lg p-3 hover:bg-muted/30 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Link
                          href={`/requirements/${requirement.id}`}
                          className="font-medium text-sm hover:underline line-clamp-1 hover:text-primary transition-colors flex-1"
                        >
                          {requirement.title}
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
                        <span>Buyer: {requirement.buyerName}</span>
                        <span>Max: {formatPrice(Number(requirement.budgetMax))}</span>
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
