# ⚡ DealFlow CRM
### Multi-Tenant Real Estate Deal Infrastructure Platform & CRM SaaS

[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2.4-blue?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.19.3-indigo?style=flat-square&logo=prisma)](https://prisma.io)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20Storage-emerald?style=flat-square&logo=supabase)](https://supabase.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-blue?style=flat-square&logo=postgresql)](https://www.postgresql.org)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-darkgreen?style=flat-square&logo=github-actions)](https://github.com/features/actions)

DealFlow CRM is a complete, production-grade SaaS deal infrastructure platform for real estate brokerages. Unlike simple property listing portals, DealFlow CRM digitizes the entire lifecycle of real estate transactions—from tracking buyer requirements and auto-matching properties to driving interactive Kanban pipelines, broker co-broking, and logging compliance audit trails.

---

## 🌎 The Real-World Problem Solved

Real estate operations have traditionally been bottlenecked by fragmented tools, manual processes, and security vulnerabilities:

1. **Information Asymmetry & Data Silos:** Agents track listings in Excel spreadsheets while buyer requirements are buried in emails, text messages, or physical notebooks. This lack of centralized mapping leads to missed deals and delayed sales.
2. **Weak Multi-Tenant Security & Compliance Risks:** In standard real estate CRMs, data is isolated solely via application logic. A single programmer error in a `WHERE` clause can leak sensitive buyer budgets, pricing strategies, or seller notes to competing brokerages.
3. **Friction in Broker Collaboration (Co-Broking):** Co-broking is critical in real estate, but sharing listings with external agents often carries the risk of leaking client contacts or property coordinates.
4. **Poor Pipeline Visibility & Reporting:** Brokerage principals lack real-time visibility into agent performance, active negotiation values, or pipeline progression, leading to unreliable business forecasts.

### How DealFlow CRM Helps:
* **Algorithmic Property Matching:** Instantly computes matches between buyer requirements and properties based on 5 parameters, eliminating manual lookup.
* **Dual-Layer Database Security:** Combines application-level client logic with raw database Row-Level Security (RLS) to ensure that brokerage tenant data remains fully isolated and immune to cross-tenant leak vectors.
* **Streamlined Co-Broking:** Built-in shared brokerage boards allow agents to advertise buyer needs and listings internally to other brokers without compromising client confidentiality.
* **Interactive CRM Funnels:** Digitizes the brokerage pipeline from onboarding to site visits, negotiations, and closed deals, with automated audit trails.

---

## 🏛️ System Architecture & Tenant Isolation

DealFlow CRM employs a strict **Dual-Layer Multi-Tenant Security** model to ensure complete data isolation between brokerages (tenants):

```
       ┌─────────────────────────────────────────────────────────┐
       │                 Next.js Frontend Client                 │
       └────────────────────────────┬────────────────────────────┘
                                    │
                                    ▼ [Supabase Auth JWT]
       ┌─────────────────────────────────────────────────────────┐
       │              Next.js Middleware Check                   │
       │     (Resolves JWT & enforces protected router scope)    │
       └────────────────────────────┬────────────────────────────┘
                                    │
                                    ▼
       ┌─────────────────────────────────────────────────────────┐
       │             Layer 1: Application-Level Query            │
       │     (Prisma Client singleton enforces tenant_id filters)│
       └────────────────────────────┬────────────────────────────┘
                                    │
                                    ▼ [SQL query with tenant_id]
       ┌─────────────────────────────────────────────────────────┐
       │             Layer 2: Database-Level Isolation           │
       │    (PostgreSQL Row Level Security policies active)      │
       └────────────────────────────┬────────────────────────────┘
                                    │
                                    ▼
       ┌─────────────────────────────────────────────────────────┐
       │             PostgreSQL Tenant Data Tables               │
       └─────────────────────────────────────────────────────────┘
```

1. **Application Layer Isolation**: Built into the [Prisma Client singleton](file:///c:/Users/aryve/OneDrive/Desktop/REAL%20STATE/dealflow-crm/src/lib/prisma/client.ts) to automatically query and isolate records by `tenant_id` resolved from the user session context.
2. **Database Layer Isolation**: Enforced by Postgres **Row Level Security (RLS) policies** ([rls_policies.sql](file:///c:/Users/aryve/OneDrive/Desktop/REAL%20STATE/dealflow-crm/prisma/migrations/rls_policies.sql)). A security-definer helper function resolves user context and blocks cross-tenant reads or writes directly at the query execution level.

---

## ⚙️ Tech Stack & Architectural Rationale

* **Framework:** **Next.js 16.2.6 (App Router) & React 19**
  * *Why:* Enables React Server Components (RSC) to reduce client bundles, simplifies API route definitions, and structures dynamic nested views (such as auth and dashboard spaces) efficiently.
* **ORM:** **Prisma Client 6.19.3**
  * *Why:* Offers type-safe queries, a unified schema configuration, and automated migrations. Extended with custom middleware to enforce tenant scoping.
* **Database:** **PostgreSQL 15+**
  * *Why:* Required for handling complex relational schemas, JSONB specifications, and native database Row-Level Security (RLS) policies.
* **Backend BaaS:** **Supabase Auth & Storage**
  * *Why:* Accelerates development by offering fully managed, JWT-based OAuth, email authentication, and secure, high-bandwidth storage buckets for listing photos.
* **Styling:** **Tailwind CSS & CSS Variables**
  * *Why:* Allows the design of beautiful, glassmorphic dark-mode dashboards and ensures complete responsiveness across desktop and mobile screens.
* **Form & Query State:** **React Hook Form & Nuqs**
  * *Why:* Optimizes client-side performance, preventing unnecessary re-renders during input collection and keeping search filters synchronized in the URL query string.

---

## ✨ Core Platform Capabilities

### 1. 🎯 Smart Matching Engine (5-Dimension Weighted Scoring)
* **Algorithmic Match Pipeline**: Evaluates matching candidates across 5 key dimensions:
  * Location & Locality Match (30%)
  * Budget Overlap (25%)
  * Property Type Compatibility (20%)
  * Transaction Type (Sale/Rent/Lease) (15%)
  * Area Boundaries (10%)
* **Bidirectional Matching**: Automatically maps properties matching a buyer's requirement (forward matching) and buyers matching a property listing (reverse mapping).
* **Interactive UI**: Visualizes match rankings with score gauges, parameter breakdown progress bars, and direct "Create Lead" matching action buttons.

### 2. 📋 Interactive Kanban CRM & Lead Workspace
* **Funnel Pipeline**: A responsive 7-stage drag-and-drop lead board (New Lead, Contacted, Interested, Site Visit, Negotiation, Closed Won, Closed Lost) powered by native HTML5 Drag and Drop APIs for high-performance rendering under React 19.
* **Granular Tracking**: Includes deal value calculation, lost reason logging, follow-up scheduling, and lead status change history.
* **Lead Workspace Tabs**:
  * **Activity Timeline**: Complete feed logging notes, emails, meetings, and automated events.
  * **Tasks Manager**: A checklist system supporting prioritization and status updates.
  * **Internal Notes**: Inline text area supporting note pinning.
  * **Site Visit scheduler**: Schedules property tours and collects customer feedback/ratings.

### 3. 🏡 Property Listings & Galleries
* **Multi-Tab Forms**: Add or edit properties with clean inputs for pricing, floor details, furnishing, amenities list, location parameters, and image URL galleries.
* **Responsive Media Viewer**: Glassmorphic preview gallery featuring fullscreen lightboxes.
* **Dynamic Search & Filtering**: Multi-param query filters targeting localities, property categories, price ranges, and furnishing states.

### 4. 📊 Performance Analytics
* **Dashboard Stats**: Real-time summary cards mapping active leads, listings, requirements, and total pipeline value.
* **High-Performance Charts**: Visualizes monthly conversion funnels, activity timelines, and active broker leaderboards using responsive, lightweight custom components to bypass heavy library bundle sizes.

### 5. 👥 Broker Collaboration Hub
* **Shared Activity Feed**: Real-time collaborative panel displaying notifications of new brokerage listings, buyer requirements, and co-broker requests.
* **In-App Notification Bell**: A polling notification engine that draws alerts for match notifications and brokerage alerts.

### 6. ⚙️ Administrative Dashboards
* **Tenant Limits & Features**: Super Admins can set maximum user limits, maximum properties, and toggle experimental feature flags (e.g. Matching Engine V2) per brokerage.
* **User Management**: View active users, update team roles (Brokerage Admin, Broker, Agent, Client), and manage account deactivations.
* **Moderation Panel**: Review flagged listings and approve/archive properties violating guidelines.

---

## 📂 Project Structure

```
dealflow-crm/
├── .github/workflows/       # GitHub CI action files
│   └── ci.yml               # Automated compile, lint, and build test runner
├── prisma/
│   ├── migrations/
│   │   └── rls_policies.sql # Row Level Security policy definitions
│   ├── schema.prisma        # Complete database models (14 models)
│   └── seed.js              # Mock data database seeder
├── public/                  # Static assets & public images
└── src/
    ├── app/
    │   ├── (auth)/          # Authentication & onboarding wizard screens
    │   ├── (dashboard)/     # Main application core views
    │   │   ├── admin/       # Super admin control panels
    │   │   ├── analytics/   # Analytics & KPI dashboards
    │   │   ├── crm/         # Lead workspace & Kanban pipeline
    │   │   ├── properties/  # Listings explorer, additions, and edits
    │   │   ├── requirements/# Buyer requirements explorer & manager
    │   │   └── settings/    # Profile, team, & appearance controllers
    │   ├── api/             # 14 REST API endpoint routes
    │   ├── globals.css      # Core Tailwind styling & custom glassmorphism components
    │   └── middleware.ts    # Route guard securing paths & tenant extraction
    ├── components/
    │   ├── ui/              # shadcn/ui custom design system primitives
    │   └── shared/          # Shared components (page-headers, KPI cards)
    ├── lib/
    │   ├── prisma/client.ts # Cache-enabled Prisma Client wrapper
    │   ├── supabase/        # Supabase config, clients, & middleware helpers
    │   └── constants.ts     # Global states, enums, & label systems
    └── services/            # Centralized business logic & database managers
```

---

## 🛠️ Step-by-Step Local Setup Guide

Follow these steps to run DealFlow CRM on your local machine:

### 1. Clone the Repository & Install Dependencies
```bash
git clone https://github.com/aryveersrivastava/dealflow-crm.git
cd dealflow-crm
npm install
```

### 2. Configure Environment Variables (`.env`)
Create a `.env` file in the root directory:
```env
# Supabase Project Connection Details
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# Database Connections (Compatible with Neon or Supabase DB)
DATABASE_URL="postgresql://postgres.xxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"

# App Settings
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="DealFlow CRM"
```
> [!NOTE]
> You can set up a free PostgreSQL database on [Supabase](https://supabase.com) or [Neon](https://neon.tech) in under 2 minutes.

### 3. Push Database Schema
Compile the Prisma models and create the tables in your database:
```bash
npx prisma db push
```

### 4. Enable Row Level Security (RLS)
Execute the SQL statements in [rls_policies.sql](file:///c:/Users/aryve/OneDrive/Desktop/REAL%20STATE/dealflow-crm/prisma/migrations/rls_policies.sql) in your database query editor (e.g. Supabase SQL Editor) to enforce tenant level isolation.

### 5. Seed Mock Data
Populate the tables with brokerage firms, agent profiles, listings, buyer requirements, and matched pipeline deals:
```bash
node prisma/seed.js
```

### 6. Start the Development Server
```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000) to review the platform.

---

## 🚀 Pre-Deployment Checklist

Before deploying the platform live to **Vercel** or **Cloud Run**:
1. Confirm all environment variables are added under project settings.
2. In Supabase storage, ensure a public bucket named `property-images` is created to handle listing media.
3. Configure authentication redirect URLs in the Supabase Auth panel to match your production domain (`https://your-domain.com/auth/callback`).
