// ==============================================================
// DealFlow CRM — TypeScript Type Definitions
// ==============================================================

import type {
  BrokerageFirm,
  User,
  Property,
  Requirement,
  Lead,
  Activity,
  Task,
  Note,
  Visit,
  Collaboration,
  Notification,
} from "@prisma/client";

// Re-export Prisma types for convenience
export type {
  BrokerageFirm,
  User,
  Property,
  Requirement,
  Lead,
  Activity,
  Task,
  Note,
  Visit,
  Collaboration,
  Notification,
};

// ======================== Auth Types ========================

export interface AuthUser {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
  };
}

export interface SessionUser {
  id: string;
  supabaseId: string;
  tenantId: string;
  email: string;
  fullName: string;
  role: string;
  avatar: string | null;
  tenant: {
    id: string;
    name: string;
    slug: string;
    subscriptionPlan: string;
  };
}

// ======================== API Types ========================

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface SortParams {
  sortBy: string;
  sortOrder: "asc" | "desc";
}

// ======================== Property Types ========================

export interface PropertyWithRelations extends Property {
  createdBy: Pick<User, "id" | "fullName" | "avatar" | "email">;
  _count?: {
    leads: number;
    visits: number;
  };
}

export interface PropertyFilters {
  city?: string;
  locality?: string;
  propertyType?: string;
  transactionType?: string;
  status?: string;
  priceMin?: number;
  priceMax?: number;
  areaMin?: number;
  areaMax?: number;
  bedrooms?: number;
  furnishing?: string;
  search?: string;
}

// ======================== Requirement Types ========================

export interface RequirementWithRelations extends Requirement {
  createdBy: Pick<User, "id" | "fullName" | "avatar" | "email">;
  _count?: {
    leads: number;
  };
}

export interface RequirementFilters {
  city?: string;
  propertyType?: string;
  transactionType?: string;
  urgency?: string;
  status?: string;
  budgetMin?: number;
  budgetMax?: number;
  search?: string;
}

// ======================== Matching Types ========================

export interface MatchScoreBreakdown {
  locationScore: number;
  budgetScore: number;
  propertyTypeScore: number;
  transactionScore: number;
  areaScore: number;
}

export interface PropertyMatch {
  property: PropertyWithRelations;
  totalScore: number;
  breakdown: MatchScoreBreakdown;
}

export interface RequirementMatch {
  requirement: RequirementWithRelations;
  totalScore: number;
  breakdown: MatchScoreBreakdown;
}

// ======================== CRM / Lead Types ========================

export interface LeadWithRelations extends Lead {
  createdBy: Pick<User, "id" | "fullName" | "avatar">;
  assignedTo: Pick<User, "id" | "fullName" | "avatar"> | null;
  property: Pick<Property, "id" | "title" | "city" | "locality" | "price"> | null;
  requirement: Pick<Requirement, "id" | "title" | "city" | "budgetMin" | "budgetMax"> | null;
  _count?: {
    activities: number;
    taskItems: number;
    visits: number;
  };
}

export interface LeadFilters {
  status?: string;
  assignedToId?: string;
  source?: string;
  search?: string;
}

// ======================== Activity Types ========================

export interface ActivityWithRelations extends Activity {
  user: Pick<User, "id" | "fullName" | "avatar">;
}

// ======================== Task Types ========================

export interface TaskWithRelations extends Task {
  createdBy: Pick<User, "id" | "fullName" | "avatar">;
  assignedTo: Pick<User, "id" | "fullName" | "avatar"> | null;
  lead: Pick<Lead, "id" | "contactName"> | null;
}

// ======================== Collaboration Types ========================

export interface CollaborationWithRelations extends Collaboration {
  fromUser: Pick<User, "id" | "fullName" | "avatar" | "email">;
  toUser: Pick<User, "id" | "fullName" | "avatar" | "email">;
  property: Pick<Property, "id" | "title" | "city" | "price"> | null;
  requirement: Pick<Requirement, "id" | "title" | "city" | "budgetMin" | "budgetMax"> | null;
}

// ======================== Analytics Types ========================

export interface DashboardStats {
  totalProperties: number;
  totalRequirements: number;
  totalLeads: number;
  totalDeals: number;
  conversionRate: number;
  revenuePipeline: number;
  activeAgents: number;
  matchRate: number;
}

export interface LeadsByStatus {
  status: string;
  count: number;
}

export interface MonthlyTrend {
  month: string;
  leads: number;
  deals: number;
  revenue: number;
}

export interface AgentPerformance {
  userId: string;
  fullName: string;
  avatar: string | null;
  totalLeads: number;
  closedWon: number;
  conversionRate: number;
  revenue: number;
}

// ======================== Navigation Types ========================

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: number;
  roles?: string[];
  children?: NavItem[];
}
