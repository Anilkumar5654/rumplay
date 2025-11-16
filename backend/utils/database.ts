import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import crypto from "crypto";
import type { Membership, Subscription, UserReaction, UserRole, WatchHistoryItem } from "../../types";

type StoredUser = {
  id: string;
  email: string;
  username: string;
  displayName: string;
  passwordHash: string;
  salt: string;
  avatar: string | null;
  bio: string;
  phone: string | null;
  channelId: string | null;
  role: UserRole;
  rolesAssignedBy?: string;
  createdAt: string;
  updatedAt: string;
  subscriptions: Subscription[];
  memberships: Membership[];
  reactions: UserReaction[];
  watchHistory: string[];
  watchHistoryDetailed: WatchHistoryItem[];
  savedVideos: string[];
  likedVideos: string[];
};

type StoredSession = {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
};

type StoredRole = {
  id: string;
  name: UserRole | (string & {});
  description: string;
  createdAt: string;
};

type StoredChannel = {
  id: string;
  userId: string;
  name: string;
  handle: string;
  avatar: string | null;
  banner: string | null;
  description: string;
  createdAt: string;
  updatedAt: string;
};

type DatabaseShape = {
  users: StoredUser[];
  roles: StoredRole[];
  sessions: StoredSession[];
  channels: StoredChannel[];
};

const ensureDataDir = () => {
  const dataDir = path.join(process.cwd(), "backend", "data");
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }
  return dataDir;
};

const dbPath = path.join(ensureDataDir(), "database.json");

const DEFAULT_DB: DatabaseShape = {
  users: [],
  roles: [
    {
      id: "role-user",
      name: "user",
      description: "Default viewer role",
      createdAt: new Date().toISOString(),
    },
    {
      id: "role-creator",
      name: "creator",
      description: "Creator role",
      createdAt: new Date().toISOString(),
    },
    {
      id: "role-admin",
      name: "admin",
      description: "Admin role",
      createdAt: new Date().toISOString(),
    },
    {
      id: "role-superadmin",
      name: "superadmin",
      description: "Super admin role",
      createdAt: new Date().toISOString(),
    },
  ],
  sessions: [],
  channels: [],
};

const readDb = (): DatabaseShape => {
  if (!existsSync(dbPath)) {
    writeFileSync(dbPath, JSON.stringify(DEFAULT_DB, null, 2), { encoding: "utf-8" });
    return JSON.parse(JSON.stringify(DEFAULT_DB)) as DatabaseShape;
  }

  try {
    const raw = readFileSync(dbPath, { encoding: "utf-8" });
    const parsed = JSON.parse(raw) as DatabaseShape;
    return {
      ...DEFAULT_DB,
      ...parsed,
      roles: parsed.roles && parsed.roles.length > 0 ? parsed.roles : DEFAULT_DB.roles,
    };
  } catch (error) {
    console.error("[DB] Failed to read database.json", error);
    return JSON.parse(JSON.stringify(DEFAULT_DB)) as DatabaseShape;
  }
};

const writeDb = (db: DatabaseShape): void => {
  try {
    writeFileSync(dbPath, JSON.stringify(db, null, 2), { encoding: "utf-8" });
  } catch (error) {
    console.error("[DB] Failed to write database.json", error);
  }
};

export const listRoles = () => {
  const db = readDb();
  return db.roles;
};

export const createRole = (name: string, description: string): StoredRole => {
  const normalized = name.toLowerCase() as StoredRole["name"];
  const db = readDb();

  if (db.roles.some((role) => role.name === normalized)) {
    throw new Error("Role already exists");
  }

  const role: StoredRole = {
    id: `role-${crypto.randomUUID()}`,
    name: normalized,
    description,
    createdAt: new Date().toISOString(),
  };

  db.roles.push(role);
  writeDb(db);
  return role;
};

const hashPassword = (password: string, salt: string) => {
  return crypto.scryptSync(password, salt, 64).toString("hex");
};

export const createUser = (params: {
  email: string;
  username: string;
  displayName: string;
  password: string;
  role?: UserRole;
}): StoredUser => {
  const db = readDb();

  if (db.users.some((user) => user.email.toLowerCase() === params.email.toLowerCase())) {
    throw new Error("Email already exists");
  }

  if (db.users.some((user) => user.username.toLowerCase() === params.username.toLowerCase())) {
    throw new Error("Username already exists");
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = hashPassword(params.password, salt);
  const now = new Date().toISOString();

  const fallbackAvatar = `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(params.username)}`;

  const user: StoredUser = {
    id: `user-${crypto.randomUUID()}`,
    email: params.email.toLowerCase(),
    username: params.username,
    displayName: params.displayName,
    passwordHash,
    salt,
    avatar: fallbackAvatar,
    bio: "",
    phone: null,
    channelId: null,
    role: params.role ?? "user",
    createdAt: now,
    updatedAt: now,
    subscriptions: [],
    memberships: [],
    reactions: [],
    watchHistory: [],
    watchHistoryDetailed: [],
    savedVideos: [],
    likedVideos: [],
  };

  db.users.push(user);
  writeDb(db);
  return user;
};

export const findUserByEmail = (email: string): StoredUser | null => {
  const db = readDb();
  return db.users.find((user) => user.email === email.toLowerCase()) ?? null;
};

export const findUserById = (id: string): StoredUser | null => {
  const db = readDb();
  return db.users.find((user) => user.id === id) ?? null;
};



export const verifyPassword = (user: StoredUser, password: string): boolean => {
  const computed = hashPassword(password, user.salt);
  return crypto.timingSafeEqual(Buffer.from(computed, "hex"), Buffer.from(user.passwordHash, "hex"));
};

export const createSession = (userId: string, durationHours = 12): StoredSession => {
  const db = readDb();
  const token = crypto.randomBytes(48).toString("hex");
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + durationHours * 60 * 60 * 1000);

  const session: StoredSession = {
    token,
    userId,
    createdAt: createdAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  db.sessions = db.sessions.filter((existing) => existing.userId !== userId);
  db.sessions.push(session);
  writeDb(db);
  return session;
};

export const findSession = (token: string): StoredSession | null => {
  const db = readDb();
  const session = db.sessions.find((item) => item.token === token) ?? null;
  if (!session) {
    return null;
  }

  const now = new Date();
  if (now > new Date(session.expiresAt)) {
    db.sessions = db.sessions.filter((item) => item.token !== token);
    writeDb(db);
    return null;
  }

  return session;
};

export const revokeSession = (token: string): void => {
  const db = readDb();
  db.sessions = db.sessions.filter((item) => item.token !== token);
  writeDb(db);
};

export const updateUser = (userId: string, updates: Partial<Omit<StoredUser, "id" | "createdAt" | "passwordHash" | "salt">> & { password?: string; role?: UserRole }): StoredUser => {
  const db = readDb();
  const index = db.users.findIndex((user) => user.id === userId);
  if (index === -1) {
    throw new Error("User not found");
  }

  const existing = db.users[index];
  const now = new Date().toISOString();

  if (updates.email && updates.email !== existing.email) {
    if (db.users.some((user, idx) => idx !== index && user.email === updates.email)) {
      throw new Error("Email already exists");
    }
  }

  if (updates.username && updates.username !== existing.username) {
    if (db.users.some((user, idx) => idx !== index && user.username === updates.username)) {
      throw new Error("Username already exists");
    }
  }

  let passwordHash = existing.passwordHash;
  let salt = existing.salt;

  if (updates.password) {
    salt = crypto.randomBytes(16).toString("hex");
    passwordHash = hashPassword(updates.password, salt);
  }

  const updated: StoredUser = {
    ...existing,
    ...updates,
    email: updates.email ? updates.email.toLowerCase() : existing.email,
    username: updates.username ?? existing.username,
    displayName: updates.displayName ?? existing.displayName,
    avatar: updates.avatar ?? existing.avatar,
    bio: updates.bio ?? existing.bio,
    phone: updates.phone ?? existing.phone,
    role: updates.role ?? existing.role,
    passwordHash,
    salt,
    updatedAt: now,
  };

  db.users[index] = updated;
  writeDb(db);
  return updated;
};

export const upsertChannel = (userId: string, payload: Omit<StoredChannel, "id" | "createdAt" | "updatedAt" | "userId"> & { id?: string }): StoredChannel => {
  const db = readDb();
  const now = new Date().toISOString();

  if (payload.handle) {
    const handleExists = db.channels.some((channel) => channel.handle.toLowerCase() === payload.handle.toLowerCase() && channel.userId !== userId);
    if (handleExists) {
      throw new Error("Channel handle already exists");
    }
  }

  if (payload.id) {
    const index = db.channels.findIndex((channel) => channel.id === payload.id && channel.userId === userId);
    if (index === -1) {
      throw new Error("Channel not found");
    }

    const updated: StoredChannel = {
      ...db.channels[index],
      name: payload.name,
      handle: payload.handle,
      avatar: payload.avatar ?? db.channels[index].avatar,
      banner: payload.banner ?? db.channels[index].banner,
      description: payload.description,
      updatedAt: now,
    };

    db.channels[index] = updated;
    writeDb(db);
    return updated;
  }

  const channel: StoredChannel = {
    id: `channel-${crypto.randomUUID()}`,
    userId,
    name: payload.name,
    handle: payload.handle,
    avatar: payload.avatar ?? null,
    banner: payload.banner ?? null,
    description: payload.description,
    createdAt: now,
    updatedAt: now,
  };

  db.channels.push(channel);

  const userIndex = db.users.findIndex((user) => user.id === userId);
  if (userIndex !== -1) {
    db.users[userIndex] = {
      ...db.users[userIndex],
      channelId: channel.id,
      updatedAt: now,
    };
  }

  writeDb(db);
  return channel;
};

export const listUsers = (): StoredUser[] => {
  const db = readDb();
  return db.users;
};

export const deleteUserById = (userId: string): void => {
  const db = readDb();
  const target = db.users.find((user) => user.id === userId);

  if (!target) {
    throw new Error("User not found");
  }

  if (target.role === "superadmin") {
    throw new Error("Cannot delete super admin");
  }

  db.sessions = db.sessions.filter((session) => session.userId !== userId);
  db.users = db.users.filter((user) => user.id !== userId);
  db.channels = db.channels.filter((channel) => channel.userId !== userId);
  writeDb(db);
};

export type { StoredUser, StoredSession, StoredRole, StoredChannel, DatabaseShape };
