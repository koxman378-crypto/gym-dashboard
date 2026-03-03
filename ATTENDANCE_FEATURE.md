# Attendance System for Customer Users

This feature allows customer users to track their gym attendance with check-in/check-out functionality.

## Features

### 1. **Check-In/Check-Out**
- Simple button interface to start and stop attendance tracking
- Real-time duration counter when checked in
- Configurable auto-close duration (1, 2, 3, or 4 hours)
- Visual status indicators (Active/Inactive)

### 2. **Monthly Statistics**
- Total days attended in selected month
- Total hours spent at gym
- Average hours per day
- Month/year selector for viewing historical data

### 3. **Attendance History Table**
- Complete history of all attendance records
- Columns include:
  - Date (with weekday)
  - Check-in time
  - Check-out time
  - Duration (hours and minutes)
  - Status (Active, Completed, Auto-Closed)
  - Auto-close setting
- Pagination support (30 records per page)

## User Experience

### For Customers
1. Upon login, customers are automatically redirected to `/attendance`
2. The sidebar shows only the "Attendance" menu item
3. Can view their own attendance data only

### Navigation
- Main route: `/attendance`
- Accessible from sidebar navigation (Clock icon)
- Only visible to users with CUSTOMER role

## API Integration

Uses the following endpoints from the backend:
- `POST /attendance/check-in` - Start attendance session
- `POST /attendance/check-out` - End attendance session
- `GET /attendance/active` - Get current active session
- `GET /attendance/history` - Get paginated history
- `GET /attendance/stats/monthly` - Get monthly statistics

## Components

### Main Page: `/src/app/attendance/page.tsx`
- Check-in/Check-out card with status
- Monthly statistics dashboard
- Attendance history table

### Columns: `/src/app/attendance/columns.tsx`
- Table column definitions for attendance history
- Custom formatters for dates, times, and durations
- Status badges with color coding

## Role-Based Access

The attendance feature is restricted to CUSTOMER role only. This is enforced at:
1. **Navigation Level**: Sidebar menu filters items by role
2. **Routing Level**: Home page redirects customers to attendance page
3. **Backend Level**: API endpoints use JWT authentication to ensure users can only access their own data

## Auto-Close Feature

- Prevents forgotten check-outs
- Configurable duration: 60, 120, 180, or 240 minutes
- Sessions automatically close after the specified duration
- Status shows as "Auto-Closed" in history

## Real-Time Updates

- Active attendance polls every 30 seconds
- Duration counter updates every second
- Automatic cache invalidation on check-in/check-out

## UI Design

- Modern gradient design matching the gym client theme
- Responsive layout for mobile and desktop
- Color-coded status indicators:
  - Green: Active session
  - Blue: Completed session
  - Orange: Auto-closed session
- Real-time clock display
- Smooth animations and transitions
