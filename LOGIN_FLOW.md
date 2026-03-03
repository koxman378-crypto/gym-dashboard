# Authentication System - Login Flow

## 📁 File Structure

```
src/app/auth/
├── page.tsx           # Redirects to /auth/login
├── login/
│   └── page.tsx      # Login page (shows first)
└── register/
    └── page.tsx      # Registration page
```

## 🔐 Authentication Flow

### 1. **Initial Access**
- User visits any URL
- If not authenticated → Redirects to `/auth/login`
- If authenticated → Shows requested page with sidebar

### 2. **Login Process**
```
User → /auth/login → Enter credentials → Submit
  ↓
Backend validates
  ↓
Success → Redirect to /users page
  ↓
Failure → Show error message
```

### 3. **After Login**
- User is redirected to `/users` page
- Sidebar becomes visible
- User info shown in sidebar footer
- All protected routes are accessible

### 4. **Routes**

**Public Routes** (No auth required):
- `/auth` → Redirects to `/auth/login`
- `/auth/login` → Login page
- `/auth/register` → Registration page

**Protected Routes** (Auth required):
- `/` → Redirects to `/users` (if authenticated)
- `/users` → Users management page
- `/plans` → Plans management page
- `/subscriptions` → Subscriptions page

## 🎨 Login Page Features

- **Beautiful gradient background** (blue → indigo → purple)
- **Gym Manager logo** with "GM" badge
- **Email & password fields** with validation
- **Show/hide password** toggle
- **Loading states** during login
- **Error messages** from backend
- **Demo credentials** displayed at bottom
- **Link to register page**
- **Redirects to /users** after successful login

## 🔧 Technical Details

### State Management
- Redux Toolkit for auth state
- RTK Query for API calls
- Persistent authentication

### Validation
- Email format validation
- Password minimum 6 characters
- Real-time error clearing

### Security
- Access token in Redux state
- Refresh token in HTTP-only cookie
- Automatic token refresh (future)

## 🚀 Usage

### Starting the App
1. Start backend: (default: http://localhost:3001)
2. Start frontend: `npm run dev`
3. Navigate to: http://localhost:3000

### Login Flow
1. App redirects to `/auth/login`
2. Enter credentials:
   - **Email**: owner@gym.com
   - **Password**: password123
3. Click "Sign In"
4. Redirected to `/users` page
5. Sidebar appears with navigation

### Register Flow
1. Click "Create account" link
2. Fill registration form
3. Submit
4. Redirected to `/users` page

### Logout
1. Click "Logout" in sidebar footer
2. Redirected to `/auth/login`
3. Auth state cleared

## 🎯 Key Features

✅ Login shows **first** by default
✅ Successful login redirects to **/users** page
✅ Clean, modern UI design
✅ Full form validation
✅ Error handling
✅ Loading states
✅ Demo credentials
✅ Mobile responsive
✅ Dark mode support
✅ Type-safe with TypeScript

## 📝 API Integration

### Login Endpoint
```typescript
POST /auth/login
Body: { email, password }
Response: { user, accessToken }
```

### Register Endpoint
```typescript
POST /auth/register
Body: { name, email, password, phone?, age? }
Response: { user, accessToken }
```

## 🔄 Redirect Logic

| Current Location | Authenticated | Redirects To |
|-----------------|---------------|--------------|
| `/` | No | `/auth/login` |
| `/` | Yes | `/users` |
| `/auth` | Any | `/auth/login` |
| `/users` | No | `/auth/login` |
| `/users` | Yes | Shows page |
| `/auth/login` | Yes | Can stay (or redirect to /users) |

## 🎨 UI Components Used

- `Button` - Submit buttons with loading states
- `Input` - Text inputs with validation
- Icons from `lucide-react`:
  - `Eye` / `EyeOff` - Password visibility
  - `Loader2` - Loading spinner
  - `Users`, `CreditCard`, `Calendar` - Sidebar icons
  - `LogOut`, `User` - User menu icons

## 🔐 Security Notes

1. Passwords hidden by default
2. HTTPS recommended for production
3. Refresh tokens in HTTP-only cookies
4. Access tokens short-lived
5. Protected routes check authentication
6. Automatic logout on token expiry
