# Authentication System - Cookie-Based Token Refresh

## Overview
This authentication system uses JWT tokens with automatic refresh capabilities:
- **Access Token**: Stored in Redux state (memory only, not persisted)
- **Refresh Token**: Stored in HTTP-only cookie (managed by backend)
- **Auto-Refresh**: Automatically refreshes access token on app reload

## How It Works

### 1. Login Flow
```
User logs in → Backend returns:
  - accessToken (stored in Redux state)
  - user data (stored in Redux + persisted to localStorage)
  - refreshToken (sent as HTTP-only cookie, NOT accessible to JS)
```

### 2. Page Reload Flow
```
User reloads page →
  Redux rehydrates (user data persisted, but NO accessToken) →
  TokenRefreshProvider detects user but no accessToken →
  Calls /auth/refresh with HTTP-only cookie →
  Backend validates refresh token →
  Returns new accessToken and user data →
  Updates Redux state
```

### 3. API Request Flow
```
API request made →
  baseQueryWithReauth intercepts →
  Adds accessToken to Authorization header →
  If 401 error →
    Calls /auth/refresh automatically →
    Gets new accessToken →
    Retries original request
```

## Key Files

### `src/store/store.ts`
- Redux store configuration with redux-persist
- **Important**: Only persists `user` and `isAuthenticated`, NOT `accessToken`

### `src/store/provider.tsx`
- Redux Provider with PersistGate
- Wraps the entire app

### `src/store/hooks/useTokenRefresh.ts`
- Custom hook that runs on app load
- Automatically refreshes token if user exists but no accessToken
- Logs out user if refresh fails

### `src/components/auth/TokenRefreshProvider.tsx`
- Component that uses useTokenRefresh hook
- Added to root layout

### `src/store/services/baseApi.ts`
- Base query with automatic token refresh on 401 errors
- Uses `credentials: "include"` to send HTTP-only cookies

### `src/store/services/authApi.ts`
- Authentication endpoints: login, register, logout, refresh
- Automatically dispatches Redux actions after successful auth

## Environment Variables

```env
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:4000/api
```

## Backend Requirements

Your NestJS backend must:

1. **Login/Register** (`POST /auth/login`, `POST /auth/register`):
   - Return: `{ accessToken: string, user: UserObject }`
   - Set HTTP-only cookie: `refreshToken`

2. **Refresh** (`POST /auth/refresh`):
   - Accept: HTTP-only cookie with refreshToken
   - Return: `{ accessToken: string, user: UserObject }`
   - Optionally rotate refresh token (set new cookie)

3. **Logout** (`POST /auth/logout`):
   - Clear the refreshToken cookie
   - Optionally invalidate the refresh token in database

### Example NestJS Cookie Configuration
```typescript
// In your auth controller
@Post('login')
async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
  const { accessToken, refreshToken, user } = await this.authService.login(dto);
  
  // Set HTTP-only cookie for refresh token
  response.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  
  return { accessToken, user };
}
```

## Usage

### In Components
```typescript
import { useAppSelector } from '@/src/store/hooks';

function MyComponent() {
  const { user, isAuthenticated, accessToken } = useAppSelector(state => state.auth);
  
  if (!isAuthenticated) {
    return <div>Please login</div>;
  }
  
  return <div>Welcome, {user?.name}!</div>;
}
```

### Making Authenticated API Calls
```typescript
import { api } from '@/src/store/services/baseApi';

export const usersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => '/users', // Automatically includes auth token
    }),
  }),
});
```

## Security Benefits

1. **XSS Protection**: Refresh token in HTTP-only cookie cannot be accessed by JavaScript
2. **Memory Only Access Token**: Access token never stored in localStorage, cleared on tab close
3. **Automatic Refresh**: User stays logged in without manual intervention
4. **Token Rotation**: Backend can rotate refresh tokens for additional security

## Testing

1. **Login**: User logs in → Verify accessToken in Redux state
2. **Reload**: Refresh page → Verify user stays logged in (auto-refresh)
3. **Token Expiry**: Wait for access token to expire → Make API call → Verify automatic refresh
4. **Logout**: Click logout → Verify both tokens cleared and user logged out
