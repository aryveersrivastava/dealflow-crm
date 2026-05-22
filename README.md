# ⚡ DealFlow CRM
### Enterprise-Grade Multi-Tenant Real Estate Deal Infrastructure & CRM SaaS

[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2.4-blue?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.19.3-indigo?style=flat-square&logo=prisma)](https://prisma.io)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20Storage-emerald?style=flat-square&logo=supabase)](https://supabase.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-blue?style=flat-square&logo=postgresql)](https://www.postgresql.org)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-darkgreen?style=flat-square&logo=github-actions)](https://github.com/features/actions)

DealFlow CRM is a complete, production-grade, multi-tenant Real Estate Deal Infrastructure platform and CRM SaaS designed for modern, high-velocity real estate brokerages. Far beyond a simple listing portal, DealFlow CRM digitizes the entire lifecycle of real estate transactions—orchestrating buyer requirements, executing complex algorithmic property matching, driving interactive Kanban pipelines, managing broker collaboration, and maintaining immutable audit trails.

---

## 🌎 The Real-World Problem Solved

Real estate transactions are highly complex, multi-party deals characterized by high transaction values and long sales cycles. Traditional real estate operations suffer from severe operational bottlenecks:

1. **Information Asymmetry & Data Silos:** Agents manage properties in spreadsheets while buyer requirements live in chat histories or notebooks. Important details get lost, and matching properties to buyers is done manually from memory.
2. **Weak Multi-Tenant Data Isolation:** Many multi-tenant CRMs isolate data purely at the application layer. A single bug in a database query can expose sensitive client requirements, pricing models, or lead notes to competing brokerages.
3. **Inefficient Co-Broking & Collaboration:** Real estate agents frequently co-broke deals (collaborating with agents from other brokerages), but lack a secure, structured mechanism to announce new properties or match listings without leaking client details.
4. **Poor Pipeline Visibility:** Brokerage managers lack real-time visibility into the status of active deals, scheduled site visits, negotiations, and agent performance, leading to inaccurate revenue forecasting.

### How DealFlow CRM Helps:
* **The Smart Matching Engine** automatically maps buyer requirements against active listings in real-time, removing manual matching overhead.
* **Dual-Layer Tenant Isolation** guarantees that customer databases, pricing, and notes are securely isolated at both the application query level and database level using PostgreSQL Row-Level Security (RLS).
* **Interactive Kanban Pipelines** digitize broker workflows, providing managers and agents with visual progress, deal values, and historical audit logs.
* **The Collaboration Hub** acts as an internal network for brokerages to co-broke securely, sharing properties and buyer needs without exposing client identities.

---

## 🏛️ System Architecture & Tenant Isolation

To meet the compliance requirements of elite enterprise brokerages, DealFlow CRM implements a **Dual-Layer Tenant Isolation Security Model**:

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

1. **Application-Level Isolation:** Integrated directly into the [Prisma Client singleton](file:///src/lib/prisma/client.ts). Every database query is automatically scoped to the active user's `tenant_id` resolved from their Supabase JWT session, preventing cross-tenant data leaks.
2. **Database-Level Isolation:** Powered by PostgreSQL **Row Level Security (RLS)** ([rls_policies.sql](file:///prisma/migrations/rls_policies.sql)). Policies restrict read/write access to rows where `tenant_id` matches the tenant ID resolved from the active user's context.

---

## ⚙️ Tech Stack & Architectural Rationale

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 16.2.6 (App Router) & React 19** | Empowers server-side rendering (SSR) for fast initial loads, dynamic API routes, and strict routing layout structures. |
| **Database ORM** | **Prisma ORM 6.19.3** | Delivers developer productivity with fully-typed database client schemas, autocompletion, and robust migrations. |
| **Database Engine** | **PostgreSQL 15+** | Needed to support relational schemas, JSONB columns for property metadata, and native database Row-Level Security (RLS). |
| **Identity & Storage** | **Supabase Auth & Storage** | Provides secure, JWT-based user authentication, role-based session tokens, and scalable storage buckets for listing media. |
| **Styling & Theme** | **Tailwind CSS & CSS Variables** | Enables responsive designs and glassmorphic user interfaces (supporting light and dark modes). |
| **State Management** | **React Hook Form & Nuqs** | Prevents unwanted re-renders using uncontrolled inputs for forms and manages search states directly in URL query parameters. |

---

## ✨ Core Platform Capabilities

### 1. 🎯 Smart Matching Engine (5-Dimension Weighted Scoring)
* **Dynamic Algorithmic Match Pipeline:** Evaluates properties against buyer requirements based on:
  * **Location & Locality Match (30%):** Exact match or proximity mapping.
  * **Budget Overlap (25%):** Pricing boundaries, ensuring property price fits within the buyer's range.
  * **Property Type Compatibility (20%):** Flat, Villa, Plot, Office Space, etc.
  * **Transaction Type (15%):** Sale, Rent, or Lease.
  * **Area Boundaries (10%):** Minimum and maximum built-up/carpet area matching.
* **Bidirectional Matching:**
  * **Forward Matching:** Find properties matching a buyer's requirement.
  * **Reverse Matching:** Find buyers matching a newly listed property.
* **Score Visualization:** Visualizes match rankings with score gauges, parameter breakdown progress bars, and direct "Create Lead" matching action buttons.

### 2. 📋 Interactive Kanban CRM & Lead Workspace
* **Custom Drag-and-Drop Pipeline:** A 7-stage pipeline (`NEW_LEAD`, `CONTACTED`, `INTERESTED`, `SITE_VISIT`, `NEGOTIATION`, `CLOSED_WON`, `CLOSED_LOST`) utilizing native HTML5 Drag and Drop APIs to ensure high performance and avoid React 19 library conflicts.
* **Lead Workspace Tabs:**
  * **Activity Timeline:** Track notes, system alerts, status transitions, and follow-ups.
  * **Tasks Manager:** Create, prioritize, and assign actionable check-items for each lead.
  * **Internal Notes:** Pin and manage notes for team collaboration.
  * **Site Visit Scheduler:** Schedule property tours and collect customer ratings and feedback.

### 3. 🏡 Property Listing & Gallery Management
* **Advanced Forms:** Multi-tab wizards for property characteristics, including pricing parameters, specifications, location details, and image uploads.
* **Interactive Media Viewer:** Glassmorphic image gallery supporting lightboxes.
* **Dynamic Filters:** URL-bound filters for locality, transaction type, property type, price, and carpet area.

### 4. 📊 Performance Analytics
* **Dashboard KPIs:** Real-time totals for active leads, properties, buyer requirements, and total pipeline value.
* **Lightweight Charts:** Monthly conversion funnels, activity trends, and broker performance rankings.

### 5. 👥 Broker Collaboration Hub
* **Co-Broke Feed:** Real-time brokerage feed displaying announcements of new listings and buyer requirements.
* **In-App Notification Bell:** A polling notification system alert center for real-time matches and brokerage events.

### 6. ⚙️ Administrative Control Panels
* **Tenant Quotas:** Configure maximum user, property, and requirement limits per brokerage.
* **User Management:** View team structures, deactivate accounts, and update roles (`Super Admin`, `Brokerage Admin`, `Broker`, `Agent`, `Client`).
* **Listing Moderation:** Audit flagged listings and approve or archive properties.

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
    │   │   └── settings/    # Profile, brokerage, & appearance controllers
    │   ├── api/             # 14 REST API endpoint routes
    │   ├── globals.css      # Core Tailwind styling & custom glassmorphism components
    │   └── middleware.ts    # Route guard securing paths & tenant extraction
    ├── components/
    │   ├── ui/              # shadcn/ui custom design system primitives
    │   └── shared/          # Shared components (page-headers, KPI cards)
    ├── lib/
    │   ├── prisma/client.ts # Cache-enabled Prisma Client wrapper
    │   ├── supabase/        # Supabase config, clients, and middleware helpers
    │   └── constants.ts     # Global states, enums, & label systems
    └── services/            # Centralized business logic & database managers
```

---

## 🛠️ Step-by-Step Local Setup Guide

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

### 3. Push Database Schema
Sync database tables with Prisma schema:
```bash
npx prisma db push
```

### 4. Enable Row Level Security (RLS)
Execute the SQL statements inside [rls_policies.sql](file:///prisma/migrations/rls_policies.sql) in your database query editor (e.g. Supabase SQL Editor) to enforce tenant level isolation.

### 5. Seed Mock Data
Populate tables with default brokerage firms, agent profiles, listings, requirements, pipeline leads, and checklist items:
```bash
node prisma/seed.js
```

### 6. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🚀 Pre-Deployment Checklist

Before deploying the platform live to **Vercel** or **Cloud Run**:
1. Confirm all environment variables are added under project settings.
2. In Supabase storage, ensure a public bucket named `property-images` is created to handle listing media.
3. Configure authentication redirect URLs in the Supabase Auth panel to match your production domain (`https://your-domain.com/auth/callback`).
