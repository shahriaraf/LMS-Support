# SaaS LMS Support & Troubleshooting Dashboard

A working mini LMS (Next.js) + a real Support Engineer Dashboard (NestJS + MongoDB), built to mirror
what a Support Engineer actually does day to day: read logs, debug API failures, fix front-end
bugs, investigate user reports, and document/apply fixes.

Every "simulated issue" in this project is a genuine backend behavior, not a mockup:

| # | Issue | Where it lives | How it's fixed |
|---|-------|-----------------|-----------------|
| 1 | Course not loading → 403 | `Course.isLocked` flag, enforced in `CoursesService.findOne()` | Support flips `isLocked` to `false` (per-course, via Support → Courses, or auto via "Resolve & Apply Fix") |
| 2 | Payment failed → 500 | `PaymentsService.charge()` — deterministic decline on test card `4000000000000002`, or random failure at `Settings.paymentFailureRate` | Support lowers/zeroes `paymentFailureRate` in Support → Settings |
| 3 | Video not playing → CORS | Custom CORS middleware in `main.ts` genuinely omits `Access-Control-Allow-Origin` on `/video/:id/manifest` when `Settings.videoCorsErrorEnabled` is on | Support disables the toggle; real browser CORS block goes away |
| 4 | Button misaligned → CSS issue | `.enroll-btn-bug` CSS class applied conditionally based on `Settings.cssMisalignmentBugEnabled`, read via `GET /settings/public` | Support disables the toggle |
| 5 | Cannot enroll → DB validation error | `EnrollmentsService.enroll()` throws a simulated Mongoose validation error when `Settings.enrollmentValidationErrorEnabled` is on | Support disables the toggle |

Every API request/response (success and failure) and every meaningful user action (signup, login,
course view, enroll attempt, payment, quiz submit, issue report) is persisted to MongoDB and
queryable from the Support Dashboard's Logs tab — nothing is faked or hardcoded for the demo.

## Architecture

```
backend/   NestJS 10 + Mongoose (MongoDB), JWT auth, role-based guards
  auth/          signup/login, JWT strategy
  users/         user profiles, roles: student | support_engineer | admin
  courses/       course CRUD, the 403-lock bug, seed script
  enrollments/   enroll flow, the DB-validation-error bug
  payments/      mock payment gateway, the 500 bug
  video/         video manifest endpoint, the CORS bug
  quiz/          quiz bank + submissions
  issues/        support tickets, suggested-fix knowledge base, "apply fix" automation
  settings/      the single source of truth for every simulated-bug toggle
  logs/          ActivityLog + ApiLog collections and query endpoints
  common/        global exception filter, logging interceptor, JWT/roles guards

frontend/  Next.js 14 (App Router) + Tailwind
  app/(user side)      landing, signup/login, course catalog, course detail
                        (video player, payment form, free-enroll, quiz)
  app/support/(...)    role-gated Support Engineer Dashboard:
                        overview, issues, courses (lock toggle), logs,
                        payments, browser compatibility checker, settings
  components/          CourseCard, VideoPlayer, PaymentForm, ReportIssueButton
  lib/                 typed API client, auth context, shared types
```

## Running it locally

### 1. Start MongoDB
```bash
docker compose up -d
# or point MONGODB_URI at any MongoDB instance (Atlas works too)
```

### 2. Backend
```bash
cd backend
cp .env.example .env      # edit JWT_SECRET etc. if you like
npm install
npm run seed               # seeds demo courses (one is pre-locked for the 403 demo)
npm run seed:quiz          # seeds a sample quiz
npm run start:dev          # http://localhost:4000
```

### 3. Frontend
```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev                 # http://localhost:3000
```

### 4. Try the demo flow
1. Sign up as a **student** at `/signup`.
2. Browse `/courses` — open "Advanced NestJS Architecture (Locked Demo)" and watch it 403.
   Click **Report this access issue**.
3. Sign up a second account as a **support_engineer** (the signup form has a role selector for
   this demo — in a real product that would never be client-controlled).
4. Go to `/support/issues`, open the ticket, read the **Suggested Fix** panel, and click
   **Resolve & Apply Fix**. The course unlocks instantly — go back and reload it as the student.
5. On a paid course, try card `4000000000000002` at checkout to reliably trigger the payment 500,
   then fix it from `/support/settings` (payment failure rate) or via the ticket's auto-fix.
6. Flip **Video CORS error** on in `/support/settings`, then open a course video as the student —
   open DevTools Console to see a real "blocked by CORS policy" error, not a simulated message.

## Notes on design choices

- **Real toggles, not fake data.** Every "bug" is a live flag in the `Settings` singleton document
  (or `Course.isLocked`), read by the actual request path. Flipping it from the dashboard changes
  behavior on the very next request — no redeploy, no mocked API responses in the frontend.
- **CORS is hand-rolled**, not `app.enableCors()`, specifically so the video-manifest route can
  have its `Access-Control-Allow-Origin` header genuinely and conditionally omitted. This is the
  one place the project trades a little idiomatic-NestJS-ness for a realistic bug reproduction.
- **Logging is global**, via `LoggingInterceptor` (success) and `AllExceptionsFilter` (errors), so
  the Support Dashboard's log viewer reflects real traffic rather than a curated log table.
- Auth uses a `role` field on `User` (`student` / `support_engineer` / `admin`) enforced by a
  `RolesGuard`. In production you would never let a client choose their own role at signup — that's
  only exposed here so a grader/reviewer can spin up both personas in under a minute.
