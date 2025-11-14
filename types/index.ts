export interface MonetizationEligibility {
  minSubscribers: number;
  minWatchHours: number;
}

export interface MembershipTier {
  id: string;
  name: string;
  price: number;
  perks: string[];
}

export interface MonetizationEarnings {
  total: number;
  monthly: number;
  lastPayout: string | null;
}

export interface MonetizationAnalytics {
  totalViews: number;
  adImpressions: number;
  adClicks: number;
  membershipRevenue: number;
}

export interface Monetization {
  enabled: boolean;
  enabledAt: string | null;
  eligibility: MonetizationEligibility;
  adsEnabled: boolean;
  membershipTiers: MembershipTier[];
  estimatedRPM: number;
  earnings: MonetizationEarnings;
  analytics: MonetizationAnalytics;
  pendingReports: number;
}

export interface Channel {
  id: string;
  name: string;
  avatar: string;
  banner: string;
  description: string;
  subscriberCount: number;
  totalViews: number;
  totalWatchHours: number;
  verified: boolean;
  createdAt: string;
  monetization: Monetization;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
  likes: number;
  replies: Comment[];
}

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  channelId: string;
  channelName: string;
  channelAvatar: string;
  views: number;
  likes: number;
  dislikes: number;
  uploadDate: string;
  duration: number;
  category: string;
  tags: string[];
  comments: Comment[];
  isShort: boolean;
  isLive: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  videoIds: string[];
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
}

export interface Story {
  id: string;
  channelId: string;
  channelName: string;
  channelAvatar: string;
  mediaUrl: string;
  thumbnail: string;
  timestamp: string;
  expiresAt: string;
}

export interface Subscription {
  channelId: string;
  subscribedAt: string;
  notifications: boolean;
}

export interface Membership {
  channelId: string;
  tierId: string;
  joinedAt: string;
}

export interface UserReaction {
  videoId: string;
  type: 'like' | 'dislike';
  timestamp: string;
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar: string;
  bio: string;
  channelId: string | null;
  subscriptions: Subscription[];
  memberships: Membership[];
  reactions: UserReaction[];
  watchHistory: string[];
  watchHistoryDetailed: WatchHistoryItem[];
  savedVideos: string[];
  likedVideos: string[];
  createdAt: string;
}

export interface WatchHistoryItem {
  videoId: string;
  lastWatchedAt: string;
  position: number;
  duration: number;
}

export interface Settings {
  theme: 'dark' | 'light';
  accentColor: string;
  autoPlayNext: boolean;
  autoPlayOnWifiOnly: boolean;
  pipEnabled: boolean;
  autoPlayOnOpen: boolean;
  miniPlayerEnabled: boolean;
  backgroundAudioEnabled: boolean;
  notificationsEnabled: boolean;
  videoQuality: 'auto' | '1080p' | '720p' | '480p';
  experimentalFeatures: boolean;
}

export interface Ad {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  url: string;
  duration: number;
}

export interface Report {
  id: string;
  videoId: string;
  userId: string;
  reason: string;
  description: string;
  timestamp: string;
}

export interface UploadProgress {
  progress: number;
  status: 'idle' | 'processing' | 'uploading' | 'completed' | 'error';
  message: string;
}

export interface VideoUploadData {
  title: string;
  description: string;
  category: string;
  tags: string[];
  videoUri: string;
  thumbnailUri: string;
  duration: number;
  isShort: boolean;
}
