# Authentication System Documentation

## Overview
This authentication system is built with Redux Toolkit (RTK Query) and integrates with a NestJS backend API.

## Features
- ✅ Login with email/password
- ✅ Redux state management for auth
- ✅ Automatic token refresh
- ✅ Protected routes with sidebar
- ✅ Logout functionality
- ✅ User profile display
- ✅ Secure cookie-based refresh tokens

## File Structure
```
src/
├── app/
│   ├── login/
│   │   └── page.tsx          # Login page UI
│   └── layout.tsx            # Root layout with Redux
├── components/
│   └── layout/
│       └── AppLayout.tsx     # Conditional sidebar layout
├── store/
│   ├── services/
│   │   └── authApi.ts        # Auth API endpoints (RTK Query)
│   ├── slices/
│   │   └── authSlice.ts      # Auth state management
│   ├── hooks/
│   │   └── index.ts          # Typed Redux hooks
│   ├── index.ts              # Store configuration
│   └── provider.tsx          # Redux Provider wrapper
└── types/
    └── type.ts               # TypeScript types
```

## Configuration

### 1. Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 2. Backend API Requirements
The backend should have these endpoints:
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user
- `GET /auth/profile` - Get current user profile

## Usage

### Login Page
Navigate to `/login` to access the login page.

**Demo Credentials** (if using the provided backend):
- Email: `owner@gym.com`
- Password: `password123`

### Login Flow
1. User enters email and password
2. Frontend calls `POST /auth/login`
3. Backend returns:
   ```json
   {
     "user": { /* user object */ },
     "accessToken": "jwt-token"
   }
   ```
4. Refresh token is stored in HTTP-only cookie
5. Access token is stored in Redux state
6. User is redirected to home page

### Protected Routes
All routes except `/login`, `/register`, and `/forgot-password` are protected and show the sidebar layout.

### Logout
Click the "Logout" button in the sidebar footer to log out.

## API Integration

### Auth API Service (`authApi.ts`)
Uses RTK Query for API calls:
```typescript
const { data, error, isLoading } = useLoginMutation()
```

### Auth Slice (`authSlice.ts`)
Manages authentication state:
```typescript
{
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}
```

### Accessing Auth State
```typescript
import { useAppSelector } from '@/src/store/hooks'

const { user, isAuthenticated } = useAppSelector(state => state.auth)
```

## Token Management

### Access Token
- Stored in Redux state
- Short-lived (typically 15-30 minutes)
- Sent with every API request via Authorization header

### Refresh Token
- Stored in HTTP-only cookie (set by backend)
- Long-lived (typically 7 days)
- Automatically sent with requests to `/auth/refresh`

### Auto-Refresh (Future Enhancement)
You can add auto-refresh logic in the `authApi.ts` baseQuery:
```typescript
baseQuery: async (args, api, extraOptions) => {
  let result = await baseQueryWithReauth(args, api, extraOptions)
  
  if (result.error?.status === 401) {
    // Try to refresh token
    const refreshResult = await baseQueryWithReauth(
      { url: '/refresh', method: 'POST' },
      api,
      extraOptions
    )
    
    if (refreshResult.data) {
      // Store new token and retry original request
      api.dispatch(setCredentials(refreshResult.data))
      result = await baseQueryWithReauth(args, api, extraOptions)
    } else {
      // Refresh failed, logout
      api.dispatch(logout())
    }
  }
  
  return result
}
```

## Components

### Login Page (`/login/page.tsx`)
- Email and password inputs with validation
- Show/hide password toggle
- Error handling
- Loading states
- Demo credentials display

### App Layout (`AppLayout.tsx`)
- Conditionally renders sidebar for authenticated routes
- Shows user info in sidebar footer
- Logout button
- Active route highlighting

## Security Notes

1. **HTTPS Required**: In production, ensure your API uses HTTPS
2. **Secure Cookies**: Backend should set HttpOnly, Secure, and SameSite flags
3. **CORS**: Backend should configure CORS to allow credentials
4. **Token Storage**: Access token in memory (Redux), refresh token in HTTP-only cookie

## Testing

### Testing Login
1. Start the backend server (default: http://localhost:3001)
2. Start the Next.js dev server: `npm run dev`
3. Navigate to http://localhost:3000/login
4. Enter credentials and click "Sign In"

### Testing Protected Routes
1. After login, navigate to `/users`, `/plans`, or `/subscriptions`
2. Sidebar should be visible
3. User info should appear in sidebar footer

### Testing Logout
1. Click "Logout" button in sidebar
2. Should redirect to `/login`
3. Auth state should be cleared

## Troubleshooting

### Login not working
- Check API URL in `.env.local`
- Verify backend is running
- Check browser console for errors
- Check network tab for API responses

### Token refresh issues
- Ensure cookies are enabled in browser
- Check backend cookie settings (HttpOnly, Secure, SameSite)
- Verify `/auth/refresh` endpoint is working

### Sidebar not showing
- Check if route is in `authPages` array in `AppLayout.tsx`
- Verify Redux state has user data

## Next Steps

1. **Add Auth Guard**: Create middleware to redirect unauthenticated users
2. **Role-based Access**: Implement role checking for different user types
3. **Remember Me**: Add option to extend refresh token lifetime
4. **Social Login**: Add Google/GitHub OAuth support
5. **Password Reset**: Implement forgot password flow
6. **Email Verification**: Add email verification on registration
