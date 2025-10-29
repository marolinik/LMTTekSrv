# Next Session Prompt

Copy and paste this prompt at the start of your next session:

---

## 🚀 Session Start Prompt

```
Hi! I'm continuing work on the LM TEK Server Configurator project.

Please review these context files:
1. PROJECT_CONTEXT.md - Complete project overview and current status
2. NEXT_SESSION_PLAN.md - Detailed plan for this session

Current Status:
- ✅ Backend API is complete (Express + PostgreSQL + Prisma)
- ✅ Frontend configurator UI is complete (React + TypeScript)
- ✅ Admin component management is working (uses localStorage)
- ⏳ Need to integrate authentication and connect frontend to backend API

Priority Tasks for This Session:
1. Create authentication system (AuthContext, Login/Register pages)
2. Migrate ComponentsContext from localStorage to API
3. Implement quote submission functionality
4. Build client dashboard to view quotes
5. Build admin dashboard to manage quotes

Let's start with task #1: Authentication System.

Please read PROJECT_CONTEXT.md first, then let's create:
1. AuthContext with login/register/logout functionality
2. Login page at /login
3. Register page at /register
4. ProtectedRoute component for auth-required pages

Use the code examples in NEXT_SESSION_PLAN.md as reference.
```

---

## Alternative Focused Prompts

### If You Want to Start with Authentication Only:
```
Hi! Continuing the LM TEK Configurator project.

Please read PROJECT_CONTEXT.md to understand the current state.

I want to implement the authentication system:
1. Create AuthContext for global auth state
2. Build Login page with email/password form
3. Build Register page with full registration form
4. Create ProtectedRoute component for route protection
5. Update Header to show logged-in user and logout button

The backend API is already complete. Use the auth.service.ts file that's already created.

Let's start with the AuthContext.
```

### If You Want to Start with API Integration:
```
Hi! Continuing the LM TEK Configurator project.

Please read PROJECT_CONTEXT.md for full context.

I want to migrate the ComponentsContext from localStorage to use the backend API:
1. Update ComponentsContext to fetch components from API on mount
2. Add React Query for caching and state management
3. Add loading and error states
4. Update admin mutations to use API (create/update/delete)
5. Remove localStorage persistence

The API endpoints are at http://localhost:3001/api/components
The componentService is already created in src/services/component.service.ts

Let's update src/contexts/ComponentsContext.tsx to use the API.
```

### If You Want to Jump to Quote Submission:
```
Hi! Continuing the LM TEK Configurator project.

Read PROJECT_CONTEXT.md for full project context.

Assuming authentication is working, I want to implement quote submission:
1. Update the "Get Quote" button in ConfigSummary
2. Create a QuoteDialog component for quote submission
3. Build the logic to convert configuration to QuoteItem[]
4. Submit quote to POST /api/quotes
5. Create a QuoteConfirmation page to show after submission

The quoteService is already created with all necessary methods.

Let's start with updating ConfigSummary.tsx to add the quote submission flow.
```

---

## 📋 Quick Reference for Next Session

### Project Structure
- **Frontend:** React + TypeScript in `src/`
- **Backend:** Express + TypeScript in `server/src/`
- **Database:** PostgreSQL with Prisma ORM

### Key Files
- `src/contexts/ComponentsContext.tsx` - Component state (needs API migration)
- `src/services/*.ts` - API service layer (already created)
- `server/src/routes/*.ts` - API endpoints (complete)
- `server/prisma/schema.prisma` - Database schema

### API Endpoints
- Auth: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- Components: `/api/components` (GET/POST/PUT/DELETE)
- Quotes: `/api/quotes` (GET/POST), `/api/quotes/:id/status` (PUT)

### Default Credentials
- Admin: admin@lmtek.com / admin123

### Running the Project
```bash
# Terminal 1: Backend
cd server && npm run dev

# Terminal 2: Frontend
npm run dev

# Terminal 3: Database UI
cd server && npm run prisma:studio
```

---

## 🎯 Session Goals Summary

**Primary Goal:** Complete authentication and quote submission system

**Deliverables:**
1. Working login/register flow
2. Protected routes for authenticated users
3. Components loaded from API (not localStorage)
4. Quote submission functionality
5. Client dashboard to view quotes
6. Admin dashboard to manage quotes

**Success Metric:**
User can register → login → configure server → submit quote → view quote status
Admin can login → view all quotes → update quote status

---

## 💡 Tips for Next Session

1. **Start Small:** Begin with AuthContext, then Login page, then Register
2. **Test Incrementally:** Test each piece before moving to next
3. **Use Existing Code:** Reference the service files already created
4. **Check Backend:** Ensure server is running before frontend work
5. **Use Prisma Studio:** View database changes in real-time
6. **Console Logs:** Add logging to debug API calls
7. **React DevTools:** Monitor component state and props

---

## ⚠️ Common Issues to Watch For

1. **CORS Errors:** Ensure ALLOWED_ORIGINS is set correctly in server/.env
2. **Token Storage:** Remember to store token in localStorage after login
3. **Protected Routes:** Don't forget to check authentication status
4. **API Base URL:** Verify VITE_API_URL in .env
5. **Database Connection:** Check PostgreSQL is running
6. **Port Conflicts:** Backend on 3001, Frontend on 5173

---

**Ready to start? Use one of the prompts above! 🚀**
