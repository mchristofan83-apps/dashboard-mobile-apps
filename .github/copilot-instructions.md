# AI Coding Agent Guidelines for Dashboard & Mobile Apps System

## 🏗️ Architecture Overview

This is a **full-stack monitoring and reporting system** with three main components:
- **Backend Server** (`server/`): Express.js API with SQLite database, WebSocket real-time sync, JWT authentication
- **Web Dashboard** (`dashboard/`): React 18 + Vite + Material-UI for desktop management interface
- **Mobile App** (`MobileApp/`): Expo (React Native) for iOS/Android with offline-first SQLite support

**Critical Data Flow**: Mobile apps ↔ WebSocket/REST API ↔ Backend DB ↔ Dashboard UI

## 🔐 Authentication & Security

- **Pattern**: JWT tokens with 24h expiry, stored in localStorage (web) or SecureStore (mobile)
- **Default Credentials**: Admin user created with `DEFAULT_ADMIN_USERNAME` and `DEFAULT_ADMIN_PASSWORD` from `.env`
- **Key Files**: 
  - [server/controllers/authController.js](server/controllers/authController.js) - JWT generation and validation
  - [server/middleware/](server/middleware/) - Rate limiting, input sanitization, token verification
  - [dashboard/src/components/Login/Login.jsx](dashboard/src/components/Login/Login.jsx) - Token persistence

**Implementation Pattern**: All protected endpoints check JWT via middleware before accessing controllers.

## 📊 Core Domains & Tables

| Domain | Tables | Purpose |
|--------|--------|---------|
| **Users** | `users`, `datauser` | Authentication, user profiles (nama, jabatan, amo) |
| **Outlets** | `dataoutlet` | Store locations with GPS coordinates |
| **Visits** | `datavisitmd`, `datavisitsales`, `datavisitaction` | MD/Sales visit schedules, checkins/checkouts |
| **Reports** | `reports` | Daily visit summaries with Excel export |

**Location & File Example**: SQL schemas in [server/config/database.js](server/config/database.js) - all tables use SQLite with foreign keys enabled.

## 🔄 Real-Time Synchronization Architecture

**Two-way sync mechanism:**
1. **WebSocket** (Socket.io) for live updates: Clients connect to `server/socket/` handlers
2. **Scheduled Cron** (node-cron): 12:00 & 18:00 sync to Cloudflare KV for redundancy
3. **Mobile Offline**: Expo-SQLite stores local snapshots, syncs when connection restored

**Key Files**:
- [server/socket/](server/socket/) - Real-time event handlers (check-in, photo upload, report updates)
- [server/utils/syncScheduler.js](server/utils/syncScheduler.js) - Cron job configuration
- [server/sync/CloudflareKVSync.js](server/sync/CloudflareKVSync.js) - Cloudflare integration (KV + Workers)
- [MobileApp/src/services/api.js](MobileApp/src/services/api.js) - Offline queue and sync retry logic

**When adding features**: Always update WebSocket event handlers in `socket/` directory to broadcast changes in real-time.

## 🛠️ Development Workflows

### Start Backend
```bash
cd server
npm install
npm run dev              # Runs with nodemon (auto-reload on file change)
# or for production: pm2 start ecosystem.config.js
```

### Start Dashboard
```bash
cd dashboard
npm install
npm run dev             # Vite dev server on port 5173
npm run build           # Production build to dist/
```

### Start Mobile App
```bash
cd MobileApp
npm install
npm start               # Expo CLI menu (choose 'a' for Android, 'i' for iOS, 'w' for web)
# Update src/utils/constants.js with your computer's IP for API_URL
```

**Common Issue**: Mobile can't reach backend → Ensure IP address in `constants.js` matches your machine's local IP and backend is running.

## 📁 Key File Patterns

### Backend Controllers
**Pattern**: Each domain gets a controller in `server/controllers/` with standard CRUD + domain-specific logic.

Example ([server/controllers/visitController.js](server/controllers/visitController.js)):
```javascript
exports.checkIn = async (req, res) => {
  // Validate JWT via middleware first (already done)
  // Get location from GPS, store photo, emit WebSocket event
  // Return standardized response: { success: true, data: {...}, message: "..." }
}
```

**Response Format**: All endpoints return `{ success: boolean, data: object, message: string, timestamp: ISO8601 }`

### Frontend Services
**Pattern**: `src/services/` contains API abstraction layer with Axios + WebSocket handlers.

Example ([dashboard/src/services/api.js](dashboard/src/services/api.js)):
- Axios instances configured with JWT header injection
- Socket.io client listeners for real-time updates
- Error handling with automatic token refresh

### Routes
**Pattern**: Each route file in `server/routes/` imports controller and applies middleware.

Example ([server/routes/visitRoutes.js](server/routes/visitRoutes.js)):
```javascript
router.post('/check-in', authenticate, visitController.checkIn)
```

## 🎨 Frontend Conventions

### Dashboard (React + Vite)
- **Component Structure**: Functional components with hooks, Material-UI for styling
- **State Management**: useState + custom hooks (no Redux/Zustand observed)
- **Navigation**: React Router v6 with protected route wrapper at root level

### Mobile (Expo/React Native)
- **Navigation**: React Navigation (stack + bottom tabs)
- **Permissions**: Handled via Expo APIs (`expo-location`, `expo-camera`, `expo-image-picker`)
- **Local Storage**: AsyncStorage for simple data, expo-sqlite for complex queries

## 🚀 Deployment & Configuration

- **Environment Variables**: Load from `.env` in both server and dashboard (Vite requires `VITE_` prefix)
- **Cloudflare Integration**: 
  - Dashboard deploys to Cloudflare Pages (see `dashboard/wrangler.toml`)
  - Backend can use Cloudflare Workers for API proxy (see `server/cloudflare-worker.js`)
- **Mobile Builds**: 
  - Use EAS (Expo Application Services) for production builds
  - Preview APK: `npm run build:android:apk`
  - App Store builds: `npm run build:ios` (requires Apple Developer account)

## 📦 External Dependencies to Know

- **express, socket.io**: Backend server framework & real-time
- **react, react-router-dom, @mui/material**: Dashboard UI
- **expo, react-native**: Mobile app framework
- **sqlite3, exceljs**: Data persistence & Excel export
- **bcryptjs, jsonwebtoken**: Security
- **axios**: HTTP client (used by all 3 components)
- **multer**: File upload handling (images, Excel files)
- **node-cron**: Scheduled sync jobs

## ⚡ Performance & Limits

- **Max File Upload**: 10MB (set in [server/index.js](server/index.js))
- **Rate Limiting**: Implemented on `/api/*` routes (see `middleware/rateLimiter.js`)
- **Input Sanitization**: All POST/PUT bodies validated via `middleware/validation.js`
- **Database Indexes**: Ensure GPS-heavy queries have proper indexing on `dataoutlet.latitude`, `dataoutlet.longitude`

## 🔍 Debugging Tips

1. **Backend Issues**: Check `server/logs/access.log` (production) or console output (dev)
2. **Mobile Connectivity**: Inspect network requests via `MobileApp/src/services/api.js` and ensure API_URL is correct
3. **Real-time Sync Lag**: Check WebSocket connection status with `socket.io-client` devtools extension
4. **Database Locks**: SQLite has limited concurrency - if seeing SQLITE_BUSY errors, review transaction patterns in controllers
5. **JWT Expiry**: Token refresh logic in Dashboard's API service should auto-retry on 401 responses

## 🎯 Before Starting Work

1. **Always check** which component you're modifying (server, dashboard, or mobile) - dependencies differ
2. **Real-time features**: Add WebSocket event handler in `socket/` directory, don't just return REST response
3. **Database changes**: Update `config/database.js` schema, test with fresh DB reset if needed
4. **Mobile offline**: If adding feature, ensure mobile caching + sync logic in `MobileApp/src/services/api.js`
5. **Configuration**: Check if feature needs `.env` variable or Vite environment setup
