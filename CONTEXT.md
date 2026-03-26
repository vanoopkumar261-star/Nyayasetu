# NyayaSetu — Master Build Context
# PASTE THIS AT THE START OF EVERY NEW ANTIGRAVITY SESSION

---

## Product Summary
**NyayaSetu (न्याय सेतु)** is a Delhi-focused AI civic assistance and grievance redressal platform.
Two core functions:
1. Scheme Discovery — help citizens find and apply for government schemes
2. Complaint Redressal — file, track, and escalate civic complaints with transparency

---

## Tech Stack (DO NOT DEVIATE)
| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript — strict mode |
| Styling | Tailwind CSS only — no inline styles, no CSS modules |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth for officers/supervisors; custom OTP table for citizens |
| File Storage | Supabase Storage (complaint proof images) |
| OTP (MVP) | Mock OTP — log to console, skip real SMS provider for now |
| i18n | react-i18next — NEVER hardcode display strings |
| Icons | lucide-react only |
| Charts | recharts only |
| Types | All types live in /types/index.ts — never define inline types |

---

## Folder Structure
```
/app
  /(public)         → landing, about, schemes, complaint file/track, chat, login
  /(citizen)        → citizen dashboard, complaints, alerts, profile
  /(officer)        → officer queue and complaint detail
  /(supervisor)     → supervisor dashboard, analytics, heatmap, officers
/components
  /ui               → reusable atomic components (buttons, badges, cards)
  /schemes          → scheme-specific components
  /complaints       → complaint-specific components
  /dashboard        → dashboard widgets and charts
  /layout           → navbar, sidebar, footer
/lib
  /db.ts            → Supabase client
  /auth.ts          → auth helpers
  /otp.ts           → OTP send/verify logic
  /classifier.ts    → rule-based complaint classifier
  /sla.ts           → SLA deadline calculation logic
  /utils.ts         → shared utility functions
/types
  /index.ts         → ALL TypeScript types and enums — single source of truth
/constants
  /categories.ts    → complaint categories with SLA hours
  /departments.ts   → department list
  /schemes-seed.ts  → seed data for schemes
```

---

## User Roles
| Role | Access |
|---|---|
| `citizen` | Explore schemes, file complaint (OTP required), track complaint |
| `officer` | See assigned complaints in their ward/zone, update status, upload proof |
| `supervisor` | See all complaints, reassign, escalate, view analytics |
| `admin` | Manage users, departments, schemes, SLA rules (post-MVP) |

---

## Complaint Status Flow (STRICT — never use other values)
```
submitted → verified → assigned → in_progress → resolved → closed
                                      ↓
                                  escalated (if SLA breached)
                                      ↓
                                  reopened (if citizen disputes)
                                  transferred (if wrong department)
```

---

## Complaint Categories + SLA Hours
| Category | SLA Hours |
|---|---|
| garbage_collection | 24 |
| water_leakage | 48 |
| sewer_blockage | 24 |
| drain_overflow | 24 |
| streetlight | 72 |
| pothole | 168 (7 days) |
| illegal_dumping | 48 |
| mosquito_sanitation | 48 |
| stray_animal | 72 |
| park_maintenance | 120 (5 days) |
| encroachment | 96 (4 days) |

---

## Departments
| id | name |
|---|---|
| dept_001 | Sanitation & Solid Waste |
| dept_002 | Water & Sewerage |
| dept_003 | Electrical & Street Lighting |
| dept_004 | Roads & Infrastructure |
| dept_005 | Parks & Environment |
| dept_006 | Animal Control |
| dept_007 | Anti-Encroachment |

---

## Key Business Rules
- Citizens MUST verify phone via OTP before filing a complaint
- OTP session expires in 10 minutes
- Officers only see complaints from their assigned ward/zone
- SLA breach auto-escalates — no manual trigger needed
- Complaint UIDs format: `NYC-YYYYMMDD-XXXXX` (e.g. NYC-20260325-00042)
- All images stored in Supabase Storage under bucket `complaint-proofs`
- Bilingual support: English (default) + Hindi via react-i18next

---

## AI Logic (Rule-Based for MVP — no LLM calls in classifiers)
- Complaint classifier: keyword matching on description → category + department
- Scheme recommender: filter by user profile fields (age, gender, occupation, income)
- AI chat assistant: calls Claude API only for the /chat page

---

## Critical Reminders for Every Session
1. All types come from `/types/index.ts` — never redefine types locally
2. All DB queries go through `/lib/db.ts` — never import Supabase client directly in components
3. RBAC middleware must be applied on EVERY protected route
4. Never hardcode UI strings — always use t() from react-i18next
5. Schema column names are sacred — never rename without updating types + all usages
6. Build exactly what's asked — no unrequested extras or refactors
