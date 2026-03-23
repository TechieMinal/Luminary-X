<div align="center">
  <h1>⚡ Luminary X</h1>
  <p><strong>Career Development & Mentorship Platform</strong></p>
  <p>A production-grade SaaS connecting ambitious professionals with expert mentors for real career growth.</p>

  ![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)
  ![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)
  ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47a248?style=flat-square&logo=mongodb)
  ![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7-010101?style=flat-square&logo=socket.io)
  ![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)
</div>

---

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | `https://luminary-x.vercel.app` |
| **API** | `https://luminary-x-api.onrender.com` |
| **Health** | `https://luminary-x-api.onrender.com/health` |

### ⚡ Demo Credentials (one-click on login page)

| Role | Email | Password |
|------|-------|----------|
| **Student** | `student@demo.com` | `Demo@12345` |
| **Mentor** | `mentor@demo.com` | `Demo@12345` |
| **Admin** | `admin@luminaryx.com` | `Admin@123456` |

> Demo accounts are created via `npm run seed`. Login page has one-click demo buttons.

---

## ✨ Features

### 🎓 Student
- Skill portfolio with proficiency levels and endorsements
- Project showcase with GitHub + live URL linking
- Browse, search, and filter approved mentors
- Book 1:1 sessions with scheduling conflict detection
- Rate and review completed sessions
- Real-time messaging with online indicators

### 🧑‍💼 Mentor
- Rich profile: expertise tags, company, availability, rates
- Manage mentee roster and session pipeline
- Confirm/decline/complete sessions with meeting links and notes
- Real-time messaging with students

### 🛡 Admin
- Analytics dashboard with Recharts (Area chart, Pie chart, progress bars)
- Platform-wide stats: users, sessions, messages, approvals
- Full user management: search, filter, activate/deactivate, delete
- Mentor approval workflow with full profile preview

### 💬 Real-Time Messaging (Socket.IO)
- Online/offline indicators
- Instant message delivery without polling
- Unread count broadcast to all connected sessions
- Falls back to HTTP if WebSocket unavailable

---

## 🛠 Tech Stack

### Frontend
| Tech | Purpose |
|------|---------|
| React 18 + Vite | UI framework + HMR builds |
| Tailwind CSS | Utility-first design system |
| Zustand | Global state (auth, messages) |
| React Router v6 | Client-side routing + guards |
| Axios | HTTP client with interceptors |
| Socket.IO Client | Real-time messaging |
| Recharts | Admin analytics charts |
| react-hot-toast | Notifications |
| Lucide React | Icons |

### Backend
| Tech | Purpose |
|------|---------|
| Node.js + Express | REST API server |
| Socket.IO | WebSocket server |
| MongoDB Atlas | Document database |
| Mongoose | ODM + schema validation |
| JWT | Stateless authentication |
| bcryptjs | Password hashing (12 rounds) |
| Helmet | HTTP security headers |
| express-rate-limit | Throttling (prod only) |
| express-mongo-sanitize | NoSQL injection prevention |
| express-validator | Input validation |
| Winston | Structured logging |

---

## 📁 Project Structure

```
luminary-x/
├── backend/
│   ├── src/
│   │   ├── config/         db.js, seed.js (demo accounts)
│   │   ├── controllers/    auth, mentor, session, project, skill, message, admin
│   │   ├── middleware/     auth.js (JWT+roles), errorHandler.js, rateLimiter.js
│   │   ├── models/         User, MentorProfile, Project, Skill, Message, Session
│   │   ├── routes/         6 domain routers
│   │   ├── utils/          apiResponse.js, logger.js
│   │   ├── validators/     authValidators.js
│   │   └── server.js       Express + Socket.IO integrated
│   └── render.yaml
│
└── frontend/
    └── src/
        ├── api/            auth, mentors, sessions, projects, skills, messages, admin
        ├── components/
        │   └── common/     Avatar, Modal, Spinner/Skeleton, StatsCard, EmptyState, ConfirmDialog
        ├── hooks/
        │   └── useSocket.js  Socket.IO hook with reconnection
        ├── layouts/
        │   └── AppLayout.jsx  Sidebar nav + topbar (role-aware)
        ├── pages/
        │   ├── landing/    Landing.jsx (hero, features, testimonials, CTA)
        │   ├── auth/       Login (demo buttons), Register
        │   ├── student/    Dashboard, Skills, Projects, Mentors, Sessions
        │   ├── mentor/     Dashboard, Mentees, Sessions, Profile
        │   └── admin/      Dashboard (charts), Users (table), Approvals
        ├── store/          authStore.js, messageStore.js (Zustand)
        └── utils/          helpers.js (dates, badges, formatting)
```

---

## 📡 API Reference

### Standard Response
```json
{ "success": true, "data": {}, "message": "...", "error": null }
```
Paginated responses include `"pagination": { "total", "page", "limit", "pages" }`.

### Endpoints Summary

| Domain | Routes |
|--------|--------|
| **Auth** | POST /register, POST /login, GET /me, PUT /profile |
| **Mentors** | GET /, GET /:id, GET+PUT /profile, GET /profile/mentees+sessions |
| **Sessions** | GET /my, POST /, PUT /:id/status, POST /:id/rate |
| **Projects** | GET /, GET /my, POST /, PUT+DELETE /:id, POST /:id/like |
| **Skills** | GET /my, POST /, PUT+DELETE /:id, POST /:id/endorse |
| **Messages** | GET /conversations, GET /unread, GET /users, GET /:userId, POST / |
| **Admin** | GET /dashboard, GET+PATCH+DELETE /users/:id, GET /pending-mentors, PUT /users/:id/approve |

### Socket.IO Events
| Event | Direction | Description |
|-------|-----------|-------------|
| `message:send` | Client → Server | Send a message |
| `message:receive` | Server → Client | Incoming message |
| `message:sent` | Server → Client | Confirm delivery |
| `users:online` | Server → Client | Online users list on connect |
| `user:online/offline` | Server → Client | Presence updates |
| `unread:update` | Server → Client | Unread count changed |
| `messages:read` | Client → Server | Mark conversation read |

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)

### 1. Clone
```bash
git clone https://github.com/yourusername/luminary-x.git
cd luminary-x
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env
# Fill in MONGO_URI and JWT_SECRET
npm run seed    # Creates demo + admin accounts
npm run dev     # → http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL=/api (proxy in dev)
npm run dev            # → http://localhost:5173
```

---

## 🔐 Environment Variables

### Backend `.env`
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/luminary-x
JWT_SECRET=at_least_32_random_characters
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@luminaryx.com
ADMIN_PASSWORD=Admin@123456
```

### Frontend `.env`
```env
# Dev — Vite proxy handles /api → :5000
VITE_API_URL=/api

# Prod — point to your deployed backend
# VITE_API_URL=https://luminary-x-api.onrender.com/api
```

---

## 🚀 Deployment

### Backend → Render
1. New Web Service → connect GitHub, root: `backend/`
2. Build: `npm install` · Start: `npm start`
3. Add all env vars from `.env.example`
4. After deploy: open Shell → `npm run seed`

### Frontend → Vercel
1. New Project → import repo, root: `frontend/`
2. Add `VITE_API_URL=https://your-app.onrender.com/api`
3. Deploy — `vercel.json` handles SPA routing

### Post-Deployment
- Update backend `CLIENT_URL` to your Vercel URL
- Set `NODE_ENV=production` on Render
- Change admin password after first login

---

## 🔒 Security

| Layer | Implementation |
|-------|---------------|
| Authentication | JWT (7d expiry), verified on every request |
| Authorization | Role middleware on all protected routes |
| Passwords | bcrypt, 12 salt rounds |
| Injection | `express-mongo-sanitize` |
| Headers | `helmet` (X-Frame-Options, CSP, etc.) |
| Rate Limiting | Auth 10/15min, API 100/15min, Messages 30/min — **production only** |
| CORS | Strict allowlist, no wildcard |
| Admin creation | Seed script only — registration blocks `role=admin` |
| Socket auth | JWT verified in Socket.IO middleware |

---

## 🏗 Architecture Notes

**Socket.IO**: Integrated into the same HTTP server as Express using `createServer`. Uses JWT auth middleware for socket handshake, personal rooms (`user:<id>`), and an in-memory `Map` for online tracking.

**API contract**: All controllers return a flat `data` object (`res.data.data = array | object`). `sendPaginated` returns array in `data` with separate `pagination` key. This keeps frontend consumption consistent.

**Demo accounts**: Created by `npm run seed` which is idempotent — safe to run multiple times. The login page has one-click demo buttons for Student, Mentor, and Admin.

---

## 📄 License

MIT — free to use, fork, and deploy.

---

Built as a production-grade portfolio project. Zero mock data. Real API. Real-time. Deployable today.
