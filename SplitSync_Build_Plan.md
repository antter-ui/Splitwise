# SplitSync — Actionable Build Plan

> Derived from `SplitSync_Full_Stack_Architecture.md`
> **GitHub:** https://github.com/antter-ui/Splitwise
> **Rule:** After every phase completes → `git push origin main`


---

## Phase Status Tracker

| Phase | Name | Status |
|---|---|---|
| 0 | Environment & Repo Setup | ✅ DONE — 2026-10-03 |
| 1 | Auth (Backend + Frontend) | ✅ DONE — 2026-10-03 |
| 2 | Groups | ✅ DONE — 2026-10-03 |
| 3 | Expenses | ✅ DONE — 2026-10-03 |
| 4 | Balance Engine + Debt Algorithm | ✅ DONE — 2026-10-03 |
| 5 | Settlements | ✅ DONE — 2026-10-03 |
| 6 | Real-Time (Socket.IO) | ✅ DONE — 2026-10-03 |
| 7 | Notifications | ✅ DONE — 2026-10-03 |
| 8 | Analytics & Activity Feed | ⬜ TODO |
| 9 | Production Features | ⬜ TODO |
| 10 | Testing | ⬜ TODO |
| 11 | Deployment | ⬜ TODO |
| 12 | Bonus (Docker, Redis, Sentry) | ⬜ TODO |

---

## 🗂️ Project Structure at a Glance

```
splitwise/
├── client/          ← React + TypeScript + Vite (frontend)
└── server/          ← Node.js + Express + TypeScript (backend)
```

---

## ✅ Phase 0 — Environment & Repo Setup
> **Do this first, before writing any feature code.**

| Task | Detail |
|---|---|
| Init GitHub repo | Create repo, push initial commit |
| Create monorepo structure | `client/` and `server/` folders |
| Setup `.gitignore` | Node, .env, dist, node_modules |
| Create `.env.example` files | Both client and server |
| Setup TypeScript | `tsconfig.json` in both |
| Setup ESLint + Prettier | Consistent formatting |

---

## ✅ Phase 1 — Auth (Backend + Frontend)
> **Start here after environment setup.**

### 1A — Backend Auth

| Order | File | What to build |
|---|---|---|
| 1 | `server/src/config/database.ts` | MongoDB connection via Mongoose |
| 2 | `server/src/config/env.ts` | Typed env variable loader |
| 3 | `server/src/models/User.ts` | User schema: name, email, passwordHash, avatar, currency, timezone |
| 4 | `server/src/middleware/errorHandler.ts` | `ApiError` class + Express error middleware |
| 5 | `server/src/utils/jwt.ts` | `signToken()` / `verifyToken()` helpers |
| 6 | `server/src/modules/auth/auth.validation.ts` | Zod schemas for register/login |
| 7 | `server/src/modules/auth/auth.service.ts` | Business logic: hash password, create user, verify credentials |
| 8 | `server/src/modules/auth/auth.controller.ts` | Route handlers calling service |
| 9 | `server/src/modules/auth/auth.routes.ts` | `POST /register`, `POST /login`, `POST /logout`, `GET /me` |
| 10 | `server/src/middleware/auth.ts` | JWT verification middleware (reads HTTP-only cookie) |
| 11 | `server/src/server.ts` | Wire Express app, middleware, routes, start |

**Test manually:** Use Postman / curl — register → login → `/me` → logout

### 1B — Frontend Auth

| Order | File | What to build |
|---|---|---|
| 1 | `client/src/lib/api.ts` | Axios instance with `withCredentials: true`, base URL from env |
| 2 | `client/src/features/auth/api/` | `register()`, `login()`, `logout()`, `getMe()` functions |
| 3 | `client/src/features/auth/hooks/` | TanStack Query hooks: `useMe()`, `useLogin()`, `useRegister()`, `useLogout()` |
| 4 | `client/src/pages/Register.tsx` | Register form with React Hook Form + Zod validation |
| 5 | `client/src/pages/Login.tsx` | Login form |
| 6 | `client/src/app/router.tsx` | React Router: public routes (`/login`, `/register`) + protected routes |
| 7 | `client/src/app/providers.tsx` | Wrap app with QueryClientProvider, RouterProvider |

> **Phase 1 checkpoint:** A user can register, log in, refresh the page and stay logged in, and log out.

---

## ✅ Phase 2 — Groups

### 2A — Backend Groups

| Order | File | What to build |
|---|---|---|
| 1 | `server/src/models/Group.ts` | Group schema: name, description, image, createdBy, members[], currency |
| 2 | `server/src/modules/groups/groups.validation.ts` | Zod: create/update group |
| 3 | `server/src/modules/groups/groups.service.ts` | CRUD + member add/remove + `isUserMemberOfGroup()` |
| 4 | `server/src/modules/groups/groups.controller.ts` | Route handlers |
| 5 | `server/src/modules/groups/groups.routes.ts` | All group + member routes |

### 2B — Frontend Groups

| Order | File | What to build |
|---|---|---|
| 1 | `client/src/features/groups/api/` | Group CRUD + member API functions |
| 2 | `client/src/features/groups/hooks/` | TanStack Query hooks |
| 3 | `client/src/pages/Dashboard.tsx` | Show user's groups + summary balances |
| 4 | `client/src/pages/Group.tsx` | Group detail page |
| 5 | `client/src/components/modals/` | CreateGroupModal, InviteMemberModal |

> **Phase 2 checkpoint:** User can create a group, invite members, see the group, and remove members.

---

## ✅ Phase 3 — Expenses

### 3A — Backend Expenses

| Order | File | What to build |
|---|---|---|
| 1 | `server/src/models/Expense.ts` | Schema: groupId, description, amount, paidBy, splitType, participants[] |
| 2 | `server/src/modules/expenses/expenses.validation.ts` | Zod — validate: `sum(participants.amount) == expense.amount` |
| 3 | `server/src/modules/expenses/expenses.service.ts` | CRUD + split calculation |
| 4 | `server/src/modules/expenses/expenses.controller.ts` | Route handlers |
| 5 | `server/src/modules/expenses/expenses.routes.ts` | Routes nested under `/groups/:groupId/expenses` |

**Split types:** `equal`, `exact`, `percentage`, `shares`

### 3B — Frontend Expenses

| Order | File | What to build |
|---|---|---|
| 1 | `client/src/features/expenses/api/` | Expense CRUD API functions |
| 2 | `client/src/features/expenses/hooks/` | TanStack Query hooks |
| 3 | `client/src/pages/Expenses.tsx` | Expense list for a group |
| 4 | `client/src/features/expenses/components/AddExpenseModal.tsx` | Multi-step form |
| 5 | `client/src/features/expenses/components/SplitCalculator.tsx` | Live preview of shares |

> **Phase 3 checkpoint:** User can add an expense with any split type, edit it, delete it.

---

## ✅ Phase 4 — Balance Engine (Core Algorithm)

> ⚠️ This is the most important algorithmic phase. Understand the algorithm — don't copy-paste it.

### 4A — Debt Simplification Algorithm
**File:** `server/src/utils/debtSimplifier.ts`

1. `calculateNetBalances(expenses, settlements)` → `Map<userId, netAmount>`
2. Separate into creditors (positive) and debtors (negative)
3. Greedy matching: take max creditor + max debtor, transfer min(C.balance, abs(D.balance))
4. Returns minimum list of transactions

### 4B — Balance Routes
- `GET /api/groups/:groupId/balances`
- `GET /api/groups/:groupId/debts`

### 4C — Frontend Balances
- Balances page showing "You owe X to Y" and "Z owes you W"

> **Phase 4 checkpoint:** Add 3 expenses, verify simplified debts are mathematically correct.

---

## ✅ Phase 5 — Settlements

- Settlement model: groupId, from, to, amount, currency, note
- `POST /api/groups/:groupId/settlements`
- `GET /api/groups/:groupId/settlements`
- SettleUpModal on frontend

> **Phase 5 checkpoint:** Rahul settles ₹1000 with Vedant → balance updates correctly.

---

## ✅ Phase 6 — Real-Time (Socket.IO)

**Backend:** Attach Socket.IO, JWT on handshake, emit events after DB writes
**Events:** `expense:created`, `expense:updated`, `expense:deleted`, `settlement:created`, `notification:new`
**Frontend:** Socket client singleton, `useGroupSocket(groupId)` hook, invalidate TanStack Query cache on events

> **Phase 6 checkpoint:** Vedant adds expense in Tab A → Rahul's Tab B updates live.

---

## ✅ Phase 7 — Notifications

- Notification model: userId, type, title, message, relatedEntity, read, createdAt
- Auto-create on expense/settlement/member events
- Emit via Socket.IO to user's personal room
- NotificationBell component + full notifications page

---

## ⬜ Phase 8 — Analytics & Activity Feed

- MongoDB aggregation: monthly spending, category breakdown
- Activity log collection
- Recharts for bar/pie charts

---

## ⬜ Phase 9 — Production Features

| Task | Package |
|---|---|
| Rate limiting | `express-rate-limit` |
| Structured logging | `pino` |
| Security headers | `helmet` |
| Image upload | Cloudinary SDK |
| Email notifications | Resend SDK |
| Swagger docs | `swagger-jsdoc` + `swagger-ui-express` |
| DB indexes | `users.email`, `expenses.groupId`, `notifications.userId` |
| Pagination | `?page=1&limit=20` on all list endpoints |

---

## ⬜ Phase 10 — Testing

| Priority | What | Tool |
|---|---|---|
| Critical | Debt simplification algorithm | Vitest unit test |
| Critical | Balance calculation | Vitest unit test |
| High | Auth routes | Supertest |
| High | Expense CRUD + split validation | Supertest |
| High | Settlement flow | Supertest |
| Medium | Authorization | Supertest |
| Medium | Frontend components | React Testing Library |

---

## ⬜ Phase 11 — Deployment

| Step | Service |
|---|---|
| Database | MongoDB Atlas |
| Images | Cloudinary |
| Email | Resend |
| Backend | Render / Railway |
| Frontend | Vercel |
| CI/CD | GitHub Actions |

---

## ⬜ Phase 12 — Bonus

- Docker + docker-compose.yml
- Redis for caching + Socket.IO scaling
- Sentry for error monitoring
- Cursor-based pagination

---

## 📊 Estimated Timeline

| Phase | Effort |
|---|---|
| Phase 0 | 0.5 day |
| Phase 1 | 2–3 days |
| Phase 2 | 2 days |
| Phase 3 | 3–4 days |
| Phase 4 | 2–3 days |
| Phase 5 | 1–2 days |
| Phase 6 | 2 days |
| Phase 7 | 1–2 days |
| Phase 8 | 2 days |
| Phase 9 | 3–4 days |
| Phase 10 | 2–3 days |
| Phase 11 | 1–2 days |
| Phase 12 | Ongoing |
| **Total** | **~4–5 weeks** |
