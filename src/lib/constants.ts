// ==============================================================
// DealFlow CRM — TypeScript Enums & Constants
// ==============================================================

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  APARTMENT: "Apartment",
  VILLA: "Villa",
  PLOT: "Plot",
  COMMERCIAL_OFFICE: "Commercial Office",
  COMMERCIAL_SHOP: "Commercial Shop",
  COMMERCIAL_SHOWROOM: "Commercial Showroom",
  WAREHOUSE: "Warehouse",
  FARMHOUSE: "Farmhouse",
  PENTHOUSE: "Penthouse",
  STUDIO: "Studio",
  INDEPENDENT_HOUSE: "Independent House",
  BUILDER_FLOOR: "Builder Floor",
};

export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  SALE: "Sale",
  RENT: "Rent",
  LEASE: "Lease",
  PG: "PG/Co-living",
};

export const FURNISHING_LABELS: Record<string, string> = {
  FURNISHED: "Furnished",
  SEMI_FURNISHED: "Semi-Furnished",
  UNFURNISHED: "Unfurnished",
};

export const PROPERTY_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  UNDER_OFFER: "Under Offer",
  SOLD: "Sold",
  RENTED: "Rented",
  ARCHIVED: "Archived",
  FLAGGED: "Flagged",
};

export const PROPERTY_STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  ACTIVE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  UNDER_OFFER: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  SOLD: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  RENTED: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  ARCHIVED: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500",
  FLAGGED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export const URGENCY_LABELS: Record<string, string> = {
  IMMEDIATE: "Immediate",
  WITHIN_1_MONTH: "Within 1 Month",
  WITHIN_3_MONTHS: "Within 3 Months",
  WITHIN_6_MONTHS: "Within 6 Months",
  FLEXIBLE: "Flexible",
};

export const URGENCY_COLORS: Record<string, string> = {
  IMMEDIATE: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  WITHIN_1_MONTH: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  WITHIN_3_MONTHS: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  WITHIN_6_MONTHS: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  FLEXIBLE: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

export const REQUIREMENT_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  PARTIALLY_FULFILLED: "Partially Fulfilled",
  FULFILLED: "Fulfilled",
  EXPIRED: "Expired",
  CANCELLED: "Cancelled",
};

export const INVESTMENT_GOAL_LABELS: Record<string, string> = {
  END_USE: "End Use",
  INVESTMENT: "Investment",
  RENTAL_INCOME: "Rental Income",
  RESALE: "Resale",
  COMMERCIAL_USE: "Commercial Use",
};

export const LEAD_STATUS_LABELS: Record<string, string> = {
  NEW_LEAD: "New Lead",
  CONTACTED: "Contacted",
  INTERESTED: "Interested",
  SITE_VISIT: "Site Visit",
  NEGOTIATION: "Negotiation",
  CLOSED_WON: "Closed Won",
  CLOSED_LOST: "Closed Lost",
};

export const LEAD_STATUS_COLORS: Record<string, string> = {
  NEW_LEAD: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  CONTACTED: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  INTERESTED: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  SITE_VISIT: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  NEGOTIATION: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  CLOSED_WON: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  CLOSED_LOST: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export const LEAD_PIPELINE_ORDER: string[] = [
  "NEW_LEAD",
  "CONTACTED",
  "INTERESTED",
  "SITE_VISIT",
  "NEGOTIATION",
  "CLOSED_WON",
  "CLOSED_LOST",
];

export const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  NOTE: "Note",
  CALL: "Call",
  EMAIL: "Email",
  MEETING: "Meeting",
  SITE_VISIT: "Site Visit",
  FOLLOW_UP: "Follow Up",
  STATUS_CHANGE: "Status Change",
  DEAL_UPDATE: "Deal Update",
};

export const TASK_PRIORITY_LABELS: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export const TASK_PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  MEDIUM: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  URGENT: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export const TASK_STATUS_LABELS: Record<string, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
  CANCELLED: "Cancelled",
};

export const USER_ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  BROKERAGE_ADMIN: "Admin",
  BROKER: "Broker",
  AGENT: "Agent",
};

export const AMENITIES_LIST = [
  "Parking",
  "Swimming Pool",
  "Gym",
  "Security",
  "Power Backup",
  "Lift",
  "Garden",
  "Club House",
  "Children's Play Area",
  "Intercom",
  "Gas Pipeline",
  "Rain Water Harvesting",
  "Fire Safety",
  "Servant Room",
  "Vastu Compliant",
  "Pet Friendly",
  "Gated Community",
  "CCTV",
  "Jogging Track",
  "Maintenance Staff",
];

export const INDIAN_CITIES = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
  "Chandigarh",
  "Gurgaon",
  "Noida",
  "Thane",
  "Navi Mumbai",
  "Indore",
  "Bhopal",
  "Surat",
  "Kochi",
  "Goa",
];

export const LEAD_SOURCES = [
  "Website",
  "Referral",
  "Walk-in",
  "Phone Inquiry",
  "Social Media",
  "Property Portal",
  "Partner Broker",
  "Advertisement",
  "Email Campaign",
  "Other",
];
