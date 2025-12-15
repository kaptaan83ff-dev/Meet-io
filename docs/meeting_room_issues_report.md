# Meeting Room Issues & Bugs Report

**Date:** 2025-12-15  
**Reporter:** Development Team  
**Priority:** HIGH

---

## Current UI Preview

![Current Meeting Room UI](file:///C:/Users/rawat/.gemini/antigravity/brain/7dbc7067-b386-4da6-b6c7-c2291944722e/uploaded_image_1765738664453.png)

---

## 🔴 Critical Issues

### 1. No Device Selection (Camera & Microphone)

**Status:** Missing Feature  
**Impact:** HIGH - Users cannot choose which camera/microphone to use

#### Problem
- The new UI removed the pre-join screen where users could test and select devices
- Users with multiple cameras/microphones have no way to switch between them
- No preview before joining the meeting

#### Previous Implementation
The old system had a `MediaSettings` component with a pre-join screen that allowed:
- Camera selection dropdown
- Microphone selection dropdown
- Device preview
- Permissions testing

#### Solution Required
**Option 1: Add Pre-Join Screen** (Recommended)
```tsx
// Create PreJoinScreen.tsx component
- Device selection dropdowns
- Video/audio preview
- Test devices before joining
- Permission requests with clear UI
```

**Option 2: Add Settings Panel**
```tsx
// Add settings button in ControlBar
- Dropdown menu for device selection
- Live switching during meeting
- Settings modal/panel
```

#### Files to Modify
- [ ] Create `client/src/components/meeting/PreJoinScreen.tsx`
- [ ] Update `client/src/pages/MeetingRoomPage.tsx` to show pre-join before LiveKitRoom
- [ ] Add device enumeration hooks from LiveKit
- [ ] Add localStorage to remember device preferences

---

### 2. Screen Share Not Working

**Status:** Implementation Bug  
**Impact:** HIGH - Core meeting feature not functioning

#### Problem
Looking at the current implementation in `MeetingRoomPage.tsx`:

```tsx
const toggleScreenShare = async () => {
    try {
        await localParticipant?.setScreenShareEnabled(!isScreenSharing);
        setIsScreenSharing(!isScreenSharing);
    } catch (e) {
        toast.error('Failed to share screen');
    }
};
```

**Issues Identified:**
1. State update happens before async operation completes
2. No error logging to see what's failing
3. Missing screen share display in VideoGrid
4. No visual feedback when screen share is active

#### Root Causes
1. **Permission Issues**: Browser may be blocking screen share permission
2. **State Race Condition**: `setIsScreenSharing` called before operation completes
3. **Missing Screen Share Track Handling**: VideoGrid doesn't display screen share tracks
4. **Browser API Requirements**: Screen share requires HTTPS or localhost

#### Solution

**Fix 1: Correct async state management**
```tsx
const toggleScreenShare = async () => {
    try {
        const newState = !isScreenSharing;
        await localParticipant?.setScreenShareEnabled(newState);
        // Only update state AFTER success
        setIsScreenSharing(newState);
        toast.success(newState ? 'Screen sharing started' : 'Screen sharing stopped');
    } catch (e: any) {
        console.error('Screen share error:', e);
        toast.error(e.message || 'Failed to share screen');
    }
};
```

**Fix 2: Add screen share track to VideoGrid**
```tsx
// VideoGrid should show screen shares in a separate section
// Or show screen share as the main video with participant videos in sidebar
```

**Fix 3: Sync state with LiveKit**
```tsx
// Listen to LiveKit events for screen share changes
useEffect(() => {
    if (localParticipant) {
        setIsScreenSharing(localParticipant.isScreenShareEnabled);
    }
}, [localParticipant?.isScreenShareEnabled]);
```

#### Files to Modify
- [ ] Fix `client/src/pages/MeetingRoomPage.tsx` - toggleScreenShare function
- [ ] Update `client/src/components/meeting/VideoGrid.tsx` - handle screen share tracks
- [ ] Add screen share layout (presenter view)

---

### 3. Cannot Copy Meeting Code

**Status:** Missing Feature  
**Impact:** MEDIUM - Poor UX, users can't easily share meeting link

#### Problem
The meeting code is displayed as plain text in the ControlBar:
```tsx
<div className="flex items-center gap-2 text-sm text-gray-400">
    <span className="font-mono font-medium text-white">{meetingCode}</span>
    <span>•</span>
    <span>{participantCount} participant{participantCount !== 1 ? 's' : ''}</span>
</div>
```

**Issues:**
- No copy button
- No click-to-copy functionality
- No visual feedback when code would be copied
- Code is small and hard to read

#### Solution

**Add Copy Button with Click Handler**
```tsx
<div className="flex items-center gap-2 p-3 bg-[#1a1f2e]/90 backdrop-blur-md rounded-xl border border-white/10">
    <div className="flex flex-col">
        <span className="text-xs text-gray-400 uppercase tracking-wider">Meeting</span>
        <div className="flex items-center gap-2">
            <code className="text-white font-mono font-bold text-base">{meetingCode}</code>
            <button
                onClick={() => {
                    navigator.clipboard.writeText(meetingCode);
                    toast.success('Meeting code copied!');
                }}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                title="Copy meeting code"
            >
                <Copy size={16} className="text-gray-400 hover:text-white" />
            </button>
        </div>
    </div>
</div>
```

#### Files to Modify
- [ ] Update `client/src/components/meeting/ControlBar.tsx` - add copy button
- [ ] Import `Copy` icon from lucide-react

---

## 🟡 UI/UX Improvements Needed

### 4. Video Grid Layout Issues

**Current Issues:**
- Single participant takes full screen (too large)
- No maximum size constraint
- Participant name overlay is too small
- Poor aspect ratio handling

**Recommended Fixes:**
```tsx
// VideoGrid: Add max width for single participant
const getTileClass = () => {
    if (count === 1) return 'aspect-video max-w-3xl mx-auto h-auto max-h-[70vh]';
    if (count === 2) return 'aspect-video';
    return 'aspect-video';
};
```

### 5. Control Bar Spacing

**Issue:** Icons are too close together, harder to click on touch devices

**Fix:**
```tsx
// Increase gap between buttons
<div className="flex items-center justify-center gap-3"> {/* Changed from gap-2 */}
```

### 6. Meeting Code Visibility

**Issue:** Meeting code at bottom is easy to miss

**Recommendation:** Move meeting code to top-left corner (like in the old UI)

```tsx
// Add fixed position overlay at top-left
<div className="absolute top-4 left-4 z-40 bg-[#1a1f2e]/90 backdrop-blur-md rounded-xl border border-white/10 p-3">
    {/* Meeting code here */}
</div>
```

### 7. Missing Visual Feedback

**Issues:**
- No indication when screen share is active
- Hand raise button needs more visual prominence
- Reaction picker needs better positioning

---

## 📋 Implementation Checklist

### Phase 1: Critical Fixes (Priority: HIGH)
- [ ] **Device Selection**
  - [ ] Create PreJoinScreen component
  - [ ] Add device enumeration
  - [ ] Add video/audio preview
  - [ ] Integrate into MeetingRoomPage
  
- [ ] **Screen Share Fix**
  - [ ] Fix async state management
  - [ ] Add error logging
  - [ ] Update VideoGrid to show screen shares
  - [ ] Test on Chrome, Firefox, Edge
  
- [ ] **Copy Meeting Code**
  - [ ] Add copy button to ControlBar
  - [ ] Add toast confirmation
  - [ ] Test clipboard API

### Phase 2: UI/UX Polish (Priority: MEDIUM)
- [ ] Improve video grid layout
- [ ] Increase control bar spacing
- [ ] Move meeting code to top-left
- [ ] Add better visual states for active features
- [ ] Improve mobile responsiveness

### Phase 3: Additional Features (Priority: LOW)
- [ ] Settings panel for mid-meeting device switching
- [ ] Background blur/virtual backgrounds
- [ ] Picture-in-picture mode
- [ ] Meeting recording UI

---

## 🔧 Quick Fixes (Can implement immediately)

### 1. Fix Screen Share State Management
**File:** `client/src/pages/MeetingRoomPage.tsx`
**Lines:** 176-183

```diff
const toggleScreenShare = async () => {
    try {
-       await localParticipant?.setScreenShareEnabled(!isScreenSharing);
-       setIsScreenSharing(!isScreenSharing);
+       const newState = !isScreenSharing;
+       await localParticipant?.setScreenShareEnabled(newState);
+       setIsScreenSharing(newState);
+       toast.success(newState ? 'Sharing screen' : 'Stopped sharing');
    } catch (e) {
+       console.error('Screen share failed:', e);
        toast.error('Failed to share screen');
    }
};
```

### 2. Add Meeting Code Copy Button
**File:** `client/src/components/meeting/ControlBar.tsx`
**Lines:** ~87-92

```diff
+ import { Copy } from 'lucide-react';

// In the meeting info section:
<div className="flex items-center gap-2">
    <span className="font-mono font-medium text-white">{meetingCode}</span>
+   <button
+       onClick={() => {
+           navigator.clipboard.writeText(meetingCode);
+           toast.success('Code copied!');
+       }}
+       className="p-1 hover:bg-white/10 rounded"
+   >
+       <Copy size={14} />
+   </button>
</div>
```

### 3. Constrain Single Participant Size
**File:** `client/src/components/meeting/VideoGrid.tsx`
**Lines:** 36-40

```diff
const getTileClass = () => {
-   if (count === 1) return 'aspect-video max-w-4xl mx-auto';
+   if (count === 1) return 'aspect-video max-w-3xl max-h-[70vh] mx-auto';
    if (count === 2) return 'aspect-video';
    return 'aspect-video';
};
```

---

## 🧪 Testing Checklist

After implementing fixes, test:

- [ ] **Device Selection**
  - [ ] Multiple cameras can be listed and selected
  - [ ] Multiple microphones can be listed and selected
  - [ ] Preview works before joining
  - [ ] Selected devices persist across page refresh

- [ ] **Screen Share**
  - [ ] Screen share starts successfully
  - [ ] Screen share displays in meeting
  - [ ] Other participants can see screen share
  - [ ] Screen share stops successfully
  - [ ] Error handling works (user cancels permission)

- [ ] **Copy Meeting Code**
  - [ ] Click copy button copies code
  - [ ] Toast confirmation appears
  - [ ] Code copied to clipboard is correct
  - [ ] Works on different browsers

- [ ] **UI/UX**
  - [ ] Video grid looks good with 1, 2, 4, 9 participants
  - [ ] Control bar buttons are easy to click
  - [ ] Meeting code is visible and accessible
  - [ ] All icons have proper hover states

---

## 📊 Estimated Effort

| Task | Effort | Priority |
|------|--------|----------|
| Add PreJoinScreen | 4 hours | HIGH |
| Fix Screen Share | 2 hours | HIGH |
| Add Copy Button | 30 mins | HIGH |
| UI/UX Polish | 2 hours | MEDIUM |
| Testing | 2 hours | HIGH |
| **Total** | **~10.5 hours** | - |

---

## 🚀 Next Steps

1. **Immediate Actions** (Can do in next 1-2 hours):
   - Fix screen share async/await
   - Add meeting code copy button
   - Constrain video grid size

2. **Short Term** (Next session):
   - Create PreJoinScreen component
   - Add device enumeration
   - Test screen share thoroughly

3. **Polish** (After core functionality works):
   - Refine UI/UX
   - Add settings panel
   - Mobile optimization
