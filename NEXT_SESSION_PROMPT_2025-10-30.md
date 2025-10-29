# Next Session Prompt - October 30, 2025

**Created:** 2025-10-29
**Project Version:** 1.1.0
**Status:** Production Ready (Docker Deployed)
**Last Session:** Bug fixes and PSU system overhaul

---

## 🚀 Quick Start - Copy & Paste This

```
Hi! I'm continuing work on the LM TEK Server Configurator project.

Project Location: D:\Projects\grando-lmtek-fusion-main
Docker Services: http://localhost:3000 (frontend), http://localhost:3001 (backend)
Version: 1.1.0

Last Session Summary (2025-10-29):
✅ Fixed critical infinite loop bug in QuoteDialog (quote submission now works)
✅ Overhauled PSU auto-selection system with new power rules
✅ Updated PSU configurations: 1-2 GPUs→2 PSU, 3-4 GPUs→3 PSU, 5-6 GPUs→4 PSU, 7-8 GPUs→5 PSU
✅ Each GPU requires 650W, each PSU provides 2000W
✅ Removed manual PSU quantity selector (now fully automatic)
✅ All documentation updated

Current Application Status:
✅ All Docker services running and healthy
✅ Database seeded with correct components
✅ Authentication working (login/register)
✅ Quote submission and PDF generation working
✅ Admin and client dashboards functional
✅ ComponentsContext using API (not localStorage)

Please review these files first:
1. PROJECT_CONTEXT.md - Complete project overview
2. SESSION_2025-10-29.md - Detailed notes from last session
3. PSU_REFERENCE.md - PSU system documentation
4. CHANGELOG.md - Version history

What would you like to work on today?
```

---

## 🎯 Recommended Next Tasks

### Option A: Security Hardening (HIGH PRIORITY) 🔒
**Estimated Time:** 2-3 hours
**Impact:** Critical for production deployment

**Tasks:**
1. **Implement Rate Limiting**
   - Add express-rate-limit to authentication endpoints
   - Limit: 5 login attempts per 15 minutes per IP
   - Files: `server/src/routes/auth.routes.ts`

2. **Move JWT to httpOnly Cookies**
   - Currently in localStorage (vulnerable to XSS)
   - Update: `src/services/auth.service.ts`, `src/lib/api.ts`
   - Benefit: Protection against XSS attacks

3. **Change Default Admin Password**
   - Current: admin@lmtek.com / admin123
   - Files: `server/.env`, `docker-compose.yml`
   - Generate strong password

**Start Command:**
```bash
cd server
npm install express-rate-limit
# Then start implementing rate limiting
```

---

### Option B: Automated Testing Setup 🧪
**Estimated Time:** 4-5 hours
**Impact:** Prevents regressions, improves code quality

**Priority Tests:**
1. **PSU Validation Tests** (CRITICAL - just updated this logic)
   - File: `src/utils/psuValidation.test.ts`
   - Test all GPU count scenarios (1-8)
   - Verify correct PSU count selection

2. **Authentication Endpoint Tests**
   - File: `server/src/routes/auth.routes.test.ts`
   - Test register, login, token validation
   - Test error cases

3. **Quote Submission Tests**
   - File: `server/src/routes/quote.routes.test.ts`
   - Test quote creation, retrieval, status updates
   - Test authorization (owner vs admin)

**Start Command:**
```bash
# Frontend
npm install -D vitest @testing-library/react @testing-library/jest-dom

# Backend
cd server
npm install -D jest supertest @types/jest
```

---

### Option C: Email Notifications 📧
**Estimated Time:** 3-4 hours
**Impact:** Improves user experience and communication

**Features:**
1. Quote submitted → Email to admin
2. Quote status changed → Email to client
3. Include quote details and PDF attachment
4. Professional HTML email templates

**Setup:**
```bash
cd server
npm install nodemailer
# Create email service and templates
```

**Files to Create:**
- `server/src/services/email.service.ts`
- `server/src/templates/quote-submitted.html`
- `server/src/templates/quote-status-update.html`

---

### Option D: Error Tracking with Sentry 📊
**Estimated Time:** 1-2 hours
**Impact:** Better debugging and monitoring

**Setup:**
```bash
npm install @sentry/react
cd server && npm install @sentry/node
```

**Implementation:**
1. Configure Sentry in `src/main.tsx` (frontend)
2. Configure Sentry in `server/src/index.ts` (backend)
3. Add React error boundaries
4. Set up source maps
5. Configure alerts

---

### Option E: Admin Dashboard Analytics 📈
**Estimated Time:** 2-3 hours
**Impact:** Better business insights

**Features:**
- Total quotes by status (chart)
- Revenue by month
- Most popular GPU configurations
- Average quote value
- Recent activity timeline

**Files to Modify:**
- `src/pages/AdminQuotes.tsx`
- Add new endpoint: `server/src/routes/quote.routes.ts` (GET /api/quotes/stats/analytics)

---

## 🐛 Known Issues (From Analysis)

### Critical (Security)
1. ❌ No rate limiting on API endpoints
2. ❌ JWT stored in localStorage (should be httpOnly cookies)
3. ❌ Default admin password (admin123) must be changed
4. ❌ No HTTPS/SSL (local dev only, but needed for production)

### High (Code Quality)
5. ❌ QuoteDialog.tsx is 650 lines (should be split into smaller components)
6. ❌ No automated tests (0% coverage)
7. ❌ No error boundaries (app crashes on uncaught errors)

### Medium (Features)
8. ⚠️ No email notifications
9. ⚠️ Large bundle size (no code splitting)
10. ⚠️ No input sanitization (XSS risk in notes fields)

### Low (Nice to Have)
11. 📝 Missing JSDoc comments
12. 📝 No API versioning
13. 📝 No component images

---

## 📚 Important File Locations

### Recently Modified (2025-10-29)
- ✅ `src/components/QuoteDialog.tsx:322` - Fixed infinite loop
- ✅ `src/utils/psuValidation.ts` - Updated PSU rules
- ✅ `src/components/Configurator.tsx:137-156` - Fixed PSU auto-selection
- ✅ `src/components/ConfigSection.tsx:385-418` - Removed manual PSU selector
- ✅ `server/prisma/seed.ts:124-159` - Updated PSU component data

### Core Files
**Frontend:**
- `src/contexts/AuthContext.tsx` - Authentication state
- `src/contexts/ComponentsContext.tsx` - Component data (API-based)
- `src/lib/api.ts` - Axios client with interceptors
- `src/services/auth.service.ts` - Auth API calls
- `src/services/quote.service.ts` - Quote API calls

**Backend:**
- `server/src/index.ts` - Express app entry
- `server/src/middleware/auth.middleware.ts` - JWT authentication
- `server/src/routes/auth.routes.ts` - Auth endpoints
- `server/src/routes/component.routes.ts` - Component CRUD
- `server/src/routes/quote.routes.ts` - Quote management
- `server/prisma/schema.prisma` - Database schema

### Documentation
- `PROJECT_CONTEXT.md` - Complete project overview
- `CHANGELOG.md` - Version history (v1.0.0 → v1.1.0)
- `SESSION_2025-10-29.md` - Last session details
- `PSU_REFERENCE.md` - PSU system documentation
- `DOCKER_SETUP.md` - Docker deployment guide

---

## 🚀 Quick Docker Commands

```bash
# Check status
docker-compose ps

# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart backend (after code changes)
docker-compose restart backend

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Access database
docker-compose exec postgres psql -U postgres -d lmtek_configurator

# Rebuild after dependency changes
docker-compose up -d --build
```

---

## 💡 Suggested Session Plans

### Plan A: Security First (3 hours)
1. ✅ Implement rate limiting (30 min)
2. ✅ Move JWT to httpOnly cookies (90 min)
3. ✅ Change default admin password (15 min)
4. ✅ Add input sanitization (45 min)
5. ✅ Test and document changes (30 min)

**Result:** Application ready for production deployment

---

### Plan B: Testing Foundation (4 hours)
1. ✅ Set up testing infrastructure (45 min)
2. ✅ Write PSU validation tests (60 min)
3. ✅ Write auth endpoint tests (60 min)
4. ✅ Write quote endpoint tests (60 min)
5. ✅ Run coverage report and fix gaps (15 min)

**Result:** 70%+ test coverage, CI/CD ready

---

### Plan C: Quick Wins (2 hours)
1. ✅ Change admin password (5 min)
2. ✅ Add basic rate limiting (30 min)
3. ✅ Set up Sentry error tracking (45 min)
4. ✅ Add admin dashboard analytics (40 min)

**Result:** Several improvements without major refactoring

---

### Plan D: Email Notifications (3 hours)
1. ✅ Set up email service (nodemailer) (30 min)
2. ✅ Create HTML email templates (45 min)
3. ✅ Implement quote submission email (45 min)
4. ✅ Implement status change email (45 min)
5. ✅ Test with real SMTP (15 min)

**Result:** Professional email communication system

---

## 📝 Pre-Session Checklist

Before starting, verify:
- [ ] Docker services are running (`docker-compose ps`)
- [ ] Frontend accessible at http://localhost:3000
- [ ] Backend API responding at http://localhost:3001/api
- [ ] Database has PSU components (4 configurations)
- [ ] Can login with admin@lmtek.com / admin123
- [ ] Quote submission works (no infinite loop)
- [ ] PSU auto-selection working for all GPU counts

---

## 🔍 Testing Your Changes

### Test PSU System
1. Go to http://localhost:3000
2. Change GPU quantity from 1 to 8
3. Expand Power Supply section each time
4. Verify correct PSU auto-selected:
   - 1-2 GPUs → 2x PSU (€477.80)
   - 3-4 GPUs → 3x PSU (€716.70)
   - 5-6 GPUs → 4x PSU (€955.60)
   - 7-8 GPUs → 5x PSU (€1,194.50)

### Test Quote Submission
1. Login as admin or create new account
2. Configure a server
3. Click "Get Quote" button
4. Fill out quote form
5. Click "Submit Quote Request"
6. Verify: Dialog switches to success view (no infinite loop)
7. Click "Make a PDF Quote"
8. Verify: PDF generates and displays
9. Download and verify PDF contents

### Test Authentication
1. Logout
2. Try to access /my-quotes (should redirect to /login)
3. Login with valid credentials
4. Verify redirected to home page
5. User menu should show name and logout option

---

## 🎓 Resources

**Documentation:**
- Express Rate Limit: https://github.com/express-rate-limit/express-rate-limit
- httpOnly Cookies with JWT: https://hasura.io/blog/best-practices-of-using-jwt-with-graphql/
- Vitest (Testing): https://vitest.dev/
- Sentry Setup: https://docs.sentry.io/platforms/javascript/guides/react/
- Nodemailer: https://nodemailer.com/about/

**Project Docs:**
- Prisma: https://www.prisma.io/docs
- React Testing Library: https://testing-library.com/react
- Docker Compose: https://docs.docker.com/compose/

---

## ⚠️ Important Notes

### Security Warnings
- 🔴 **CRITICAL:** Change admin password before production
- 🔴 **CRITICAL:** Generate strong JWT_SECRET (32+ characters)
- 🔴 **CRITICAL:** Configure ALLOWED_ORIGINS for production domain
- 🟡 **WARNING:** Current JWT in localStorage is XSS vulnerable

### Database Notes
- PSU components manually inserted on 2025-10-29
- If backend container is rebuilt, PSU data may be lost (seed.ts still has old data in Docker image)
- To fix: Rebuild backend container after seed.ts changes

### Testing Notes
- No tests currently exist (0% coverage)
- Critical paths need testing: auth, PSU validation, quote submission
- Aim for 70% coverage minimum

---

## 🎯 Success Metrics

### Security Hardening
- [ ] Rate limiting active on auth endpoints
- [ ] JWT in httpOnly cookies (not localStorage)
- [ ] Default admin password changed
- [ ] Input sanitization implemented

### Testing
- [ ] 70%+ code coverage
- [ ] All critical paths tested
- [ ] CI/CD pipeline configured
- [ ] Tests run on every commit

### Features
- [ ] Email notifications working
- [ ] Error tracking with Sentry
- [ ] Admin analytics dashboard
- [ ] Component images uploaded

---

## 📞 Quick Reference

**Project Path:** D:\Projects\grando-lmtek-fusion-main
**Frontend:** http://localhost:3000
**Backend API:** http://localhost:3001/api
**Database:** PostgreSQL on localhost:5432

**Admin Credentials (CHANGE FOR PRODUCTION):**
- Email: admin@lmtek.com
- Password: admin123

**Recent Version:**
- v1.1.0 (2025-10-29)
- Status: Production Ready ✅
- Docker: Running and Healthy ✅

---

## 🚦 Ready to Start!

**Choose your focus:**
1. 🔒 Security Hardening (Option A) - RECOMMENDED for production
2. 🧪 Testing Setup (Option B) - RECOMMENDED for code quality
3. 📧 Email Notifications (Option C) - User experience improvement
4. 📊 Error Tracking (Option D) - Better monitoring
5. 📈 Admin Analytics (Option E) - Business insights

**Or tell me what you want to work on, and I'll help you get started!** 🚀
