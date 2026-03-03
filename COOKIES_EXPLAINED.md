# Cookie Storage Explained

## Your 3 Cookies

### 1. `refreshToken` 🔐
- **Purpose**: Authentication refresh token
- **Set by**: Your NestJS backend (`/auth/login`, `/auth/register`)
- **Used for**: Automatically getting new access tokens without re-login
- **Type**: HTTP-only cookie (secure, can't be accessed by JavaScript)
- **Expires**: Typically 7-30 days (set by backend)

### 2. `sidebarstate` 📐
- **Purpose**: Remember sidebar open/closed state
- **Set by**: Your frontend (likely in `AppLayout` or sidebar component)
- **Used for**: UI persistence - remembering if user collapsed the sidebar
- **Type**: Regular cookie (accessible by JavaScript)
- **Expires**: Usually long-term or session-based

### 3. `__next_hmr_refresh_hash__` 🔥
- **Purpose**: Next.js Hot Module Replacement (HMR)
- **Set by**: Next.js development server
- **Used for**: Fast Refresh during development (auto-reload on code changes)
- **Type**: Development only - NOT present in production
- **Expires**: Session-based (cleared when dev server stops)

## What Should Be in Production?

✅ **Keep**: `refreshToken`, `sidebarstate`  
❌ **Auto-removed**: `__next_hmr_refresh_hash__` (dev only)

## Why HTTP-Only Cookie for Refresh Token?

**Security Benefits:**
- JavaScript cannot access it (XSS protection)
- Automatically sent with API requests
- More secure than localStorage
- Access token in memory (Redux) gets cleared on tab close

## What If I Don't Want sidebarstate Cookie?

You can use localStorage instead:
```typescript
// Instead of cookies
localStorage.setItem('sidebarState', 'closed');

// Or use session storage (cleared on tab close)
sessionStorage.setItem('sidebarState', 'closed');
```
