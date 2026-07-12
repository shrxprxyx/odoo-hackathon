# AssetFlow

**Enterprise Asset & Resource Management System** — a centralized ERP platform for tracking, allocating, and maintaining physical assets and shared resources (equipment, furniture, vehicles, rooms) across any organization.

Built for [Hackathon Name] — a fully self-hosted, local-first stack with no third-party BaaS.

---

## Architecture

The system runs entirely on infrastructure you control: a local PostgreSQL instance (via Docker), a self-hosted Express API with an in-process Socket.IO server for real-time updates, and local disk storage for uploaded files. No Firebase, Supabase, or MongoDB — and no managed cloud database or cache layer.

# Architecture

AssetFlow follows a modular, layered architecture designed around separation of concerns. Each layer has a clearly defined responsibility, allowing the system to remain maintainable, scalable, and secure.

---

## High-Level System Architecture

```mermaid
flowchart TB

%% =========================
%% USERS
%% =========================

subgraph USERS["👥 Users"]
A1[Administrator]
A2[Asset Manager]
A3[Department Head]
A4[Employee]
end

%% =========================
%% FRONTEND
%% =========================

subgraph FRONTEND["🖥️ Frontend (Next.js 15 + React + TypeScript)"]

Dashboard
OrgSetup["Organization Setup"]
EmployeeDirectory
Assets
Allocation
Booking
Maintenance
Audit
Reports
Notifications
Profile
Settings

end

%% =========================
%% API
%% =========================

subgraph API["⚙️ Express.js REST API"]

Routes
Controllers
Services
Repositories
Middleware

end

%% =========================
%% SECURITY
%% =========================

subgraph SECURITY["🔒 Security Layer"]

JWT
RBAC["Role-Based Access"]
Validation["Zod Validation"]
Bcrypt
RateLimit["Rate Limiting"]
ErrorHandling

end

%% =========================
%% BUSINESS MODULES
%% =========================

subgraph MODULES["📦 Business Modules"]

Organization
AssetLifecycle
AllocationService
BookingService
MaintenanceService
AuditService
NotificationService
ReportingService
ActivityService

end

%% =========================
%% REALTIME
%% =========================

subgraph SOCKET["⚡ Socket.IO"]

LiveDashboard
LiveBooking
LiveNotifications
LiveMaintenance
LiveAudit

end

%% =========================
%% STORAGE
%% =========================

subgraph STORAGE["💾 Persistence Layer"]

Prisma
PostgreSQL[(PostgreSQL)]
Uploads["Local Upload Storage"]

end

%% Connections

USERS --> FRONTEND

FRONTEND -->|REST API| API

FRONTEND -->|Socket.IO| SOCKET

API --> SECURITY

SECURITY --> MODULES

MODULES --> Prisma

Prisma --> PostgreSQL

MODULES --> Uploads

SOCKET --> MODULES

MODULES --> LiveDashboard
MODULES --> LiveNotifications
```

---

# Layered Architecture

```mermaid
flowchart TB

Client["Client Browser"]

subgraph Presentation

Next["Next.js + React"]

Components["Reusable Components"]

Pages["Pages"]

Forms["Forms"]

end

subgraph Application

Routes

Controllers

Services

Middleware

Validation

SocketIO

end

subgraph DataAccess

Prisma

Repository

end

subgraph Database

Postgres[(PostgreSQL)]

Uploads

end

Client --> Next

Next --> Routes

Routes --> Controllers

Controllers --> Services

Services --> Validation

Services --> Repository

Repository --> Prisma

Prisma --> Postgres

Services --> Uploads

SocketIO --> Next
```

---

# Authentication Flow

```mermaid
sequenceDiagram

actor User

participant Frontend

participant API

participant Auth

participant PostgreSQL

User->>Frontend: Enter Email & Password

Frontend->>API: POST /auth/login

API->>Auth: Validate Credentials

Auth->>PostgreSQL: Find User

PostgreSQL-->>Auth: User Record

Auth->>Auth: Compare bcrypt Hash

Auth->>Auth: Generate JWT

Auth-->>API: JWT + User Details

API-->>Frontend: Success Response

Frontend-->>User: Dashboard
```

---

# Asset Allocation Workflow

```mermaid
flowchart LR

Employee

Request

Validation

Availability

Approval

Allocation

ActivityLog

Database

Socket

Dashboard

Notifications

Employee --> Request

Request --> Validation

Validation --> Availability

Availability --> Approval

Approval --> Allocation

Allocation --> Database

Allocation --> ActivityLog

Database --> Socket

Socket --> Dashboard

Socket --> Notifications
```

---

# Asset Lifecycle

```mermaid
stateDiagram-v2

[*] --> Registered

Registered --> Available

Available --> Allocated

Allocated --> Returned

Returned --> Available

Allocated --> UnderMaintenance

UnderMaintenance --> Available

Available --> Lost

Lost --> Recovered

Recovered --> Available

Available --> Retired

Retired --> Disposed

Disposed --> [*]
```

---

# Deployment Architecture

```mermaid
flowchart LR

Browser

Browser -->|"HTTPS"| Next

Next["Next.js Frontend"]

Next -->|"REST"| Express

Next -->|"Socket.IO"| Socket

Express["Express API"]

Socket["Socket.IO"]

Express --> Prisma

Prisma --> PostgreSQL

Express --> UploadStorage["Local Uploads"]

PostgreSQL["PostgreSQL 16"]

```

---

# Cross-Cutting Design Principles

| Principle | Implementation |
|------------|----------------|
| Local First | PostgreSQL running locally via Docker |
| Authentication | JWT + bcrypt |
| Authorization | Role-Based Access Control |
| Validation | Shared Zod schemas on frontend and backend |
| Database | Prisma ORM with parameterized SQL |
| Real-Time | Socket.IO (no external messaging service) |
| File Storage | Multer storing uploads locally |
| Logging | Immutable Activity Logs |
| Error Handling | Centralized Express middleware |
| Security | Rate limiting, validation, JWT verification |

---

# Architectural Decisions

- **No Firebase**
- **No Supabase**
- **No MongoDB**
- **No Redis**
- **No Cloud Storage**
- **No Third-Party Authentication**
- **Local PostgreSQL only**
- **REST-first API architecture**
- **Real-time updates using Socket.IO**
- **Repository pattern for data access**
- **Shared validation using Zod**
- **Role-Based Access Control**
- **Local file storage using Multer**
- **Parameterized database queries**
- **Immutable audit and activity logging**
---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Zustand | Client-side state, dashboards, forms |
| Calendar UI | react-big-calendar | Resource booking calendar view |
| Backend | Express.js, TypeScript | REST API + Socket.IO server |
| ORM | Prisma | Type-safe schema, migrations, DB-level constraints |
| Database | PostgreSQL 16 (Docker, local) | No cloud DB, no Redis — runs on `localhost:5432` |
| Auth | Custom — bcrypt + JWT | No Clerk/Firebase Auth. Signup creates Employee accounts only; Admin promotes roles. |
| Real-time | Socket.IO (self-hosted, in-process) | Live KPI updates, booking confirmations, overdue alerts, audit flags — no message broker needed at this scale |
| File storage | Multer → local disk (`/apps/api/uploads`) | Asset photos, maintenance photos, audit documents |
| Validation | Zod (shared schemas, frontend + backend) | Field-level inline feedback on invalid input |
| Charts | Recharts | Utilization trends, booking heatmap, reports |
| Containerization | Docker Compose | One command spins up Postgres + API + Web identically for every team member |

---

## Project Structure

```
assetflow/
├── apps/
│   ├── web/                 # Next.js 15 frontend
│   │   ├── app/
│   │   ├── components/
│   │   └── store/            # Zustand stores
│   └── api/                  # Express + TypeScript backend
│       ├── src/
│       │   ├── modules/      # org-setup, assets, allocations, bookings,
│       │   │                    maintenance, audits, notifications
│       │   ├── middleware/   # auth, RBAC, validation
│       │   ├── sockets/      # Socket.IO event handlers
│       │   └── validators/   # Zod schemas
│       └── uploads/          # local file storage (gitignored)
├── packages/
│   └── shared-types/         # types & Zod schemas shared by web + api
├── prisma/
│   └── schema.prisma         # single source of truth for all entities
├── docs/
│   ├── architecture.svg
│   ├── API.md                 # endpoint contract (see below)
│   └── Database.md            # entity reference (see below)
├── docker-compose.yml
└── README.md
```

---



## Getting Started (Windows / PowerShell)

### Prerequisites
- Node.js 20+
- Docker Desktop
- npm

### 1. Clone and install

```powershell
git clone <repo-url>
cd assetflow
npm install
```

### 2. Start the local database

```powershell
docker compose up -d
```

This starts a local PostgreSQL container. No cloud account, no connection string from a third party.

### 3. Configure environment variables

```powershell
Copy-Item apps/api/.env.example apps/api/.env
Copy-Item apps/web/.env.example apps/web/.env
```

`apps/api/.env`
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/assetflow"
JWT_SECRET="replace-with-a-long-random-string"
JWT_EXPIRES_IN=3600
BCRYPT_ROUNDS=10
PORT=4000
```

`apps/web/.env`
```
NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXT_PUBLIC_SOCKET_URL="http://localhost:4000"
```

### 4. Run database migrations + seed

```powershell
npx prisma migrate dev --schema=./prisma/schema.prisma
npx prisma db seed
```

### 5. Start the app

```powershell
# Terminal 1 — API
cd apps/api
npm run dev

# Terminal 2 — Web
cd apps/web
npm run dev
```

Visit `http://localhost:3000`.

---

## Data Model Reference

Core entities and the constraints that enforce AssetFlow's business rules. Implemented as Prisma models backed by these Postgres-level guarantees:

| Entity | Key Fields | Constraint / Index |
|---|---|---|
| `User` | email, passwordHash, roles[], departmentId, status | `email` unique; role assignment writable only via Admin-guarded endpoint |
| `Department` | name, parentDeptId, headId, status | Self-referencing FK for hierarchy |
| `AssetCategory` | name, customFields (JSON) | Per-category dynamic fields (e.g. warranty period) |
| `Asset` | assetTag, categoryId, serialNumber, condition, location, isBookable, status | `assetTag` and `serialNumber` unique; indexed on `status`, `categoryId` |
| `AssetHistory` | assetId, fromStatus, toStatus, actorId, reason | Immutable log of every lifecycle transition |
| `Allocation` | assetId, holderId/holderDeptId, expectedReturnDate, status | **Partial unique index**: only one `Active` allocation per `assetId` — this is what blocks double-allocation at the DB layer, not just in application code |
| `TransferRequest` | assetId, fromHolderId, toHolderId, status | Requested → Approved → Re-allocated workflow |
| `ResourceBooking` | resourceId, bookerId, startTime, endTime, status | **Partial unique/overlap constraint** on `(resourceId, startTime, endTime)` where `status != 'Cancelled'` — rejects overlapping slots at the DB layer as a second line of defense behind the API overlap check |
| `MaintenanceRequest` | assetId, requesterId, priority, status, technicianId | Pending → Approved/Rejected → Assigned → In Progress → Resolved |
| `AuditCycle` | name, scopeType, scopeId, startDate, endDate, status | scope = department / location / all |
| `AuditAssignment` | cycleId, auditorId | Unique per `(cycleId, auditorId)` |
| `AuditFinding` | cycleId, assetId, auditorId, status (Verified/Missing/Damaged) | Feeds auto-generated discrepancy report |
| `Notification` | userId, type, message, relatedResourceType/Id, isRead | Pushed live via Socket.IO on write |
| `ActivityLog` | actorId, action, resourceType, resourceId, changes (JSON) | Immutable audit trail of who did what, when |

Full schema lives in `prisma/schema.prisma`; a plain-English version is kept in `docs/Database.md`.

---

## API Conventions

Base URL: `http://localhost:4000/api`

**Response envelope**
```json
// List endpoints
{ "data": [ /* ... */ ], "total": 42 }

// Single-resource endpoints
{ "id": 1, "field": "value" }

// Errors
{ "error": "field_specific_message", "field": "email" }
```

**Auth header**
```
Authorization: Bearer <jwt>
```

**Representative endpoints**

| Method | Route | Auth | Purpose |
|---|---|---|---|
| `POST` | `/auth/signup` | Public | Creates an **Employee** account only — no role field accepted from the client |
| `POST` | `/auth/login` | Public | Returns JWT + user profile |
| `GET` | `/auth/me` | Any | Current session validation |
| `GET` / `POST` / `PUT` / `DELETE` | `/departments` | Admin (write) | Department hierarchy management |
| `POST` | `/employees/:id/promote` | Admin only | The **only** place a role is ever assigned |
| `GET` / `POST` | `/assets` | Asset Manager (write) | Register + search/filter by tag, serial, category, status |
| `POST` | `/allocations` | Asset Manager, Dept Head | Returns `409` with `currently_held_by` if asset already allocated, prompting a transfer request instead |
| `POST` | `/bookings` | Any | Returns `409` on overlap with the conflicting slot |
| `POST` | `/maintenance-requests` | Any | Raise request; `PATCH` for approval workflow transitions |
| `POST` | `/audit-cycles` | Admin | Create cycle + assign auditors |
| `PATCH` | `/audit-cycles/:id/findings` | Assigned auditor | Verified / Missing / Damaged |
| `GET` | `/reports/*` | Admin, Managers | Utilization, maintenance frequency, booking heatmap |

Full request/response bodies for every endpoint are documented in `docs/API.md`.

---

## Core Domain Rules

- **Asset lifecycle**: `Available → Allocated → Reserved → Under Maintenance → Lost → Retired → Disposed`, enforced via a status enum with explicit valid transitions in the API layer, and logged to `AssetHistory` on every change.
- **No double-allocation**: enforced at two layers — an API-level check that returns a clear "currently held by X" response with a transfer option, *and* a partial unique DB index as the source of truth under concurrent requests.
- **Booking overlap prevention**: checked at the API layer before insert, backed by a DB-level partial unique constraint so overlapping slots can never land in the table even under a race.
- **Realistic account creation**: signup always creates an Employee account. Only an Admin, from the Employee Directory, can promote someone to Department Head or Asset Manager — no self-elevation is possible anywhere in the API.
- **Email validation**: signup emails are checked for correct format and against a bundled disposable-domain blocklist (no external API call). Invalid emails return a specific, actionable error (e.g. `{"error": "Enter a valid email", "field": "email"}`) rather than a generic failure.
- **Real-time feedback**: bookings, allocations, maintenance approvals, and audit flags push instantly to affected users via Socket.IO — no polling.

---

## User Roles

| Role | Capabilities |
|---|---|
| **Admin** | Manages departments, categories, audit cycles, and role assignment. Views org-wide analytics. |
| **Asset Manager** | Registers/allocates assets. Approves transfers, maintenance requests, and returns. |
| **Department Head** | Views department assets. Approves department allocation/transfer requests. Books resources on the department's behalf. |
| **Employee** | Views own allocated assets. Books shared resources. Raises maintenance requests. Initiates returns/transfers. |

---

## Screens

1. Login / Signup
2. Dashboard (KPIs, overdue highlights, quick actions)
3. Organization Setup (Departments, Asset Categories, Employee Directory) — Admin only
4. Asset Registration & Directory
5. Asset Allocation & Transfer
6. Resource Booking (calendar view, overlap validation)
7. Maintenance Management (approval workflow)
8. Asset Audit (cycles, discrepancy reports)
9. Reports & Analytics
10. Activity Logs & Notifications

---

