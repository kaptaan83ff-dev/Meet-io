# User Profile System Documentation

## Overview
Complete user profile management system with avatar upload, personal information editing, password changes, and session management.

---

## Features

### 1. Profile Information
- **Name** - User's full name
- **Email** - Read-only email address
- **Job Title** - Optional professional title
- **Bio** - Personal description
- **Avatar** - Profile picture with crop functionality
- **Role Badge** - "USER" or "ADMIN" display

### 2. Avatar Management
**Upload Process:**
1. Click avatar → Select image
2. Image opens in cropper modal
3. Adjust zoom and position
4. Save → Uploads to server
5. Page refreshes with new avatar

**Technical:**
- Uses `react-easy-crop` for cropping
- Circular crop enforced
- Renders via React Portal
- Default avatar from DiceBear API

### 3. Security Features
**Password Change:**
- Requires current password
- New password confirmation
- Server validates before update

**Session Management:**
- View all active sessions
- See current device badge
- Logout from current device
- Logout from all devices  
- Revoke specific sessions

**Account Deletion:**
- Type "DELETE" to confirm
- Double confirmation dialog
- Irreversible action

---

## File Structure

```
client/src/
├── pages/
│   └── ProfilePage.tsx          # Main profile page
├── components/
│   └── profile/
│       └── ImageCropper.tsx     # Avatar cropper modal
├── context/
│   └── AuthContext.tsx          # User state management
└── services/
    └── api.ts                   # userAPI methods

server/src/
├── controllers/
│   └── userController.ts        # Profile endpoints
└── routes/
    └── userRoutes.ts           # API routes
```

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| PUT | `/api/users/profile` | Update name, title, bio |
| POST | `/api/users/avatar` | Upload avatar image |
| PUT | `/api/users/password` | Change password |
| GET | `/api/users/sessions` | Get active sessions |
| POST | `/api/users/logout-all` | Logout all devices |
| DELETE | `/api/users/sessions/:id` | Revoke session |
| DELETE | `/api/users/account` | Delete account |

---

## User Interface

### Layout
```
ProfilePage
├── Sidebar (navigation)
└── Main Content
    ├── Header
    └── 3-Column Grid
        ├── Left: Avatar Card
        │   ├── Avatar (clickable)
        │   ├── Name
        │   ├── Email
        │   └── Role Badge
        └── Right: Tabs
            ├── Overview Tab
            │   └── Edit Form
            └── Security Tab
                ├── Password Change
                ├── Sessions List
                └── Danger Zone
```

### Tabs
**Overview:**
- Edit name, title, bio
- Save button with loading state

**Security:**
- Password change form
- Active sessions with device info
- Account deletion

---

## User Type Definition

```typescript
interface User {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    role?: string;      // 'user' | 'admin'
    title?: string;
    bio?: string;
}
```

---

## Key Features Explained

### Portal Implementation
ImageCropper modal uses React Portal:
```tsx
{showCropper && avatarSrc && createPortal(
    <ImageCropper .../>,
    document.body
)}
```

**Benefits:**
- Renders outside parent hierarchy
- No z-index conflicts
- Proper modal stacking

### FileReader Safety
```tsx
reader.onload = (event) => {
    if (event.target?.result) {
        setAvatarSrc(event.target.result.toString());
    }
};
reader.onerror = () => {
    toast.error('Failed to read image');
};
```

**Why:**
- Prevents "resourced closed" errors
- Proper error handling
- Null checking

---

## Common Issues & Fixes

### Issue 1: Profile Page Black Screen
**Cause:** User interface missing fields
**Fix:** Add all fields to User interface in AuthContext

### Issue 2: Avatar Upload Fails
**Cause:** FileReader errors or server issues
**Fix:** Check error handler, verify API endpoint

### Issue 3: Session List Empty
**Cause:** API not returning sessions
**Fix:** Check backend session tracking

---

## Testing Checklist

- [ ] View profile page loads
- [ ] Avatar upload works
- [ ] Crop and save avatar
- [ ] Edit name, title, bio
- [ ] Change password
- [ ] View active sessions
- [ ] Logout from device
- [ ] Logout all devices
- [ ] Account deletion flow

---

## Routes

**Access:** `/profile`
**Auth Required:** ✅ Yes
**Sidebar Link:** ✅ Visible when logged in

---

## Styling

**Theme:**
- Background: `#0B0E14`
- Cards: `#1a1f2e/50` with backdrop blur
- Primary: Blue (`#3b82f6`)
- Danger: Red (`#ef4444`)

**Responsive:**
- Mobile: Single column
- Tablet: 2 columns
- Desktop: 3 columns (lg breakpoint)

---

## Future Enhancements

- [ ] Email change with verification
- [ ] Two-factor authentication
- [ ] Activity log
- [ ] Enhanced session details (location, IP)
- [ ] Password strength indicator
- [ ] Social media links
