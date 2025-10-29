# LM TEK Server Configurator - Project Context

## 📋 Project Overview

A full-stack web application for configuring high-end GPU servers with dynamic component management, user authentication, and quote generation system.

**Live Demo:** Not deployed yet
**Tech Stack:** React + TypeScript + Vite (Frontend) | Express + PostgreSQL + Prisma (Backend)

---

## 🏗️ Architecture

### Frontend (React SPA)
- **Framework:** React 18.3.1 + TypeScript + Vite
- **UI Library:** shadcn-ui (Radix UI + Tailwind CSS)
- **State Management:**
  - React Context API (ComponentsContext - will migrate to API)
  - TanStack React Query (for API calls)
- **Routing:** React Router v6
- **Forms:** React Hook Form + Zod validation
- **Icons:** Lucide React
- **HTTP Client:** Axios

### Backend (REST API)
- **Framework:** Express.js + TypeScript
- **Database:** PostgreSQL 14+
- **ORM:** Prisma 5.22
- **Authentication:** JWT (jsonwebtoken + bcryptjs)
- **Validation:** Zod
- **CORS:** Configured for local development

### Database Schema (PostgreSQL)

```prisma
User {
  id: UUID
  email: String (unique)
  password: String (hashed with bcrypt)
  name: String
  phone: String?
  company: String?
  role: Enum(CLIENT, ADMIN)
  quotes: Quote[]
}

Component {
  id: UUID
  category: Enum(GPU, CPU, RAM, STORAGE, POWER, NETWORK, MOTHERBOARD, COOLING)
  name: String
  spec: String
  listPrice: Float
  metadata: JSON {
    capacity?: number        // For RAM (GB) and Power (W)
    cores?: number          // For CPU
    psuCount?: number       // For Power Supply (1-5)
    gpuSupport?: number     // For Cooling Loops (1-8)
  }
  isActive: Boolean
  quoteItems: QuoteItem[]
}

Quote {
  id: UUID
  quoteNumber: String (unique, auto-generated)
  userId: UUID -> User
  status: Enum(PENDING, REVIEWED, APPROVED, REJECTED, COMPLETED)
  totalPrice: Float
  configuration: JSON (full config object)
  items: QuoteItem[]
  notes: String?
  adminNotes: String?
  createdAt: DateTime
  updatedAt: DateTime
}

QuoteItem {
  id: UUID
  quoteId: UUID -> Quote
  componentId: UUID? -> Component
  category: String
  name: String
  spec: String
  quantity: Int
  unitPrice: Float
  totalPrice: Float
}
```

---

## 🎯 Current Status

### ✅ COMPLETED

#### Frontend Components
1. **Core Configurator**
   - `Configurator.tsx` - Main configuration state & logic
   - `ConfigSection.tsx` - Component selection UI (all 8 categories)
   - `ConfigSummary.tsx` - Sticky footer with pricing
   - Auto-adjustment logic for PSU (based on GPU count)
   - Auto-adjustment logic for Cooling Loop (matched to GPU count)

2. **Component Categories** (8 total)
   - GPU - Graphics cards (1-8 quantity selector)
   - CPU - Processors with core count
   - RAM - Memory options (128GB-1024GB)
   - Storage - NVMe drives
   - Power Supply - 1-5 PSUs with validation
   - Motherboard - Server motherboards
   - Cooling Loop - Liquid cooling (auto-matched to GPU count)
   - Network - Network interfaces

3. **Admin Panel**
   - `Admin.tsx` - Full admin dashboard
   - `ComponentForm.tsx` - Add/Edit component dialog
   - Tabbed interface for all categories
   - CRUD operations for components
   - Dynamic form fields based on category

4. **Data Management**
   - `ComponentsContext.tsx` - Local context (uses localStorage)
   - Type definitions in `src/types/components.ts`
   - Default components pre-populated

5. **Business Logic**
   - PSU Validation: Minimum PSU based on GPU count
     - 1-2 GPUs → 2 PSUs minimum
     - 3-4 GPUs → 4 PSUs minimum
     - 5-8 GPUs → 5 PSUs minimum
   - Cooling Loop Auto-Selection: Matches GPU count exactly
   - Real-time price calculation

6. **UI/UX Features**
   - Responsive design (mobile-friendly)
   - Dark/Light theme support
   - Glass-morphism effects
   - Icon-based navigation
   - Disabled states for invalid options
   - Helper text for requirements

#### Backend API (Complete)
1. **Server Setup**
   - Express.js server with TypeScript
   - CORS configuration
   - Error handling middleware
   - Port: 3001

2. **Authentication System**
   - JWT-based authentication
   - Password hashing (bcrypt)
   - Role-based access control (CLIENT/ADMIN)
   - Token expiration (7 days)
   - Auth middleware for protected routes

3. **API Endpoints**

   **Auth Routes** (`/api/auth`)
   - POST `/register` - Register new user
   - POST `/login` - Login user
   - GET `/me` - Get current user (authenticated)

   **Component Routes** (`/api/components`)
   - GET `/` - Get all components (public)
   - GET `/category/:category` - Get by category (public)
   - POST `/` - Create component (admin only)
   - PUT `/:id` - Update component (admin only)
   - DELETE `/:id` - Soft delete component (admin only)

   **Quote Routes** (`/api/quotes`)
   - POST `/` - Create quote (authenticated)
   - GET `/` - Get quotes (filtered by role)
   - GET `/:id` - Get quote by ID
   - PUT `/:id/status` - Update status (admin only)
   - DELETE `/:id` - Delete quote (admin only)
   - GET `/stats/summary` - Get statistics (admin only)

   **User Routes** (`/api/users`)
   - GET `/` - Get all users (admin only)
   - GET `/:id` - Get user by ID (admin only)

4. **Database Setup**
   - PostgreSQL database
   - Prisma ORM configuration
   - Migration files
   - Seed script with all components
   - Proper indexes and relationships

5. **Frontend Services** (Created)
   - `api.ts` - Axios client with interceptors
   - `auth.service.ts` - Authentication methods
   - `component.service.ts` - Component CRUD
   - `quote.service.ts` - Quote management

6. **Default Data**
   - Admin user: admin@lmtek.com / admin123
   - 7 GPU options
   - 3 CPU options
   - 4 RAM options
   - 3 Storage options
   - 5 Power Supply options
   - 3 Motherboard options
   - 8 Cooling Loop options
   - 3 Network options

---

### ⏳ IN PROGRESS / PENDING

#### High Priority (Next Session)
1. **Update ComponentsContext to use API**
   - Replace localStorage with API calls
   - Use React Query for caching
   - Handle loading/error states
   - Keep admin-only mutations

2. **Authentication UI**
   - Login page (`/login`)
   - Register page (`/register`)
   - Protected route wrapper
   - Auth context/provider
   - Logout functionality
   - User profile display

3. **Quote Submission System**
   - "Get Quote" button functionality
   - Quote submission form with:
     - Client details (if not logged in → register)
     - Configuration summary
     - Optional notes field
   - Quote confirmation page
   - Email notification (future)

4. **Client Dashboard**
   - `/my-quotes` page
   - List of user's quotes
   - Quote detail view
   - Status tracking
   - Filter by status

5. **Admin Quote Management**
   - `/admin/quotes` page
   - View all quotes
   - Update quote status
   - Add admin notes
   - User information display
   - Statistics dashboard

#### Medium Priority
6. **Quote Management Features**
   - Export quote as PDF
   - Email quote to client
   - Quote expiration dates
   - Quote versioning

7. **Enhanced Admin Features**
   - Bulk component import/export
   - Component usage analytics
   - Price history tracking
   - User management (enable/disable)

8. **UI Enhancements**
   - Loading skeletons
   - Error boundaries
   - Toast notifications (using Sonner)
   - Confirmation dialogs
   - Better mobile navigation

#### Low Priority
9. **Advanced Features**
   - Component comparison tool
   - Saved configurations
   - Configuration templates
   - Multi-language support
   - Currency conversion

10. **DevOps**
    - Docker setup
    - CI/CD pipeline
    - Production deployment
    - Environment-specific configs
    - Database backups

---

## 📁 Project Structure

```
grando-lmtek-fusion-main/
├── server/                           # Backend API
│   ├── prisma/
│   │   ├── schema.prisma            # Database schema
│   │   └── seed.ts                  # Database seeder
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.routes.ts       # Authentication endpoints
│   │   │   ├── component.routes.ts  # Component CRUD
│   │   │   ├── quote.routes.ts      # Quote management
│   │   │   └── user.routes.ts       # User management
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts   # JWT auth + role check
│   │   ├── utils/
│   │   │   └── auth.utils.ts        # Password hash, JWT, quote#
│   │   ├── lib/
│   │   │   └── prisma.ts            # Prisma client
│   │   └── index.ts                 # Express app
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── README.md
│
├── src/                              # Frontend React App
│   ├── components/
│   │   ├── Configurator.tsx         # Main config logic
│   │   ├── ConfigSection.tsx        # Component selection UI
│   │   ├── ConfigSummary.tsx        # Price summary footer
│   │   ├── Header.tsx               # Navigation header
│   │   ├── admin/
│   │   │   └── ComponentForm.tsx    # Add/Edit component dialog
│   │   └── ui/                      # 50+ shadcn components
│   ├── pages/
│   │   ├── Index.tsx                # Home/Configurator page
│   │   ├── Admin.tsx                # Admin dashboard
│   │   └── NotFound.tsx             # 404 page
│   ├── contexts/
│   │   └── ComponentsContext.tsx    # Component state (localStorage)
│   ├── services/                    # API service layer
│   │   ├── auth.service.ts
│   │   ├── component.service.ts
│   │   └── quote.service.ts
│   ├── lib/
│   │   └── api.ts                   # Axios instance
│   ├── types/
│   │   └── components.ts            # TypeScript types
│   ├── utils/
│   │   └── psuValidation.ts         # PSU logic
│   ├── hooks/
│   ├── App.tsx                      # Router setup
│   ├── main.tsx                     # Entry point
│   └── index.css                    # Global styles
│
├── public/                           # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── vite.config.ts
├── .env.example
├── PROJECT_CONTEXT.md               # This file
├── BACKEND_SETUP.md                 # Backend setup guide
└── README.md                        # Project readme
```

---

## 🔧 Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Environment Variables

**Frontend** (`.env` in project root):
```env
VITE_API_URL=http://localhost:3001/api
```

**Backend** (`server/.env`):
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/lmtek_configurator?schema=public"
JWT_SECRET="your-secret-key-min-32-chars"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
ALLOWED_ORIGINS="http://localhost:5173"
ADMIN_EMAIL="admin@lmtek.com"
ADMIN_PASSWORD="admin123"
ADMIN_NAME="System Administrator"
```

### Installation & Running

**Backend:**
```bash
cd server
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
# Server runs on http://localhost:3001
```

**Frontend:**
```bash
npm install
npm run dev
# App runs on http://localhost:5173
```

**Database Management:**
```bash
cd server
npm run prisma:studio
# Opens Prisma Studio at http://localhost:5555
```

---

## 🎨 Design System

### Colors
- **Primary:** Custom brand color (defined in Tailwind)
- **Accent:** Highlight color for selected items
- **Background:** Dark theme with glass-morphism
- **Text:** High contrast for accessibility

### Components (shadcn-ui)
All components from shadcn-ui library:
- Button, Card, Dialog, Tabs
- Input, Label, Select
- Toast (Sonner), Badge
- Accessible (Radix UI primitives)

### Layout
- Responsive grid system
- Sticky footer for pricing
- Hero section with video background
- Mobile-first design

---

## 🔐 Security

### Authentication
- JWT tokens with 7-day expiration
- HTTP-only cookie option available
- Password hashing with bcryptjs (10 rounds)
- Role-based access control

### API Protection
- CORS restricted to allowed origins
- Admin routes protected by middleware
- Input validation with Zod
- SQL injection prevention (Prisma)

### Best Practices
- Environment variables for secrets
- Soft delete for components (isActive flag)
- Audit trail (createdAt, updatedAt)
- Token refresh on expiration

---

## 📊 Key Business Rules

### Component Management
1. All components have: category, name, spec, listPrice
2. Components can be soft-deleted (isActive = false)
3. Metadata is flexible JSON for category-specific fields
4. Admin-only access for CRUD operations

### PSU Validation Rules (Updated 2025-10-29)
Power supply configuration is fully automatic based on GPU count:
- **1-2 GPUs (650-1300W):** 2x PSU (4000W total) - €477.80
- **3-4 GPUs (1950-2600W):** 3x PSU (6000W total) - €716.70
- **5-6 GPUs (3250-3900W):** 4x PSU (8000W total) - €955.60
- **7-8 GPUs (4550-5200W):** 5x PSU (10000W total) - €1,194.50
- Each PSU unit is 2000W
- Auto-selects when GPU quantity changes
- No manual PSU selection - fully automatic for optimal redundancy

### Cooling Loop Rules
- Exactly matches GPU count (1-8)
- Auto-selects when GPU quantity changes
- Only matching loop is enabled
- Visual indicator for matched loop

### Quote Workflow
1. **PENDING:** Initial submission by client
2. **REVIEWED:** Admin has reviewed the quote
3. **APPROVED:** Quote approved, ready for order
4. **REJECTED:** Quote rejected with admin notes
5. **COMPLETED:** Order completed

### User Roles
- **CLIENT:** Can view components, create quotes, view own quotes
- **ADMIN:** Full access to all features, manage users, update quotes

---

## 🐛 Known Issues & Limitations

### Fixed Issues (2025-10-29)
1. ✅ ComponentsContext migrated from localStorage to API
2. ✅ Authentication UI implemented (login/register pages)
3. ✅ Quote submission functionality with PDF generation
4. ✅ Client dashboard (My Quotes page)
5. ✅ Admin quote management UI
6. ✅ PDF export functionality
7. ✅ Infinite loop bug in QuoteDialog fixed
8. ✅ PSU auto-selection logic updated with correct wattage rules

### Current Limitations
1. No email notifications
2. No rate limiting on API endpoints
3. JWT stored in localStorage (should use httpOnly cookies)
4. Default admin password needs changing for production
5. No HTTPS/SSL configured
8. No image upload for components

### Tech Debt
1. Error handling could be more comprehensive
2. Loading states need improvement
3. Need better TypeScript type safety in some areas
4. API error messages could be more user-friendly
5. Need comprehensive testing

---

## 📝 Important Notes

### Default Admin Credentials
- **Email:** admin@lmtek.com
- **Password:** admin123
- ⚠️ MUST be changed in production!

### Database Seeding
- Seed script populates all component categories
- Uses consistent IDs for upsert (can re-run safely)
- Admin user created automatically

### API Base URL
- Development: http://localhost:3001/api
- Frontend expects VITE_API_URL env variable

### Component IDs
- Generated as UUIDs by database
- Frontend uses ID for updates/deletes
- Category + name combination should be unique

---

## 🎯 Success Metrics (Future)

### KPIs to Track
- Number of registered users
- Quotes submitted per day/week
- Quote approval rate
- Average quote value
- Most popular components
- Time to quote approval
- User conversion rate

### Analytics to Implement
- Component selection frequency
- Configuration patterns
- Price sensitivity analysis
- User journey tracking
- A/B testing for UI changes

---

## 📚 Resources & Documentation

### External Dependencies
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Prisma Docs](https://www.prisma.io/docs)
- [Express.js Guide](https://expressjs.com/)
- [shadcn-ui Components](https://ui.shadcn.com/)
- [Radix UI Primitives](https://www.radix-ui.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zod Validation](https://zod.dev/)

### Project Documentation
- README.md - Project overview
- BACKEND_SETUP.md - Complete backend setup guide
- server/README.md - API documentation
- This file - Complete project context

---

## 🔄 Development Workflow

### Making Changes

1. **Backend Changes:**
   ```bash
   cd server
   # Update schema.prisma
   npm run prisma:migrate
   npm run prisma:generate
   npm run dev
   ```

2. **Frontend Changes:**
   ```bash
   npm run dev
   # Hot reload enabled
   ```

3. **Adding New Component:**
   - Update `ComponentCategory` enum in schema.prisma
   - Run migration
   - Update frontend types
   - Add UI in ConfigSection
   - Update validation logic if needed

4. **Testing API:**
   ```bash
   # Use cURL, Postman, or Prisma Studio
   curl http://localhost:3001/api/components
   ```

### Git Workflow (When Implemented)
- Main branch: `main`
- Feature branches: `feature/description`
- Hotfix branches: `hotfix/description`
- Commit messages: Conventional Commits format

---

## 🚀 Deployment Checklist (Future)

### Pre-Deployment
- [ ] Change admin password
- [ ] Set strong JWT_SECRET
- [ ] Configure production DATABASE_URL
- [ ] Set up SSL/HTTPS
- [ ] Configure CORS for production domain
- [ ] Set NODE_ENV=production
- [ ] Build frontend: `npm run build`
- [ ] Build backend: `cd server && npm run build`

### Infrastructure
- [ ] PostgreSQL database (AWS RDS, Heroku, etc.)
- [ ] Backend hosting (AWS, Heroku, Railway, etc.)
- [ ] Frontend hosting (Vercel, Netlify, etc.)
- [ ] Domain configuration
- [ ] SSL certificates
- [ ] CDN for assets

### Monitoring
- [ ] Error tracking (Sentry, etc.)
- [ ] Performance monitoring
- [ ] Database backups
- [ ] Uptime monitoring
- [ ] Log aggregation

---

## 📝 Recent Changes (2025-10-29)

### Bug Fixes
1. **QuoteDialog Infinite Loop** (src/components/QuoteDialog.tsx:322)
   - Added missing `setIsSubmitting(false)` in success path
   - Fixed stuck loading state after quote submission
   - PDF generation now works correctly

### Feature Updates
2. **PSU Auto-Selection System Overhaul**
   - Updated validation rules: `src/utils/psuValidation.ts`
   - Modified auto-selection: `src/components/Configurator.tsx:137-156`
   - Removed manual quantity selector: `src/components/ConfigSection.tsx:385-418`
   - Updated database seed: `server/prisma/seed.ts:124-159`
   - New PSU configurations with correct wattage and pricing
   - Fully automatic based on GPU count (no manual intervention)

3. **Database Updates**
   - 4 new PSU component configurations added
   - Pricing: €238.90 per 2000W PSU unit
   - Metadata includes: capacity (W), psuCount

### Files Modified
- `src/components/QuoteDialog.tsx` - Fixed infinite loop
- `src/utils/psuValidation.ts` - Updated PSU rules
- `src/components/Configurator.tsx` - Fixed PSU auto-selection
- `src/components/ConfigSection.tsx` - Removed manual PSU quantity selector
- `server/prisma/seed.ts` - Updated PSU component data

---

**Last Updated:** 2025-10-29
**Project Phase:** Production Ready (Docker Deployed)
**Next Session Focus:** Security hardening, testing, email notifications
