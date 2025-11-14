# PlayTube - Quick Start Guide

## 🚀 Running the App

### Prerequisites
- **Node.js** v16+ installed
- **Bun** package manager installed
- **Expo Go** app on your phone (iOS/Android)
- OR **iOS Simulator** (Mac only)
- OR **Android Emulator** (requires Android Studio)

### Installation & Startup

```bash
# 1. Install dependencies
bun install

# 2. Start development server
bun start

# You'll see a QR code and options:
# - Press 'i' for iOS Simulator
# - Press 'a' for Android Emulator
# - Scan QR with Expo Go app for physical device
# - Press 'w' for web browser
```

### First Launch
The app will:
1. Load mock data (4 channels, 7 videos)
2. Save to AsyncStorage
3. Display the Home feed
4. You're logged in as "Current User"

---

## 📱 App Navigation

### Bottom Tabs (Always Visible)
1. **Home** 🏠 - Main feed with videos and shorts
2. **Explore** 🧭 - Trending and categories
3. **Upload** ➕ - Upload placeholder
4. **Subscriptions** 📺 - Videos from subscribed channels
5. **Profile** 👤 - Your profile and settings

### Opening Videos
- Tap any video thumbnail → **Video Player** opens
- Player has full controls and comments
- Tap channel avatar → **Channel Page**
- Tap related video → Opens new video

### Opening Shorts
- Tap any short thumbnail → **Shorts Player** opens
- Swipe up/down to navigate
- Tap back to return

---

## 🎬 Video Player Features

### Playback Controls
- **Play/Pause**: Tap center play button or video
- **Skip Forward**: Tap "+10s" button (skip 10 seconds)
- **Skip Backward**: Tap "-10s" button (go back 10 seconds)
- **Seek**: Use progress bar (swipe left/right)
- **Controls**: Auto-hide after 3 seconds, tap video to show

### Interactions
- **Like/Dislike**: Tap thumbs up or down (turns pink when active)
- **Subscribe**: Tap subscribe button in channel section
- **Comment**: Scroll down, tap comment input, type, send
- **Share**: Tap share icon for native share dialog
- **Report**: Tap flag icon to report video

### Navigation
- **Back**: Tap back button (top left) or swipe from left
- **Channel**: Tap channel avatar to visit channel
- **Related**: Scroll down, tap any related video

---

## 📺 Channel Features

### Channel Tabs
- **Videos**: Grid of all videos from this channel
- **Shorts**: Grid of all shorts from this channel
- **About**: Description, stats, monetization info
- **Manage**: (Own channel only) Monetization dashboard

### Subscribe
- Tap "Subscribe" button → Changes to "Subscribed"
- Subscriber count increases
- Unsubscribe by tapping again

### Monetization (Own Channel)
Go to your channel → **Manage** tab:

**If Not Monetized:**
- See eligibility requirements
- ✅ 1000+ subscribers
- ✅ 4000+ watch hours
- "Apply for Monetization" button (if eligible)

**If Monetized:**
- Total earnings: $XXX,XXX
- Monthly earnings: $XX,XXX
- Estimated RPM: $X.XX
- View membership tiers

---

## 👤 Profile & Settings

### View Profile
Tap **Profile** tab to see:
- Your avatar and name
- Subscriptions, Liked, Watched counts
- Edit Profile button
- View My Channel button
- Menu items (History, Liked, Saved, Playlists, Settings)

### Edit Profile
1. Tap "Edit Profile"
2. Change display name, username, email, bio
3. Tap checkmark (top right) to save
4. Returns to profile with changes applied

### View Your Channel
If you have a channel (current user does - Tech Reviews Pro):
1. Tap "View My Channel"
2. See your channel page with all videos
3. Go to "Manage" tab for monetization

---

## 🔍 Search & Explore

### Home Search
- Type in search bar at top of Home
- Results filter in real-time
- Clear search to show all

### Explore Tab
- Tap **Explore** tab
- See category cards (Trending, Music, Gaming, etc.)
- Scroll down for "Trending Now" videos
- Tap any video to watch

---

## 📤 Subscriptions

### Subscribe to Channels
- Subscribe from video player or channel page
- Subscriptions persist across app restarts

### View Subscribed Content
1. Tap **Subscriptions** tab
2. See horizontal row of subscribed channels
3. Tap channel avatar to visit channel
4. Scroll down to see videos from all subscriptions
5. Most recent videos appear first

---

## 🎥 Shorts

### Watch Shorts
1. From Home feed, tap any short in carousel
2. OR scroll through feed and tap short thumbnail
3. Vertical full-screen player opens

### Navigate Shorts
- **Swipe Up**: Next short
- **Swipe Down**: Previous short
- **Like**: Tap heart icon (right side)
- **Comment**: Tap comment icon
- **Share**: Tap share icon
- **Back**: Tap back button (top left)

---

## 💬 Comments

### View Comments
1. Open any video
2. Scroll down below video info
3. Tap "Comments (N)" to expand
4. See all comments with avatars and timestamps

### Add Comment
1. Type in comment input field
2. Tap send icon (paper plane)
3. Your comment appears at bottom of list
4. Comment persists after app restart

---

## 💰 Monetization Simulation

### Becoming Monetized
Current user's channel (Tech Reviews Pro) is **already monetized**.

To test:
1. Go to **Profile** → "View My Channel"
2. Tap **Manage** tab
3. See monetization dashboard:
   - ✅ Eligibility met (2.5M subscribers, 5000 watch hours)
   - Total earnings: $125,000
   - Monthly earnings: $12,500
   - RPM: $4.50
   - 2 membership tiers (Bronze $4.99, Gold $9.99)

### Testing Non-Monetized Channel
1. Open "Fitness Journey" channel (850K subs, 3500 hours)
2. See monetization NOT enabled
3. Requirements not met yet

---

## 📊 Mock Data Overview

### Channels (4 total)
1. **Tech Reviews Pro** - 2.5M subs, monetized ✅
2. **Cooking with Love** - 1.2M subs, monetized ✅
3. **Fitness Journey** - 850K subs, not monetized ❌
4. **Gaming Legends** - 3.5M subs, monetized ✅

### Videos (7 total)
- **4 Regular Videos**: iPhone review, Pasta recipe, Fitness transformation, Gaming montage
- **3 Shorts**: Tech tip, Pasta hack, Ab workout

### Current User
- Username: currentuser
- Display Name: Current User
- Channel: Tech Reviews Pro (you own this!)
- Subscribed to: Cooking with Love, Gaming Legends
- Liked: iPhone review, Pasta recipe

---

## 🎨 Theme

### Colors
- **Primary**: Pink (#FF2D95)
- **Background**: Dark (#0B0C10)
- **Surface**: Cards (#1F2833)
- **Text**: White (#FFFFFF)
- **Text Secondary**: Gray (#B0B0B0)

### When to See Pink
- Active tab icon
- Like/Dislike when active
- Subscribe button (when not subscribed)
- Active category chip
- Links and accents

---

## 💾 Data Persistence

### What Persists
- ✅ Likes and dislikes
- ✅ Subscriptions
- ✅ Comments you add
- ✅ Watch history
- ✅ Saved videos
- ✅ Profile changes
- ✅ Settings

### How to Reset
Delete and reinstall app, or manually:
```javascript
// Run in console (dev mode)
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.clear();
```
Then restart app.

---

## 🐛 Troubleshooting

### Video won't play
- Check video URL in mock data
- Some sample videos may be slow to load
- Try different video

### Data not persisting
- Check AsyncStorage is working
- Look for errors in console
- Try restarting dev server

### Navigation broken
- Swipe from left edge to go back
- Or use back button in header

### Tabs not working
- Make sure you're tapping the actual tab icons
- Check console for errors

---

## 🎯 Quick Demo Flow

**Show all features in 3 minutes:**

1. Launch app → **Home feed** (categories, shorts, videos)
2. Tap video → **Player** (play, like, subscribe, comment)
3. Add comment → Type "Great video!" → Send
4. Tap channel avatar → **Channel page** (tabs, videos)
5. Tap **Manage** → See **monetization** (earnings, tiers)
6. Back → Back → Tap short → **Shorts player** (swipe up/down)
7. Back → Tap **Explore** → See **categories and trending**
8. Tap **Subscriptions** → See **subscribed channels**
9. Tap **Profile** → See **stats** → Tap **Edit Profile**
10. Change name → Save → **Persists**
11. Close app → Reopen → All changes **still there** ✅

---

## 📱 Mobile vs Web

### Mobile (Recommended)
- Full functionality
- Smooth video playback
- Native gestures
- Better performance

### Web
- Basic functionality works
- Video playback supported
- Some gestures may differ
- Use for testing only

---

## ✅ Success Criteria

You'll know the app works correctly if:

1. ✅ Home feed displays videos and shorts
2. ✅ Videos play with controls
3. ✅ Like button turns pink and persists
4. ✅ Subscribe button works and persists
5. ✅ Comments can be added
6. ✅ Shorts player swipes vertically
7. ✅ Channel page shows monetization
8. ✅ Profile can be edited
9. ✅ All data persists after restart
10. ✅ No crashes or errors

If all 10 pass → **App is fully working!** 🎉

---

## 🚀 Next Steps

After testing:
1. Customize theme colors
2. Add your own mock data
3. Connect to real backend
4. Implement upload flow
5. Add settings screen
6. Build mini-player
7. Deploy to stores

---

**Enjoy exploring PlayTube!** 🎬📱✨
