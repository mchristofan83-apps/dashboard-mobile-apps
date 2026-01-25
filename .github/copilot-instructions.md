# Copilot Instructions for Dashboard & Mobile Apps System

This is a **full-stack Visit Management System** with real-time GPS tracking, photo documentation, and automated data synchronization across web and mobile platforms.

## Architecture Overview

### Three Independent Tiers:

1. **Server** (Node.js/Express) - Single source of truth with SQLite databases
   - Manages 7 databases: `menulogin`, `datauser`, `dataoutlet`, `datavisitmd`, `datavisitsales`, `visitaction`, `synclog`
   - Real-time updates via Socket.IO
   - Scheduled sync at 12:00 & 18:00 (cron jobs in `server/utils/syncScheduler.js`)
   - JWT-based auth with admin/user roles

2. **Dashboard** (React 18 + Vite + Material-UI) - Web-based admin interface
   - Route structure: `/dashboard` (main), `/users`, `/outlets`, `/visits`, `/reports`, `/auth-users`
   - Protected routes via `ProtectedRoute` component checking `localStorage.token`
   - Uses `socket.io-client` for real-time updates
   - Material-UI theme configured in `App.jsx`

3. **MobileApp** (React Native/Expo) - Field operations on iOS/Android
   - Tab navigation with 4 main screens: Dashboard, Visits, Actions, Reports
   - Uses `expo-location` (GPS), `expo-camera`, `expo-image-picker`
   - AsyncStorage replaces localStorage (token stored in device storage)
   - Offline-first architecture with automatic sync on reconnection

## Data Flow Architecture

```
Tablet/Phone (MobileApp)
    ↓ [API calls + GPS data]
Server (Express + SQLite)
    ↓ [Socket.IO broadcasts]
Dashboard (React) + other Mobile Clients
```

### Critical Data Sync Points:
- **Check-in**: GPS coordinates captured via `expo-location`
- **Photo upload**: Images → `uploads/images/` via `multer` + `fileUpload.js`
- **Excel upload**: Files → `uploads/excel/` processed by `exceljs` then synced to DB
- **Sync cycle**: Records marked `synced_at = CURRENT_TIMESTAMP` by scheduled job

## Key Database Relationships

| Table | Primary Purpose | Foreign Keys |
|-------|-----------------|--------------|
| `menulogin` | User credentials + access levels (admin/user) | - |
| `datauser` | Field staff info (nama, jabatan, amo, warehouse) | Referenced by visits |
| `dataoutlet` | Store/outlet locations with GPS (latitude, longitude) | Referenced by visits |
| `datavisitmd` & `datavisitsales` | Scheduled visits | FK: idoutlet |
| `visitaction` | Actual visit execution (check-in/out, photos, status) | FK: visit_id |

**Admin-Only Operations**: User CRUD, Outlet CRUD, Visit scheduling all protected by `verifyAdmin` middleware.

## Common Development Workflows

### Running the Stack:
```bash
# Terminal 1: Start server
cd server && npm start

# Terminal 2: Start dashboard
cd dashboard && npm run dev

# Terminal 3: Start mobile app
cd MobileApp && npm start
```

**Node versions**: Server uses `bcryptjs`, `exceljs`, `xlsx` - verify package versions match workspace.

### Testing API Endpoints:
- Health check: `GET /api/health`
- Auth required endpoints: Include `Authorization: Bearer <token>` header
- File uploads use `Content-Type: multipart/form-data` (handled by `multer` with 10MB limit)

## Project-Specific Patterns

### 1. Middleware Stack (in order):
```javascript
// server/index.js
helmet() → compression() → morgan() → cors() → express.json() → sanitizeInput()
```
All routes require `verifyToken` except `/auth/login` and `/auth/register`.

### 2. API Response Format (consistent across all controllers):
```javascript
{ success: true/false, message: "...", data: {...}, error: "..." }
```

### 3. File Upload Strategy:
- Images saved with timestamp: `uploads/images/` + originalname
- Excel files: parsed with `exceljs`, inserted to DB, then file stored in `uploads/excel/`
- All file operations use `sanitizeInput` middleware to prevent injection
- **Bulk visit upload**: POST `/visits/md/upload-excel` or `/visits/sales/upload-excel`
  - Expects `username, amo, warehouse, idoutlet, namaoutlet, datevisit` columns
  - Returns: `{ successCount, errorCount, errors: [...] }` with first 10 errors shown
  - Status defaults to `'scheduled'` on insert
  - Templates available in [templates/](templates/) directory for reference

### 4. Socket.IO Broadcast Pattern (for real-time updates):
```javascript
// When visit updates occur:
io.emit('visit-updated', { visitId, status, timestamp })
```
Dashboard subscribes to these events via `socket.io-client` connection.

### 5. Token & Auth Storage:
- **Dashboard**: `localStorage.getItem('token')`
- **Mobile**: `AsyncStorage.getItem('token')`
- Both validated server-side via `jwt.verify()` with `JWT_SECRET` env var

## Critical Files to Understand First

| File | Purpose |
|------|---------|
| [server/database/schema.js](server/database/schema.js) | All 7 table definitions + relationships |
| [server/index.js](server/index.js) | Middleware setup + Socket.IO init |
| [server/routes/index.js](server/routes/index.js) | Route mounting pattern |
| [server/middleware/auth.js](server/middleware/auth.js) | Token validation + admin check |
| [dashboard/src/App.jsx](dashboard/src/App.jsx) | Route structure + theme |
| [dashboard/src/services/api.js](dashboard/src/services/api.js) | API client with auth interceptor |
| [MobileApp/src/services/api.js](MobileApp/src/services/api.js) | Mobile API client + AsyncStorage usage |
| [server/utils/syncScheduler.js](server/utils/syncScheduler.js) | Cron-based sync logic |

## Environment Variables (from .env example)
```
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
DB_PATH=./databases
UPLOAD_PATH=./uploads
EXCEL_UPLOAD_PATH=./uploads/excel
IMAGE_UPLOAD_PATH=./uploads/images
SYNC_SCHEDULE_1=0 12 * * *        # 12:00 UTC
SYNC_SCHEDULE_2=0 18 * * *        # 18:00 UTC
DEFAULT_ADMIN_USERNAME=admin-gis
DEFAULT_ADMIN_PASSWORD=gis2026
NODE_ENV=development
```

## Common Gotchas

1. **Token format**: Expect `Bearer <token>` in Authorization header; both web/mobile normalize this
2. **Timestamp fields**: `created_at`, `updated_at`, `synced_at` on all tables - use for sync logic
3. **Visit status enum**: `'scheduled'`, `'in-progress'`, `'completed'`, `'cancelled'` (enforce in validation middleware)
4. **GPS accuracy**: Mobile app captures latitude/longitude during check-in; verify precision for location matching
5. **Excel bulk upload**: Must match exact column headers or parse fails silently - see [server/controllers/userController.js](server/controllers/userController.js) for template

## When Adding Features

- **New database table?** → Add schema to [server/database/schema.js](server/database/schema.js), init in [server/database/init.js](server/database/init.js)
- **New API endpoint?** → Create controller in `server/controllers/`, route in `server/routes/`, mount in [server/routes/index.js](server/routes/index.js)
- **Mobile screen?** → Add to [MobileApp/src/screens/](MobileApp/src/screens/), wire in [MobileApp/src/navigation/AppNavigator.js](MobileApp/src/navigation/AppNavigator.js)
- **Dashboard page?** → Create component in [dashboard/src/components/](dashboard/src/components/), route in [dashboard/src/App.jsx](dashboard/src/App.jsx)
- **Real-time feature?** → Emit Socket.IO event from controller, subscribe in client components

## Testing Real-Time Features

Use Socket.IO dev tools or trigger actions via API:
```bash
# Terminal: Monitor server logs
npm run dev

# Another terminal: Trigger update
curl -X POST http://localhost:8000/api/visits/1 -H "Authorization: Bearer <token>"
```
Watch dashboard auto-refresh via socket subscription.
