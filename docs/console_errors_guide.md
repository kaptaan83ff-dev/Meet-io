# Console Errors - Diagnosis and Fixes

## Error Analysis from Screenshot

### 1. ❌ `GET http://localhost:5000/api/meetings/404` (UnhandledError)

**What it means:**
- Your app is trying to fetch data from `/api/meetings/404`
- This URL is malformed - it's treating "404" as a meeting ID
- The API is returning a 404 "Not Found" error

**Where it's happening:**
- `AuthContext.tsx:19` and `AuthContext.tsx:17`
- This suggests the error is occurring during authentication check

**Why it's happening:**
- The app might be trying to redirect to a meeting with code "404"
- OR there's a bad URL parameter being passed
- OR the authentication flow is trying to fetch a non-existent resource

**How to fix it:**

#### Step 1: Check your browser URL
If you're at a URL like `http://localhost:5173/meeting/404`, that's the problem. The app thinks "404" is a valid meeting code.

**Solution:** Navigate to the dashboard instead:
```
http://localhost:5173/dashboard
```

#### Step 2: Check AuthContext for bad API calls

The error is in `AuthContext.tsx` lines 17 and 19. Let me check what's there:

**File to check:** `client/src/context/AuthContext.tsx`

Look for any API calls that might be using a hardcoded or incorrect ID. The error suggests something like:
```tsx
// BAD - Don't do this
fetch(`/api/meetings/${someUndefinedVariable}`)

// GOOD - Check for undefined first
if (meetingId) {
  fetch(`/api/meetings/${meetingId}`)
}
```

---

### 2. ⚠️ UnhandledError @ Main.tsx:4

**What it means:**
- An error occurred in your main app entry point
- The error wasn't caught by any error boundary

**Why it's happening:**
- The 404 error from above is bubbling up
- React is catching it but there's no error boundary to handle it gracefully

**How to fix it:**

#### Option 1: Add Error Boundary (Recommended)

Create a new file `client/src/components/ErrorBoundary.tsx`:

```tsx
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-4">Oops! Something went wrong</h1>
            <p className="text-gray-400 mb-4">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

Then wrap your app in `Main.tsx`:

```tsx
import { ErrorBoundary } from './components/ErrorBoundary';

// Inside your main render:
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

#### Option 2: Add Try-Catch in API Calls

In your API service files, wrap fetch calls:

```tsx
// client/src/services/api.ts
export const meetingAPI = {
  async join(data: { code: string }) {
    try {
      const response = await fetch(`${API_URL}/meetings/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to join meeting: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Join meeting error:', error);
      throw error; // Re-throw so caller can handle it
    }
  }
};
```

---

## Quick Fix Checklist

### ☑️ Immediate Actions

1. **Clear your browser cache and reload**
   ```
   Ctrl + Shift + R (Windows)
   Cmd + Shift + R (Mac)
   ```

2. **Check your current URL**
   - If it contains `/meeting/404` or any weird path, go back to `/dashboard`

3. **Check the dev server**
   - Make sure both client and server are running
   - Look for any server errors in the terminal

4. **Restart the dev server**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

### ☑️ Code Fixes to Apply

#### Fix 1: Add validation in MeetingRoomPage

**File:** `client/src/pages/MeetingRoomPage.tsx`

```tsx
// At the top of the component
export default function MeetingRoomPage() {
    const { code } = useParams<{ code: string }>();
    const navigate = useNavigate();
    
    // ADD THIS: Validate meeting code
    useEffect(() => {
        if (!code || code === '404' || code.length < 3) {
            toast.error('Invalid meeting code');
            navigate('/dashboard');
        }
    }, [code, navigate]);
    
    // ... rest of component
}
```

#### Fix 2: Better error handling in joinMeeting

**File:** `client/src/pages/MeetingRoomPage.tsx`

Look for the `joinMeeting` function and update it:

```tsx
const joinMeeting = useCallback(async () => {
    if (!code) {
        console.error('No meeting code provided');
        navigate('/dashboard');
        return;
    }
    
    try {
        setLoading(true);
        const response = await meetingAPI.join({ code });
        // ... handle response
    } catch (error: any) {
        console.error('Failed to join meeting:', error);
        toast.error(error.response?.data?.error || 'Failed to join meeting');
        
        // If it's a 404, redirect to dashboard
        if (error.response?.status === 404) {
            navigate('/dashboard');
        }
        
        setLoading(false);
    }
}, [code, navigate]);
```

---

## Prevention Tips

### 1. Always validate route parameters
```tsx
// Before using params
if (!code || code.trim() === '') {
  navigate('/dashboard');
  return;
}
```

### 2. Add loading states
```tsx
if (loading) return <Loader />;
if (error) return <ErrorScreen error={error} />;
```

### 3. Use optional chaining
```tsx
// Instead of:
user.name

// Use:
user?.name || 'Guest'
```

### 4. Handle 404s gracefully
```tsx
// In your API calls
if (response.status === 404) {
  toast.error('Meeting not found');
  navigate('/dashboard');
  return;
}
```

---

## Testing Your Fixes

1. **Test invalid URLs:**
   - Go to `http://localhost:5173/meeting/invalid-code`
   - Should redirect to dashboard with error message

2. **Test valid meeting:**
   - Create a new meeting from dashboard
   - Should load without errors

3. **Test 404 handling:**
   - Try joining a meeting that doesn't exist
   - Should show error and redirect

---

## Summary

The main issue is your app is trying to access `/api/meetings/404` which suggests:
1. Either you navigated to a URL with "404" as the meeting code
2. Or there's a bug where undefined/null values are being used as IDs

**Quick fix:** 
- Navigate to `/dashboard` 
- Clear browser cache
- Restart dev server

**Permanent fix:**
- Add meeting code validation
- Add error boundaries
- Better error handling in API calls
