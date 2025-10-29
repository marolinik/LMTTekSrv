# Next Session Plan - LM TEK Configurator

## 🎯 Session Goal
Complete frontend-backend integration with authentication system and quote submission functionality.

---

## 📋 TODO List Priority

### 🔴 HIGH PRIORITY (Must Complete)

#### 1. Authentication System (2-3 hours)
**Status:** Not Started
**Difficulty:** Medium

**Tasks:**
- [ ] Create AuthContext/Provider for global auth state
- [ ] Build Login page (`/login`)
  - Email + password form
  - Error handling
  - Redirect to dashboard on success
- [ ] Build Register page (`/register`)
  - Full registration form (name, email, phone, company, password)
  - Client role by default
  - Redirect to login on success
- [ ] Create ProtectedRoute component
  - Check authentication status
  - Redirect to login if not authenticated
  - Support role-based access
- [ ] Update Header component
  - Show user name when logged in
  - Add logout button
  - Hide admin link for non-admins
- [ ] Add authentication to existing routes

**Files to Create:**
- `src/contexts/AuthContext.tsx`
- `src/pages/Login.tsx`
- `src/pages/Register.tsx`
- `src/components/ProtectedRoute.tsx`

**Files to Update:**
- `src/components/Header.tsx`
- `src/App.tsx` (add routes)

---

#### 2. Migrate ComponentsContext to API (1-2 hours)
**Status:** Not Started
**Difficulty:** Medium

**Tasks:**
- [ ] Update ComponentsContext to fetch from API on mount
- [ ] Add React Query for component fetching
- [ ] Handle loading states
- [ ] Handle error states
- [ ] Keep admin mutations (create/update/delete)
- [ ] Remove localStorage persistence
- [ ] Add refetch on component changes

**Files to Update:**
- `src/contexts/ComponentsContext.tsx`

**New Dependencies:**
- Already have TanStack React Query

**Code Example:**
```tsx
const { data: components, isLoading, error } = useQuery({
  queryKey: ['components'],
  queryFn: () => componentService.getAll(),
});
```

---

#### 3. Quote Submission System (2-3 hours)
**Status:** Not Started
**Difficulty:** Medium-High

**Tasks:**
- [ ] Update ConfigSummary "Get Quote" button
  - Check if user is logged in
  - If not → redirect to login with return URL
  - If yes → open quote dialog
- [ ] Create QuoteDialog component
  - Show configuration summary
  - Optional notes textarea
  - Submit button
  - Loading state during submission
- [ ] Implement quote submission logic
  - Build QuoteItem array from configuration
  - Call quoteService.create()
  - Show success message
  - Redirect to quote detail page
- [ ] Create QuoteConfirmation page
  - Display quote number
  - Show full configuration
  - Display "Pending Review" status
  - Link to "View My Quotes"

**Files to Create:**
- `src/components/QuoteDialog.tsx`
- `src/pages/QuoteConfirmation.tsx`

**Files to Update:**
- `src/components/ConfigSummary.tsx`
- `src/App.tsx` (add route)

**Quote Submission Flow:**
```
User clicks "Get Quote"
  → Check if authenticated
  → If not: Redirect to /login?returnTo=/
  → If yes: Open QuoteDialog
    → User adds notes
    → Click "Submit Quote"
      → Create QuoteItem[] from config
      → POST /api/quotes
      → Redirect to /quote-confirmation/:id
```

---

### 🟡 MEDIUM PRIORITY (Should Complete)

#### 4. Client Dashboard (1-2 hours)
**Status:** Not Started
**Difficulty:** Medium

**Tasks:**
- [ ] Create MyQuotes page (`/my-quotes`)
- [ ] Fetch user's quotes with React Query
- [ ] Display quotes in table/grid
  - Quote number
  - Date submitted
  - Total price
  - Status badge
  - View details button
- [ ] Add filtering by status
- [ ] Add pagination
- [ ] Create QuoteDetail page (`/quotes/:id`)
  - Full configuration display
  - All quote items
  - Status tracking
  - Admin notes (if any)

**Files to Create:**
- `src/pages/MyQuotes.tsx`
- `src/pages/QuoteDetail.tsx`
- `src/components/QuoteStatusBadge.tsx`

**Files to Update:**
- `src/App.tsx` (add routes)
- `src/components/Header.tsx` (add "My Quotes" link)

---

#### 5. Admin Quote Management (2-3 hours)
**Status:** Not Started
**Difficulty:** Medium-High

**Tasks:**
- [ ] Create AdminQuotes page (`/admin/quotes`)
  - Protected route (admin only)
  - Fetch all quotes
  - Display in table with user info
  - Filter by status
  - Search functionality
- [ ] Add quote detail view for admin
  - All client information
  - Configuration details
  - Status update dropdown
  - Admin notes textarea
  - Save changes button
- [ ] Add quote statistics dashboard
  - Total quotes
  - Pending count
  - Approved count
  - Total revenue
  - Charts (optional)

**Files to Create:**
- `src/pages/admin/AdminQuotes.tsx`
- `src/pages/admin/AdminQuoteDetail.tsx`
- `src/pages/admin/AdminDashboard.tsx`

**Files to Update:**
- `src/App.tsx` (add routes)
- `src/pages/Admin.tsx` (add navigation tabs)

---

### 🟢 LOW PRIORITY (Nice to Have)

#### 6. UI/UX Improvements
- [ ] Add loading skeletons for API calls
- [ ] Implement toast notifications (Sonner)
- [ ] Add confirmation dialogs for destructive actions
- [ ] Improve error messages
- [ ] Add empty states
- [ ] Mobile menu improvements

#### 7. Testing & Documentation
- [ ] Test all API endpoints
- [ ] Test authentication flow
- [ ] Test quote submission
- [ ] Update README with new features
- [ ] Add API documentation

---

## 🏗️ Technical Architecture Updates

### New Routes to Add

```tsx
// Public routes
<Route path="/login" element={<Login />} />
<Route path="/register" element={<Register />} />

// Protected client routes
<Route path="/my-quotes" element={<ProtectedRoute><MyQuotes /></ProtectedRoute>} />
<Route path="/quotes/:id" element={<ProtectedRoute><QuoteDetail /></ProtectedRoute>} />
<Route path="/quote-confirmation/:id" element={<ProtectedRoute><QuoteConfirmation /></ProtectedRoute>} />

// Protected admin routes
<Route path="/admin" element={<ProtectedRoute requireAdmin><Admin /></ProtectedRoute>} />
<Route path="/admin/quotes" element={<ProtectedRoute requireAdmin><AdminQuotes /></ProtectedRoute>} />
<Route path="/admin/quotes/:id" element={<ProtectedRoute requireAdmin><AdminQuoteDetail /></ProtectedRoute>} />
```

### Context Structure

```tsx
// AuthContext
{
  user: User | null,
  isAuthenticated: boolean,
  isAdmin: boolean,
  login: (email, password) => Promise<void>,
  register: (data) => Promise<void>,
  logout: () => void,
  isLoading: boolean
}

// ComponentsContext (updated)
{
  components: ComponentsByCategory | null,
  isLoading: boolean,
  error: Error | null,
  addComponent: (data) => Promise<void>,
  updateComponent: (id, data) => Promise<void>,
  deleteComponent: (id, category) => Promise<void>,
  refetch: () => void
}
```

---

## 📊 Data Flow Diagrams

### Authentication Flow
```
App Mount
  → Check localStorage for token
  → If exists: GET /api/auth/me
    → Success: Set user state
    → Failure: Clear token, redirect to login

Login
  → POST /api/auth/login
  → Receive token + user
  → Store in localStorage
  → Set AuthContext state
  → Redirect to dashboard

Logout
  → Clear localStorage
  → Clear AuthContext
  → Redirect to home
```

### Quote Submission Flow
```
Configurator
  → User configures server
  → Clicks "Get Quote"
  → If not authenticated: Redirect to /login
  → If authenticated:
    → Open QuoteDialog
    → User adds notes
    → Submit
      → Convert config to QuoteItem[]
      → POST /api/quotes
      → Success: Redirect to /quote-confirmation/:id
      → Error: Show error message
```

### Admin Quote Management Flow
```
Admin Login
  → Navigate to /admin/quotes
  → GET /api/quotes (all quotes)
  → Display in table
  → Click on quote
    → Navigate to /admin/quotes/:id
    → GET /api/quotes/:id
    → Display full details
    → Admin updates status
      → PUT /api/quotes/:id/status
      → Show success message
      → Update quote list
```

---

## 🔧 Code Snippets for Reference

### ProtectedRoute Component
```tsx
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin }: ProtectedRouteProps) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?returnTo=${location.pathname}`} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
```

### Building QuoteItems from Configuration
```tsx
const buildQuoteItems = (config: Configuration): QuoteItem[] => {
  return [
    {
      category: 'GPU',
      name: config.gpu.model,
      spec: `${config.gpu.quantity}x`,
      quantity: config.gpu.quantity,
      unitPrice: config.gpu.price / config.gpu.quantity,
      totalPrice: config.gpu.price,
    },
    {
      category: 'CPU',
      name: config.cpu.model,
      spec: `${config.cpu.cores} Cores`,
      quantity: 1,
      unitPrice: config.cpu.price,
      totalPrice: config.cpu.price,
    },
    // ... repeat for all categories
  ];
};
```

---

## ⚠️ Important Considerations

### Security
- Ensure all admin routes check for admin role
- Validate tokens on every protected request
- Handle token expiration gracefully
- Don't expose sensitive data in error messages

### Performance
- Use React Query caching for components
- Implement pagination for quote lists
- Lazy load admin pages
- Optimize images and assets

### User Experience
- Clear error messages
- Loading states for all async operations
- Success feedback for actions
- Breadcrumb navigation
- Mobile responsiveness

### Error Handling
- Network errors
- 401 Unauthorized (redirect to login)
- 403 Forbidden (show message)
- 404 Not Found
- Validation errors

---

## 📝 Session Checklist

### Before Starting
- [ ] Review PROJECT_CONTEXT.md
- [ ] Ensure backend is running (`cd server && npm run dev`)
- [ ] Ensure frontend is running (`npm run dev`)
- [ ] Test API health: `curl http://localhost:3001/api/health`
- [ ] Verify database connection with Prisma Studio

### During Session
- [ ] Commit code frequently
- [ ] Test each feature as you build it
- [ ] Keep terminal logs open for debugging
- [ ] Use React DevTools and Network tab

### End of Session
- [ ] Update PROJECT_CONTEXT.md with progress
- [ ] Document any issues encountered
- [ ] Create new NEXT_SESSION_PLAN.md if needed
- [ ] Commit all changes

---

## 🎯 Success Criteria

By end of this session, the following should work:

1. ✅ **Authentication**
   - User can register
   - User can login
   - User can logout
   - Protected routes redirect to login

2. ✅ **Component Management**
   - Components load from API
   - Admin can add/edit/delete components
   - Changes reflect immediately

3. ✅ **Quote System**
   - Authenticated user can submit quote
   - Quote appears in "My Quotes"
   - Quote number is generated
   - Status shows as "Pending"

4. ✅ **Client Dashboard**
   - User can view their quotes
   - User can see quote details
   - Status badges display correctly

5. ✅ **Admin Dashboard**
   - Admin can view all quotes
   - Admin can update quote status
   - Admin can add notes
   - Statistics display correctly

---

## 🚀 Quick Start Commands

### Terminal 1 (Backend)
```bash
cd server
npm run dev
```

### Terminal 2 (Frontend)
```bash
npm run dev
```

### Terminal 3 (Database)
```bash
cd server
npm run prisma:studio
```

### Testing
```bash
# Test login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lmtek.com","password":"admin123"}'

# Test components (should work without auth)
curl http://localhost:3001/api/components
```

---

## 📚 Files to Reference

- `PROJECT_CONTEXT.md` - Full project context
- `BACKEND_SETUP.md` - Backend setup instructions
- `server/README.md` - API documentation
- `src/services/*.ts` - API service implementations

---

**Estimated Time:** 6-10 hours total
**Priority Order:** Auth → API Integration → Quote Submission → Dashboards
**Goal:** Fully functional quote management system with authentication
