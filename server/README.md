# LM TEK Server Configurator - Backend API

Backend API for the LM TEK Server Configurator application built with Express, TypeScript, Prisma, and PostgreSQL.

## Features

- **Authentication**: JWT-based authentication with role-based access control (Client/Admin)
- **Components Management**: Full CRUD operations for server components
- **Quote System**: Create, view, and manage configuration quotes
- **User Management**: Admin dashboard for managing clients
- **Database**: PostgreSQL with Prisma ORM

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + bcryptjs
- **Validation**: Zod

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- npm or yarn package manager

## Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `server` directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/lmtek_configurator?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
ALLOWED_ORIGINS="http://localhost:5173"
ADMIN_EMAIL="admin@lmtek.com"
ADMIN_PASSWORD="admin123"
```

### 3. Setup PostgreSQL Database

Make sure PostgreSQL is running, then create the database:

```sql
CREATE DATABASE lmtek_configurator;
```

### 4. Run Database Migrations

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5. Seed the Database

This will create the admin user and populate components:

```bash
npm run prisma:seed
```

### 6. Start the Development Server

```bash
npm run dev
```

The API will be running at `http://localhost:3001`

## API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user | Authenticated |

### Components

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/components` | Get all components | Public |
| GET | `/api/components/category/:category` | Get components by category | Public |
| POST | `/api/components` | Create component | Admin |
| PUT | `/api/components/:id` | Update component | Admin |
| DELETE | `/api/components/:id` | Delete component | Admin |

### Quotes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/quotes` | Create quote | Authenticated |
| GET | `/api/quotes` | Get quotes (filtered by user role) | Authenticated |
| GET | `/api/quotes/:id` | Get quote by ID | Authenticated |
| PUT | `/api/quotes/:id/status` | Update quote status | Admin |
| DELETE | `/api/quotes/:id` | Delete quote | Admin |
| GET | `/api/quotes/stats/summary` | Get quote statistics | Admin |

### Users

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/users` | Get all users | Admin |
| GET | `/api/users/:id` | Get user by ID | Admin |

## Database Schema

### User
- id, email, name, password (hashed)
- phone, company
- role (CLIENT | ADMIN)
- quotes (relation)

### Component
- id, category, name, spec
- listPrice, metadata (JSON)
- isActive (soft delete)

### Quote
- id, quoteNumber, userId
- status, totalPrice
- configuration (JSON), items (relation)
- notes, adminNotes

### QuoteItem
- id, quoteId, componentId
- category, name, spec
- quantity, unitPrice, totalPrice

## Development

### Run Prisma Studio

View and edit database:

```bash
npm run prisma:studio
```

### Create New Migration

After schema changes:

```bash
npm run prisma:migrate
```

### Build for Production

```bash
npm run build
npm start
```

## Default Admin Credentials

After seeding:
- Email: `admin@lmtek.com`
- Password: `admin123`

**⚠️ Change these in production!**

## Security Notes

- All passwords are hashed with bcrypt
- JWT tokens expire after 7 days (configurable)
- Admin-only routes are protected with role middleware
- Soft delete for components (isActive flag)
- CORS configured for specified origins only

## API Response Format

### Success Response
```json
{
  "data": { },
  "message": "Success message"
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": []
}
```

## Testing with cURL

### Register User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe",
    "phone": "+1234567890",
    "company": "Acme Corp"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@lmtek.com",
    "password": "admin123"
  }'
```

### Get Components
```bash
curl http://localhost:3001/api/components
```

### Create Quote (with token)
```bash
curl -X POST http://localhost:3001/api/quotes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "configuration": {},
    "items": [],
    "totalPrice": 50000
  }'
```

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL in `.env`
- Ensure database exists

### Migration Errors
```bash
npx prisma migrate reset  # Resets database and reruns migrations
npx prisma generate       # Regenerates Prisma client
```

### Port Already in Use
Change PORT in `.env` or kill the process using port 3001:
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill
```

## License

Proprietary - LM TEK
