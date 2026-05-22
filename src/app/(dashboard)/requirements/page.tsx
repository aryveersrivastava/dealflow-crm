"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClipboardList, Plus, MapPin, Zap, IndianRupee, Clock, Search, SlidersHorizontal, RefreshCw } from "lucide-react";
import { buttonVariants, Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatRelativeTime, cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import {
  PROPERTY_TYPE_LABELS,
  TRANSACTION_TYPE_LABELS,
  URGENCY_LABELS,
  URGENCY_COLORS,
  INVESTMENT_GOAL_LABELS,
} from "@/lib/constants";

export default function RequirementsPage() {
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filter states
  const [search, setSearch] = useState("");
  const [propertyType, setPropertyType] = useState<string>("ALL");
  const [transactionType, setTransactionType] = useState<string>("ALL");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search, 300);
  const debouncedBudgetMin = useDebounce(budgetMin, 300);
  const debouncedBudgetMax = useDebounce(budgetMax, 300);

  const fetchRequirements = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (propertyType !== "ALL") params.append("propertyType", propertyType);
      if (transactionType !== "ALL") params.append("transactionType", transactionType);
      if (debouncedBudgetMin) params.append("budgetMin", debouncedBudgetMin);
      if (debouncedBudgetMax) params.append("budgetMax", debouncedBudgetMax);

      const res = await fetch(`/api/requirements?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch requirements");
      const json = await res.json();
      setRequirements(json.data || []);
      setTotal(json.pagination?.total || 0);
    } catch (error) {
      console.error("Failed to fetch requirements:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, [debouncedSearch, propertyType, transactionType, debouncedBudgetMin, debouncedBudgetMax]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Requirement Marketplace"
        description="Browse and search buyer requirements recorded across your firm"
        action={
          <Link href="/requirements/new" className={cn(buttonVariants(), "gap-2 shadow-sm")}>
            <Plus className="h-4 w-4" /> Post Requirement
          </Link>
        }
      />

      {/* Filter and Search Bar */}
      <Card className="glass-panel border-none shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by buyer name, city, title, description..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="h-4 w-4" /> Filters
                {(propertyType !== "ALL" || transactionType !== "ALL" || budgetMin || budgetMax) && (
                  <span className="h-2 w-2 rounded-full bg-primary" />
                )}
              </Button>
              <Button variant="ghost" size="icon" onClick={fetchRequirements}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Property Type</label>
                <Select value={propertyType} onValueChange={(val) => setPropertyType(val || "ALL")}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Types</SelectItem>
                    {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Transaction</label>
                <Select value={transactionType} onValueChange={(val) => setTransactionType(val || "ALL")}>
                  <SelectTrigger>
                    <SelectValue placeholder="All transactions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Transactions</SelectItem>
                    {Object.entries(TRANSACTION_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Min Budget (INR)</label>
                <Input
                  type="number"
                  placeholder="e.g. 5000000"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Max Budget (INR)</label>
                <Input
                  type="number"
                  placeholder="e.g. 20000000"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grid Display */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-5 w-1/4" />
                </div>
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-1/3" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="border-t pt-3 flex justify-between items-center">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : requirements.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No Buyer Requirements Found"
          description={
            search || propertyType !== "ALL" || transactionType !== "ALL" || budgetMin || budgetMax
              ? "No requirements match your active filter settings. Try clearing filters."
              : "There are no buyer requirements registered in your brokerage firm yet."
          }
          actionLabel="Post Buyer Requirement"
          actionHref="/requirements/new"
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {requirements.map((req) => (
            <Link key={req.id} href={`/requirements/${req.id}`}>
              <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg hover-lift cursor-pointer h-full flex flex-col justify-between">
                {/* Urgency Badge */}
                <div className="absolute top-3 right-3 z-10">
                  <Badge className={cn("text-[10px] font-semibold px-2 py-0.5", URGENCY_COLORS[req.urgency])}>
                    <Clock className="mr-1 h-3 w-3 inline" />
                    {URGENCY_LABELS[req.urgency]}
                  </Badge>
                </div>

                <CardContent className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Title */}
                    <div className="pr-24">
                      <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors">
                        {req.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">Buyer: {req.buyerName}</p>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-3">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">
                        {req.locality && `${req.locality}, `}{req.city}
                      </span>
                    </div>

                    {/* Budget */}
                    <div className="flex items-center gap-1.5 mt-2.5">
                      <IndianRupee className="h-4 w-4 text-primary shrink-0" />
                      <span className="font-bold text-primary text-sm sm:text-base">
                        {formatPrice(Number(req.budgetMin))} — {formatPrice(Number(req.budgetMax))}
                      </span>
                    </div>

                    {/* Type Badges */}
                    <div className="flex flex-wrap gap-1.5 mt-3.5">
                      <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-medium">
                        {PROPERTY_TYPE_LABELS[req.propertyType]}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] px-2 py-0.5 font-medium">
                        {TRANSACTION_TYPE_LABELS[req.transactionType]}
                      </Badge>
                      {req.bedrooms && (
                        <Badge variant="outline" className="text-[10px] px-2 py-0.5 font-medium">
                          {req.bedrooms} BHK
                        </Badge>
                      )}
                      {req.investmentGoal && (
                        <Badge variant="outline" className="text-[10px] px-2 py-0.5 font-medium">
                          {INVESTMENT_GOAL_LABELS[req.investmentGoal]}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t mt-4">
                    <div className="flex items-center gap-1 text-xs">
                      <Zap className="h-3.5 w-3.5 text-amber-500" />
                      <span className="font-semibold text-foreground">{req.matchCount}</span>
                      <span className="text-muted-foreground">matches</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {formatRelativeTime(req.createdAt)}
                    </span>
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
