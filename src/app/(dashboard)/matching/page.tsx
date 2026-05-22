"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, Building2, ClipboardList, MapPin, ArrowRight, Eye, UserPlus } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/shared/page-header";
import { formatPrice, cn } from "@/lib/utils";
import { PROPERTY_TYPE_LABELS, TRANSACTION_TYPE_LABELS } from "@/lib/constants";

// Demo match results
const demoMatches = [
  {
    id: "1",
    totalScore: 92,
    breakdown: { locationScore: 100, budgetScore: 85, propertyTypeScore: 100, transactionScore: 100, areaScore: 80 },
    property: { id: "p1", title: "3BHK Premium in Andheri West", city: "Mumbai", locality: "Andheri West", price: 25000000, area: 1850, propertyType: "APARTMENT", transactionType: "SALE" },
  },
  {
    id: "2",
    totalScore: 78,
    breakdown: { locationScore: 75, budgetScore: 90, propertyTypeScore: 100, transactionScore: 100, areaScore: 60 },
    property: { id: "p2", title: "2BHK Spacious in Goregaon East", city: "Mumbai", locality: "Goregaon", price: 18000000, area: 1200, propertyType: "APARTMENT", transactionType: "SALE" },
  },
  {
    id: "3",
    totalScore: 65,
    breakdown: { locationScore: 60, budgetScore: 70, propertyTypeScore: 100, transactionScore: 100, areaScore: 45 },
    property: { id: "p3", title: "3BHK in Malad West", city: "Mumbai", locality: "Malad", price: 22000000, area: 1600, propertyType: "APARTMENT", transactionType: "SALE" },
  },
];

function ScoreCircle({ score, size = "md" }: { score: number; size?: "sm" | "md" | "lg" }) {
  const sizeMap = { sm: 48, md: 72, lg: 96 };
  const s = sizeMap[size];
  const strokeWidth = size === "sm" ? 3 : 4;
  const radius = (s - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  const color = score >= 80 ? "text-emerald-500" : score >= 60 ? "text-blue-500" : score >= 40 ? "text-amber-500" : "text-red-500";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: s, height: s }}>
      <svg className="transform -rotate-90" width={s} height={s}>
        <circle cx={s / 2} cy={s / 2} r={radius} className="fill-none stroke-muted" strokeWidth={strokeWidth} />
        <circle
          cx={s / 2} cy={s / 2} r={radius}
          className={`fill-none ${color}`}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
        />
      </svg>
      <span className={cn("absolute text-base font-bold", size === "sm" && "text-xs", size === "lg" && "text-xl", color)}>
        {score}
      </span>
    </div>
  );
}

export default function MatchingPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Matching Engine"
        description="Find the best property-requirement matches using our weighted scoring algorithm"
        action={
          <Badge variant="outline" className="text-sm px-3 py-1.5">
            <Zap className="mr-1 h-4 w-4 text-amber-500" /> AI-Ready Pipeline
          </Badge>
        }
      />

      <Tabs defaultValue="requirement" className="space-y-6">
        <TabsList>
          <TabsTrigger value="requirement">
            <ClipboardList className="mr-2 h-4 w-4" /> Match Requirement
          </TabsTrigger>
          <TabsTrigger value="property">
            <Building2 className="mr-2 h-4 w-4" /> Match Property
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requirement" className="space-y-6">
          {/* Demo: Show matches for a requirement */}
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <ClipboardList className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">3BHK in Andheri/Goregaon for End Use</p>
                  <p className="text-sm text-muted-foreground">Budget: ₹2 Cr — ₹3 Cr · Mumbai · Apartment · Sale</p>
                </div>
                <Badge variant="secondary" className="ml-auto">{demoMatches.length} matches</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Match Results */}
          <div className="space-y-4">
            {demoMatches.map((match) => (
              <Card key={match.id} className="overflow-hidden transition-all hover:shadow-md">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Score */}
                    <div className="flex items-center justify-center p-6 bg-muted/30 md:w-32 shrink-0">
                      <ScoreCircle score={match.totalScore} />
                    </div>

                    {/* Property Info */}
                    <div className="flex-1 p-5 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{match.property.title}</h3>
                          <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            {match.property.locality}, {match.property.city}
                          </div>
                        </div>
                        <span className="text-lg font-bold text-primary">
                          {formatPrice(match.property.price)}
                        </span>
                      </div>

                      {/* Badges */}
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="text-xs">{PROPERTY_TYPE_LABELS[match.property.propertyType]}</Badge>
                        <Badge variant="outline" className="text-xs">{TRANSACTION_TYPE_LABELS[match.property.transactionType]}</Badge>
                        <Badge variant="outline" className="text-xs">{match.property.area} sqft</Badge>
                      </div>

                      {/* Score Breakdown */}
                      <div className="grid grid-cols-5 gap-3 pt-2">
                        {[
                          { label: "Location", score: match.breakdown.locationScore, weight: "30%" },
                          { label: "Budget", score: match.breakdown.budgetScore, weight: "25%" },
                          { label: "Type", score: match.breakdown.propertyTypeScore, weight: "20%" },
                          { label: "Transaction", score: match.breakdown.transactionScore, weight: "15%" },
                          { label: "Area", score: match.breakdown.areaScore, weight: "10%" },
                        ].map((dim) => (
                          <div key={dim.label} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">{dim.label}</span>
                              <span className="font-medium">{dim.score}</span>
                            </div>
                            <Progress value={dim.score} className="h-1.5" />
                            <span className="text-[10px] text-muted-foreground">{dim.weight}</span>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Link href={`/properties/${match.property.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                          <Eye className="mr-1 h-3 w-3" /> View
                        </Link>
                        <Button size="sm" variant="outline">
                          <UserPlus className="mr-1 h-3 w-3" /> Create Lead
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="property">
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            Select a property to find matching requirements
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
