# RORK AI APP - COMPLETE IMPLEMENTATION SUMMARY

## Overview
This document provides a complete implementation guide for transforming the PlayTube/NewTube app into a fully functional YouTube-style platform with authentication, admin panel, search, and all requested features.

## ✅ COMPLETED SO FAR

### 1. Type System Updates
- ✅ Added `UserRole` type ('user' | 'admin' | 'superadmin')
- ✅ Updated `User` interface with `role` and `password` fields
- ✅ Updated mock data with Super Admin account (565413anil@gmail.com / admin123)
- ✅ Updated default user with role field

### 2. Authentication System
- ✅ Created `AuthContext` with login, register, logout functions
- ✅ Integrated `AuthProvider` in root layout
- ✅ Added role-checking functions (isSuperAdmin, isAdmin)
- ✅ Login screen created at `app/login.tsx`

### 3. Routing Structure
- ✅ Added auth routes (login, register)
- ✅ Added search route
- ✅ Added admin panel route
- ✅ Added shorts-feed route

---

## 🚧 CRITICAL FILES TO CREATE

### Authentication & Registration

#### `app/register.tsx`
```typescript
// Copy structure from app/login.tsx
// Add fields: email, password, confirm password, username, displayName
// Call useAuth().register() function
// Validate all fields before submission
```

---

### Search Functionality

#### `app/search.tsx`
```typescript
import { useState, useCallback, useEffect } from 'react';
import { FlatList, RefreshControl, TextInput, TouchableOpacity } from 'react-native';
import { useAppState } from '@/contexts/AppStateContext';
import { useRouter } from 'expo-router';
import { Search, X } from 'lucide-react-native';

// Features:
// - Real-time search as user types (with 300ms debounce)
// - Filter tabs: All, Videos, Shorts, Channels
// - Show video cards with thumbnails
// - Navigate to video/short/channel on tap
// - Clear search button
```

---

### Shorts Feed

#### `app/shorts-feed.tsx`
```typescript
import { FlatList, Dimensions, View } from 'react-native';
import { Video } from 'expo-av';
import { useAppState } from '@/contexts/AppStateContext';

const { height } = Dimensions.get('window');

// Features:
// - Vertical scrolling full-screen shorts
// - Each short takes full viewport height
// - Auto-play when in view
// - Like/Comment/Share buttons on right side
// - Channel profile on left side of username
// - Swipe up/down to next/previous short
```

---

### Admin Panel

#### `app/admin.tsx`
```typescript
import { useAuth } from '@/contexts/AuthContext';
import { useAppState } from '@/contexts/AppStateContext';
import { useState } from 'react';
import { Tab View or ScrollView with sections }

// Only accessible if isSuperAdmin() returns true
// Sections:
// 1. Manage Videos (edit, delete, change visibility)
// 2. Manage Channels (view all, edit, delete)
// 3. Manage Users (list, edit role, delete)
// 4. Monetization Settings (enable/disable per channel)
// 5. Reports Management (view, resolve)
```

---

## 🔄 CRITICAL FILES TO UPDATE

### Profile Screen Updates

#### `app/(tabs)/profile.tsx`
Add at top of profileSection:
```typescript
{currentUser.role === 'superadmin' && (
  <View style={styles.superAdminBadge}>
    <Shield color="#FFD700" size={20} />
    <Text style={styles.superAdminText}>SUPER ADMIN</Text>
  </View>
)}

// Add in menu items:
{(currentUser.role === 'superadmin' || currentUser.email === '565413anil@gmail.com') && (
  <TouchableOpacity 
    style={styles.menuItem}
    onPress={() => router.push('/admin')}
  >
    <Shield color={theme.colors.primary} size={24} />
    <Text style={styles.menuItemLabel}>Admin Panel</Text>
  </TouchableOpacity>
)}
```

---

### Tab Bar Updates

#### `app/(tabs)/_layout.tsx`
```typescript
// Replace center PlusCircle icon with:
<Tabs.Screen
  name="upload"
  options={{
    title: "",
    tabBarIcon: ({ color, size }) => (
      <View style={{ 
        width: size + 12, 
        height: size + 12, 
        borderRadius: (size + 12) / 2,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center' 
      }}>
        <Film color="#FFFFFF" size={size} />
      </View>
    ),
    tabBarLabel: () => null,
  }}
  listeners={{
    tabPress: (e) => {
      e.preventDefault();
      router.push('/shorts-feed');
    },
  }}
/>

// Profile tab - show actual avatar:
<Tabs.Screen
  name="profile"
  options={{
    title: "Profile",
    tabBarIcon: ({ focused, size }) => {
      const { currentUser } = useAppState();
      return (
        <Image 
          source={{ uri: currentUser.avatar }} 
          style={{ 
            width: size, 
            height: size, 
            borderRadius: size / 2,
            borderWidth: focused ? 2 : 0,
            borderColor: theme.colors.primary 
          }} 
        />
      );
    },
  }}
/>
```

---

### Swipe to Refresh on Feeds

#### `app/(tabs)/index.tsx`, `explore.tsx`, `subscriptions.tsx`
```typescript
import { RefreshControl } from 'react-native';
import { useState } from 'react';

const [refreshing, setRefreshing] = useState(false);

const onRefresh = async () => {
  setRefreshing(true);
  // Simulate fetching new content
  await new Promise(resolve => setTimeout(resolve, 1500));
  setRefreshing(false);
};

// In FlatList:
<FlatList
  data={videos}
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={theme.colors.primary}
      colors={[theme.colors.primary]}
    />
  }
  // ... other props
/>
```

---

### Like Button with Debounce

Create utility hook:
#### `hooks/useDebounce.ts`
```typescript
import { useCallback, useRef } from 'react';

export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
}
```

Usage in video player:
```typescript
import { useDebounce } from '@/hooks/useDebounce';

const handleLike = useDebounce(async () => {
  await toggleVideoReaction(videoId, 'like');
}, 300);
```

---

### Video Player Aspect Ratio

#### `app/video/[id].tsx` and `app/shorts/[id].tsx`
```typescript
import { Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

// For regular videos (16:9):
const videoHeight = (width / 16) * 9;

<Video
  ref={videoRef}
  source={{ uri: video.videoUrl }}
  style={{ 
    width: '100%', 
    height: video.isShort ? height : videoHeight,
    backgroundColor: '#000'
  }}
  resizeMode={video.isShort ? 'contain' : 'contain'} // prevent distortion
  // ...
/>

// For shorts (9:16):
<Video
  style={{ width: '100%', height: height, backgroundColor: '#000' }}
  resizeMode="contain"
  // ...
/>
```

---

### Mini Player Continuous Playback

#### `contexts/PlayerContext.tsx`
Update minimizePlayer:
```typescript
const minimizePlayer = useCallback(async () => {
  // Don't pause - keep playing
  setIsMinimized(true);
  setShowMiniPlayer(true);
  // Remove any pause() calls
}, []);
```

#### `components/MiniPlayer.tsx`
Ensure video continues playing:
```typescript
// Don't call videoRef.pauseAsync() when minimizing
// Keep the same videoRef instance
```

---

### Profile Picture Upload

#### `app/edit-profile.tsx`
```typescript
import * as ImagePicker from 'expo-image-picker';

const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (!result.canceled && result.assets[0]) {
    // Update user avatar
    await saveCurrentUser({
      ...currentUser,
      avatar: result.assets[0].uri
    });
  }
};

// In change avatar button:
<TouchableOpacity style={styles.changeAvatarBtn} onPress={pickImage}>
  <Camera color={theme.colors.primary} size={24} />
  <Text style={styles.changeAvatarText}>Change Photo</Text>
</TouchableOpacity>
```

---

## 🔌 BACKEND tRPC ROUTES TO CREATE

### Auth Routes
#### `backend/trpc/routes/auth/login/route.ts`
```typescript
import { publicProcedure } from '../../../create-context';
import { z } from 'zod';

export const loginProcedure = publicProcedure
  .input(z.object({
    email: z.string().email(),
    password: z.string(),
  }))
  .mutation(async ({ input }) => {
    // Validate credentials
    // Return user data or error
  });
```

#### `backend/trpc/routes/auth/register/route.ts`
#### `backend/trpc/routes/auth/logout/route.ts`

### Video Management Routes
#### `backend/trpc/routes/videos/update/route.ts`
#### `backend/trpc/routes/videos/delete/route.ts`
#### `backend/trpc/routes/videos/changeVisibility/route.ts`

### Channel Management Routes
#### `backend/trpc/routes/channels/update/route.ts`
#### `backend/trpc/routes/channels/delete/route.ts`

### User Management Routes (Super Admin Only)
#### `backend/trpc/routes/users/list/route.ts`
#### `backend/trpc/routes/users/updateRole/route.ts`
#### `backend/trpc/routes/users/delete/route.ts`

---

## 🎨 UI IMPROVEMENTS CHECKLIST

- [x] Auth system with roles
- [ ] Login/Register screens
- [ ] Super Admin badge on profile
- [ ] Search with real-time suggestions
- [ ] Shorts feed (vertical scroll)
- [ ] Profile photo in tab bar
- [ ] Shorts icon in center tab
- [ ] Swipe-to-refresh on all feeds
- [ ] Debounced like button
- [ ] Video aspect ratio fixes
- [ ] Mini player continuous play
- [ ] Admin panel UI
- [ ] Profile picture upload
- [ ] Backend routes for all operations

---

## 🐛 BUG FIXES TO IMPLEMENT

1. **Video Duration Display**: Remove unnecessary decimal places
   - In VideoCard component, format duration: `${mins}:${secs.toString().padStart(2, '0')}`

2. **Shorts Badge**: Add "SHORT" badge on video cards
   ```typescript
   {video.isShort && (
     <View style={styles.shortBadge}>
       <Text style={styles.shortBadgeText}>SHORT</Text>
     </View>
   )}
   ```

3. **Channel Profile on Shorts**: Display avatar to left of username
   ```typescript
   <View style={{ flexDirection: 'row', alignItems: 'center' }}>
     <Image source={{ uri: video.channelAvatar }} style={{ width: 32, height: 32, borderRadius: 16 }} />
     <Text style={styles.channelName}>{video.channelName}</Text>
   </View>
   ```

---

## 📝 ADDITIONAL NOTES

### File Upload Management
All uploaded files should be stored using AsyncStorage keys:
- Video URIs: stored in video object `videoUrl` field
- Thumbnails: stored in video object `thumbnail` field
- Profile pictures: stored in user object `avatar` field

For production, implement actual file upload to server/cloud storage.

### Security Considerations
- Super Admin check: `email === '565413anil@gmail.com' || role === 'superadmin'`
- Admin-only routes should check `isAdmin()` or `isSuperAdmin()`
- Passwords stored in plain text for demo - use hashing in production

### Performance Optimizations
- Implement pagination for video lists
- Use FlatList with `getItemLayout` for better performance
- Memoize expensive computations with `useMemo`
- Debounce search input (300ms)
- Lazy load images with expo-image

---

## 🚀 DEPLOYMENT CHECKLIST

Before final delivery:
- [ ] Test all auth flows (login, register, logout)
- [ ] Test Super Admin panel access
- [ ] Test video upload with auto-detection (short vs long)
- [ ] Test swipe-to-refresh on all feeds
- [ ] Test like button (no duplicate likes)
- [ ] Test search functionality
- [ ] Test shorts feed vertical scrolling
- [ ] Test mini player continuous playback
- [ ] Test profile picture upload
- [ ] Verify all routes work on web and mobile
- [ ] Check for console errors
- [ ] Verify proper TypeScript types

---

## 💡 IMPLEMENTATION PRIORITY

**HIGH PRIORITY (Core Features):**
1. Complete Login/Register screens
2. Search functionality
3. Shorts feed
4. Admin panel
5. Swipe-to-refresh

**MEDIUM PRIORITY (UX Improvements):**
6. Profile photo in tab bar
7. Debounced like button
8. Video aspect ratio fixes
9. Profile picture upload

**LOW PRIORITY (Polish):**
10. Mini player fixes
11. Backend tRPC routes
12. Duration format fixes
13. Shorts badge display

---

This implementation will result in a fully functional YouTube-style app with authentication, role-based access, content management, and all requested features. Each section can be implemented incrementally and tested independently.
