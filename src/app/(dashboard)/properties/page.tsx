"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Plus, MapPin, Bed, Bath, Eye } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PropertyFilters } from "@/components/properties/property-filters";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatArea, formatRelativeTime, cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import {
  PROPERTY_TYPE_LABELS,
  TRANSACTION_TYPE_LABELS,
  PROPERTY_STATUS_LABELS,
  PROPERTY_STATUS_COLORS,
  FURNISHING_LABELS,
} from "@/lib/constants";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filter states
  const [search, setSearch] = useState("");
  const [propertyType, setPropertyType] = useState<string>("ALL");
  const [transactionType, setTransactionType] = useState<string>("ALL");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search, 300);
  const debouncedPriceMin = useDebounce(priceMin, 300);
  const debouncedPriceMax = useDebounce(priceMax, 300);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (propertyType !== "ALL") params.append("propertyType", propertyType);
      if (transactionType !== "ALL") params.append("transactionType", transactionType);
      if (debouncedPriceMin) params.append("priceMin", debouncedPriceMin);
      if (debouncedPriceMax) params.append("priceMax", debouncedPriceMax);

      const res = await fetch(`/api/properties?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch properties");
      const json = await res.json();
      setProperties(json.data || []);
      setTotal(json.pagination?.total || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [debouncedSearch, propertyType, transactionType, debouncedPriceMin, debouncedPriceMax]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Property Inventory"
        description="Manage and filter your brokerage property listings"
        action={
          <Link href="/properties/new" className={cn(buttonVariants(), "gap-2 shadow-sm")}>
            <Plus className="h-4 w-4" /> Add Property
          </Link>
        }
      />

      {/* Filter and Search Bar */}
      <PropertyFilters
        search={search}
        setSearch={setSearch}
        propertyType={propertyType}
        setPropertyType={setPropertyType}
        transactionType={transactionType}
        setTransactionType={setTransactionType}
        priceMin={priceMin}
        setPriceMin={setPriceMin}
        priceMax={priceMax}
        setPriceMax={setPriceMax}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        onRefresh={fetchProperties}
      />

      {/* Property Display */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex justify-between items-center pt-2">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <EmptyState
          title="No properties found"
          description="We couldn't find any property matches with the selected filters. Post a new property to get started."
          actionLabel="Add Property"
          actionHref="/properties/new"
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {properties.map((property) => (
            <Link key={property.id} href={`/properties/${property.id}`}>
              <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover-lift border border-border/40 hover:border-primary/20 bg-card/60 backdrop-blur-md cursor-pointer">
                {/* Image Area */}
                <div className="relative h-48 bg-gradient-to-br from-primary/10 via-accent/5 to-background overflow-hidden border-b">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10" />
                  <div className="absolute bottom-3 left-3 z-20 flex gap-2">
                    <Badge className={cn("text-xs font-semibold shadow-sm", PROPERTY_STATUS_COLORS[property.status])}>
                      {PROPERTY_STATUS_LABELS[property.status]}
                    </Badge>
                    <Badge variant="secondary" className="text-xs font-semibold shadow-sm bg-white/90 dark:bg-black/80">
                      {TRANSACTION_TYPE_LABELS[property.transactionType]}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3 z-20 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white backdrop-blur-xs font-medium">
                    <Eye className="h-3 w-3" /> {property.viewCount}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Building2 className="h-16 w-16 text-primary/15 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                </div>

                <CardContent className="p-4 space-y-4">
                  {/* Title & Location */}
                  <div className="space-y-1">
                    <h3 className="font-bold text-base line-clamp-1 group-hover:text-primary transition-colors text-foreground">
                      {property.title}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground/60" />
                      {property.locality}, {property.city}
                    </div>
                  </div>

                  {/* Price & Area */}
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-extrabold text-primary">
                      {formatPrice(Number(property.price))}
                      {property.transactionType === "RENT" || property.transactionType === "LEASE"
                        ? "/mo"
                        : ""}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground bg-muted/60 px-2 py-1 rounded">
                      {formatArea(Number(property.area), property.areaUnit)}
                    </span>
                  </div>

                  {/* Specs */}
                  {(property.bedrooms || property.bathrooms || property.furnishing) && (
                    <div className="flex items-center gap-3.5 text-xs text-muted-foreground font-medium border-t border-b border-border/30 py-2">
                      {property.bedrooms && (
                        <span className="flex items-center gap-1">
                          <Bed className="h-3.5 w-3.5 text-muted-foreground/60" /> {property.bedrooms} BHK
                        </span>
                      )}
                      {property.bathrooms && (
                        <span className="flex items-center gap-1">
                          <Bath className="h-3.5 w-3.5 text-muted-foreground/60" /> {property.bathrooms} Bath
                        </span>
                      )}
                      {property.furnishing && (
                        <span className="bg-primary/5 text-primary border border-primary/10 px-1.5 py-0.5 rounded text-[10px]">
                          {FURNISHING_LABELS[property.furnishing]}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                    <span className="font-semibold text-foreground/80">{property.createdBy?.fullName}</span>
                    <span>{formatRelativeTime(property.createdAt)}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
