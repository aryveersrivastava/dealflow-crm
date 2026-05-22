"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Save, Building2, MapPin, IndianRupee, Layers, Image as ImageIcon, Trash2, Plus } from "lucide-react";
import Link from "next/link";
import { createPropertySchema, type CreatePropertyFormData } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
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
  FURNISHING_LABELS,
} from "@/lib/constants";

interface PropertyFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export function PropertyForm({ initialData, isEdit = false }: PropertyFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [newImageUrl, setNewImageUrl] = useState("");

  const defaultValues: Partial<CreatePropertyFormData> = initialData
    ? {
        title: initialData.title,
        description: initialData.description || "",
        propertyType: initialData.propertyType,
        transactionType: initialData.transactionType,
        status: initialData.status,
        price: Number(initialData.price),
        area: Number(initialData.area),
        areaUnit: initialData.areaUnit || "sqft",
        bedrooms: initialData.bedrooms !== null ? Number(initialData.bedrooms) : undefined,
        bathrooms: initialData.bathrooms !== null ? Number(initialData.bathrooms) : undefined,
        furnishing: initialData.furnishing || undefined,
        floor: initialData.floor !== null ? Number(initialData.floor) : undefined,
        totalFloors: initialData.totalFloors !== null ? Number(initialData.totalFloors) : undefined,
        facing: initialData.facing || "",
        city: initialData.city,
        locality: initialData.locality,
        address: initialData.address || "",
        ownerName: initialData.ownerName || "",
        ownerPhone: initialData.ownerPhone || "",
        amenities: initialData.amenities || [],
        tags: initialData.tags || [],
        images: initialData.images || [],
      }
    : {
        title: "",
        description: "",
        propertyType: "APARTMENT",
        transactionType: "SALE",
        status: "ACTIVE",
        price: 0,
        area: 0,
        areaUnit: "sqft",
        city: "",
        locality: "",
        address: "",
        ownerName: "",
        ownerPhone: "",
        amenities: [],
        tags: [],
        images: [],
      };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreatePropertyFormData>({
    resolver: zodResolver(createPropertySchema) as any,
    defaultValues,
  });

  const propertyType = watch("propertyType");
  const transactionType = watch("transactionType");
  const furnishing = watch("furnishing");
  const images = watch("images") || [];

  const addImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setValue("images", [...images, newImageUrl.trim()]);
    setNewImageUrl("");
  };

  const removeImageUrl = (indexToRemove: number) => {
    setValue(
      "images",
      images.filter((_, idx) => idx !== indexToRemove)
    );
  };

  // Common amenities lists
  const availableAmenities = [
    "Parking",
    "Security",
    "Power Backup",
    "Gym",
    "Swimming Pool",
    "Lift",
    "Club House",
    "Intercom",
    "Gas Pipeline",
    "Water Storage",
    "Play Area",
    "Rain Water Harvesting",
  ];

  const selectedAmenities = watch("amenities") || [];

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setValue(
        "amenities",
        selectedAmenities.filter((a) => a !== amenity)
      );
    } else {
      setValue("amenities", [...selectedAmenities, amenity]);
    }
  };

  const onSubmit = async (values: CreatePropertyFormData) => {
    setLoading(true);
    try {
      const url = isEdit ? `/api/properties/${initialData.id}` : "/api/properties";
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

      toast.success(isEdit ? "Property updated successfully" : "Property created successfully");
      router.push(`/properties/${data.data.id}`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to save property");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "basic", label: "Basic Info", icon: Building2 },
    { id: "pricing", label: "Pricing & Size", icon: IndianRupee },
    { id: "location", label: "Location", icon: MapPin },
    { id: "specs", label: "Specs & Amenities", icon: Layers },
    { id: "media", label: "Media & Images", icon: ImageIcon },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={isEdit ? `/properties/${initialData.id}` : "/properties"}
            className="flex items-center justify-center h-9 w-9 rounded-md border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isEdit ? "Edit Property" : "Add New Property"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEdit ? "Update details of your existing listing" : "Create a new property listing in your CRM"}
            </p>
          </div>
        </div>
        <Button onClick={handleSubmit(onSubmit)} disabled={loading} className="gap-2">
          <Save className="h-4 w-4" />
          {loading ? "Saving..." : "Save Property"}
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
                {/* 1. BASIC DETAILS */}
                {activeTab === "basic" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Property Title *</Label>
                      <Input
                        id="title"
                        placeholder="e.g. Spacious 3BHK Apartment in Powai"
                        {...register("title")}
                      />
                      {errors.title && (
                        <p className="text-xs font-medium text-destructive">{errors.title.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="propertyType">Property Type *</Label>
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
                        <Label htmlFor="transactionType">Transaction Type *</Label>
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

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        rows={6}
                        placeholder="Enter full property details, highlights, nearby landmarks, etc."
                        {...register("description")}
                      />
                      {errors.description && (
                        <p className="text-xs font-medium text-destructive">
                          {errors.description.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. PRICING & AREA */}
                {activeTab === "pricing" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">
                          Price (INR) *{" "}
                          {transactionType === "RENT" || transactionType === "LEASE"
                            ? "(Monthly Rent)"
                            : "(Sale Value)"}
                        </Label>
                        <Input
                          id="price"
                          type="number"
                          placeholder="e.g. 15000000"
                          {...register("price", { valueAsNumber: true })}
                        />
                        {errors.price && (
                          <p className="text-xs font-medium text-destructive">
                            {errors.price.message}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label htmlFor="area">Area *</Label>
                          <Input
                            id="area"
                            type="number"
                            placeholder="e.g. 1200"
                            {...register("area", { valueAsNumber: true })}
                          />
                          {errors.area && (
                            <p className="text-xs font-medium text-destructive">
                              {errors.area.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="areaUnit">Unit</Label>
                          <Input id="areaUnit" defaultValue="sqft" {...register("areaUnit")} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. LOCATION */}
                {activeTab === "location" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City *</Label>
                        <Input id="city" placeholder="e.g. Mumbai" {...register("city")} />
                        {errors.city && (
                          <p className="text-xs font-medium text-destructive">
                            {errors.city.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="locality">Locality *</Label>
                        <Input
                          id="locality"
                          placeholder="e.g. Andheri West"
                          {...register("locality")}
                        />
                        {errors.locality && (
                          <p className="text-xs font-medium text-destructive">
                            {errors.locality.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Full Address</Label>
                      <Input
                        id="address"
                        placeholder="e.g. Flat 402, Building A, Main Road"
                        {...register("address")}
                      />
                    </div>
                  </div>
                )}

                {/* 4. SPECIFICATIONS & AMENITIES */}
                {activeTab === "specs" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
                            <Label htmlFor="bathrooms">Bathrooms</Label>
                            <Input
                              id="bathrooms"
                              type="number"
                              placeholder="e.g. 2"
                              {...register("bathrooms", {
                                setValueAs: (v) => (v === "" ? undefined : Number(v)),
                              })}
                            />
                          </div>
                        </>
                      )}

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

                      <div className="space-y-2">
                        <Label htmlFor="floor">Floor Number</Label>
                        <Input
                          id="floor"
                          type="number"
                          placeholder="e.g. 4"
                          {...register("floor", {
                            setValueAs: (v) => (v === "" ? undefined : Number(v)),
                          })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="totalFloors">Total Floors</Label>
                        <Input
                          id="totalFloors"
                          type="number"
                          placeholder="e.g. 12"
                          {...register("totalFloors", {
                            setValueAs: (v) => (v === "" ? undefined : Number(v)),
                          })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="facing">Facing Direction</Label>
                        <Input id="facing" placeholder="e.g. East" {...register("facing")} />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Amenities</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {availableAmenities.map((amenity) => {
                          const isSelected = selectedAmenities.includes(amenity);
                          return (
                            <button
                              key={amenity}
                              type="button"
                              onClick={() => toggleAmenity(amenity)}
                              className={`flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md border text-left transition-all ${
                                isSelected
                                  ? "bg-primary/10 border-primary text-primary"
                                  : "bg-background border-input text-muted-foreground hover:text-foreground hover:bg-muted"
                              }`}
                            >
                              {amenity}
                              {isSelected && (
                                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="border-t pt-4 space-y-4">
                      <h4 className="font-medium text-sm text-foreground">Contact & Owner Info</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="ownerName">Owner Name</Label>
                          <Input
                            id="ownerName"
                            placeholder="e.g. Ramesh Kumar"
                            {...register("ownerName")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ownerPhone">Owner Phone</Label>
                          <Input
                            id="ownerPhone"
                            placeholder="e.g. +91 9876543210"
                            {...register("ownerPhone")}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. MEDIA & IMAGES */}
                {activeTab === "media" && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="newImage">Add Image URL</Label>
                      <div className="flex gap-2">
                        <Input
                          id="newImage"
                          placeholder="https://images.unsplash.com/... or storage URL"
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addImageUrl();
                            }
                          }}
                        />
                        <Button type="button" onClick={addImageUrl} variant="secondary" className="gap-1.5 shrink-0">
                          <Plus className="h-4 w-4" /> Add
                        </Button>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Enter public image web URLs or Supabase Storage links for your property showcase.
                      </p>
                    </div>

                    {images.length > 0 ? (
                      <div className="space-y-3">
                        <Label>Current Images ({images.length})</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {images.map((imgUrl, idx) => (
                            <div key={idx} className="relative group border rounded-xl overflow-hidden bg-muted/40 aspect-video shadow-xs border-border/60">
                              <img
                                src={imgUrl}
                                alt={`Property ${idx + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback standard icon if URL fails to load
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                              {/* Fallback box when image error happens */}
                              <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground text-xs font-semibold p-2 text-center select-none">
                                Image Preview
                              </div>
                              <img
                                src={imgUrl}
                                alt={`Property ${idx + 1}`}
                                className="absolute inset-0 w-full h-full object-cover z-10"
                              />
                              <button
                                type="button"
                                onClick={() => removeImageUrl(idx)}
                                className="absolute top-2 right-2 z-20 flex h-7 w-7 items-center justify-center rounded-lg bg-background/90 text-destructive border border-border hover:bg-destructive hover:text-white transition-all shadow-sm"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                              <div className="absolute bottom-2 left-2 z-20 text-[9px] font-bold bg-black/60 text-white rounded px-1.5 py-0.5 backdrop-blur-xs">
                                #{idx + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-10 border border-dashed rounded-xl text-muted-foreground">
                        <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                        <p className="text-xs font-medium">No images added to this listing yet.</p>
                      </div>
                    )}
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
