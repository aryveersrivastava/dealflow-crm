"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Save, User, MapPin, IndianRupee, Layers, Plus, X } from "lucide-react";
import Link from "next/link";
import { createRequirementSchema, type CreateRequirementFormData } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PROPERTY_TYPE_LABELS,
  TRANSACTION_TYPE_LABELS,
  URGENCY_LABELS,
  FURNISHING_LABELS,
  INVESTMENT_GOAL_LABELS,
} from "@/lib/constants";

interface RequirementFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export function RequirementForm({ initialData, isEdit = false }: RequirementFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [localityInput, setLocalityInput] = useState("");

  const defaultValues: Partial<CreateRequirementFormData> = initialData
    ? {
        title: initialData.title,
        description: initialData.description || "",
        buyerName: initialData.buyerName,
        buyerPhone: initialData.buyerPhone || "",
        buyerEmail: initialData.buyerEmail || "",
        propertyType: initialData.propertyType,
        transactionType: initialData.transactionType,
        budgetMin: Number(initialData.budgetMin),
        budgetMax: Number(initialData.budgetMax),
        areaMin: initialData.areaMin !== null ? Number(initialData.areaMin) : undefined,
        areaMax: initialData.areaMax !== null ? Number(initialData.areaMax) : undefined,
        bedrooms: initialData.bedrooms !== null ? Number(initialData.bedrooms) : undefined,
        city: initialData.city,
        locality: initialData.locality || "",
        preferredLocalities: initialData.preferredLocalities || [],
        urgency: initialData.urgency || "FLEXIBLE",
        investmentGoal: initialData.investmentGoal || undefined,
        furnishing: initialData.furnishing || undefined,
        notes: initialData.notes || "",
        isPublic: initialData.isPublic !== undefined ? initialData.isPublic : true,
      }
    : {
        title: "",
        description: "",
        buyerName: "",
        buyerPhone: "",
        buyerEmail: "",
        propertyType: "APARTMENT",
        transactionType: "SALE",
        budgetMin: 0,
        budgetMax: 0,
        city: "",
        locality: "",
        preferredLocalities: [],
        urgency: "FLEXIBLE",
        isPublic: true,
        notes: "",
      };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateRequirementFormData>({
    resolver: zodResolver(createRequirementSchema) as any,
    defaultValues,
  });

  const propertyType = watch("propertyType");
  const transactionType = watch("transactionType");
  const urgency = watch("urgency");
  const furnishing = watch("furnishing");
  const investmentGoal = watch("investmentGoal");
  const isPublic = watch("isPublic");
  const preferredLocalities = watch("preferredLocalities") || [];

  const addPreferredLocality = () => {
    if (localityInput.trim() && !preferredLocalities.includes(localityInput.trim())) {
      setValue("preferredLocalities", [...preferredLocalities, localityInput.trim()]);
      setLocalityInput("");
    }
  };

  const removePreferredLocality = (index: number) => {
    setValue(
      "preferredLocalities",
      preferredLocalities.filter((_, i) => i !== index)
    );
  };

  const onSubmit = async (values: CreateRequirementFormData) => {
    setLoading(true);
    try {
      const url = isEdit ? `/api/requirements/${initialData.id}` : "/api/requirements";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      toast.success(isEdit ? "Requirement updated successfully" : "Requirement posted successfully");
      router.push(`/requirements/${data.data.id}`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to save requirement");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "basic", label: "Basic & Buyer", icon: User },
    { id: "budget", label: "Budget & Area", icon: IndianRupee },
    { id: "location", label: "Location & Urgency", icon: MapPin },
    { id: "specs", label: "Specifications", icon: Layers },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={isEdit ? `/requirements/${initialData.id}` : "/requirements"}
            className="flex items-center justify-center h-9 w-9 rounded-md border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isEdit ? "Edit Requirement" : "Post Buyer Requirement"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEdit ? "Update buyer requirements and matching criteria" : "Record buyer specifications to enable property matching"}
            </p>
          </div>
        </div>
        <Button onClick={handleSubmit(onSubmit)} disabled={loading} className="gap-2">
          <Save className="h-4 w-4" />
          {loading ? "Saving..." : "Save Requirement"}
        </Button>
      </div>

      {/* Tabs Layout */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 flex flex-row md:flex-col gap-1 border-b md:border-b-0 md:border-r pb-4 md:pb-0 md:pr-6 overflow-x-auto whitespace-nowrap">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <div className="flex-1">
          <Card className="glass-panel">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* 1. BASIC DETAILS & BUYER CONTACT */}
                {activeTab === "basic" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Requirement Title *</Label>
                      <Input
                        id="title"
                        placeholder="e.g. Buyer looking for 3BHK in Andheri West"
                        {...register("title")}
                      />
                      {errors.title && (
                        <p className="text-xs font-medium text-destructive">{errors.title.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Requirement Summary / Description</Label>
                      <Textarea
                        id="description"
                        rows={4}
                        placeholder="Provide details on buyer preferences, must-haves, etc."
                        {...register("description")}
                      />
                      {errors.description && (
                        <p className="text-xs font-medium text-destructive">{errors.description.message}</p>
                      )}
                    </div>

                    <div className="border-t pt-4 space-y-4">
                      <h4 className="font-medium text-sm text-foreground">Buyer Contact Details</h4>
                      
                      <div className="space-y-2">
                        <Label htmlFor="buyerName">Buyer Name *</Label>
                        <Input
                          id="buyerName"
                          placeholder="e.g. Ramesh Shah"
                          {...register("buyerName")}
                        />
                        {errors.buyerName && (
                          <p className="text-xs font-medium text-destructive">{errors.buyerName.message}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="buyerPhone">Buyer Phone</Label>
                          <Input
                            id="buyerPhone"
                            placeholder="e.g. +91 9876543210"
                            {...register("buyerPhone")}
                          />
                          {errors.buyerPhone && (
                            <p className="text-xs font-medium text-destructive">{errors.buyerPhone.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="buyerEmail">Buyer Email</Label>
                          <Input
                            id="buyerEmail"
                            type="email"
                            placeholder="e.g. ramesh@example.com"
                            {...register("buyerEmail")}
                          />
                          {errors.buyerEmail && (
                            <p className="text-xs font-medium text-destructive">{errors.buyerEmail.message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. BUDGET & AREA */}
                {activeTab === "budget" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="budgetMin">Minimum Budget (INR) *</Label>
                        <Input
                          id="budgetMin"
                          type="number"
                          placeholder="e.g. 10000000"
                          {...register("budgetMin", { valueAsNumber: true })}
                        />
                        {errors.budgetMin && (
                          <p className="text-xs font-medium text-destructive">{errors.budgetMin.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="budgetMax">Maximum Budget (INR) *</Label>
                        <Input
                          id="budgetMax"
                          type="number"
                          placeholder="e.g. 25000000"
                          {...register("budgetMax", { valueAsNumber: true })}
                        />
                        {errors.budgetMax && (
                          <p className="text-xs font-medium text-destructive">{errors.budgetMax.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="areaMin">Minimum Area (Sq.Ft.)</Label>
                        <Input
                          id="areaMin"
                          type="number"
                          placeholder="e.g. 800"
                          {...register("areaMin", {
                            setValueAs: (v) => (v === "" ? undefined : Number(v)),
                          })}
                        />
                        {errors.areaMin && (
                          <p className="text-xs font-medium text-destructive">{errors.areaMin.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="areaMax">Maximum Area (Sq.Ft.)</Label>
                        <Input
                          id="areaMax"
                          type="number"
                          placeholder="e.g. 1800"
                          {...register("areaMax", {
                            setValueAs: (v) => (v === "" ? undefined : Number(v)),
                          })}
                        />
                        {errors.areaMax && (
                          <p className="text-xs font-medium text-destructive">{errors.areaMax.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. LOCATION & URGENCY */}
                {activeTab === "location" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City *</Label>
                        <Input id="city" placeholder="e.g. Mumbai" {...register("city")} />
                        {errors.city && (
                          <p className="text-xs font-medium text-destructive">{errors.city.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="locality">Primary Locality Preference</Label>
                        <Input
                          id="locality"
                          placeholder="e.g. Andheri West"
                          {...register("locality")}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 border-t pt-4">
                      <Label htmlFor="preferredLocalities">Preferred Localities List</Label>
                      <div className="flex gap-2">
                        <Input
                          id="newLocality"
                          placeholder="Type locality and click Add (e.g. Bandra West)"
                          value={localityInput}
                          onChange={(e) => setLocalityInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addPreferredLocality();
                            }
                          }}
                        />
                        <Button type="button" variant="outline" onClick={addPreferredLocality}>
                          <Plus className="h-4 w-4" /> Add
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {preferredLocalities.map((loc, idx) => (
                          <Badge key={idx} variant="secondary" className="gap-1.5 px-3 py-1 text-xs">
                            {loc}
                            <button
                              type="button"
                              onClick={() => removePreferredLocality(idx)}
                              className="text-muted-foreground hover:text-foreground rounded-full"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                        {preferredLocalities.length === 0 && (
                          <span className="text-xs text-muted-foreground italic">No preferred localities added yet</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 border-t pt-4">
                      <Label htmlFor="urgency">Urgency Level *</Label>
                      <Select
                        value={urgency}
                        onValueChange={(val: any) => setValue("urgency", val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select urgency" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(URGENCY_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* 4. SPECIFICATIONS & EXTRA */}
                {activeTab === "specs" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="propertyType">Preferred Property Type *</Label>
                        <Select
                          value={propertyType}
                          onValueChange={(val: any) => setValue("propertyType", val)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="transactionType">Preferred Transaction Type *</Label>
                        <Select
                          value={transactionType}
                          onValueChange={(val: any) => setValue("transactionType", val)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select transaction" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(TRANSACTION_TYPE_LABELS).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t pt-4">
                      {propertyType !== "PLOT" && propertyType !== "WAREHOUSE" && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="bedrooms">Bedrooms (BHK)</Label>
                            <Input
                              id="bedrooms"
                              type="number"
                              placeholder="e.g. 3"
                              {...register("bedrooms", {
                                setValueAs: (v) => (v === "" ? undefined : Number(v)),
                              })}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="furnishing">Furnishing Status</Label>
                            <Select
                              value={furnishing || "none"}
                              onValueChange={(val: any) =>
                                setValue("furnishing", val === "none" ? undefined : val)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select furnishing" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Not Specified</SelectItem>
                                {Object.entries(FURNISHING_LABELS).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="investmentGoal">Investment / Buying Goal</Label>
                        <Select
                          value={investmentGoal || "none"}
                          onValueChange={(val: any) =>
                            setValue("investmentGoal", val === "none" ? undefined : val)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select goal" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Not Specified</SelectItem>
                            {Object.entries(INVESTMENT_GOAL_LABELS).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2 border-t pt-4">
                      <Label htmlFor="notes">Additional Private Notes / Agent Notes</Label>
                      <Textarea
                        id="notes"
                        rows={3}
                        placeholder="Internal notes regarding buyer requirements (not shared publicly)"
                        {...register("notes")}
                      />
                    </div>

                    <div className="flex items-center justify-between border-t pt-4 bg-muted/20 p-4 rounded-lg">
                      <div className="space-y-0.5">
                        <Label htmlFor="isPublic">Public Marketplace Visibility</Label>
                        <p className="text-xs text-muted-foreground">
                          Toggle visibility on the shared Brokerage/MLS marketplace feed.
                        </p>
                      </div>
                      <Switch
                        id="isPublic"
                        checked={isPublic}
                        onCheckedChange={(checked) => setValue("isPublic", checked)}
                      />
                    </div>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
