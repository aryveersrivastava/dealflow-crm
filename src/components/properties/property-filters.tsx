"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, RefreshCw } from "lucide-react";
import { PROPERTY_TYPE_LABELS, TRANSACTION_TYPE_LABELS } from "@/lib/constants";

interface PropertyFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  propertyType: string;
  setPropertyType: (val: string) => void;
  transactionType: string;
  setTransactionType: (val: string) => void;
  priceMin: string;
  setPriceMin: (val: string) => void;
  priceMax: string;
  setPriceMax: (val: string) => void;
  showFilters: boolean;
  setShowFilters: (val: boolean) => void;
  onRefresh: () => void;
}

export function PropertyFilters({
  search,
  setSearch,
  propertyType,
  setPropertyType,
  transactionType,
  setTransactionType,
  priceMin,
  setPriceMin,
  priceMax,
  setPriceMax,
  showFilters,
  setShowFilters,
  onRefresh,
}: PropertyFiltersProps) {
  return (
    <Card className="glass-panel border-none shadow-sm">
      <CardContent className="p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, description, locality, city..."
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
              {(propertyType !== "ALL" || transactionType !== "ALL" || priceMin || priceMax) && (
                <span className="h-2 w-2 rounded-full bg-primary" />
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={onRefresh}>
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
              <label className="text-xs font-semibold text-muted-foreground">Min Price (INR)</label>
              <Input
                type="number"
                placeholder="e.g. 5000000"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Max Price (INR)</label>
              <Input
                type="number"
                placeholder="e.g. 20000000"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
