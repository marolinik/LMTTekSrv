# Changelog

All notable changes to the LM TEK Server Configurator project will be documented in this file.

## [Unreleased]

### Security
- TODO: Implement rate limiting on authentication endpoints
- TODO: Move JWT from localStorage to httpOnly cookies
- TODO: Change default admin password for production
- TODO: Add HTTPS/SSL configuration

## [1.1.0] - 2025-10-29

### Fixed
- **Critical Bug:** Fixed infinite loop in QuoteDialog component
  - Added missing `setIsSubmitting(false)` call in success path after quote creation
  - Quote submission now properly completes and shows PDF preview
  - File: `src/components/QuoteDialog.tsx:322`

### Changed
- **Major Update:** Overhauled PSU auto-selection system
  - Updated PSU validation rules to match new power requirements
  - 1-2 GPUs → 2 PSU (4000W) - €477.80
  - 3-4 GPUs → 3 PSU (6000W) - €716.70
  - 5-6 GPUs → 4 PSU (8000W) - €955.60
  - 7-8 GPUs → 5 PSU (10000W) - €1,194.50
  - Each PSU unit is 2000W
  - Files modified:
    - `src/utils/psuValidation.ts` - Updated validation logic
    - `src/components/Configurator.tsx` - Fixed auto-selection behavior
    - `src/components/ConfigSection.tsx` - Removed manual quantity selector
    - `server/prisma/seed.ts` - Updated PSU component data

### Removed
- Manual PSU quantity selector (x1-x5 buttons)
  - PSU configuration is now fully automatic based on GPU count
  - Provides optimal power redundancy without user intervention

### Database
- Deleted old PSU component configurations
- Added 4 new PSU component configurations:
  - 2x PSU (4000W) for 1-2 GPUs
  - 3x PSU (6000W) for 3-4 GPUs
  - 4x PSU (8000W) for 5-6 GPUs
  - 5x PSU (10000W) for 7-8 GPUs

## [1.0.0] - 2025-10-29

### Added
- Complete backend API with authentication
- PostgreSQL database with Prisma ORM
- User authentication (JWT-based)
- Component management system (CRUD)
- Quote submission and management
- Client dashboard (My Quotes)
- Admin dashboard (Component management)
- Admin quote management interface
- PDF generation for quotes
- Docker containerization
- ComponentsContext migrated from localStorage to API
- Login and Registration pages
- Protected routes with role-based access control
- AI-powered sales assistant integration (Google Gemini)

### Features
- 8 component categories: GPU, CPU, RAM, Storage, Power, Network, Motherboard, Cooling
- Automatic PSU selection based on GPU count
- Automatic cooling loop matching to GPU count
- Automatic CPU selection based on GPU configuration
- NVLink bridge auto-calculation for compatible GPUs
- Real-time price calculation
- Quote status workflow (PENDING → REVIEWED → APPROVED → REJECTED → COMPLETED)
- Quote statistics for admins
- Quote copy and edit functionality
- PDF export with professional formatting
- Responsive design with dark/light theme support

### Technical
- React 18.3.1 + TypeScript
- Vite for build tooling
- shadcn-ui component library (50+ components)
- TanStack React Query for API state management
- Express.js backend
- PostgreSQL 14 database
- Prisma 5.22 ORM
- Docker Compose for orchestration
- Nginx for frontend serving

### Security
- bcrypt password hashing (10 rounds)
- JWT authentication with 7-day expiration
- Role-based access control (CLIENT/ADMIN)
- Input validation with Zod
- SQL injection prevention (Prisma ORM)
- CORS configuration
- Soft delete for components

---

## Version Format

This project uses [Semantic Versioning](https://semver.org/):
- MAJOR version for incompatible API changes
- MINOR version for new functionality in a backwards compatible manner
- PATCH version for backwards compatible bug fixes

## Types of Changes
- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** for vulnerability fixes
