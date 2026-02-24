# Software Requirements Specification (SRS)

## TakuraBid — Digital Freight Marketplace

**Version:** 1.0  
**Date:** February 24, 2026  
**Application URL:** https://takura-bid-six.vercel.app/  
**Status:** Active Development  

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [System Architecture](#3-system-architecture)
4. [User Roles and Personas](#4-user-roles-and-personas)
5. [Functional Requirements](#5-functional-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Data Requirements](#7-data-requirements)
8. [External Interface Requirements](#8-external-interface-requirements)
9. [UI/UX Specifications](#9-uiux-specifications)
10. [Security Requirements](#10-security-requirements)
11. [Assumptions and Constraints](#11-assumptions-and-constraints)
12. [Appendices](#12-appendices)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) document provides a comprehensive description of the TakuraBid digital freight marketplace platform. It details the functional and non-functional requirements, system architecture, user interfaces, and data models necessary to build, maintain, and extend the system. This document serves as the authoritative reference for developers, testers, project managers, and stakeholders involved in the TakuraBid project.

### 1.2 Scope

TakuraBid is a web-based digital freight marketplace designed to connect cargo shippers (clients) with transport drivers across Zimbabwe and the broader African continent. The platform facilitates the entire logistics lifecycle — from load posting and competitive bidding through to shipment tracking, communication, and performance analytics.

The system encompasses two distinct portals (Client and Driver), each with role-specific functionality including load management, job scheduling, real-time messaging, route optimization, and comprehensive analytics dashboards.

### 1.3 Definitions and Acronyms

| Term | Definition |
|------|-----------|
| **Client** | A business or individual that needs goods transported (shipper/consignor) |
| **Driver** | A transport provider who bids on and fulfills delivery jobs |
| **Load** | A shipment request posted by a client, including cargo details, route, and budget |
| **Bid** | A proposal submitted by a driver in response to a posted load |
| **Job** | An accepted bid that becomes an active transport assignment |
| **Load Board** | A marketplace view where drivers browse and bid on available loads |
| **SRS** | Software Requirements Specification |
| **DXA** | Device-independent units used in document formatting |
| **API** | Application Programming Interface |
| **CRUD** | Create, Read, Update, Delete |
| **UI** | User Interface |
| **UX** | User Experience |

### 1.4 References

- TakuraBid live application: https://takura-bid-six.vercel.app/
- Client Portal: https://takura-bid-six.vercel.app/client
- Driver Portal: https://takura-bid-six.vercel.app/driver

### 1.5 Document Overview

Section 2 provides a high-level product description and context. Sections 3–4 cover architecture and user roles. Section 5 contains detailed functional requirements organized by module. Sections 6–10 address non-functional, data, interface, UI/UX, and security requirements. Sections 11–12 capture assumptions, constraints, and appendices.

---

## 2. Overall Description

### 2.1 Product Perspective

TakuraBid is a standalone web application operating as a two-sided marketplace. It sits at the intersection of logistics technology and procurement, specifically tailored for the African market with localization for Zimbabwean routes, currency considerations, and regional logistics corridors. The platform draws inspiration from established freight marketplaces while addressing unique challenges of the African transport sector, including route optimization across the region's specific road networks, support for diverse cargo types (agricultural, construction, mining, tourism), and verified payment systems.

### 2.2 Product Features Summary

The platform is organized around six core capability areas:

**Real-Time Bidding** — Live auction-style participation enabling drivers to competitively bid on posted loads with instant visibility into competitor activity.

**Smart Matching** — AI-driven algorithms that connect clients with optimal transport providers based on cargo type, driver specialization, ratings, availability, and route expertise.

**Load & Job Management** — End-to-end lifecycle management from load posting through delivery completion, including status tracking, progress updates, and invoicing.

**Communication System** — Real-time in-platform messaging between clients and drivers tied to specific jobs for contextual, organized conversations.

**Analytics & Insights** — Comprehensive dashboards for both clients and drivers providing performance metrics, cost analysis, earnings tracking, and operational efficiency data.

**Route Optimization** — Intelligent route planning with multi-stop optimization, fuel savings calculations, and estimated delivery time projections.

### 2.3 User Classes and Characteristics

The platform serves two primary user classes:

**Clients (Shippers)** are businesses or individuals who need to transport goods. They range from small businesses shipping consumer goods to large enterprises with mining or construction logistics needs. Clients are expected to have basic web literacy and familiarity with logistics terminology. Examples from the platform include ABC Construction, Farm Fresh Zimbabwe, Safari Lodge Group, Retail Plus Zimbabwe, and Zimbabwe Mining Corp.

**Drivers (Transport Providers)** are professional transport operators with specialized equipment and expertise. They may specialize in specific cargo types such as heavy equipment, agricultural products, liquid/chemical transport, or express delivery. Drivers are expected to have mobile/web access and be comfortable with digital bidding and job management workflows.

### 2.4 Operating Environment

The application is deployed on Vercel's serverless platform and is accessible via modern web browsers on desktop and mobile devices. The frontend is built as a responsive web application optimized for both large screens and mobile viewports.

### 2.5 Design and Implementation Constraints

- The application must support Zimbabwean route networks and regional corridors (Harare, Bulawayo, Gweru, Mutare, Masvingo, Victoria Falls, Chinhoyi, Kariba).
- Currency handling must accommodate USD as the primary transaction currency (consistent with Zimbabwe's multi-currency system).
- The system must handle distance measurements in kilometers.
- Weight measurements use metric tons.

---

## 3. System Architecture

### 3.1 High-Level Architecture

TakuraBid follows a client-server architecture with a modern web frontend deployed on Vercel's edge network. The system is composed of the following layers:

**Presentation Layer** — Responsive web application with distinct Client and Driver portal interfaces, shared navigation components, and role-based view rendering.

**Application Layer** — Server-side business logic handling load management, bidding engine, matching algorithms, messaging, analytics computation, and route optimization.

**Data Layer** — Persistent storage for user profiles, loads, bids, jobs, messages, analytics data, and system configuration.

**Integration Layer** — External service connections for mapping/routing, payment processing, and notification delivery.

### 3.2 Module Decomposition

| Module | Description |
|--------|-------------|
| Authentication & Authorization | User registration, login, role-based access control |
| Load Management | Load creation, editing, status tracking, filtering |
| Bidding Engine | Bid submission, comparison, acceptance, rejection |
| Job Management | Job lifecycle from assignment through completion |
| Driver Marketplace | Driver discovery, profiles, ratings, specializations |
| Messaging System | Real-time job-linked chat between clients and drivers |
| Analytics Engine | Data aggregation, metric calculation, visualization |
| Route Optimization | Multi-stop route planning, distance/time calculation |
| Payment Processing | Budget management, invoicing, payment verification |
| Notification System | Alerts for bids, messages, status changes |

### 3.3 Deployment Architecture

The application is hosted on Vercel (https://takura-bid-six.vercel.app/) using serverless functions for backend logic and edge-optimized static delivery for frontend assets. This provides automatic scaling, global CDN distribution, and zero-downtime deployments.

---

## 4. User Roles and Personas

### 4.1 Client Role

**Access Point:** Client Portal (https://takura-bid-six.vercel.app/client)

**Navigation Menu:** Find Drivers, Messages, My Loads, Analytics

**Capabilities:**
- Post new loads with cargo details, route, budget, and requirements
- Browse and hire transport drivers from the driver marketplace
- View and compare incoming bids on posted loads
- Assign drivers to loads and manage active shipments
- Track load status (In Bidding → Assigned → In Transit → Completed)
- Communicate with assigned drivers via job-linked messaging
- View shipping analytics including costs, delivery performance, and route volumes
- Filter and search through load history

### 4.2 Driver Role

**Access Point:** Driver Portal (https://takura-bid-six.vercel.app/driver)

**Navigation Menu:** Load Board, Analytics, My Jobs, Chat

**Capabilities:**
- Browse available loads on the Load Board with filtering
- Submit bids on loads matching their expertise and availability
- Manage assigned jobs through their lifecycle
- Update job progress (start job, update progress percentage)
- View schedule and availability calendar
- Access optimized route suggestions for multi-stop trips
- View performance analytics including earnings, ratings, and efficiency
- Communicate with clients via job-linked messaging
- Download invoices for completed jobs

### 4.3 System Administrator (Implied)

While not explicitly shown in the current UI, the system architecture implies an administrative role responsible for user verification, dispute resolution, platform configuration, and system monitoring.

---

## 5. Functional Requirements

### 5.1 Authentication and User Management

#### FR-AUTH-001: User Registration
The system shall allow new users to register accounts via a "Sign up" interface. Registration shall capture user role (Client or Driver), contact information, and relevant profile details.

#### FR-AUTH-002: User Login
The system shall authenticate users via a "Log in" mechanism and redirect them to their role-appropriate portal.

#### FR-AUTH-003: Role Switching
The system shall provide a role selector (Client/Driver dropdown) in the navigation bar, allowing users to view the platform from either perspective.

#### FR-AUTH-004: Driver Profile Management
Drivers shall be able to create and maintain profiles including: display name, professional title/specialization, bio/description, skill tags, equipment types, and service areas.

---

### 5.2 Load Management (Client Portal)

#### FR-LOAD-001: Post New Load
The system shall allow clients to create a new load posting with the following fields:
- **Cargo Type** (e.g., Building Materials, Agricultural Products, Consumer Goods, Tourism Equipment, Mining Equipment)
- **Weight** (in tons)
- **Origin City** (e.g., Harare, Gweru, Masvingo, Bulawayo, Chinhoyi)
- **Destination City** (e.g., Bulawayo, Mutare, Harare, Victoria Falls, Kariba)
- **Distance** (auto-calculated in km)
- **Budget** (in USD)
- **Pickup Date**
- **Delivery Date**
- **Special Requirements** (e.g., Flatbed Truck, Crane Loading, Insurance Required, Refrigerated Truck, Covered Transport, Low-Loader, etc.)
- **Trip Type** (One Way / Round Trip)
- **Urgency** (Standard / Urgent)
- **Detailed Description**

#### FR-LOAD-002: Load Status Tracking
Each load shall have one of the following statuses, progressing through the lifecycle:
- **In Bidding** — Load is posted and open for driver bids
- **Assigned** — A bid has been accepted and a driver assigned
- **In Transit** — The driver has started the delivery
- **Completed** — Delivery has been successfully completed

#### FR-LOAD-003: Load Dashboard Summary
The "My Loads" page shall display summary statistics at the top:
- Active Loads count
- Total Bids received (across all loads)
- Completed Loads count
- Total Spent (USD)

#### FR-LOAD-004: Load List View
The system shall display all loads in a card-based list view showing: route (origin → destination), status badge, cargo type, weight, budget, distance, number of bids, pickup date, delivery date, assigned driver (if applicable), load ID, and posted date.

#### FR-LOAD-005: Load Filtering
The system shall provide a "Filter by" dropdown allowing clients to filter loads by status (All Loads, In Bidding, Assigned, In Transit, Completed).

#### FR-LOAD-006: Load Actions
Each load card shall provide contextual action buttons based on status:
- **In Bidding:** "View Bids (n)" and "Manage"
- **Assigned:** "Manage"
- **In Transit:** "Track Load" and "Manage"
- **Completed:** "View Receipt" and "Manage"

#### FR-LOAD-007: Bid Viewing
The system shall allow clients to view all bids received for a specific load, including bid amount, driver profile, ratings, and any bid comments. The bid count shall be displayed on the load card (e.g., "View Bids (3)").

#### FR-LOAD-008: Driver Assignment
The system shall allow clients to accept a bid, which assigns the driver to the load and transitions the load status to "Assigned." The assigned driver's name shall be displayed on the load card (e.g., "Assigned to: Tendai Mukamuri").

---

### 5.3 Driver Marketplace (Client Portal)

#### FR-MARKET-001: Driver Discovery
The "Find Drivers" page shall display a searchable, filterable list of registered transport drivers.

#### FR-MARKET-002: Driver Profile Cards
Each driver listing shall display:
- Driver initials/avatar
- Full name
- Professional title and specialization (e.g., "Expert Heavy Equipment Transport | Professional Long-Distance Driver")
- Total earnings on platform (e.g., "$33K+ earned")
- Average rating (out of 5 stars)
- Availability status ("Available now" / "Unavailable")
- Skill/specialty tags (e.g., Heavy Equipment, Long Distance, Flatbed Transport)
- Bio/description text (truncated with overflow)

#### FR-MARKET-003: Driver Search and Filtering
The system shall provide a search bar ("Search by skills, location...") and a Filters button enabling clients to search and filter drivers by specialization, location, availability, rating, and cargo type expertise.

#### FR-MARKET-004: Hire Driver Action
Each available driver card shall display a "Hire Driver" button. Unavailable drivers shall display an "Unavailable" label instead.

#### FR-MARKET-005: Driver Specializations
The system shall support the following driver specialization categories (non-exhaustive):
- Heavy Equipment / Flatbed Transport
- Agricultural Products / Cold Chain / Refrigerated Transport
- Construction Materials / Mining Transport
- General Freight / Cross-Border / Import/Export
- Liquid Transport / Fuel & Chemical Delivery
- Express Delivery / Time-Sensitive / Medical Supplies

---

### 5.4 Load Board (Driver Portal)

#### FR-BOARD-001: Available Loads Display
The Load Board shall display all available loads that drivers can bid on, presented in a card-based list view.

#### FR-BOARD-002: Load Board Summary Statistics
The top of the Load Board shall display:
- Available Loads count
- Urgent Loads count
- Average Rate (USD)
- My Bids count

#### FR-BOARD-003: Load Card Details
Each load card on the board shall display:
- Time since posting (e.g., "Posted 2 hours ago", "Posted 30 minutes ago")
- Load title (e.g., "Building Materials Transport")
- Trip type, urgency level, distance (km), and estimated budget
- Cargo description with "more" expandable link
- Requirement tags (e.g., Flatbed Truck, Crane Loading, Insurance Required)
- Client verification status ("Payment verified" with badge)
- Client rating (stars)
- Client total spending on platform
- Route (origin → destination)
- Weight (tons)
- Number of proposals submitted
- Bookmark and favorite icons

#### FR-BOARD-004: Load Board Search and Filtering
The system shall provide a search bar ("Search by origin, destination, load type") and a Filters button for refining available loads.

#### FR-BOARD-005: Urgent Load Highlighting
Loads marked as "Urgent" shall display a prominent warning indicator ("Important upfront:") with urgency details highlighted distinctly from standard loads.

---

### 5.5 Job Management (Driver Portal)

#### FR-JOB-001: Jobs Dashboard
The "My Jobs" page shall display a comprehensive view including: schedule/availability calendar, route planning map, upcoming jobs summary, optimized route suggestions, and a detailed jobs timeline.

#### FR-JOB-002: Schedule and Availability Calendar
The system shall display a monthly calendar view highlighting dates with scheduled jobs. Drivers shall be able to view their availability across the month.

#### FR-JOB-003: Route Planning Map
The system shall display an interactive map showing the driver's upcoming job routes across Zimbabwe, with visual indicators for each stop location (Harare, Bulawayo, Victoria Falls, Mutare, Gweru, Masvingo).

#### FR-JOB-004: Optimized Route Suggestions
The system shall generate multi-stop route optimization suggestions showing:
- Recommended stop sequence
- Distance for each leg (km)
- Estimated time for each leg (hours)
- Total distance
- Total estimated time
- Fuel savings percentage

Example: "Start: Harare → Bulawayo (439km, 5.5h) → Continue: Bulawayo → Victoria Falls (440km, 5.5h) → Return: Victoria Falls → Harare via Gweru (520km, 6.5h). Total Distance: 1,399km • Est. Time: 17.5h • Fuel Savings: 15%"

#### FR-JOB-005: Upcoming Jobs Summary
The system shall display a compact summary of upcoming jobs with: route, date, distance, estimated duration, rate, and status (In Transit / Active / Pending).

#### FR-JOB-006: Jobs Timeline
The system shall display a detailed timeline of all jobs (current and historical) with the following information per job:
- Route (origin → destination)
- Status badge (In Transit / Active / Pending / Completed)
- Cargo type and weight
- Progress bar with percentage (for in-transit jobs)
- Distance (km)
- Client name
- Pickup and delivery dates
- Job ID
- Action buttons: "View Details", "Update Progress" (in-transit), "Start Job" (active), "Download Invoice" (completed)

#### FR-JOB-007: Job Status Lifecycle
Jobs shall progress through the following statuses:
- **Pending** — Job assigned but not yet started
- **Active** — Job accepted, awaiting start
- **In Transit** — Delivery in progress with trackable progress percentage
- **Completed** — Delivery finished, invoice available

#### FR-JOB-008: Progress Updates
Drivers shall be able to update delivery progress as a percentage for in-transit jobs via an "Update Progress" interface.

#### FR-JOB-009: Invoice Download
Drivers shall be able to download invoices for completed jobs.

---

### 5.6 Messaging System

#### FR-MSG-001: Job-Linked Conversations
The messaging system shall organize conversations by job, with each conversation thread linked to a specific Job ID. Messages shall display the associated Job ID (e.g., "Job: JOB001").

#### FR-MSG-002: Client Messaging Interface
The client chat page shall display:
- A left-panel message list showing all conversation threads with: driver name/avatar initials, last message preview (truncated), timestamp, job reference, online status indicator (green dot), and unread message count badge.
- A right-panel conversation view for reading and composing messages.
- An empty state prompt ("Select a conversation — Choose a conversation to start messaging with drivers") when no conversation is selected.

#### FR-MSG-003: Driver Messaging Interface
The driver chat page shall display the same layout as the client interface but with client names instead of driver names (e.g., "ABC Construction", "Farm Fresh Zimbabwe", "Safari Lodge Group").

#### FR-MSG-004: Real-Time Messaging
Messages shall be delivered in real-time without requiring page refresh. Online status indicators shall reflect current connection state.

#### FR-MSG-005: Unread Message Indicators
The system shall display unread message count badges on conversation threads (e.g., a blue "1" or "2" badge).

---

### 5.7 Analytics — Client Portal

#### FR-ANALYTICS-CLIENT-001: Shipping Analytics Dashboard
The client analytics page shall provide a comprehensive "Shipping Analytics" dashboard with the tagline "Track your logistics performance and shipping insights."

#### FR-ANALYTICS-CLIENT-002: Key Performance Indicators
The dashboard shall display top-level KPI cards:
- **Total Shipping Costs** (e.g., $15,420)
- **On-Time Delivery** percentage (e.g., 96%)
- **Total Shipments** count (e.g., 42)
- **Avg Cost/Mile** (e.g., $1.85)

#### FR-ANALYTICS-CLIENT-003: Total Shipping Costs Over Time
The system shall display a line chart showing shipping costs over a 4-week period with:
- Current month total
- Monthly average comparison
- Weekly data points

#### FR-ANALYTICS-CLIENT-004: On-Time Delivery Rate
The system shall display a bar chart showing monthly on-time delivery percentages (e.g., Oct through Feb) with:
- Current month percentage
- Target percentage threshold line

#### FR-ANALYTICS-CLIENT-005: Shipment Volume by Route/Region
The system shall display a horizontal bar chart showing shipment counts per route corridor:
- Harare → Bulawayo: 15
- Gweru → Mutare: 12
- Harare → Mutare: 8
- Bulawayo → Victoria Falls: 7

#### FR-ANALYTICS-CLIENT-006: Average Cost per Mile/Load
The system shall display a scatter plot with trend line showing cost per mile across different distances, including:
- Average cost per mile
- Cost range (min–max)
- Distance axis (miles)

#### FR-ANALYTICS-CLIENT-007: Monthly Performance Summary
The dashboard shall include a summary section with:
- Cost Savings vs Last Month (percentage)
- Average Delivery Time (days)
- Driver Satisfaction Rate (percentage)

---

### 5.8 Analytics — Driver Portal

#### FR-ANALYTICS-DRIVER-001: Driver Analytics Dashboard
The driver analytics page shall display performance metrics with the tagline "Track your performance metrics and insights."

#### FR-ANALYTICS-DRIVER-002: Key Performance Indicators
The dashboard shall display top-level KPI cards:
- **Total Earnings** (e.g., $27,000)
- **Average Rating** (e.g., 4.8)
- **Total Kilometres** (e.g., 45,200)
- **Driver Ranking** (e.g., "Top 5%")

#### FR-ANALYTICS-DRIVER-003: Profile Views and Clicks
The system shall display a dual-line chart tracking:
- Total profile views (e.g., 2,847)
- Total profile clicks (e.g., 892)
- Trend over time

#### FR-ANALYTICS-DRIVER-004: Earnings Over Time
The system shall display a bar chart showing weekly earnings with:
- Current month total
- Weekly average
- Per-week breakdown (Week 1 through Week 4)

#### FR-ANALYTICS-DRIVER-005: Load Acceptance vs. Decline Rate
The system shall display:
- Accepted count and declined count
- Donut/pie chart showing acceptance percentage (e.g., 70% accepted, 30% declined)

#### FR-ANALYTICS-DRIVER-006: Miles Driven vs. Pay Per Mile
The system shall display a scatter plot with trend line showing pay per mile across different distances, including:
- Average pay per mile
- Best pay per mile rate
- Distance axis (miles)

#### FR-ANALYTICS-DRIVER-007: Idle Time vs. Driving Time
The system shall display:
- Total driving hours (e.g., 156h)
- Total idle hours (e.g., 32h)
- Efficiency percentage (e.g., 83%)
- Stacked bar chart showing daily breakdown (Mon–Sun) of driving vs. idle time

---

### 5.9 Search Functionality

#### FR-SEARCH-001: Global Search
Both portals shall provide a global search bar in the navigation header for searching across loads, drivers, jobs, and messages.

#### FR-SEARCH-002: Contextual Search
Individual pages shall provide context-specific search functionality:
- Load Board: Search by origin, destination, load type
- Find Drivers: Search by skills, location
- My Loads: Filter by status

---

## 6. Non-Functional Requirements

### 6.1 Performance

#### NFR-PERF-001: Page Load Time
All pages shall load within 3 seconds on a standard broadband connection (10 Mbps+). Initial page load may take up to 5 seconds for cold starts on serverless infrastructure.

#### NFR-PERF-002: Real-Time Updates
Messages and status changes shall propagate to connected clients within 2 seconds of server-side processing.

#### NFR-PERF-003: Search Response Time
Search queries shall return results within 1 second for datasets up to 10,000 records.

#### NFR-PERF-004: Analytics Rendering
Analytics dashboards shall render all charts and visualizations within 3 seconds of data retrieval.

### 6.2 Scalability

#### NFR-SCALE-001: Concurrent Users
The system shall support at least 1,000 concurrent users without performance degradation.

#### NFR-SCALE-002: Data Volume
The system shall handle at least 100,000 load records, 500,000 bid records, and 1,000,000 message records.

#### NFR-SCALE-003: Horizontal Scaling
The serverless architecture on Vercel shall allow automatic horizontal scaling based on traffic demand.

### 6.3 Reliability and Availability

#### NFR-REL-001: Uptime
The system shall maintain 99.5% uptime availability, excluding scheduled maintenance windows.

#### NFR-REL-002: Data Durability
All transactional data (loads, bids, jobs, payments) shall be persisted with redundancy to prevent data loss.

#### NFR-REL-003: Error Handling
The system shall handle all errors gracefully, displaying user-friendly error messages and logging detailed error information for debugging.

### 6.4 Usability

#### NFR-USE-001: Responsive Design
The application shall be fully responsive and functional across desktop (1920px+), laptop (1366px), tablet (768px), and mobile (375px) viewports.

#### NFR-USE-002: Browser Compatibility
The application shall support the latest two major versions of Chrome, Firefox, Safari, and Edge.

#### NFR-USE-003: Accessibility
The application should conform to WCAG 2.1 Level AA guidelines for accessibility, including proper contrast ratios, keyboard navigation, and screen reader compatibility.

#### NFR-USE-004: Intuitive Navigation
Users shall be able to complete primary tasks (post a load, place a bid, send a message) within 3 clicks from the portal landing page.

### 6.5 Maintainability

#### NFR-MAINT-001: Code Quality
The codebase shall follow consistent coding standards with ESLint/Prettier configuration.

#### NFR-MAINT-002: Modular Architecture
Features shall be organized in modular, loosely-coupled components to enable independent development and testing.

#### NFR-MAINT-003: Documentation
All API endpoints shall be documented. Component interfaces shall include TypeScript type definitions.

---

## 7. Data Requirements

### 7.1 Data Entities

#### 7.1.1 User
| Field | Type | Description |
|-------|------|-------------|
| user_id | UUID | Unique user identifier |
| email | String | User email address |
| password_hash | String | Encrypted password |
| role | Enum | CLIENT, DRIVER |
| name | String | Display name |
| created_at | DateTime | Account creation timestamp |
| updated_at | DateTime | Last profile update |

#### 7.1.2 Driver Profile
| Field | Type | Description |
|-------|------|-------------|
| driver_id | UUID | References user_id |
| title | String | Professional title (e.g., "Expert Heavy Equipment Transport") |
| specialization | String | Specialization subtitle |
| bio | Text | Driver description/bio |
| total_earnings | Decimal | Cumulative platform earnings |
| average_rating | Float | Average rating (0–5) |
| total_kilometres | Integer | Total km driven on platform |
| availability_status | Enum | AVAILABLE, UNAVAILABLE |
| skill_tags | Array[String] | Specialization tags |
| payment_verified | Boolean | Payment verification status |
| total_spent | Decimal | For client-facing display of spending |

#### 7.1.3 Load
| Field | Type | Description |
|-------|------|-------------|
| load_id | String | Unique load ID (e.g., "LOAD001") |
| client_id | UUID | References user_id of posting client |
| title | String | Load title |
| cargo_type | String | Type of cargo |
| weight_tons | Float | Weight in metric tons |
| origin_city | String | Pickup city |
| destination_city | String | Delivery city |
| distance_km | Integer | Calculated route distance |
| budget_usd | Decimal | Client's budget in USD |
| pickup_date | Date | Scheduled pickup date |
| delivery_date | Date | Expected delivery date |
| trip_type | Enum | ONE_WAY, ROUND_TRIP |
| urgency | Enum | STANDARD, URGENT |
| description | Text | Detailed load description |
| requirements | Array[String] | Special requirement tags |
| status | Enum | IN_BIDDING, ASSIGNED, IN_TRANSIT, COMPLETED |
| assigned_driver_id | UUID | References driver's user_id (nullable) |
| posted_at | DateTime | Load creation timestamp |

#### 7.1.4 Bid
| Field | Type | Description |
|-------|------|-------------|
| bid_id | UUID | Unique bid identifier |
| load_id | String | References load_id |
| driver_id | UUID | References driver's user_id |
| amount_usd | Decimal | Bid amount in USD |
| message | Text | Bid proposal message |
| status | Enum | PENDING, ACCEPTED, REJECTED |
| submitted_at | DateTime | Bid submission timestamp |

#### 7.1.5 Job
| Field | Type | Description |
|-------|------|-------------|
| job_id | String | Unique job ID (e.g., "JOB001") |
| load_id | String | References load_id |
| driver_id | UUID | Assigned driver |
| client_id | UUID | Load owner |
| rate_usd | Decimal | Agreed job rate |
| status | Enum | PENDING, ACTIVE, IN_TRANSIT, COMPLETED |
| progress_percent | Integer | Delivery progress (0–100) |
| started_at | DateTime | Job start timestamp (nullable) |
| completed_at | DateTime | Job completion timestamp (nullable) |

#### 7.1.6 Message
| Field | Type | Description |
|-------|------|-------------|
| message_id | UUID | Unique message identifier |
| job_id | String | References job_id for conversation context |
| sender_id | UUID | References user_id |
| recipient_id | UUID | References user_id |
| content | Text | Message body |
| read | Boolean | Read receipt status |
| sent_at | DateTime | Message timestamp |

### 7.2 Entity Relationships

- A **Client** can post many **Loads** (1:N)
- A **Load** can receive many **Bids** (1:N)
- A **Driver** can submit many **Bids** (1:N)
- A **Load** has at most one accepted **Bid** / **Job** (1:1)
- A **Job** links one **Client** and one **Driver** (N:1 on both sides)
- **Messages** belong to a **Job** conversation thread (N:1)
- A **Driver** has one **Driver Profile** (1:1)

### 7.3 Data Validation Rules

- Budget must be a positive decimal value greater than 0
- Weight must be a positive number (in tons)
- Pickup date must be today or in the future
- Delivery date must be on or after pickup date
- Bid amount must be a positive decimal
- Rating must be between 0.0 and 5.0
- Progress percentage must be between 0 and 100
- Load status transitions must follow the defined lifecycle order

---

## 8. External Interface Requirements

### 8.1 User Interfaces

The application presents two distinct portal interfaces accessible from the landing page:

**Landing Page** (https://takura-bid-six.vercel.app/) — Marketing/entry page with portal selection, feature descriptions, and value proposition messaging.

**Client Portal** (https://takura-bid-six.vercel.app/client) — Four main pages: Find Drivers, Messages, My Loads, Analytics.

**Driver Portal** (https://takura-bid-six.vercel.app/driver) — Four main pages: Load Board, Analytics, My Jobs, Chat.

### 8.2 Hardware Interfaces

No specific hardware interfaces are required. The application operates on standard computing devices with web browser access.

### 8.3 Software Interfaces

| Interface | Purpose |
|-----------|---------|
| Mapping/Routing API | Route calculation, distance estimation, map visualization |
| Payment Gateway | Payment verification, transaction processing |
| Email/SMS Service | Notification delivery for critical events |
| Cloud Storage | Document/invoice storage and retrieval |

### 8.4 Communication Interfaces

- **HTTPS** — All client-server communication encrypted via TLS
- **WebSocket** — Real-time messaging and status update delivery
- **REST API** — Standard CRUD operations for all data entities

---

## 9. UI/UX Specifications

### 9.1 Design System

**Color Palette:**
- Primary: Dark navy/charcoal (#1a1a2e or similar) — used for headers, buttons, and primary actions
- Accent: Green (#22c55e or similar) — used for positive indicators, availability, on-time metrics
- Warning: Amber/yellow — used for pending states and urgent alerts
- Status colors: Green (completed/available), Blue (in transit/active), Yellow (in bidding/pending), Orange (assigned), Red (declined/urgent)

**Typography:**
- Clean, sans-serif font family
- Hierarchical sizing for headings, body text, and metadata
- Bold weight for KPI numbers and section titles

**Layout:**
- Card-based design pattern for content organization
- Consistent spacing and padding
- White/light gray backgrounds with subtle borders
- Top navigation bar with role indicator

### 9.2 Navigation Structure

**Client Portal Navigation:**
```
TakuraBid Logo | Find Drivers ▾ | Messages | My Loads | Analytics | Search... | Client ▾ | Log in | Sign up
```

**Driver Portal Navigation:**
```
TakuraBid Logo | Load Board | Analytics | My Jobs | Chat | Search... | Driver ▾ | Log in | Sign up
```

### 9.3 Page Layouts

**Dashboard Pages (Analytics):** Grid-based layout with KPI cards at top, followed by 2-column chart grids, and summary sections at bottom.

**List Pages (My Loads, Load Board, Find Drivers):** Summary stats at top, followed by vertically stacked content cards with action buttons.

**Split-Panel Pages (Messages/Chat):** Left panel (conversation list) and right panel (conversation detail/messages) in a master-detail pattern.

**Multi-Section Pages (My Jobs):** Mixed layout with calendar + map top section, followed by timeline list below.

### 9.4 Component Specifications

**Status Badges:** Rounded pill-shaped badges with color-coded backgrounds (green for Completed, orange for In Transit, blue for In Bidding, yellow for Assigned, gray for Pending/Active).

**KPI Cards:** Bordered cards with large numeric values, descriptive labels below, and optional trend icons.

**Chart Components:** Line charts, bar charts, donut charts, scatter plots with trend lines, and horizontal bar charts, all rendered with consistent styling and color palette.

**Driver Cards:** Avatar circle (initials), multi-line text content (name, title, stats, tags, bio), and right-aligned action button.

**Load Cards:** Full-width cards with route header, metadata grid (distance, bids, dates), assigned driver bar, and action button row.

---

## 10. Security Requirements

### 10.1 Authentication

#### SR-AUTH-001: Secure Authentication
The system shall implement secure authentication with encrypted password storage (bcrypt or equivalent hashing).

#### SR-AUTH-002: Session Management
User sessions shall be managed with secure, httpOnly cookies or JWT tokens with appropriate expiration.

#### SR-AUTH-003: Role-Based Access Control
The system shall enforce role-based access control ensuring clients cannot access driver-specific endpoints and vice versa.

### 10.2 Data Protection

#### SR-DATA-001: Transport Encryption
All data in transit shall be encrypted using TLS 1.2 or higher.

#### SR-DATA-002: Sensitive Data Handling
Personally identifiable information (PII) shall be stored in encrypted form. Payment information shall be handled by PCI-compliant third-party processors and never stored directly.

#### SR-DATA-003: Audit Logging
The platform describes "Immutable secure logging for all platform transactions" as a core capability. All significant actions (load posting, bid submission, job assignment, payment processing) shall be logged with timestamps, actor IDs, and action details in an append-only audit log.

### 10.3 Payment Security

#### SR-PAY-001: Payment Verification
The system shall verify client payment capability before allowing load posting, as indicated by the "Payment verified" badge shown on load board listings.

#### SR-PAY-002: Secure Transactions
All financial transactions shall be processed through secure, PCI-compliant payment processing infrastructure as described by the platform's "Financial-grade data protection infrastructure" capability.

---

## 11. Assumptions and Constraints

### 11.1 Assumptions

1. Users have access to modern web browsers and stable internet connectivity.
2. USD is the primary transaction currency for the platform.
3. The initial deployment focuses on Zimbabwean domestic routes, with potential expansion to SADC regional corridors.
4. Drivers have legitimate transport businesses and can provide verification documentation.
5. Clients have verified payment methods before posting loads.
6. Distance calculations are based on road network distances, not straight-line distances.
7. The platform operates as a marketplace facilitating connections between clients and drivers; it does not own or operate transport vehicles.

### 11.2 Constraints

1. **Geographic Focus:** Initial route network is limited to major Zimbabwean cities (Harare, Bulawayo, Gweru, Mutare, Masvingo, Victoria Falls, Chinhoyi, Kariba).
2. **Currency:** Platform currently operates in USD only; multi-currency support described as a capability but not yet implemented in the observed UI.
3. **Regulatory:** Transport operations must comply with Zimbabwean transport regulations and licensing requirements.
4. **Connectivity:** The platform's real-time features (messaging, live tracking) require persistent internet connectivity, which may be intermittent in some service areas.
5. **Deployment:** Currently deployed on Vercel's free/hobby tier, which may have request limits and cold start latency.

### 11.3 Dependencies

1. Vercel hosting platform for deployment and serverless compute
2. Third-party mapping/routing service for route calculations and map rendering
3. Payment processing provider for financial transactions
4. Email/SMS notification service for alerts

---

## 12. Appendices

### Appendix A: Route Network

The following routes are observed in the current platform data:

| Route | Distance (km) | Estimated Duration |
|-------|---------------|-------------------|
| Harare → Bulawayo | 439 | 5.5 hours |
| Gweru → Mutare | 520 | ~6 hours |
| Masvingo → Harare | 292 | 4 hours |
| Bulawayo → Victoria Falls | 440 | 5.5 hours |
| Chinhoyi → Kariba | 180 | ~3 hours |
| Victoria Falls → Harare (via Gweru) | 520 | 6.5 hours |

### Appendix B: Sample Load Data

| Load ID | Route | Cargo | Weight | Budget | Status |
|---------|-------|-------|--------|--------|--------|
| LOAD001 | Harare → Bulawayo | Building Materials | 5 tons | $850 | In Transit |
| LOAD002 | Gweru → Mutare | Agricultural Products | 8 tons | $1,200 | Completed |
| LOAD003 | Masvingo → Harare | Consumer Goods | 3.5 tons | $650 | In Bidding |
| LOAD004 | Bulawayo → Victoria Falls | Tourism Equipment | 4 tons | $750 | Assigned |

### Appendix C: Sample Driver Profiles

| Name | Specialization | Rating | Earnings | Availability |
|------|---------------|--------|----------|--------------|
| Tendai M. | Heavy Equipment / Long-Distance | 4.8 | $33K+ | Available |
| Sarah C. | Agricultural / Cold Chain | 4.9 | $45K+ | Available |
| James M. | Construction / Mining | 4.7 | $28K+ | Unavailable |
| Grace M. | General Freight / Cross-Border | 4.6 | $21K+ | Available |
| Michael T. | Liquid / Chemical Transport | 4.9 | $52K+ | Available |
| Patricia N. | Express / Time-Sensitive Delivery | 4.8 | $38K+ | Available |

### Appendix D: Analytics Metrics Reference

**Client Metrics:**
Total Shipping Costs, On-Time Delivery %, Total Shipments, Avg Cost/Mile, Shipping Costs Over Time (weekly), On-Time Delivery Rate (monthly), Shipment Volume by Route, Average Cost per Mile/Load (scatter), Cost Savings vs Last Month, Average Delivery Time, Driver Satisfaction Rate.

**Driver Metrics:**
Total Earnings, Average Rating, Total Kilometres, Driver Ranking (Top %), Profile Views & Clicks, Earnings Over Time (weekly), Load Acceptance vs. Decline Rate, Miles Driven vs. Pay Per Mile (scatter), Driving Time, Idle Time, Efficiency %.

### Appendix E: Glossary of Status Codes

| Status | Context | Meaning |
|--------|---------|---------|
| In Bidding | Load | Open for driver bids |
| Assigned | Load | Driver selected, awaiting start |
| In Transit | Load/Job | Active delivery in progress |
| Completed | Load/Job | Delivery successfully finished |
| Pending | Job | Assigned but not started |
| Active | Job | Accepted, awaiting pickup |
| Available | Driver | Currently accepting jobs |
| Unavailable | Driver | Not accepting new jobs |

---

*End of Document*

**Document prepared:** February 24, 2026  
**Platform version analyzed:** TakuraBid v1.0 (https://takura-bid-six.vercel.app/)
