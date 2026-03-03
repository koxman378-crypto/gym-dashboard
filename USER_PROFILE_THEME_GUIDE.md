# User Profile & Theme Implementation

## Overview
This document describes the implementation of user profile management with CRUD operations for nickname and avatar, logout functionality, and dark/light theme switching.

## Features Implemented

### 1. User Profile Management
**Location:** `/profile` page

**Features:**
- View current user information (name, email, role)
- Edit nickname (custom display name)
- Upload/change profile avatar image
- Logout functionality with redirect to login

**CRUD Operations:**
- **Read:** Fetches user profile data from `/users/me/profile` endpoint
- **Update:** Updates nickname and avatar via `/users/me/profile` PATCH endpoint
- **Delete:** Avatar can be removed by uploading a new one (managed through S3)

**Image Upload Flow:**
1. User selects an image file
2. Frontend requests a presigned URL from `/upload/profile-image`
3. Image is uploaded directly to S3 using the presigned URL
4. Public URL is stored in the database
5. Profile is updated with the new avatar URL

### 2. Theme System (Dark/Light Mode)
**Provider:** `ThemeProvider` component using `next-themes`

**Features:**
- Light mode
- Dark mode
- System preference (auto-detect)
- Persistent theme selection across sessions

**Toggle Location:** 
- Header (top-right corner) - Sun/Moon icon with dropdown menu

**Usage:**
Themes are applied automatically using Tailwind's `dark:` variant classes throughout the application.

### 3. Updated Sidebar
**User Menu Section:**
- Profile picture/avatar display
- User nickname or name
- Email address
- Dropdown menu with:
  - Profile Settings link
  - Logout button

## Technical Details

### API Endpoints Used

#### Profile Management
- `GET /users/me/profile` - Get current user profile
- `PATCH /users/me/profile` - Update nickname and avatar
- `POST /upload/profile-image` - Generate presigned URL for S3 upload
- `POST /auth/logout` - Logout user

### Redux State Updates
When profile is updated:
1. API call updates backend
2. Redux state is synchronized with new data
3. UI updates automatically across all components

### Theme Implementation
**Files Created:**
- `src/components/theme/ThemeProvider.tsx` - Wraps app with theme context
- `src/components/theme/ThemeToggle.tsx` - Toggle button component

**Configuration:**
```tsx
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
>
```

### Database Schema (Backend)
```typescript
@Schema({ collection: 'users', timestamps: true })
export class User {
  @Prop({ default: null, trim: true })
  nickname: string;

  @Prop({ default: null })
  avatar: string;
  
  // ... other fields
}
```

### Frontend Types
```typescript
export type AuthUser = {
  id: string;
  email: string;
  name: string;
  nickname?: string;
  role: Role;
  avatar?: string;
  // ... other fields
};
```

## File Structure

### New Files Created
```
src/
├── app/
│   └── profile/
│       └── page.tsx                   # User profile page
├── components/
│   └── theme/
│       ├── ThemeProvider.tsx          # Theme context provider
│       └── ThemeToggle.tsx            # Theme toggle component
```

### Modified Files
```
src/
├── app/
│   └── layout.tsx                     # Added ThemeProvider wrapper
├── components/
│   └── layout/
│       └── AppLayout.tsx              # Added theme toggle & user dropdown
├── store/
│   ├── slices/
│   │   └── authSlice.ts              # Added nickname field
│   └── services/
│       ├── authApi.ts                # Updated to include nickname
│       └── usersApi.ts               # Added profile update APIs
└── types/
    └── type.ts                       # Added nickname to User interface
```

## Usage Guide

### For Users

#### Update Profile Picture
1. Navigate to Profile Settings (click user avatar in sidebar)
2. Click the camera icon on the profile picture
3. Select an image (JPG, PNG, or GIF, max 5MB)
4. Image uploads automatically
5. Click "Save Changes" to update your profile

#### Update Nickname
1. Navigate to Profile Settings
2. Type your preferred nickname in the input field
3. Click "Save Changes"

#### Change Theme
1. Click the Sun/Moon icon in the top-right header
2. Select:
   - **Light** - Force light mode
   - **Dark** - Force dark mode
   - **System** - Follow OS preference

#### Logout
Two ways to logout:
1. Click user avatar in sidebar → Click "Logout"
2. Go to Profile Settings page → Click "Logout" button

### For Developers

#### Access Current User Data
```tsx
import { useAppSelector } from "@/src/store/hooks";

function MyComponent() {
  const { user } = useAppSelector((state) => state.auth);
  
  return (
    <div>
      <p>{user?.nickname || user?.name}</p>
      {user?.avatar && <img src={user.avatar} alt="Avatar" />}
    </div>
  );
}
```

#### Use Theme in Components
```tsx
import { useTheme } from "next-themes";

function MyComponent() {
  const { theme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme("dark")}>
      Dark Mode
    </button>
  );
}
```

#### Apply Dark Mode Styles
```tsx
// Tailwind classes with dark: variant
<div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
  Content
</div>
```

## Security Considerations

1. **Image Upload:**
   - File type validation (images only)
   - File size limit (5MB max)
   - Direct upload to S3 using presigned URLs
   - No sensitive data exposed in URLs

2. **Profile Updates:**
   - Authenticated endpoint (JWT required)
   - Users can only update their own profile
   - Name, email, and role are read-only

3. **Logout:**
   - Clears access token from Redux state
   - Invalidates refresh token on backend
   - Redirects to login page

## API Error Handling

All API calls include error handling:
- Network errors display user-friendly messages
- Validation errors show specific field issues
- Automatic retry for failed uploads
- Graceful fallbacks for missing data

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Theme preference persists using localStorage
- Responsive design for mobile/tablet/desktop

## Future Enhancements

Potential improvements:
- Crop/resize image before upload
- Multiple profile pictures
- Password change functionality
- Two-factor authentication
- Profile completion percentage
- Social media links

## Testing Recommendations

1. Test image upload with various file types and sizes
2. Verify theme persistence across page reloads
3. Test logout flow and redirect behavior
4. Check responsive design on mobile devices
5. Validate form inputs and error messages
6. Test concurrent profile updates
7. Verify S3 URL expiration handling
