# Phase 2: Authentication & User Management - Implementation Plan

## Overview

Implementing complete authentication system for meet-io with secure user registration/login, JWT-based auth, and beautiful UI/UX based on the provided design files.

## User Review Required

> [!IMPORTANT]
> This implementation will store JWT tokens as **HTTP-Only cookies** for security. The client won't be able to access tokens via JavaScript, preventing XSS attacks.

> [!WARNING]
> The User model will include an `avatar` field (URL string). We'll support avatar uploads in a future phase, but for now it will accept URLs or use default avatars.

---

## Proposed Changes

### Backend Components

#### Database Configuration

##### [NEW] [db.ts](file:///d:/meet-io/server/src/config/db.ts)

- Mongoose connection setup using `MONGO_URI` from environment
- Connection error handling and retry logic
- Connection success logging

#### Data Models

##### [NEW] [User.ts](file:///d:/meet-io/server/src/models/User.ts)

```typescript
User Schema:
- name: string (required)
- email: string (required, unique, lowercase)
- password: string (required, min 8 chars, hashed)
- avatar: string (optional, URL or default)
- createdAt: Date (auto)
- updatedAt: Date (auto)

Methods:
- comparePassword(candidatePassword): Promise<boolean>

Pre-save hooks:
- Hash password with bcryptjs (salt rounds: 10) before saving
```

#### Authentication Controller

##### [NEW] [authController.ts](file:///d:/meet-io/server/src/controllers/authController.ts)

Handlers:
1. **register**: 
   - Validate input (name, email, password)
   - Check if email already exists
   - Hash password
   - Create user
   - Generate JWT
   - Send HTTP-Only cookie
   - Return user data (without password)

2. **login**:
   - Validate input (email, password)
   - Find user by email
   - Compare password with bcrypt
   - Generate JWT token
   - Send HTTP-Only cookie
   - Return user data

3. **logout**:
   - Clear auth cookie
   - Return success message

4. **getMe** (authenticated route):
   - Return current authenticated user

#### Middleware

##### [NEW] [authMiddleware.ts](file:///d:/meet-io/server/src/middleware/authMiddleware.ts)

- Extract JWT from HTTP-Only cookie
- Verify token using JWT_SECRET
- Attach user to req.user
- Handle invalid/expired tokens

#### Utilities

##### [NEW] [jwtHelper.ts](file:///d:/meet-io/server/src/utils/jwtHelper.ts)

- `generateToken(userId)`: Create JWT with 7-day expiration
- `sendTokenResponse(user, statusCode, res)`: Helper to send cookie + JSON response
- Cookie configuration: httpOnly, secure (production), sameSite, maxAge

#### Routes

##### [NEW] [authRoutes.ts](file:///d:/meet-io/server/src/routes/authRoutes.ts)

```
POST   /api/auth/register  - Register new user
POST   /api/auth/login     - Login user
POST   /api/auth/logout    - Logout user
GET    /api/auth/me        - Get current user (protected)
```

##### [MODIFY] [index.ts](file:///d:/meet-io/server/src/index.ts)

- Import database connection
- Initialize MongoDB connection before starting server
- Mount auth routes at `/api/auth`
- Add error handling for MongoDB connection failures

---

### Frontend Components (Future Phase - For Reference)

Based on your design files, the frontend will include:

- **Landing Page** ([LandingPage.html](file:///d:/meet-io/docs/LandingPage.html)): Hero section, features, CTA
- **Auth System** ([authSystem.jsx](file:///d:/meet-io/docs/authSystem.jsx)): Login/Register with social auth options
- **Dashboard** ([responsiveDashboard.html](file:///d:/meet-io/docs/responsiveDashboard.html)): Meeting controls, schedule, sidebar

**Design Patterns Observed:**
- Dark theme: `bg-[#0B0E14]`, `bg-[#151921]`
- Gradient buttons: Blue (#3B82F6), Orange (#FF4D00to #E63600)
- Modern rounded corners: `rounded-[2rem]`, `rounded-xl`
- Glassmorphism effects with backdrop-blur
- Responsive grid layouts
- Micro-animations and hover effects

---

## Dependencies to Install

```bash
# Production
npm install --save mongoose bcryptjs jsonwebtoken cookie-parser

# Development  
npm install --save-dev @types/bcryptjs @types/cookie-parser @types/jsonwebtoken
```

---

## Verification Plan

### Automated Tests

**Manual API Testing with curl/Postman:**

1. **Test Registration:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```
Expected: 201 status, user object, Set-Cookie header with JWT

2. **Test Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```
Expected: 200 status, user object, Set-Cookie header

3. **Test Get Current User:**
```bash
curl http://localhost:5000/api/auth/me \
  --cookie "token=<JWT_FROM_LOGIN>"
```
Expected: 200 status, user object

4. **Test Logout:**
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  --cookie "token=<JWT_FROM_LOGIN>"
```
Expected: 200 status, cookie cleared

5. **Test Duplicate Email:**
```bash
# Try to register with existing email
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Another User","email":"test@example.com","password":"password456"}'
```
Expected: 400 status, error message "Email already in use"

### MongoDB Verification

```bash
# Connect to MongoDB and verify user was created
# Check that password is hashed (bcrypt hash starts with $2a$ or $2b$)
```

### Manual Verification

1. **User reviews:**
   - Authentication flow works end-to-end
   - JWT tokens are being set as HTTP-Only cookies
   - Passwords are properly hashed in MongoDB
   - Protected routes require authentication

2. **Security checklist:**
   - Passwords are never returned in API responses
   - JWT tokens are in HTTP-Only cookies (inspect browser dev tools)
   - Invalid credentials return proper error messages
   - Email validation prevents duplicate accounts

---

## Implementation Order

1. ✅ Install dependencies (mongoose, bcryptjs, jsonwebtoken, cookie-parser)
2. ✅ Set up Mongoose database connection
3. ✅ Create User model with password hashing
4. ✅ Create JWT helper utilities
5. ✅ Create auth middleware
6. ✅ Create auth controller (register, login, logout, getMe)
7. ✅ Create auth routes
8. ✅ Update server index.ts to connect DB and mount routes
9. ✅ Test all endpoints
10. ✅ Verify in MongoDB

---

## Notes

- Using bcryptjs (pure JS) instead of bcrypt (C++ binding) for better Windows compatibility
- JWT expiration set to 7 days for balance between security and UX
- Cookie settings: `httpOnly: true`, `secure: NODE_ENV === 'production'`, `sameSite: 'strict'`
- User password field will have `select: false` by default to prevent accidental exposure
- Avatar field prepared for future file upload implementation
