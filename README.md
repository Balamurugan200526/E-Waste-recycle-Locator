# ♻️ E-CYCLE – Smart E-Waste Locator & Reward System

> **Hackathon-grade full-stack web application** that connects users to certified e-waste recycling centers, rewards responsible disposal with a credit system, and validates drops via QR codes and GPS anti-fraud technology.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Tailwind CSS, Leaflet Maps |
| Backend | Node.js, Express.js, Socket.IO (WebSockets) |
| Database | MongoDB with Mongoose ODM |
| Auth | JWT (JSON Web Tokens), bcryptjs |
| Real-time | Socket.IO bidirectional WebSockets |
| QR Code | `qrcode` npm package (server-side generation) |
| Maps | OpenStreetMap via React-Leaflet (free, no API key) |
| Security | Helmet, express-rate-limit, express-validator |
| PWA | Service Worker, Web App Manifest |
| DevOps | Docker + Docker Compose, Nginx |

---

## 📁 Full Project Structure

```
ecycle/
├── docker-compose.yml          ← Orchestrates all services
├── .gitignore
│
├── backend/
│   ├── server.js               ← Express + Socket.IO entry point
│   ├── package.json
│   ├── Dockerfile
│   ├── .env.example            ← Copy to .env and configure
│   │
│   ├── config/
│   │   └── database.js         ← MongoDB connection
│   │
│   ├── middleware/
│   │   └── auth.js             ← JWT verify, requireAdmin, generateToken
│   │
│   ├── models/
│   │   ├── User.js             ← User schema (credits, role, location)
│   │   ├── RecycleCenter.js    ← Centers with geospatial index
│   │   ├── RecycleTransaction.js ← Transactions with QR + GPS data
│   │   └── Notification.js     ← In-app notifications
│   │
│   ├── routes/
│   │   ├── auth.js             ← signup, login, /me, profile
│   │   ├── users.js            ← leaderboard
│   │   ├── admin.js            ← stats, user mgmt, credits, broadcast
│   │   ├── centers.js          ← CRUD + /nearby geospatial query
│   │   ├── recycle.js          ← submit, verify QR, my transactions
│   │   └── notifications.js    ← list, mark read
│   │
│   └── utils/
│       └── seed.js             ← Admin + demo user + 5 sample centers
│
└── frontend/
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── Dockerfile
    ├── nginx.conf
    │
    ├── public/
    │   ├── index.html
    │   ├── manifest.json       ← PWA manifest
    │   └── sw.js               ← Service Worker (offline support)
    │
    └── src/
        ├── App.js              ← Router, protected routes
        ├── index.js            ← Entry + SW registration
        ├── index.css           ← Tailwind + global styles + Leaflet theme
        │
        ├── context/
        │   ├── AuthContext.js  ← Auth state, login/logout/signup
        │   └── SocketContext.js ← WebSocket connection + live events
        │
        ├── utils/
        │   └── api.js          ← Axios client, all API methods grouped
        │
        ├── pages/
        │   ├── LandingPage.js  ← Hero, features, animated particles
        │   ├── LoginPage.js    ← Login form with demo credentials hint
        │   ├── SignupPage.js   ← Signup with password strength meter
        │   ├── DashboardPage.js ← Stats, quick actions, recent activity
        │   ├── MapPage.js      ← Leaflet map + nearby centers sidebar
        │   ├── RecyclePage.js  ← Multi-item form → QR code generation
        │   ├── LeaderboardPage.js ← Ranked users with podium
        │   ├── ProfilePage.js  ← Edit profile, change password
        │   ├── AdminDashboard.js ← Stats, user table, credit modal, broadcast
        │   └── NotFoundPage.js
        │
        └── components/
            └── ui/
                ├── Layout.js            ← Sidebar nav, mobile header
                └── LiveNotificationToast.js ← WebSocket toast popup
```

---

## ⚙️ Local Development Setup

### Prerequisites

- **Node.js** v18+ — https://nodejs.org
- **MongoDB** v6+ — https://www.mongodb.com/try/download/community
- **npm** v9+

---

### Step 1 — Clone / Download the project

```bash
# If using git
git clone <your-repo-url>
cd ecycle

# Or just ensure you're in the ecycle/ directory
```

---

### Step 2 — Set up the Backend

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ecycle
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
ADMIN_EMAIL=admin@ecycle.com
ADMIN_PASSWORD=Admin@123456
```

---

### Step 3 — Seed the Database

```bash
# From the backend/ directory
npm run seed
```

This creates:
- ✅ Admin user: `admin@ecycle.com` / `Admin@123456`
- ✅ Demo user: `demo@ecycle.com` / `Demo@123456`
- ✅ 5 recycling centers across India (with geospatial data)

---

### Step 4 — Start the Backend

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Backend runs at: **http://localhost:5000**
Health check: **http://localhost:5000/api/health**

---

### Step 5 — Set up the Frontend

```bash
# Open a new terminal
cd frontend

# Install dependencies
npm install
```

Create `frontend/.env` (optional — defaults work with the proxy):
```env
REACT_APP_API_URL=/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

### Step 6 — Start the Frontend

```bash
npm start
```

Frontend runs at: **http://localhost:3000**

---

## 🐳 Docker Deployment (Production)

Run the entire stack with a single command:

```bash
# From the ecycle/ root directory
docker-compose up --build

# Run in background
docker-compose up --build -d

# Seed the database inside Docker
docker exec -it ecycle_backend node utils/seed.js
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000/api |
| MongoDB | localhost:27017 |

---

## 🔐 Authentication & Roles

| Role | Access |
|------|--------|
| **User** | Dashboard, Map, Recycle, Leaderboard, Profile |
| **Admin** | All user pages + Admin Dashboard (users, credits, analytics, broadcast) |

**JWT Flow:**
1. Login → server returns JWT token
2. Token stored in `localStorage`
3. Axios interceptor attaches `Authorization: Bearer <token>` to every request
4. 401 responses automatically clear token and redirect to login

---

## 🗺️ API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | — | Create account |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | ✅ | Get current user |
| PUT | `/api/auth/profile` | ✅ | Update name |
| POST | `/api/auth/change-password` | ✅ | Change password |

### Centers
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/centers` | — | All active centers |
| GET | `/api/centers/nearby?lat=&lng=&radius=` | — | Geospatial nearest |
| GET | `/api/centers/:id` | — | Single center |
| POST | `/api/centers` | Admin | Create center |
| PUT | `/api/centers/:id` | Admin | Update center |
| DELETE | `/api/centers/:id` | Admin | Deactivate center |

### Recycling
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/recycle/submit` | ✅ | Submit e-waste, get QR |
| POST | `/api/recycle/verify` | ✅ | Verify QR, award credits |
| GET | `/api/recycle/my` | ✅ | User's transactions |
| GET | `/api/recycle/leaderboard` | — | Top 20 users |
| GET | `/api/recycle/:id` | ✅ | Single transaction |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/stats` | Admin | Dashboard analytics |
| GET | `/api/admin/users` | Admin | Paginated user list |
| PATCH | `/api/admin/users/:id/credits` | Admin | Add/remove credits |
| PATCH | `/api/admin/users/:id/status` | Admin | Activate/deactivate |
| GET | `/api/admin/transactions` | Admin | All transactions |
| POST | `/api/admin/broadcast` | Admin | Notify all users |

### Notifications
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/notifications` | ✅ | User notifications |
| PATCH | `/api/notifications/read-all` | ✅ | Mark all read |
| PATCH | `/api/notifications/:id/read` | ✅ | Mark one read |

---

## ⚡ Real-Time WebSocket Events

| Event | Direction | Trigger |
|-------|-----------|---------|
| `join` | Client→Server | After login (joins personal room) |
| `join_admin` | Client→Server | Admin after login |
| `credits_updated` | Server→Client | Admin credit change or QR verification |
| `transaction_created` | Server→Client | New recycling submission |
| `new_user` | Server→Admins | New user signup |
| `transaction_verified` | Server→Admins | QR verified at center |
| `broadcast_notification` | Server→All | Admin broadcast |

---

## 📱 QR Code Recycling Flow

```
User fills form → Selects center + items + weight
       ↓
Backend generates UUID token + QR code (base64 PNG)
       ↓
User visits physical center, shows QR on screen
       ↓
Center staff (or admin) scans / enters token at /api/recycle/verify
       ↓
Backend validates token (not expired, not already used)
       ↓
Credits awarded instantly → WebSocket push to user's browser
       ↓
User sees live toast: "+50 Credits Earned! ✅"
```

---

## 🛡️ Security Features

| Feature | Implementation |
|---------|---------------|
| Password hashing | bcryptjs, 12 salt rounds |
| JWT auth | 7-day expiry, secret key |
| Rate limiting | 200 req/15min global, 20 req/15min auth |
| Input validation | express-validator on all POST/PATCH routes |
| HTTP headers | Helmet.js (XSS, clickjacking, MIME sniffing) |
| CORS | Whitelist only `CLIENT_URL` |
| GPS anti-fraud | 500m max distance validation at submission |
| QR expiry | 24-hour token expiry |
| Role guards | `requireAdmin` middleware on all admin routes |
| Account disable | Admin can deactivate users instantly |

---

## 🎨 UI Features

- **Dark eco-tech theme** — deep forest greens on near-black
- **Syne + DM Sans** — distinctive display/body font pairing
- **Glassmorphism cards** — frosted glass panels with subtle borders
- **Animated particle canvas** — on landing page
- **CSS grid background** — subtle dot grid across all pages
- **Smooth animations** — slide-up, fade-in, float, glow keyframes
- **Fully responsive** — mobile sidebar + collapsible nav
- **Loading skeletons** — shimmer placeholders during data fetch
- **Password strength meter** — real-time visual feedback
- **Dark Leaflet map** — hue-rotated tiles for eco-tech aesthetic

---

## 🏆 Key Differentiators (Hackathon Winning Features)

1. **Full real-time system** — credits update live via WebSockets
2. **QR anti-fraud** — UUID tokens with 24h expiry
3. **GPS validation** — 500m radius check to confirm physical presence
4. **PWA** — installable, offline-capable
5. **Role-based platform** — separate admin and user experiences
6. **Geospatial search** — MongoDB `$nearSphere` for accurate nearby results
7. **Broadcasting** — admin can notify all users simultaneously
8. **Leaderboard with podium** — gamified recycling incentive
9. **Docker production-ready** — one command full deployment
10. **Security hardened** — Helmet, rate limiting, validation, CORS

---

## 📧 Default Credentials (After Seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ecycle.com | Admin@123456 |
| Demo User | demo@ecycle.com | Demo@123456 |

> ⚠️ Change these immediately in production!

---

## 🌿 Built for a Sustainable Future

E-CYCLE demonstrates that technology and environmental responsibility can coexist — making recycling rewarding, verifiable, and community-driven.
