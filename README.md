# TakuraBid — Digital Freight Marketplace

![Next.js](https://img.shields.io/badge/Framework-Next.js_16-000000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/Language-TypeScript_5.9-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/UI_Runtime-React_19-61DAFB?logo=react&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS_3.4-38B2AC?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Database-Supabase_PostgreSQL-3ECF8E?logo=supabase&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-blue)
![Status](https://img.shields.io/badge/Status-In_Development-yellow)

---

## Overview

**TakuraBid** is a full-stack digital freight marketplace engineered to bridge the gap between cargo owners and professional truck drivers across Zimbabwe's logistics sector. The platform operationalises a transparent, competitive bidding model — clients post freight loads with detailed cargo specifications, and drivers submit itemised rate proposals in real time. Upon bid acceptance, the system automatically provisions a job contract, activates a bidirectional messaging channel between the two parties, and exposes delivery progress tracking through a role-partitioned dashboard interface.

The platform is purpose-built to address systemic inefficiencies in informal freight procurement: opaque pricing, unverified driver credentials, and the absence of a structured digital marketplace for domestic haulage. TakuraBid enforces verified driver profiles, structured bid auditing, analytics reporting, and a complete load lifecycle from posting through completion.

> Developed as part of the **HIT200 Software Engineering Project** — Harare Institute of Technology

---

## System Architecture

TakuraBid is implemented as a **monolithic full-stack Next.js application** using the App Router paradigm introduced in Next.js 13 and matured through version 16. There is no separate backend service; all server-side logic is handled through Next.js **Route Handlers** co-located with the application under `src/app/api/`. This eliminates cross-origin complexity, simplifies deployment, and enables server-side data access within the same process as the UI rendering layer.

```
Client Browser
     |
     | HTTPS (same-origin fetch / navigation)
     |
Next.js 16 App Router (Node.js Runtime)
     |
     |--  /src/app/(pages)/        React 19 Client Components — interactive UI
     |--  /src/app/api/(routes)/   Route Handlers — REST endpoints, auth, DB access
     |--  /src/middleware.ts        Edge Middleware — cookie-based auth gate
     |
     | Supabase SDK (REST + PostgREST)
     |
Supabase Hosted PostgreSQL
     |--  users       (clients + drivers, role-partitioned)
     |--  loads       (freight postings with status lifecycle)
     |--  bids        (driver proposals against loads)
     |--  jobs        (accepted contracts, driver-confirmed)
     |--  messages    (job-scoped messaging threads)
     |--  direct_messages  (user-to-user DMs)
     |--  notifications    (system event notifications)
     |--  reviews     (post-completion ratings)
```

### Authentication Model

TakuraBid implements **custom cookie-based session management** rather than Supabase Auth or any JWT token exchange. On sign-in, the server queries the `users` table by credential match and, upon success, the client persists the authenticated `user_id` UUID in both `localStorage` and a `SameSite=Lax` HTTP cookie (`takura_user`). This cookie is read by the Edge Middleware on every inbound request to enforce route-level access control, and is also consumed by API Route Handlers via the `NextRequest.cookies` interface for per-request identity resolution.

The `AuthProvider` React Context component manages client-side auth state and re-hydrates the session cookie on every page mount from `localStorage`, ensuring the server-side cookie remains current across navigation and page refresh events.

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|:------|:-----------|:--------|:--------|
| **Application Framework** | Next.js (App Router) | 16.1.4 | Full-stack server + client rendering, API route handlers, Edge Middleware |
| **UI Runtime** | React | 19.2.3 | Client Component interactivity, Context API state management |
| **Language** | TypeScript | 5.9.3 | End-to-end static typing across server and client code |
| **Styling** | Tailwind CSS | 3.4.19 | Utility-first CSS framework; custom component classes defined in `globals.css` |
| **Database** | Supabase PostgreSQL | Latest | Hosted PostgreSQL with PostgREST auto-generated REST API layer |
| **Database Client** | Supabase JS SDK | 2.97.0 | Typed query builder for PostgreSQL via PostgREST |
| **Build Tooling** | Next.js SWC Compiler | — | Rust-based transpilation and bundling (replaces Babel/Webpack) |
| **Linting** | ESLint + TypeScript ESLint | 9.x | Static analysis, type-aware lint rules |
| **CSS Post-processing** | PostCSS + Autoprefixer | 8.x / 10.x | Cross-browser CSS compatibility |

---

## Database Schema

The PostgreSQL schema defines eight tables with strict relational integrity through foreign key constraints. Row-Level Security (RLS) is disabled across all tables; access control is enforced exclusively at the application layer via role-checked Route Handlers.

### Core Tables

| Table | Primary Key | Description |
|:------|:------------|:------------|
| `users` | `user_id UUID` | Unified table for both CLIENT and DRIVER roles. Role-specific fields (e.g., `driver_ranking`, `company_name`) are nullable for the non-applicable role. |
| `loads` | `load_id TEXT` | Freight postings created by CLIENT users. Status progresses through: `In Bidding` → `Assigned` → `In Transit` → `Completed`. |
| `bids` | `bid_id UUID DEFAULT gen_random_uuid()` | Driver-submitted rate proposals against a specific load. Constrained to one bid per driver per load. |
| `jobs` | `job_id TEXT` | Contracts provisioned automatically upon CLIENT bid acceptance. Requires DRIVER confirmation before activation. |
| `messages` | `message_id UUID DEFAULT gen_random_uuid()` | Job-scoped communication thread between the assigned driver and client. |
| `direct_messages` | `dm_id UUID DEFAULT gen_random_uuid()` | Unrestricted user-to-user direct messaging, independent of job assignment. |
| `notifications` | `notification_id UUID DEFAULT gen_random_uuid()` | System-generated event notifications per user. |
| `reviews` | `review_id UUID DEFAULT gen_random_uuid()` | Bidirectional post-completion ratings between drivers and clients. |

### Status Lifecycles

```
LOAD:  In Bidding  →  Assigned  →  In Transit  →  Completed
BID:   Pending     →  Accepted  |  Rejected
JOB:   Pending     →  Active    →  In Transit  →  Completed
```

### Primary Key Generation Strategy

Text-keyed tables (`loads`, `jobs`) do not carry a database-level DEFAULT and require application-side key generation prior to `INSERT`. UUID-keyed tables (`bids`, `messages`, etc.) use `gen_random_uuid()` or explicit `crypto.randomUUID()` generation at the application layer.

---

## Application Structure

```
src/
├── app/
│   ├── api/                         # All REST Route Handlers (server-only)
│   │   ├── analytics/
│   │   │   ├── client/route.ts      # Client KPI aggregation endpoint
│   │   │   └── driver/route.ts      # Driver earnings and performance endpoint
│   │   ├── bids/
│   │   │   ├── route.ts             # POST — submit bid (DRIVER)
│   │   │   ├── my/route.ts          # GET — driver's bid on a specific load
│   │   │   └── [bidId]/accept/      # POST — accept bid, provision job (CLIENT)
│   │   ├── conversations/
│   │   │   ├── route.ts             # GET — list job conversation threads
│   │   │   └── [jobId]/route.ts     # GET — fetch messages for a job
│   │   ├── direct-messages/
│   │   │   ├── route.ts             # GET/POST — DM conversations
│   │   │   └── [recipientId]/route.ts  # GET — message thread with specific user
│   │   ├── job-offers/route.ts      # POST — client direct offer to driver
│   │   ├── jobs/
│   │   │   ├── my/route.ts          # GET — driver's active and completed jobs
│   │   │   └── [jobId]/accept/      # POST — driver confirms job (DRIVER)
│   │   ├── loads/
│   │   │   ├── route.ts             # POST — create load (CLIENT)
│   │   │   ├── available/route.ts   # GET — load board (public, DRIVER)
│   │   │   ├── my/route.ts          # GET — client's posted loads
│   │   │   └── [loadId]/route.ts    # GET — single load with client profile join
│   │   ├── messages/route.ts        # POST — send job message
│   │   └── users/profile/route.ts   # GET/PUT — profile read and update
│   │
│   ├── auth/
│   │   ├── login/page.tsx           # Sign-in form
│   │   └── signup/page.tsx          # Registration with role selection
│   │
│   ├── client/                      # CLIENT-role pages
│   │   ├── analytics/page.tsx       # Shipment cost and performance analytics
│   │   ├── chat/page.tsx            # Messaging hub
│   │   ├── dashboard/page.tsx       # Client overview dashboard
│   │   ├── loads/page.tsx           # Posted loads management
│   │   ├── post-load/page.tsx       # Load creation wizard
│   │   └── profile/page.tsx         # Client profile editor
│   │
│   ├── driver/                      # DRIVER-role pages
│   │   ├── analytics/page.tsx       # Earnings and performance analytics
│   │   ├── chat/page.tsx            # Messaging hub
│   │   ├── dashboard/page.tsx       # Driver overview dashboard
│   │   ├── jobs/page.tsx            # Active and completed jobs
│   │   ├── loads/
│   │   │   ├── page.tsx             # Public load board
│   │   │   └── [id]/page.tsx        # Load detail and bid submission form
│   │   └── profile/page.tsx         # Driver profile editor
│   │
│   ├── layout.tsx                   # Root layout — AuthProvider injection
│   └── page.tsx                     # Landing page
│
├── components/
│   ├── layout/DashboardLayout.tsx   # Role-aware sidebar + header shell
│   └── providers/AuthProvider.tsx   # Global auth context (React Context API)
│
├── lib/
│   ├── queries/
│   │   ├── auth.ts                  # getCurrentUser() — cookie-to-profile resolution
│   │   └── loads.ts                 # Parameterised query functions for loads, jobs, messages
│   ├── supabase/
│   │   ├── client.ts                # Browser-side Supabase singleton
│   │   └── server.ts                # Server-side Supabase factory (per-request)
│   └── types/database.ts            # Full TypeScript type definitions for all DB entities
│
├── middleware.ts                     # Edge Middleware — auth cookie enforcement
└── styles/globals.css               # Global Tailwind base + custom component utilities
```

---

## Key Features

### Load Management
- Clients create freight postings with structured metadata: cargo type, weight, origin/destination cities, distance, budget, pickup and delivery dates, urgency classification (`Standard` / `Urgent`), and an optional requirements array.
- Application-generated `LOAD{timestamp}` primary keys prevent collision without requiring a database sequence.

### Competitive Bidding System
- Drivers browse the public load board and submit bid proposals specifying a USD rate and a cover message.
- The server enforces a single-bid-per-driver constraint per load via a uniqueness check prior to insertion.
- Clients review all submitted bids and accept one; acceptance automatically rejects all competing bids, marks the load as `Assigned`, and provisions a `Pending` job record.

### Job Lifecycle and Confirmation
- Jobs require explicit driver acceptance before transitioning to `Active` status, providing a two-step confirmation model that prevents involuntary job assignment.
- Clients may also bypass the bidding process entirely via the direct job-offer endpoint (`POST /api/job-offers`), creating a `Pending` job directly against a selected driver.

### Messaging
- Job-scoped messages (`/api/messages`) are threaded to the associated `job_id` and restricted to the two parties on the contract.
- Direct messages (`/api/direct-messages`) permit unrestricted user-to-user communication independent of any job relationship.

### Analytics Dashboards
- Driver analytics aggregate earnings, total kilometres driven, bid acceptance rate, weekly earnings distribution, profile views, and clicks.
- Client analytics compute total freight expenditure, on-time delivery rate, route volume distribution, monthly cost trends, and average cost per kilometre.

### Role-Partitioned Access Control
- The Edge Middleware (`middleware.ts`) intercepts all non-static requests and enforces the presence of a valid `takura_user` session cookie, returning HTTP 401 for API routes and redirecting page routes to the login screen.
- Individual Route Handlers perform secondary role validation — `getCurrentUser(req)` resolves the authenticated user from `req.cookies` and confirms the expected role before executing any database operation.

---

## API Reference

| Method | Endpoint | Role | Description |
|:-------|:---------|:-----|:------------|
| `POST` | `/api/loads` | CLIENT | Create a freight load posting |
| `GET` | `/api/loads/available` | Public | Retrieve all loads with status `In Bidding` |
| `GET` | `/api/loads/my` | CLIENT | Retrieve loads posted by the authenticated client |
| `GET` | `/api/loads/[loadId]` | Public | Retrieve a single load with client profile join |
| `POST` | `/api/bids` | DRIVER | Submit a bid on an open load |
| `GET` | `/api/bids/my?loadId=` | DRIVER | Retrieve the driver's existing bid for a load |
| `POST` | `/api/bids/[bidId]/accept` | CLIENT | Accept a bid and provision a job |
| `POST` | `/api/jobs/[jobId]/accept` | DRIVER | Confirm a job offer and set status to `Active` |
| `GET` | `/api/jobs/my` | DRIVER | Retrieve the driver's job history |
| `POST` | `/api/job-offers` | CLIENT | Send a direct job offer to a specific driver |
| `POST` | `/api/messages` | AUTH | Post a message within a job thread |
| `GET` | `/api/conversations` | AUTH | List all job-based conversation threads |
| `GET` | `/api/conversations/[jobId]` | AUTH | Retrieve messages for a specific job |
| `GET/POST` | `/api/direct-messages` | AUTH | List DM conversations or send a DM |
| `GET` | `/api/direct-messages/[recipientId]` | AUTH | Fetch message thread with a specific user |
| `GET/PUT` | `/api/users/profile` | AUTH | Read or update the authenticated user's profile |
| `GET` | `/api/analytics/driver` | DRIVER | Retrieve driver performance analytics |
| `GET` | `/api/analytics/client` | CLIENT | Retrieve client shipment analytics |

---

## Local Development

### Prerequisites

- Node.js 18 or later
- A Supabase project with the schema applied (`supabase_schema.sql` at repository root)

### Installation

```bash
# Clone the repository
git clone https://github.com/Nqobileee/Takura-Bid.git
cd Takura-Bid

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application is served at `http://localhost:3000`.

### Available Scripts

| Command | Description |
|:--------|:------------|
| `npm run dev` | Start Next.js development server with hot reload |
| `npm run build` | Compile and bundle for production |
| `npm run start` | Run the production build locally |
| `npm run lint` | Execute ESLint with Next.js rule configuration |
| `npm run type-check` | Run TypeScript compiler in check-only mode |

### Database Setup

Execute `supabase_schema.sql` in the Supabase SQL Editor to provision all tables, indexes, enumerated types, triggers, and sample data. The schema includes:

- 10 sample DRIVER accounts
- 10 sample CLIENT accounts
- 20 sample freight loads at various lifecycle stages
- 30 sample bids across open loads
- 10 jobs with associated message threads and reviews

All sample accounts use the password `password123`.

---

## Team

| Full Name | Role |
|:----------|:-----|
| Edith N. Muyambiri | Frontend and Backend Development |
| Princess B. Kwaniya | Database Architecture and AI Models |
| Matipa Brave Machangu | Documentation and Testing |
| Nyasha Nyekete | Documentation and Testing |

---

## Repository

**GitHub:** [https://github.com/Nqobileee/Takura-Bid](https://github.com/Nqobileee/Takura-Bid)

---

## License

This project is licensed under the **ISC License**.

---

*TakuraBid — Structuring Zimbabwe's freight sector through transparent, technology-driven logistics.*
