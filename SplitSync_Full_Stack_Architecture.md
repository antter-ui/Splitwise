# SplitSync — Full-Stack Expense Sharing Platform

## 1. Project Overview

**SplitSync** is a production-style full-stack expense-sharing platform inspired by applications such as Splitwise.

The application should allow users to:

- Register and log in
- Create groups
- Invite and manage group members
- Add, edit, and delete expenses
- Split expenses in multiple ways
- Automatically calculate balances
- Simplify debts between users
- Record settlements
- View expense history
- Add comments/notes
- Receive notifications
- Synchronize updates in real time
- Search and filter expenses
- View spending analytics
- Manage profile and settings

### Example

Four friends go on a trip.

Vedant pays ₹4,000 for a hotel and the expense is split equally:

```text
Vedant → ₹1,000
A       → ₹1,000
B       → ₹1,000
C       → ₹1,000
```

The system should calculate:

```text
A owes Vedant ₹1,000
B owes Vedant ₹1,000
C owes Vedant ₹1,000
```

The backend should also be able to simplify multiple debts into fewer transactions.

---

# 2. High-Level Architecture

```text
                         ┌──────────────────────┐
                         │      React App       │
                         │      TypeScript      │
                         └──────────┬───────────┘
                                    │
                           HTTPS / REST API
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   Express.js API     │
                         │   Node.js + TS       │
                         └──────────┬───────────┘
                                    │
             ┌──────────────────────┼──────────────────────┐
             │                      │                      │
             ▼                      ▼                      ▼
      ┌─────────────┐        ┌─────────────┐       ┌──────────────┐
      │ Auth Module │        │ Expense      │       │ Group Module │
      │             │        │ Module       │       │              │
      └─────────────┘        └─────────────┘       └──────────────┘
             │                      │                      │
             └──────────────────────┼──────────────────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │      MongoDB         │
                         │      Database        │
                         └──────────────────────┘

                         ┌──────────────────────┐
                         │      Socket.IO       │
                         │   Real-time events   │
                         └──────────┬───────────┘
                                    │
                                    ▼
                              React clients
```

## Advanced Architecture

```text
React
  │
  ├── REST API ───────────────► Express / Node
  │                                  │
  ├── WebSocket ──────────────► Socket.IO
  │                                  │
  │                         ┌────────┴────────┐
  │                         │                 │
  │                       Redis            MongoDB
  │                         │                 │
  │                  caching/pub-sub      persistent data
  │
  └── Cloud Storage
          │
          └── S3 / Cloudinary
```

---

# 3. Recommended Technology Stack

## Frontend

### Core

- React
- TypeScript
- Vite

TypeScript is recommended over plain JavaScript because this project has many related entities and complex financial calculations.

### UI

- Tailwind CSS
- shadcn/ui
- Lucide React

### State Management

Use **TanStack Query** for server state:

- Users
- Groups
- Expenses
- Balances
- Notifications

Optionally use **Zustand** for client-side UI state:

- Sidebar
- Modals
- Theme
- Temporary form state
- User preferences

---

# 4. Frontend Architecture

```text
src/
│
├── app/
│   ├── router.tsx
│   ├── providers.tsx
│   └── queryClient.ts
│
├── components/
│   ├── ui/
│   ├── navbar/
│   ├── sidebar/
│   ├── modals/
│   └── common/
│
├── features/
│   │
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   └── types.ts
│   │
│   ├── groups/
│   │   ├── components/
│   │   ├── api/
│   │   ├── hooks/
│   │   └── types.ts
│   │
│   ├── expenses/
│   │   ├── components/
│   │   ├── api/
│   │   ├── hooks/
│   │   └── types.ts
│   │
│   ├── balances/
│   │   ├── components/
│   │   ├── api/
│   │   └── hooks/
│   │
│   ├── settlements/
│   │
│   ├── notifications/
│   │
│   └── profile/
│
├── pages/
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Dashboard.tsx
│   ├── Group.tsx
│   ├── Expenses.tsx
│   ├── Balances.tsx
│   ├── Activity.tsx
│   └── Settings.tsx
│
├── lib/
│   ├── api.ts
│   ├── socket.ts
│   ├── utils.ts
│   └── validation.ts
│
├── hooks/
│
├── types/
│
└── main.tsx
```

---

# 5. Backend Architecture

Recommended backend stack:

- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose

```text
server/
│
├── src/
│
│   ├── config/
│   │   ├── database.ts
│   │   ├── env.ts
│   │   └── redis.ts
│   │
│   ├── modules/
│   │
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.validation.ts
│   │   │   └── auth.types.ts
│   │   │
│   │   ├── users/
│   │   │
│   │   ├── groups/
│   │   │
│   │   ├── expenses/
│   │   │
│   │   ├── balances/
│   │   │
│   │   ├── settlements/
│   │   │
│   │   └── notifications/
│   │
│   ├── models/
│   │
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   ├── rateLimiter.ts
│   │   └── validation.ts
│   │
│   ├── utils/
│   │   ├── debtSimplifier.ts
│   │   ├── jwt.ts
│   │   ├── logger.ts
│   │   └── email.ts
│   │
│   ├── socket/
│   │   ├── socket.ts
│   │   └── events.ts
│   │
│   ├── routes.ts
│   └── server.ts
│
└── package.json
```

---

# 6. Database Architecture

Recommended MongoDB collections:

```text
users
groups
groupMembers        # optional initially
expenses
settlements
notifications
comments
sessions
activities          # optional but useful
```

---

# 7. User Schema

```text
User
│
├── _id
├── name
├── email
├── passwordHash
├── avatar
├── currency
├── timezone
├── createdAt
└── updatedAt
```

Example:

```json
{
  "name": "Vedant",
  "email": "vedant@example.com",
  "passwordHash": "...",
  "currency": "INR"
}
```

Never store plain-text passwords.

Use:

- Argon2, or
- bcrypt

Store:

```text
passwordHash
```

instead.

---

# 8. Group Schema

```text
Group
│
├── _id
├── name
├── description
├── image
├── createdBy
├── members[]
├── currency
├── createdAt
└── updatedAt
```

Example:

```json
{
  "name": "Goa Trip",
  "createdBy": "user123",
  "members": [
    "user123",
    "user456",
    "user789"
  ],
  "currency": "INR"
}
```

---

# 9. Expense Schema

The expense model is one of the most important models in the application.

```text
Expense
│
├── _id
├── groupId
├── description
├── amount
├── currency
├── paidBy
├── splitType
├── participants[]
├── category
├── notes
├── createdBy
├── createdAt
└── updatedAt
```

Example:

```json
{
  "description": "Hotel",
  "amount": 4000,
  "paidBy": "vedant",
  "splitType": "equal",
  "participants": [
    {
      "userId": "vedant",
      "amount": 1000
    },
    {
      "userId": "rahul",
      "amount": 1000
    },
    {
      "userId": "aman",
      "amount": 1000
    },
    {
      "userId": "rohit",
      "amount": 1000
    }
  ]
}
```

---

# 10. Expense Splitting Algorithms

The application should support multiple split methods.

## Equal Split

```text
₹4000 / 4

₹1000 each
```

## Exact Amounts

```text
Vedant → ₹1500
Rahul  → ₹1000
Aman   → ₹1000
Rohit  → ₹500
```

## Percentage

```text
Vedant → 40%
Rahul  → 20%
Aman   → 20%
Rohit  → 20%
```

## Shares

```text
Vedant → 2 shares
Rahul  → 1 share
Aman   → 1 share
```

Backend validation should ensure:

```text
sum(participants.amount) == expense.amount
```

Do not trust the frontend to enforce this.

---

# 11. Balance Calculation

Example:

```text
A pays ₹3000
B pays ₹1000
C pays ₹0
```

Three people share equally.

Total:

```text
₹4000
```

Fair share:

```text
₹4000 / 3 = ₹1333.33
```

Net balances:

```text
A → +₹1666.67
B → -₹333.33
C → -₹1333.33
```

The system can produce:

```text
C → A ₹1333.33
B → A ₹333.33
```

---

# 12. Debt Simplification Algorithm

Create:

```text
utils/debtSimplifier.ts
```

Conceptually:

```text
calculateBalances()
        ↓
positive balances
        +
negative balances
        ↓
match creditors/debtors
        ↓
generate minimum transactions
```

Example:

```text
A +₹2000
B -₹1000
C -₹1000
```

Output:

```text
B → A ₹1000
C → A ₹1000
```

Another example:

```text
A +₹3000
B -₹2000
C -₹1000
```

Output:

```text
B → A ₹2000
C → A ₹1000
```

This is one of the most important algorithmic parts of the project.

You should understand the algorithm instead of simply copying an implementation.

---

# 13. Settlement System

Settlement model:

```text
Settlement
│
├── _id
├── groupId
├── from
├── to
├── amount
├── currency
├── note
├── createdAt
└── createdBy
```

Example:

```text
Rahul
   ↓ ₹1000
Vedant
```

After a settlement, the relevant balance should update.

---

# 14. Authentication Architecture

Recommended:

```text
JWT
+
HTTP-only cookies
```

Flow:

```text
REGISTER
   ↓
Hash password
   ↓
Save user
   ↓
LOGIN
   ↓
Verify password
   ↓
Generate access token
   ↓
HTTP-only cookie
```

Protected request:

```text
React
 ↓
GET /api/groups
 ↓
Cookie
 ↓
Auth Middleware
 ↓
Verify JWT
 ↓
Controller
```

Security concepts to learn:

- Password hashing
- JWT
- HTTP-only cookies
- CORS
- CSRF considerations
- Rate limiting
- Input validation
- Authorization

---

# 15. Authorization

Authentication asks:

> Who are you?

Authorization asks:

> Are you allowed to do this?

Example:

```text
User A belongs to Group X
```

User A can access:

```text
GET /groups/X
POST /groups/X/expenses
```

But should not be able to access another private group:

```text
GET /groups/Y/private-data
```

The backend should verify group membership using something such as:

```text
isUserMemberOfGroup()
```

Never rely only on frontend restrictions.

---

# 16. REST API Architecture

## Authentication

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

## Users

```text
GET   /api/users/me
PATCH /api/users/me
POST  /api/users/avatar
```

## Groups

```text
POST   /api/groups
GET    /api/groups
GET    /api/groups/:groupId
PATCH  /api/groups/:groupId
DELETE /api/groups/:groupId
```

## Members

```text
POST   /api/groups/:groupId/members
DELETE /api/groups/:groupId/members/:userId
```

## Expenses

```text
POST   /api/groups/:groupId/expenses
GET    /api/groups/:groupId/expenses
GET    /api/expenses/:expenseId
PATCH  /api/expenses/:expenseId
DELETE /api/expenses/:expenseId
```

## Balances

```text
GET /api/groups/:groupId/balances
GET /api/groups/:groupId/debts
```

## Settlements

```text
POST /api/groups/:groupId/settlements
GET  /api/groups/:groupId/settlements
```

---

# 17. Real-Time Architecture

Use:

```text
Socket.IO
```

Example:

```text
Vedant adds expense
        ↓
POST /expenses
        ↓
MongoDB
        ↓
Server emits:
expense:created
        ↓
Socket.IO
        ↓
All group members
        ↓
UI updates instantly
```

Possible events:

```text
expense:created
expense:updated
expense:deleted

group:member-added
group:member-removed

settlement:created

notification:new
```

---

# 18. Socket Rooms

Each group can become a Socket.IO room.

```text
group:123
group:456
group:789
```

When Vedant opens Goa Trip:

```text
socket.join("group:123")
```

When an expense is created:

```text
io.to("group:123").emit(
    "expense:created",
    expense
)
```

Only users connected to that group room receive the event.

---

# 19. Redis

Redis is not required for the first version.

Add it when you want more advanced infrastructure.

Use Redis for:

- Caching
- Session management
- Rate limiting
- Socket.IO scaling
- Pub/Sub

If you run multiple backend instances:

```text
                    ┌── Server 1
Client ── Load Balancer
                    └── Server 2
```

A shared Socket.IO adapter such as Redis can allow events to propagate across backend instances.

This is where scalability concepts become practical.

---

# 20. Notifications

Notification model:

```text
Notification
│
├── userId
├── type
├── title
├── message
├── relatedEntity
├── read
└── createdAt
```

Examples:

```text
Vedant added ₹2000 Hotel expense
Rahul joined Goa Trip
Aman settled ₹500 with you
You were added to Goa Trip
```

Real-time delivery:

```text
Socket.IO
```

Persistent notifications:

```text
MongoDB
```

---

# 21. Email System

Optional but useful for a production-style project.

Possible provider:

- Resend
- Another transactional email provider

Emails can include:

```text
Welcome email
Group invitation
Expense notification
Settlement confirmation
Password reset
```

Architecture:

```text
Expense created
      ↓
Backend
      ↓
Notification Service
      ↓
Email Provider
```

---

# 22. File/Image Storage

For profile pictures and group images, use:

- Cloudinary, or
- AWS S3

Do not store actual image files inside MongoDB.

Store the resulting URL:

```text
image URL
```

---

# 23. Validation

Frontend:

```text
Zod
React Hook Form
```

Backend:

```text
Zod
```

or another validation library such as Joi.

Validate things such as:

```text
amount > 0
email is valid
group name is not empty
split amounts = total amount
user belongs to group
```

Important rule:

> Frontend validation is for UX. Backend validation is for security and data integrity.

---

# 24. Error Architecture

Instead of scattered:

```javascript
try {
  // ...
} catch (error) {
  console.log(error);
}
```

Create centralized:

```text
ApiError
ErrorHandler Middleware
```

Example response:

```json
{
  "success": false,
  "message": "You are not a member of this group",
  "code": "GROUP_ACCESS_DENIED"
}
```

This lets the frontend handle errors consistently.

---

# 25. Database Indexes

Indexes are important for performance.

Potential indexes:

```text
users.email
expenses.groupId
expenses.createdAt
notifications.userId
settlements.groupId
```

Useful compound index:

```text
groupId + createdAt
```

This can improve group expense history queries.

Indexes should be chosen based on actual query patterns.

---

# 26. Frontend Pages

Recommended routes:

```text
/
│
├── /login
├── /register
│
├── /dashboard
│
├── /groups
│   ├── /create
│   └── /:groupId
│
├── /groups/:groupId/expenses
├── /groups/:groupId/balances
├── /groups/:groupId/activity
│
├── /settlements
├── /notifications
└── /settings
```

---

# 27. Dashboard

Possible dashboard:

```text
┌─────────────────────────────────────┐
│ Hello Vedant 👋                     │
│                                     │
│ You owe       You're owed           │
│ ₹1,250        ₹3,450                │
│                                     │
├─────────────────────────────────────┤
│ Recent Expenses                     │
│                                     │
│ 🏨 Hotel              ₹4,000        │
│ 🍕 Dinner             ₹1,200        │
│ 🚕 Taxi                ₹500         │
│                                     │
├─────────────────────────────────────┤
│ Your Groups                         │
│                                     │
│ Goa Trip                            │
│ College                             │
│ Roommates                           │
└─────────────────────────────────────┘
```

---

# 28. Expense Creation Flow

```text
Add Expense
     ↓
Description
     ↓
Amount
     ↓
Paid by
     ↓
Choose participants
     ↓
Choose split method
     ↓
Calculate shares
     ↓
Review
     ↓
Submit
```

Example:

```text
Expense: Dinner

₹2400

Paid by:
● Vedant

Split:
○ Equal
○ Exact
○ Percentage
○ Shares

Participants:

☑ Vedant
☑ Rahul
☑ Aman
☑ Rohit

Each pays:

₹600
```

---

# 29. Activity System

Activity feed examples:

```text
Vedant added Hotel ₹4000

Rahul settled ₹1000 with Vedant

Aman added Dinner ₹2400

Rohit joined Goa Trip
```

This can be powered by:

- An explicit `activities` collection, or
- A carefully designed event system

For a portfolio project, an explicit activity collection is reasonable.

---

# 30. Product Analytics

Inside SplitSync, build expense analytics such as:

```text
Total expenses
Monthly spending
Category spending
Group spending
Most expensive category
Settlement frequency
```

Use MongoDB aggregation:

```text
expenses
   ↓
$match
   ↓
$group
   ↓
$sum
   ↓
$sort
```

Display charts using:

- Recharts
- Chart.js

Example:

```text
Food       ₹12,500
Travel      ₹8,400
Hotel       ₹6,000
Transport   ₹3,200
```

---

# 31. Website Visitor Analytics

Product analytics and website visitor analytics are different.

If you want to know:

> How many people visited my deployed website?

Use:

- Vercel Analytics, or
- Another web analytics platform

Do not mix visitor analytics with your internal expense analytics.

---

# 32. Testing Architecture

## Frontend

- Vitest
- React Testing Library

## Backend

- Vitest or Jest
- Supertest

Test:

```text
register
login
create group
add member
create expense
split expense
calculate balance
settlement
authorization
```

### Most important tests

Test the debt algorithm carefully.

Example:

```text
Input:
A +1000
B -400
C -600

Expected:
B → A 400
C → A 600
```

---

# 33. API Documentation

Use:

```text
Swagger / OpenAPI
```

Expose something like:

```text
/api/docs
```

This lets developers and recruiters inspect the backend API.

---

# 34. Security

Important concepts:

```text
JWT
HTTP-only cookies
Password hashing
CORS
CSRF
XSS
NoSQL injection
Rate limiting
Input validation
Authorization
Environment variables
Secure headers
```

Useful packages/tools include:

```text
helmet
cors
express-rate-limit
zod
argon2 / bcrypt
```

Never commit secrets such as:

```text
MONGO_URI
JWT_SECRET
EMAIL_API_KEY
```

Use:

```text
.env
```

and provide:

```text
.env.example
```

---

# 35. Environment Variables

Backend:

```env
PORT=
MONGO_URI=
JWT_SECRET=
CLIENT_URL=
REDIS_URL=
CLOUDINARY_URL=
EMAIL_API_KEY=
```

Frontend:

```env
VITE_API_URL=
```

Never commit actual production secrets.

---

# 36. Deployment Architecture

A practical deployment:

```text
                  INTERNET
                     │
             ┌───────┴────────┐
             │                │
             ▼                ▼
          Vercel           Backend Host
             │                │
          React            Node/Express
                                │
                       ┌────────┴────────┐
                       │                 │
                       ▼                 ▼
                    MongoDB           Redis
                   Atlas             optional
```

Possible services:

- Frontend: Vercel
- Backend: Render/Railway/another cloud provider
- Database: MongoDB Atlas
- Redis: Redis-compatible managed provider
- Images: Cloudinary/S3

---

# 37. CI/CD

Use:

```text
GitHub
GitHub Actions
Vercel
Backend hosting
MongoDB Atlas
```

Pipeline:

```text
git push
   ↓
GitHub
   ↓
CI
   ├── npm install
   ├── lint
   ├── typecheck
   ├── test
   └── build
   ↓
Deploy
```

---

# 38. Docker

After the basic application works, learn:

- Docker
- Docker Compose

Possible development environment:

```text
docker-compose.yml

frontend
backend
mongodb
redis
```

Conceptually:

```text
React
   │
Node
   │
MongoDB
   │
Redis
```

Docker is useful for making the development environment reproducible.

---

# 39. Logging

Use a structured logger such as:

```text
Pino
```

Instead of relying only on:

```javascript
console.log()
```

Useful structured logs:

```text
INFO expense.created
userId=123
groupId=456
expenseId=789
```

---

# 40. Monitoring

Consider:

```text
Sentry
```

for application errors.

Monitor:

```text
API response time
errors
database performance
server health
```

---

# 41. Complete Production-Style Architecture

```text
                         ┌─────────────────────┐
                         │      USER           │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ React + TypeScript  │
                         │ Tailwind + shadcn   │
                         └───────┬─────┬───────┘
                                 │     │
                         REST API│     │WebSocket
                                 │     │
                                 ▼     ▼
                         ┌─────────────────────┐
                         │ Node.js + Express   │
                         │ TypeScript          │
                         └──────────┬──────────┘
                                    │
                 ┌──────────────────┼─────────────────┐
                 │                  │                 │
                 ▼                  ▼                 ▼
           ┌───────────┐      ┌───────────┐    ┌────────────┐
           │ Auth      │      │ Expense   │    │ Group      │
           │ Service   │      │ Service   │    │ Service    │
           └───────────┘      └───────────┘    └────────────┘
                 │                  │                 │
                 └──────────────────┼─────────────────┘
                                    │
                                    ▼
                            ┌───────────────┐
                            │   MongoDB     │
                            │   Atlas       │
                            └───────────────┘
                                    │
                             ┌──────▼──────┐
                             │    Redis    │
                             │   optional  │
                             └─────────────┘

       ┌────────────────┐       ┌──────────────────┐
       │ Cloudinary/S3  │       │ Email Provider   │
       │ Images         │       │ Notifications    │
       └────────────────┘       └──────────────────┘

                         ┌─────────────────────┐
                         │ GitHub Actions      │
                         │ CI/CD               │
                         └──────────┬──────────┘
                                    │
                                    ▼
                              Production
```

---

# 42. Skills You Need

## Level 1 — Frontend Fundamentals

Learn:

```text
HTML
CSS
JavaScript
TypeScript
React
React Hooks
React Router
Forms
API calls
Async/Await
Error handling
Responsive UI
```

---

## Level 2 — Advanced React

Learn:

```text
Component architecture
Custom hooks
Context
TanStack Query
Optimistic updates
Loading states
Error states
Form validation
Code splitting
Lazy loading
```

### Optimistic Updates

Example:

```text
Click Add
   ↓
UI updates immediately
   ↓
API request
   ↓
Server confirms
```

This makes the UI feel responsive.

---

## Level 3 — Backend

Learn:

```text
Node.js
Express
REST APIs
Middleware
Controllers
Services
Repositories
Authentication
Authorization
Error handling
Validation
Logging
```

Understand:

```text
Request
 ↓
Router
 ↓
Middleware
 ↓
Controller
 ↓
Service
 ↓
Database
 ↓
Response
```

---

## Level 4 — MongoDB

Learn:

```text
CRUD
Documents
Collections
References
Embedding
Indexes
Aggregation
Transactions
Schema design
Mongoose
```

Especially understand aggregation for analytics:

```text
expenses
   ↓
$match
   ↓
$group
   ↓
$sum
   ↓
$sort
```

---

## Level 5 — Algorithms

For this project, learn:

```text
Hash Maps
Sorting
Greedy algorithms
Graph concepts
Debt simplification
Minimizing transactions
```

The debt simplification problem is particularly valuable because it gives the project a meaningful algorithmic component.

---

## Level 6 — WebSockets

Learn:

```text
WebSocket
Socket.IO
Rooms
Events
Broadcasting
Connection lifecycle
Reconnection
Authentication
```

Architecture:

```text
Client
   ↕
Socket.IO
   ↕
Node
   ↕
MongoDB
```

---

## Level 7 — Database/System Design

Learn:

```text
Database normalization
Denormalization
Indexes
Transactions
Concurrency
Caching
Pagination
Rate limiting
Scalability
Load balancing
```

---

# 43. Pagination

Do not return huge numbers of records:

```text
GET /expenses
```

Instead use pagination:

```text
GET /expenses?page=1&limit=20
```

For a more advanced design, use cursor pagination:

```text
GET /expenses?cursor=abc123
```

Cursor pagination is worth understanding for large datasets.

---

# 44. Build Order

Do not build every feature simultaneously.

## Phase 1 — Foundation

```text
React + TypeScript
Node + Express + TypeScript
MongoDB
Mongoose
Git/GitHub
```

Build:

```text
Register
Login
Logout
Profile
```

---

## Phase 2 — Groups

Build:

```text
Create group
Join group
Invite member
Remove member
Group dashboard
```

---

## Phase 3 — Expenses

Build:

```text
Add expense
Equal split
Exact split
Percentage split
Shares split
Edit expense
Delete expense
```

---

## Phase 4 — Balance Engine

Build:

```text
calculateBalance()
calculateDebts()
simplifyDebts()
```

This is the core algorithmic part.

---

## Phase 5 — Settlements

Build:

```text
Pay someone
Record settlement
Update balances
Settlement history
```

---

## Phase 6 — Real-Time

Add:

```text
Socket.IO
Rooms
Events
Live expense updates
Live settlement updates
Notifications
```

---

## Phase 7 — Analytics

Add:

```text
Monthly expenses
Category breakdown
Group statistics
Charts
```

---

## Phase 8 — Production Features

Add:

```text
Redis
Rate limiting
Logging
Sentry
Email
Cloudinary
Pagination
Caching
Swagger
```

---

## Phase 9 — Testing

Add:

```text
Unit tests
API tests
Integration tests
Frontend tests
Debt algorithm tests
```

---

## Phase 10 — Deployment

```text
GitHub
        ↓
GitHub Actions
        ↓
Frontend → Vercel
Backend → Cloud hosting
Database → MongoDB Atlas
Redis → Managed Redis
Images → Cloudinary/S3
```

---

# 45. Complete Learning Coverage

This project can cover a large portion of modern full-stack development:

| Area | Skills |
|---|---|
| Frontend | React, TypeScript, Tailwind |
| Backend | Node, Express |
| Database | MongoDB, Mongoose |
| Authentication | JWT, cookies, hashing |
| Authorization | Access control |
| APIs | REST |
| Real-time | WebSockets, Socket.IO |
| Algorithms | Debt simplification |
| Database design | Schema/indexes |
| Validation | Zod |
| State | TanStack Query/Zustand |
| Caching | Redis |
| Notifications | Socket.IO/email |
| Storage | Cloudinary/S3 |
| Testing | Vitest/Jest/Supertest |
| DevOps | Docker, CI/CD |
| Deployment | Vercel + cloud backend |
| Monitoring | Sentry/logging |
| Documentation | Swagger/OpenAPI |
| System Design | Scalability, caching, load balancing |

---

# 46. Portfolio Positioning

Instead of calling the project simply:

> Splitwise Clone

Use a project name such as:

## SplitSync — Real-Time Expense Sharing Platform

Suggested portfolio description:

> A full-stack expense-sharing platform that enables groups to track shared expenses, automatically calculate and simplify debts, manage settlements, and synchronize financial activity in real time using WebSockets.

### Technology Stack

```text
React
TypeScript
Node.js
Express
MongoDB
Mongoose
Socket.IO
TanStack Query
Tailwind CSS
JWT
Redis
Docker
GitHub Actions
```

The project demonstrates:

```text
Frontend
→ Backend
→ Database
→ Authentication
→ Authorization
→ Algorithms
→ Real-time systems
→ Caching
→ Testing
→ Deployment
→ System design
```

---

# 47. Final Goal

The goal should not be to make only a visual clone.

The goal is to build a complete system where you can explain:

1. Why the database is designed this way.
2. How authentication works.
3. How authorization is enforced.
4. How expenses are split.
5. How balances are calculated.
6. How debt simplification works.
7. How settlements affect balances.
8. How real-time synchronization works.
9. Why Socket.IO rooms are used.
10. When Redis becomes useful.
11. How indexes improve queries.
12. How pagination works.
13. How the API is structured.
14. How errors are handled.
15. How security is implemented.
16. How the application is tested.
17. How CI/CD works.
18. How the application scales.

That turns the project from a simple "clone" into a strong full-stack/system-design portfolio project.
