# LM TEK Server Configurator

**Version:** 1.1.0
**Status:** Production Ready
**Deployment:** Render.com (Docker-compatible)

> **Professional high-performance GPU server configuration and quoting system**

---

## Overview

The LM TEK Server Configurator is a full-stack web application for configuring and quoting high-performance GPU servers. Built with modern technologies for reliability and scalability.

### Key Features

- Interactive server configuration with real-time pricing
- Support for 1-8 GPU configurations with automatic PSU matching
- Comprehensive component management (11 categories)
- Quote generation with PDF export
- Admin dashboard for component and quote management
- User authentication and authorization
- Responsive design for desktop and mobile

---

## Tech Stack

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **UI Components:** Radix UI + Tailwind CSS (shadcn/ui)
- **Routing:** React Router v6
- **State Management:** React Context API
- **Forms:** React Hook Form + Zod validation
- **HTTP Client:** Axios

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express + TypeScript
- **Database:** PostgreSQL 14
- **ORM:** Prisma
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs

### Infrastructure
- **Deployment:** Render.com (Blueprint/IaC)
- **Container:** Docker (local development)
- **CI/CD:** Auto-deploy on git push

---

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker & Docker Compose (for local development)
- PostgreSQL 14 (or use Docker)

### Local Development with Docker

1. **Clone the repository:**
   ```bash
   git clone https://github.com/marolinik/LMTTekSrv.git
   cd LMTTekSrv
   ```

2. **Set up environment variables:**
   ```bash
   # Frontend (.env)
   cp .env.example .env

   # Backend (server/.env)
   cp server/.env.example server/.env
   ```

3. **Start Docker services:**
   ```bash
   docker-compose up -d
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api
   - Database: localhost:5432

5. **Default admin credentials:**
   - Email: `admin@lmtek.com`
   - Password: `admin123` ⚠️ **CHANGE IN PRODUCTION!**

### Local Development without Docker

1. **Install dependencies:**
   ```bash
   # Frontend
   npm install

   # Backend
   cd server
   npm install
   ```

2. **Set up PostgreSQL database:**
   ```bash
   # Create database
   createdb lmtek_configurator

   # Update server/.env with database URL
   DATABASE_URL="postgresql://user:password@localhost:5432/lmtek_configurator"
   ```

3. **Run database migrations:**
   ```bash
   cd server
   npx prisma migrate dev
   npx prisma generate
   npm run prisma:seed
   ```

4. **Start development servers:**
   ```bash
   # Terminal 1: Backend
   cd server
   npm run dev

   # Terminal 2: Frontend
   npm run dev
   ```

---

## Deploy to Render.com

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com)

This application is configured for one-click deployment to Render using their Blueprint feature.

### Quick Deploy

1. **Prerequisites:**
   - GitHub account
   - Render.com account (free tier available)
   - Strong admin password generated

2. **Deploy:**
   - See comprehensive guide: **[DEPLOYMENT.md](./DEPLOYMENT.md)**
   - Render Blueprint automatically creates:
     - PostgreSQL database
     - Node.js backend API
     - Static React frontend

3. **Cost:** ~$14/month for production (Starter plan)

---

## Project Structure

```
LMTTekSrv/
├── src/                      # Frontend React source
│   ├── components/           # React components
│   ├── contexts/             # Context providers
│   ├── pages/                # Page components
│   ├── services/             # API services
│   └── utils/                # Utility functions
│
├── server/                   # Backend Express source
│   ├── src/
│   │   ├── controllers/      # Route controllers
│   │   ├── middleware/       # Express middleware
│   │   ├── routes/           # API routes
│   │   └── index.ts          # Server entry point
│   └── prisma/
│       ├── schema.prisma     # Database schema
│       └── seed.prod.js      # Production seed data
│
├── render.yaml               # Render Blueprint (IaC)
├── docker-compose.yml        # Docker services (local dev)
├── DEPLOYMENT.md             # Complete deployment guide
├── SECURITY_ROADMAP.md       # Security implementation guide
└── README.md                 # This file
```

---

## Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide for Render.com
- **[SECURITY_ROADMAP.md](./SECURITY_ROADMAP.md)** - Security hardening instructions
- **[PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md)** - Detailed project overview
- **[PSU_REFERENCE.md](./PSU_REFERENCE.md)** - PSU system documentation
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history

---

## Component Categories

The configurator supports **11 component categories**:

1. **GPU** - Graphics cards (1-8 units)
2. **CPU** - Processors (auto-selected based on GPU count)
3. **RAM** - Memory modules (1-8 units × 64GB)
4. **Storage** - OS drive + Data drive
5. **Power Supply** - PSU configurations (auto-selected: 2-5 units)
6. **Network** - Network interface cards
7. **Motherboard** - System boards
8. **Cooling** - Liquid cooling loops (auto-selected for GPU count)
9. **Chassis** - Server enclosures
10. **R&D** - Research & Development services
11. **Assembly** - Server assembly services

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Components (Admin only for write operations)
- `GET /api/components` - Get all components
- `POST /api/components` - Create component
- `PUT /api/components/:id` - Update component
- `DELETE /api/components/:id` - Delete component

### Quotes
- `GET /api/quotes` - Get user's quotes
- `POST /api/quotes` - Create new quote
- `GET /api/quotes/:id` - Get quote by ID
- `PATCH /api/quotes/:id/status` - Update status (admin only)

### Health
- `GET /` - API information
- `GET /api/health` - Health check endpoint

---

## Security

### ✅ Implemented
- JWT authentication with bcrypt password hashing
- CORS protection with allowed origins
- Input validation with Zod
- SQL injection protection via Prisma ORM
- Environment variable protection (.gitignore)
- Password complexity requirements

### ⚠️ Recommended (See SECURITY_ROADMAP.md)
- Rate limiting on authentication endpoints
- httpOnly cookies for JWT tokens
- Input sanitization for XSS prevention
- Content Security Policy headers
- HTTPS/SSL in production

**⚠️ CRITICAL:** Change default admin password before production deployment!

---

## Development

### Available Scripts

**Frontend:**
```bash
npm run dev          # Start dev server (Vite)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

**Backend:**
```bash
npm run dev                  # Start dev server (tsx watch)
npm run build                # Build TypeScript
npm run start                # Start production server
npm run prisma:generate      # Generate Prisma Client
npm run prisma:migrate       # Run migrations (production)
npm run prisma:migrate:dev   # Run migrations (development)
npm run prisma:studio        # Open Prisma Studio
npm run prisma:seed          # Seed database (development)
npm run prisma:seed:prod     # Seed database (production)
```

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Version History

- **v1.1.0** (2025-10-29)
  - PSU system overhaul with new power rules
  - Fixed quote submission infinite loop
  - Added CHASSIS, R&D, and ASSEMBLY to admin interface
  - Prepared for Render.com deployment
  - Complete deployment documentation

- **v1.0.0** (2025-10-28)
  - Initial release
  - Full configurator functionality
  - Admin dashboard
  - Quote management system

See **[CHANGELOG.md](./CHANGELOG.md)** for detailed version history.

---

## License

ISC License - Copyright © 2025 LM TEK

---

## Support

- **Issues:** https://github.com/marolinik/LMTTekSrv/issues
- **Documentation:** See `/docs` and markdown files in root
- **Deployment Help:** See [DEPLOYMENT.md](./DEPLOYMENT.md)

---

**Built with ❤️ for high-performance computing**
