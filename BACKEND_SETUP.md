# LM TEK Configurator - Complete Backend Integration Guide

This guide explains how to set up the complete backend system for the LM TEK Server Configurator.

## 🏗️ Architecture Overview

**Frontend:**
- React + TypeScript + Vite
- TanStack React Query for API state management
- Context API for local state
- Axios for HTTP requests

**Backend:**
- Express.js + TypeScript
- PostgreSQL database
- Prisma ORM
- JWT authentication
- RESTful API

## 📋 Prerequisites

1. **Node.js 18+** installed ([Download](https://nodejs.org/))
2. **PostgreSQL 14+** installed and running ([Download](https://www.postgresql.org/download/))
3. **npm** or **yarn** package manager
4. **Git** (optional, for version control)

## 🚀 Step-by-Step Setup

### Part 1: Database Setup

#### 1.1 Install PostgreSQL

**Windows:**
- Download PostgreSQL installer from official website
- Run installer (use default port 5432)
- Remember the password you set for the `postgres` user

**Mac (using Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### 1.2 Create Database

Open PostgreSQL command line:

**Windows:**
- Open SQL Shell (psql) from Start Menu
- Enter server [localhost], database [postgres], port [5432], username [postgres]
- Enter your password

**Mac/Linux:**
```bash
psql postgres
```

Then create the database:
```sql
CREATE DATABASE lmtek_configurator;
\q
```

### Part 2: Backend Setup

#### 2.1 Navigate to Server Directory

```bash
cd server
```

#### 2.2 Install Dependencies

```bash
npm install
```

This will install:
- Express.js (web framework)
- Prisma (database ORM)
- bcryptjs (password hashing)
- jsonwebtoken (JWT auth)
- cors (cross-origin requests)
- zod (validation)
- TypeScript and types

#### 2.3 Configure Environment Variables

Create `.env` file in the `server` directory:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Database Connection
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/lmtek_configurator?schema=public"

# JWT Configuration
JWT_SECRET="change-this-to-a-random-secret-key-min-32-chars"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=3001
NODE_ENV="development"

# Frontend URL (for CORS)
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000"

# Admin User (will be created on first seed)
ADMIN_EMAIL="admin@lmtek.com"
ADMIN_PASSWORD="admin123"
ADMIN_NAME="System Administrator"
```

**Important:**
- Replace `YOUR_PASSWORD` with your PostgreSQL password
- Change `JWT_SECRET` to a random string (at least 32 characters)
- In production, use strong passwords!

#### 2.4 Generate Prisma Client

```bash
npm run prisma:generate
```

This creates the Prisma Client based on your schema.

#### 2.5 Run Database Migrations

```bash
npm run prisma:migrate
```

This creates all database tables.

#### 2.6 Seed the Database

```bash
npm run prisma:seed
```

This populates the database with:
- Admin user account
- All GPU components
- All CPU components
- All RAM options
- All storage options
- All power supply options
- All motherboard options
- All cooling loop options
- All network options

#### 2.7 Start Backend Server

```bash
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:3001
📊 Environment: development
```

Test if it's working:
```bash
curl http://localhost:3001/api/health
```

Should return:
```json
{"status":"ok","timestamp":"2025-..."}
```

### Part 3: Frontend Setup

#### 3.1 Navigate to Frontend Root

```bash
cd ..  # From server directory back to project root
```

#### 3.2 Install Dependencies

```bash
npm install
```

This installs all React dependencies plus axios for API calls.

#### 3.3 Configure Environment

Create `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:3001/api
```

#### 3.4 Start Frontend Development Server

```bash
npm run dev
```

You should see:
```
VITE v5.4.19  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

#### 3.5 Open in Browser

Navigate to: `http://localhost:5173`

## ✅ Verification Checklist

### Backend Verification

1. **Database Connection**
   ```bash
   cd server
   npm run prisma:studio
   ```
   Opens Prisma Studio at `http://localhost:5555` to view database

2. **API Health Check**
   ```bash
   curl http://localhost:3001/api/health
   ```

3. **Get Components**
   ```bash
   curl http://localhost:3001/api/components
   ```
   Should return list of all components

4. **Login as Admin**
   ```bash
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@lmtek.com","password":"admin123"}'
   ```
   Should return user object and JWT token

### Frontend Verification

1. Open `http://localhost:5173` - should see configurator
2. Click "Admin" button in header
3. Try to access admin panel (should prompt for login soon)

## 🔐 User Accounts

### Default Admin Account
- **Email:** `admin@lmtek.com`
- **Password:** `admin123`
- **Role:** ADMIN
- **Permissions:** Full access to all features

### Creating Client Accounts
Clients can register through the frontend (to be implemented) or via API:

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client@example.com",
    "password": "password123",
    "name": "John Doe",
    "phone": "+1234567890",
    "company": "Acme Corp"
  }'
```

## 📊 Database Schema

```
User
├── id (UUID)
├── email (unique)
├── password (hashed)
├── name
├── phone
├── company
├── role (CLIENT | ADMIN)
└── quotes (relation)

Component
├── id (UUID)
├── category (GPU | CPU | RAM | STORAGE | POWER | MOTHERBOARD | COOLING | NETWORK)
├── name
├── spec
├── listPrice
├── metadata (JSON: capacity, cores, psuCount, gpuSupport)
└── isActive (boolean)

Quote
├── id (UUID)
├── quoteNumber (unique)
├── userId (FK → User)
├── status (PENDING | REVIEWED | APPROVED | REJECTED | COMPLETED)
├── totalPrice
├── configuration (JSON)
├── notes
├── adminNotes
└── items (relation)

QuoteItem
├── id (UUID)
├── quoteId (FK → Quote)
├── componentId (FK → Component, optional)
├── category
├── name
├── spec
├── quantity
├── unitPrice
└── totalPrice
```

## 🔄 API Workflow

### For Clients:

1. **Register/Login**
   ```
   POST /api/auth/register or POST /api/auth/login
   → Returns JWT token
   ```

2. **Browse Components**
   ```
   GET /api/components
   → Returns all available components
   ```

3. **Configure Server**
   - User selects components in frontend
   - Frontend calculates total price

4. **Submit Quote**
   ```
   POST /api/quotes
   Headers: Authorization: Bearer <token>
   Body: { configuration, items, totalPrice, notes }
   → Creates quote with status PENDING
   ```

5. **View Quotes**
   ```
   GET /api/quotes
   Headers: Authorization: Bearer <token>
   → Returns user's quotes only
   ```

### For Admins:

1. **Login as Admin**
   ```
   POST /api/auth/login
   Body: { email: "admin@lmtek.com", password: "admin123" }
   ```

2. **Manage Components**
   ```
   GET    /api/components
   POST   /api/components (create)
   PUT    /api/components/:id (update)
   DELETE /api/components/:id (soft delete)
   ```

3. **View All Quotes**
   ```
   GET /api/quotes
   → Returns all quotes (not filtered by user)
   ```

4. **Update Quote Status**
   ```
   PUT /api/quotes/:id/status
   Body: { status: "APPROVED", adminNotes: "Looks good!" }
   ```

5. **View Statistics**
   ```
   GET /api/quotes/stats/summary
   → Returns total quotes, revenue, etc.
   ```

## 🛠️ Development Commands

### Backend (from `server/` directory)

```bash
# Development
npm run dev              # Start dev server with hot reload

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio
npm run prisma:seed      # Seed database

# Build
npm run build           # Build for production
npm start               # Start production server
```

### Frontend (from project root)

```bash
# Development
npm run dev            # Start dev server

# Build
npm run build          # Build for production
npm run preview        # Preview production build
npm run lint           # Run ESLint
```

## 🐛 Troubleshooting

### Database Connection Error

**Problem:** `Can't reach database server`

**Solutions:**
1. Check PostgreSQL is running:
   ```bash
   # Windows
   services.msc → Look for PostgreSQL

   # Mac
   brew services list

   # Linux
   sudo systemctl status postgresql
   ```

2. Verify DATABASE_URL in `.env`
3. Check PostgreSQL port (default: 5432)

### Port Already in Use

**Problem:** `Port 3001 already in use`

**Solutions:**
1. Change PORT in `server/.env`
2. Or kill process on port 3001:
   ```bash
   # Windows
   netstat -ano | findstr :3001
   taskkill /PID <PID> /F

   # Mac/Linux
   lsof -ti:3001 | xargs kill
   ```

### Migration Errors

**Problem:** Migration fails

**Solutions:**
```bash
cd server
npx prisma migrate reset  # ⚠️ Deletes all data!
npm run prisma:seed       # Re-seed database
```

### CORS Errors in Frontend

**Problem:** `CORS policy: No 'Access-Control-Allow-Origin'`

**Solution:**
1. Check `ALLOWED_ORIGINS` in `server/.env`
2. Add your frontend URL:
   ```env
   ALLOWED_ORIGINS="http://localhost:5173"
   ```
3. Restart backend server

### Auth Token Expired

**Problem:** `Invalid or expired token`

**Solution:**
- Tokens expire after 7 days (configurable)
- User needs to login again
- Check JWT_EXPIRES_IN in `server/.env`

## 🔒 Security Best Practices

### For Development:
- ✅ Use `.env` files (never commit to git)
- ✅ Strong JWT_SECRET (min 32 chars)
- ✅ HTTPS in production
- ✅ Change default admin password

### For Production:
- ✅ Use environment variables (not `.env` files)
- ✅ Enable rate limiting
- ✅ Use HTTPS only
- ✅ Set secure CORS origins
- ✅ Regular database backups
- ✅ Update dependencies regularly

## 📚 Next Steps

Now that the backend is set up, the next tasks are:

1. ✅ **Backend API** - Complete
2. ⏳ **Update ComponentsContext** - Use API instead of localStorage
3. ⏳ **Add Authentication UI** - Login/Register pages
4. ⏳ **Quote Submission** - Form for clients to submit quotes
5. ⏳ **Client Dashboard** - View submitted quotes
6. ⏳ **Admin Dashboard** - Manage all quotes and users

## 🆘 Need Help?

1. Check logs in terminal
2. Open Prisma Studio: `npm run prisma:studio`
3. Test API endpoints with cURL or Postman
4. Check PostgreSQL logs

## 📖 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Guide](https://expressjs.com/)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/)
- [JWT.io](https://jwt.io/)
- [Axios Documentation](https://axios-http.com/docs/intro)

---

**Project Status:** ✅ Backend Complete | ⏳ Frontend Integration In Progress
