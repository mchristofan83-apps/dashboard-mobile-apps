# Dashboard & Mobile Apps System

A comprehensive monitoring, controlling, and reporting system with web dashboard and mobile applications for managing MD and Sales visits with GPS tracking, photo documentation, and real-time synchronization.

## 🤖 AI Integration (Windsurf Anthropic AI)

This system is enhanced with **Windsurf Anthropic AI** integration for intelligent features:

- **AI-Powered Analytics**: Advanced data analysis and predictive insights
- **Smart Route Optimization**: AI-optimized visit scheduling and route planning
- **Automated Reporting**: AI-generated reports with natural language summaries
- **Anomaly Detection**: AI-powered detection of unusual patterns in visit data
- **Voice Assistant**: Natural language processing for mobile app interactions
- **Image Recognition**: AI analysis of visit photos for compliance checking
- **Predictive Analytics**: Forecast visit completion rates and performance metrics

## Features

### Web Dashboard

- **Authentication System**: Secure login with JWT tokens
- **Main Dashboard**: Real-time statistics with interactive graphs
- **User Management**: CRUD operations with Excel bulk upload
- **Outlet Management**: Manage outlets with GPS coordinates
- **Visit Scheduling**: Schedule MD and Sales visits
- **Visit Tracking**: Real-time GPS tracking and photo documentation
- **Reports**: Comprehensive reporting with data visualization

### Mobile Application

- **Authentication**: Secure JWT-based login with session persistence
- **Visit Management**: View and manage assigned visits
- **GPS Check-in/Check-out**: Location-based visit tracking
- **Photo Documentation**: Capture and upload visit photos
- **Offline Support**: Works offline with data synchronization
- **Real-time Sync**: Automatic data synchronization with server

### Backend Server

- **RESTful API**: Complete API for dashboard and mobile apps
- **JWT Authentication**: Secure token-based authentication
- **Database**: Integrated SQLite database with optimized queries
- **File Upload**: Handle Excel uploads and image uploads
- **Rate Limiting**: API protection with rate limiting
- **Security**: Input sanitization and SQL injection protection

## Tech Stack

### Web Dashboard Tech

- **Frontend**: React 18 with Material-UI (MUI) v5
- **HTTP Client**: Axios with interceptors and retry logic
- **Charts**: Recharts for interactive data visualization
- **Build Tool**: Vite with hot module replacement
- **Real-time**: Socket.IO client for live updates
- **State Management**: React Hooks and Context API
- **Routing**: React Router v6 with protected routes

### Mobile App Tech

- **Framework**: React Native 0.72 with Expo SDK ~54.0.30
- **Navigation**: React Navigation v6 (Stack + Bottom Tabs)
- **Storage**: AsyncStorage + SQLite (expo-sqlite) for offline support
- **HTTP Client**: Axios with interceptors and Cloudflare fallback
- **UI Components**: Custom components with React Native styling
- **Location Services**: Expo Location with GPS tracking
- **Camera**: Expo Image Picker for photo documentation
- **Real-time**: Socket.IO client for live updates
- **Biometric Auth**: Expo Secure Store for fingerprint/Face ID

### Backend Server Tech

- **Runtime**: Node.js v25.3.0 with Express.js v4.18.2
- **Database**: SQLite3 v5.1.6 with multiple database files
- **Authentication**: JWT v9.0.2 with bcryptjs v2.4.3
- **File Processing**: Multer v1.4.5 for uploads, ExcelJS v4.4.0 for Excel files
- **Security**: Helmet v7.0.0, CORS v2.8.5, express-rate-limit v7.5.1
- **Real-time**: Socket.IO v4.7.2 for WebSocket connections
- **Development**: Nodemon v3.0.1 for auto-restart
- **Cloudflare Integration**: KV storage and Workers API
- **Process Management**: PM2 support with ecosystem config
- **SSL**: HTTPS support with certificate management

## Prerequisites

- Node.js (v16 or higher, recommended v25.3.0+)
- npm or yarn
- Git
- Expo CLI (for mobile development)
- Android Studio / Xcode (for mobile testing)
- Cloudflare account (for production deployment)

## Quick Start

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd dashboard-mobile-apps

# Install server dependencies
cd server
npm install

# Install dashboard dependencies
cd ../dashboard
npm install

# Install mobile app dependencies
cd ../MobileApp
npm install
```

### 2. Environment Configuration

```bash
# Server environment
cd server
cp .env.example .env
# Edit .env with your configuration

# Dashboard environment
cd ../dashboard
cp .env.production.example .env.production
# Edit environment variables as needed
```

### 3. Initialize Database

```bash
cd server
npm run init-schema
```

### 4. Start Development Servers

```bash
# Start the backend server (Terminal 1)
cd server
npm run dev

# Start the dashboard (Terminal 2)
cd ../dashboard
npm run dev

# Start the mobile app (Terminal 3)
cd ../MobileApp
npm start
```

## 🌐 Deployment

### Production Deployment with Cloudflare

1. **Server Deployment**:

   ```bash
   cd server
   npm run pm2:start
   ```

2. **Dashboard Deployment**:

   ```bash
   cd dashboard
   npm run build:production
   npm run deploy:production
   ```

3. **Mobile App Build**:

   ```bash
   cd MobileApp
   npm run build:android
   npm run build:ios
   ```

### Subdomain Configuration

- **Dashboard**: `dashboard.gisconnect.online`
- **API**: `api.gisconnect.online`
- **Server**: `server.gisconnect.online`

## 🔧 Configuration

### Server Configuration (.env)

```env
NODE_ENV=production
PORT=8000
HTTPS_PORT=8443
DB_PATH=./database/production.db
JWT_SECRET=your-jwt-secret
CLOUDFLARE_API_TOKEN=your-token
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_KV_NAMESPACE=your-kv-namespace
```

### Mobile App Configuration

The mobile app automatically detects environment:

- **Development**: Uses local server
- **Production**: Uses Cloudflare API
- **Staging**: Uses staging subdomain

## 📱 Features in Detail

### Real-time Synchronization

- Live updates across all platforms
- Offline support with automatic sync
- Conflict resolution and data integrity
- Cloudflare KV for distributed caching

### Security Features

- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- Rate limiting and DDoS protection
- SSL/TLS encryption
- Biometric authentication (mobile)

### AI-Powered Features

- Predictive analytics for visit planning
- Smart route optimization
- Automated report generation
- Image recognition for compliance
- Natural language processing
- Anomaly detection

## 📊 Database Schema

The system uses SQLite with the following tables:

- `menulogin` - Authentication users
- `datauser` - User information
- `dataoutlet` - Outlet/Store data
- `datavisitmd` - MD visit schedules
- `datavisitsales` - Sales visit schedules
- `visitaction` - Visit actions and check-ins
- `synclog` - Synchronization logs

## 🚀 API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `GET /api/auth/users` - Get auth users (admin)
- `POST /api/auth/users` - Create auth user (admin)

### Users

- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Visits

- `GET /api/visits` - Get visits
- `POST /api/visits` - Create visit
- `PUT /api/visits/:id` - Update visit
- `POST /api/visit-actions/checkin` - Check-in to visit

### Dashboard

- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/my-dashboard` - Get user dashboard

### Sync

- `POST /api/sync/trigger` - Manual sync (admin)
- `GET /api/sync/logs` - Get sync logs (admin)
- `POST /api/sync/cloudflare` - Cloudflare sync (admin)

## 🛠️ Development

### Code Structure

```text
apps/
├── server/                 # Backend API server
│   ├── controllers/        # Route controllers
│   ├── routes/            # API routes
│   ├── middleware/        # Express middleware
│   ├── database/          # Database files and schema
│   ├── utils/             # Utility functions
│   └── socket/            # Socket.IO handlers
├── dashboard/             # Web dashboard
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   └── config/        # Configuration
└── MobileApp/             # React Native app
    ├── src/
    │   ├── screens/       # App screens
    │   ├── services/      # API and utility services
    │   └── config/        # Environment configuration
```

### Testing

```bash
# Server tests
cd server
npm test

# Dashboard tests  
cd dashboard
npm test

# Mobile app tests
cd MobileApp
npm test
```

## 📈 Monitoring & Analytics

### Built-in Monitoring

- Health check endpoints
- Performance metrics
- Error tracking
- User activity logs
- Sync status monitoring

### AI Analytics

- Visit pattern analysis
- Performance prediction
- Route optimization suggestions
- Automated insights generation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:

- Check the documentation
- Review the API endpoints
- Check the configuration examples
- Review the troubleshooting guide

---

## 🏆 Built With

**Built with ❤️ using React, React Native, Node.js, and enhanced with Windsurf Anthropic AI: AI-Powered Analytics, Smart Route Optimization, Automated Reporting, Anomaly Detection, Voice Assistant, Image Recognition, Predictive Analytics**
