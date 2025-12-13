# 🧪 Testing Guide - Meet.io Authentication

## The Issue You're Seeing

❌ **"Invalid credentials"** errors in console
- You're trying to **login** but the account doesn't exist yet
- Need to **register** first!

---

## ✅ Step-by-Step Testing Instructions

### STEP 1: Register a New Account

1. **On the login page**, click **"Sign up for free"** at the bottom
2. The form should switch to registration mode (showing Name field)
3. **Fill in:**
   - Name: `Demo User`
   - Email: `demo@meetio.com`
   - Password: `password123`
4. **Click "Create Account"**

**Expected Result:**
- ✅ Green toast: "Welcome, Demo User!"
- ✅ Redirect to `/dashboard`
- ✅ Console shows: POST /api/auth/register → 201 Created

---

### STEP 2: Test Logout (Optional)

1. Open browser console
2. Type: `window.location.href = '/login'`
3. This simulates logout and takes you back to login

---

### STEP 3: Test Login

1. Make sure you're on `/login` page
2. Form should say **"Welcome back"** (Sign In mode)
3. **Enter same credentials:**
   - Email: `demo@meetio.com`
   - Password: `password123`
4. **Click "Sign In"**

**Expected Result:**
- ✅ Green toast: "Welcome back, Demo User!"
- ✅ Redirect to `/dashboard`
- ✅ Console shows: POST /api/auth/login → 200 OK

---

## 🔍 Debugging Checklist

If there are still issues, check:

**Backend Server (Port 5000):**
```bash
# Should be running
curl http://localhost:5000/health
```

**Frontend Client (Port 5173):**
- Running on http://localhost:5173

**Browser Console:**
- Network tab → Look for POST requests
- Should see cookies being set
- Check for CORS errors

**MongoDB:**
- Connected to Atlas
- User should be saved after registration

---

## 📸 What You Should See

### Registration Success:
- Green toast notification top-right
- Immediate redirect to dashboard
- Dashboard shows welcome message

### Login Success:
- Green toast: "Welcome back..."
- Redirect to dashboard
- User persists across page refreshes

---

## ❌ Common Errors & Fixes

**"Invalid credentials"**
→ Wrong email/password OR user doesn't exist (register first!)

**"Email already in use"**
→ User exists, use login instead of register

**Network Error**
→ Backend server not running (check port 5000)

**CORS Error**
→ Check if withCredentials is set (already configured)
