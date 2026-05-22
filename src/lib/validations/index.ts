// ==============================================================
// DealFlow CRM — Zod Validation Schemas
// ==============================================================

import { z } from "zod";

// ======================== Auth Validations ========================

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const onboardingSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  brokerageName: z.string().min(2, "Brokerage name is required"),
  city: z.string().min(2, "City is required"),
  reraNumber: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type OnboardingFormData = z.infer<typeof onboardingSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// ======================== Property Validations ========================

export const createPropertySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  description: z.string().max(5000).optional(),
  propertyType: z.enum([
    "APARTMENT", "VILLA", "PLOT", "COMMERCIAL_OFFICE", "COMMERCIAL_SHOP",
    "COMMERCIAL_SHOWROOM", "WAREHOUSE", "FARMHOUSE", "PENTHOUSE",
    "STUDIO", "INDEPENDENT_HOUSE", "BUILDER_FLOOR",
  ]),
  transactionType: z.enum(["SALE", "RENT", "LEASE", "PG"]),
  status: z.enum(["DRAFT", "ACTIVE", "UNDER_OFFER", "SOLD", "RENTED", "ARCHIVED"]).default("ACTIVE"),
  price: z.coerce.number().positive("Price must be positive"),
  area: z.coerce.number().positive("Area must be positive"),
  areaUnit: z.string().default("sqft"),
  bedrooms: z.coerce.number().int().min(0).optional(),
  bathrooms: z.coerce.number().int().min(0).optional(),
  furnishing: z.enum(["FURNISHED", "SEMI_FURNISHED", "UNFURNISHED"]).optional(),
  floor: z.coerce.number().int().optional(),
  totalFloors: z.coerce.number().int().optional(),
  facing: z.string().optional(),
  city: z.string().min(2, "City is required"),
  locality: z.string().min(2, "Locality is required"),
  address: z.string().optional(),
  ownerName: z.string().optional(),
  ownerPhone: z.string().optional(),
  amenities: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
});

export const updatePropertySchema = createPropertySchema.partial();

export type CreatePropertyFormData = z.infer<typeof createPropertySchema>;
export type UpdatePropertyFormData = z.infer<typeof updatePropertySchema>;

// ======================== Requirement Validations ========================

export const requirementBaseSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  description: z.string().max(5000).optional(),
  buyerName: z.string().min(2, "Buyer name is required"),
  buyerPhone: z.string().optional(),
  buyerEmail: z.string().email().optional().or(z.literal("")),
  propertyType: z.enum([
    "APARTMENT", "VILLA", "PLOT", "COMMERCIAL_OFFICE", "COMMERCIAL_SHOP",
    "COMMERCIAL_SHOWROOM", "WAREHOUSE", "FARMHOUSE", "PENTHOUSE",
    "STUDIO", "INDEPENDENT_HOUSE", "BUILDER_FLOOR",
  ]),
  transactionType: z.enum(["SALE", "RENT", "LEASE", "PG"]),
  budgetMin: z.coerce.number().positive("Minimum budget must be positive"),
  budgetMax: z.coerce.number().positive("Maximum budget must be positive"),
  areaMin: z.coerce.number().positive().optional(),
  areaMax: z.coerce.number().positive().optional(),
  bedrooms: z.coerce.number().int().min(0).optional(),
  city: z.string().min(2, "City is required"),
  locality: z.string().optional(),
  preferredLocalities: z.array(z.string()).default([]),
  urgency: z.enum(["IMMEDIATE", "WITHIN_1_MONTH", "WITHIN_3_MONTHS", "WITHIN_6_MONTHS", "FLEXIBLE"]).default("FLEXIBLE"),
  investmentGoal: z.enum(["END_USE", "INVESTMENT", "RENTAL_INCOME", "RESALE", "COMMERCIAL_USE"]).optional(),
  furnishing: z.enum(["FURNISHED", "SEMI_FURNISHED", "UNFURNISHED"]).optional(),
  notes: z.string().optional(),
  isPublic: z.boolean().default(true),
});

export const createRequirementSchema = requirementBaseSchema.refine((data) => data.budgetMax >= data.budgetMin, {
  message: "Maximum budget must be greater than minimum budget",
  path: ["budgetMax"],
});

export const updateRequirementSchema = requirementBaseSchema.partial().refine((data) => {
  if (data.budgetMin !== undefined && data.budgetMax !== undefined) {
    return data.budgetMax >= data.budgetMin;
  }
  return true;
}, {
  message: "Maximum budget must be greater than minimum budget",
  path: ["budgetMax"],
});

export type CreateRequirementFormData = z.infer<typeof createRequirementSchema>;
export type UpdateRequirementFormData = z.infer<typeof updateRequirementSchema>;

// ======================== Lead Validations ========================

export const createLeadSchema = z.object({
  contactName: z.string().min(2, "Contact name is required"),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  source: z.string().optional(),
  propertyId: z.string().optional(),
  requirementId: z.string().optional(),
  assignedToId: z.string().optional(),
  notes: z.string().optional(),
  expectedValue: z.coerce.number().positive().optional(),
});

export const updateLeadSchema = z.object({
  status: z.enum([
    "NEW_LEAD", "CONTACTED", "INTERESTED", "SITE_VISIT",
    "NEGOTIATION", "CLOSED_WON", "CLOSED_LOST",
  ]).optional(),
  assignedToId: z.string().optional(),
  notes: z.string().optional(),
  expectedValue: z.coerce.number().positive().optional(),
  lostReason: z.string().optional(),
  nextFollowUp: z.string().datetime().optional(),
  score: z.coerce.number().int().min(0).max(100).optional(),
});

export type CreateLeadFormData = z.infer<typeof createLeadSchema>;
export type UpdateLeadFormData = z.infer<typeof updateLeadSchema>;

// ======================== Task Validations ========================

export const createTaskSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  leadId: z.string().optional(),
  assignedToId: z.string().optional(),
  dueDate: z.string().datetime().optional(),
});

export type CreateTaskFormData = z.infer<typeof createTaskSchema>;

// ======================== Note Validations ========================

export const createNoteSchema = z.object({
  content: z.string().min(1, "Note content is required"),
  leadId: z.string().optional(),
  isPinned: z.boolean().default(false),
});

export type CreateNoteFormData = z.infer<typeof createNoteSchema>;

// ======================== Visit Validations ========================

export const createVisitSchema = z.object({
  propertyId: z.string().min(1, "Property is required"),
  leadId: z.string().optional(),
  scheduledAt: z.string().datetime(),
});

export const updateVisitSchema = z.object({
  status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
  feedback: z.string().optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
});

export type CreateVisitFormData = z.infer<typeof createVisitSchema>;
export type UpdateVisitFormData = z.infer<typeof updateVisitSchema>;

// ======================== Collaboration Validations ========================

export const createCollaborationSchema = z.object({
  toUserId: z.string().min(1, "Recipient is required"),
  type: z.enum(["SHARED_LISTING", "SHARED_REQUIREMENT", "CO_BROKE", "NOTE"]),
  propertyId: z.string().optional(),
  requirementId: z.string().optional(),
  message: z.string().optional(),
});

export type CreateCollaborationFormData = z.infer<typeof createCollaborationSchema>;
