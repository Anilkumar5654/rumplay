import { existsSync, readFileSync, writeFileSync, chmodSync } from "fs";
import path from "path";
import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { z } from "zod";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";
import { ensureUploadDirs, resolveUploadPath, UploadFolder } from "./utils/ensureUploadDirs";
import { createSession, createUser, findSession, findUserByEmail, findUserById, revokeSession, verifyPassword } from "./utils/database";
import { sanitizeUser } from "./utils/auth-helpers";
import { SUPER_ADMIN_EMAIL } from "./constants/auth";

ensureUploadDirs();

const app = new Hono();

const resolveAllowedOrigins = () => {
  const raw = process.env.CORS_ALLOWED_ORIGINS;
  if (!raw) {
    return ["*"];
  }

  return raw
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

const allowedOrigins = resolveAllowedOrigins();

const normalizeToken = (value: string | null): string | null => {
  if (!value) {
    return null;
  }

  if (value.toLowerCase().startsWith("bearer ")) {
    return value.substring(7).trim();
  }

  return value.trim();
};

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(3).regex(/^[a-zA-Z0-9_]+$/),
  displayName: z.string().min(1),
});

const uploadFolderSchema = z.enum(["profiles", "thumbnails", "videos", "shorts", "banners"]);

const uploadRequestSchema = z.object({
  fileName: z.string().min(3),
  fileData: z.string().min(10),
  folder: uploadFolderSchema.default("profiles"),
  mimeType: z.string().optional(),
});

type FolderConfig = {
  maxBytes: number;
  allowedMimeTypes: Set<string>;
  allowedExtensions: Set<string>;
};

const folderConfigs: Record<UploadFolder, FolderConfig> = {
  profiles: {
    maxBytes: 5 * 1024 * 1024,
    allowedMimeTypes: new Set(["image/png", "image/jpeg"]),
    allowedExtensions: new Set(["png", "jpg", "jpeg"]),
  },
  thumbnails: {
    maxBytes: 8 * 1024 * 1024,
    allowedMimeTypes: new Set(["image/png", "image/jpeg"]),
    allowedExtensions: new Set(["png", "jpg", "jpeg"]),
  },
  banners: {
    maxBytes: 12 * 1024 * 1024,
    allowedMimeTypes: new Set(["image/png", "image/jpeg"]),
    allowedExtensions: new Set(["png", "jpg", "jpeg"]),
  },
  videos: {
    maxBytes: 250 * 1024 * 1024,
    allowedMimeTypes: new Set(["video/mp4", "video/quicktime", "video/x-m4v", "video/webm", "video/3gpp", "video/3gp"]),
    allowedExtensions: new Set(["mp4", "mov", "m4v", "webm", "3gp"]),
  },
  shorts: {
    maxBytes: 120 * 1024 * 1024,
    allowedMimeTypes: new Set(["video/mp4", "video/quicktime", "video/x-m4v", "video/webm", "video/3gpp", "video/3gp"]),
    allowedExtensions: new Set(["mp4", "mov", "m4v", "webm", "3gp"]),
  },
};

const fallbackMimeByExtension: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  mp4: "video/mp4",
  mov: "video/quicktime",
  m4v: "video/x-m4v",
  webm: "video/webm",
  "3gp": "video/3gpp",
};

const fileFieldCandidates = ["file", "media", "upload", "asset"] as const;

const resolveExtension = (fileName: string): string => {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
};

const resolveMimeFromExtension = (extension: string): string => {
  return fallbackMimeByExtension[extension] ?? "";
};

const normalizeMimeType = (value: string): string => value.toLowerCase();

const resolvePublicBaseUrl = () => {
  const raw = process.env.PUBLIC_BASE_URL;
  if (!raw) {
    return "";
  }
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
};

const publicBaseUrl = resolvePublicBaseUrl();

type FileLike = {
  name?: string;
  type?: string;
  size?: number;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

type PersistSuccess = {
  relativePath: string;
  url: string;
  mimeType: string;
  filename: string;
  size: number;
};

type PersistResult =
  | { ok: true; data: PersistSuccess }
  | { ok: false; status: number; message: string };

const parseFolderInput = (value: unknown): UploadFolder => {
  const candidate = typeof value === "string" ? value : "profiles";
  const parsed = uploadFolderSchema.safeParse(candidate);
  if (parsed.success) {
    return parsed.data;
  }
  return "profiles";
};

const isFileLike = (value: unknown): value is FileLike => {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as FileLike;
  return typeof candidate.arrayBuffer === "function";
};

const formatLimit = (bytes: number): string => {
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) {
    return `${Math.round(mb * 10) / 10}MB`;
  }
  const kb = bytes / 1024;
  return `${Math.round(kb)}KB`;
};

const persistUpload = (folder: UploadFolder, originalFileName: string, buffer: Buffer, mimeType: string): PersistResult => {
  const config = folderConfigs[folder] ?? folderConfigs.profiles;
  const extension = resolveExtension(originalFileName);
  const resolvedMime = mimeType ? normalizeMimeType(mimeType) : resolveMimeFromExtension(extension);

  if (!extension || !config.allowedExtensions.has(extension)) {
    console.error("[Uploads] Unsupported extension", { folder, extension, originalFileName });
    return { ok: false, status: 400, message: `Unsupported file extension for ${folder}` };
  }

  if (!resolvedMime || !config.allowedMimeTypes.has(resolvedMime)) {
    console.error("[Uploads] Unsupported mime", { folder, resolvedMime, originalFileName });
    return { ok: false, status: 400, message: `Unsupported file type for ${folder}` };
  }

  if (buffer.length === 0) {
    return { ok: false, status: 400, message: "Empty file" };
  }

  if (buffer.length > config.maxBytes) {
    console.error("[Uploads] File exceeds limit", { folder, size: buffer.length, limit: config.maxBytes });
    return { ok: false, status: 400, message: `File exceeds ${formatLimit(config.maxBytes)} limit` };
  }

  ensureUploadDirs();

  const { absolutePath, relativePath, filename } = resolveUploadPath(folder, originalFileName);

  try {
    writeFileSync(absolutePath, buffer);
    chmodSync(absolutePath, 0o644);
  } catch (error) {
    console.error("[Uploads] Failed to persist file", error);
    return { ok: false, status: 500, message: "Unable to save file" };
  }

  const url = publicBaseUrl ? `${publicBaseUrl}${relativePath}` : relativePath;

  return {
    ok: true,
    data: {
      relativePath,
      url,
      mimeType: resolvedMime,
      filename,
      size: buffer.length,
    },
  };
};

app.use("*", async (c, next) => {
  const requestOrigin = c.req.header("origin") ?? "";
  const allowAny = allowedOrigins.includes("*");
  const matchedOrigin = allowAny
    ? "*"
    : allowedOrigins.includes(requestOrigin)
      ? requestOrigin
      : allowedOrigins[0] ?? "*";

  c.res.headers.set("Access-Control-Allow-Origin", matchedOrigin);
  c.res.headers.set("Vary", "Origin");
  c.res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept");
  c.res.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  c.res.headers.set("Access-Control-Allow-Credentials", "true");
  c.res.headers.set("Access-Control-Max-Age", "86400");

  if (c.req.method === "OPTIONS") {
    return c.text("", 204);
  }

  await next();
});

app.use(
  "/api/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
  })
);

app.get("/uploads/*", (c) => {
  const relativePath = c.req.path.replace(/^\/uploads\/?/, "");

  if (!relativePath) {
    return c.notFound();
  }

  const absolutePath = path.join(process.cwd(), "public_html", "uploads", relativePath);

  if (!existsSync(absolutePath)) {
    return c.notFound();
  }

  const data = readFileSync(absolutePath);
  const extension = relativePath.split(".").pop()?.toLowerCase();

  let mimeType = "application/octet-stream";
  if (extension === "png") {
    mimeType = "image/png";
  } else if (extension === "jpg" || extension === "jpeg") {
    mimeType = "image/jpeg";
  }

  return new Response(data, {
    status: 200,
    headers: {
      "Content-Type": mimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
});

app.post("/api/uploads", async (c) => {
  const contentType = c.req.header("content-type") ?? "";
  console.log("[Uploads] Incoming request", { contentType });

  try {
    if (contentType.includes("multipart/form-data")) {
      const rawBody = (await c.req.parseBody()) as Record<string, unknown>;
      const folder = parseFolderInput(rawBody.folder);

      const resolvedFileValue = fileFieldCandidates
        .map((key) => rawBody[key as string])
        .find((value) => value !== undefined && value !== null);

      let fileEntry: FileLike | null = null;

      if (Array.isArray(resolvedFileValue)) {
        fileEntry = resolvedFileValue.find((item) => isFileLike(item)) ?? null;
      } else if (isFileLike(resolvedFileValue)) {
        fileEntry = resolvedFileValue;
      }

      if (!fileEntry) {
        console.error("[Uploads] Multipart request missing file", { keys: Object.keys(rawBody) });
        return c.json({ success: false, error: "Missing file" }, 400);
      }

      const providedName = typeof rawBody.fileName === "string" && rawBody.fileName.trim().length > 0 ? rawBody.fileName.trim() : undefined;
      const originalFileName = providedName || fileEntry.name || `upload-${Date.now()}`;
      const arrayBuffer = await fileEntry.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const candidateMime = typeof fileEntry.type === "string" && fileEntry.type.length > 0
        ? normalizeMimeType(fileEntry.type)
        : resolveMimeFromExtension(resolveExtension(originalFileName));

      const result = persistUpload(folder, originalFileName, buffer, candidateMime);

      if (!result.ok) {
        return c.json({ success: false, error: result.message }, result.status);
      }

      console.log("[Uploads] Stored file", { folder, filename: result.data.filename, size: result.data.size });

      return c.json({
        success: true,
        folder,
        path: result.data.relativePath,
        url: result.data.url,
        mimeType: result.data.mimeType,
        size: result.data.size,
        filename: result.data.filename,
      });
    }

    const payload = await c.req.json().catch(() => null);
    const parsed = uploadRequestSchema.safeParse(payload);

    if (!parsed.success) {
      console.error("[Uploads] Invalid JSON payload", parsed.error.flatten());
      return c.json({ success: false, error: "Invalid payload" }, 400);
    }

    const { fileName, fileData, folder, mimeType } = parsed.data;
    let dataString = fileData;
    let resolvedMime = mimeType ? normalizeMimeType(mimeType) : "";
    const dataMatch = fileData.match(/^data:(.+);base64,(.+)$/);

    if (dataMatch) {
      const embeddedMime = dataMatch[1];
      if (embeddedMime && embeddedMime.length > 0) {
        resolvedMime = normalizeMimeType(embeddedMime);
      }
      dataString = dataMatch[2];
    }

    let buffer: Buffer;
    try {
      buffer = Buffer.from(dataString, "base64");
    } catch (error) {
      console.error("[Uploads] Failed to decode base64", error);
      return c.json({ success: false, error: "Invalid file data" }, 400);
    }

    if (buffer.length === 0) {
      return c.json({ success: false, error: "Empty file" }, 400);
    }

    const fallbackMime = resolvedMime || resolveMimeFromExtension(resolveExtension(fileName));
    const result = persistUpload(folder, fileName, buffer, fallbackMime);

    if (!result.ok) {
      return c.json({ success: false, error: result.message }, result.status);
    }

    console.log("[Uploads] Stored base64 file", { folder, filename: result.data.filename, size: result.data.size });

    return c.json({
      success: true,
      folder,
      path: result.data.relativePath,
      url: result.data.url,
      mimeType: result.data.mimeType,
      size: result.data.size,
      filename: result.data.filename,
    });
  } catch (error) {
    console.error("[Uploads] Unexpected error", error);
    return c.json({ success: false, error: "Unable to process upload" }, 500);
  }
});

app.post("/api/auth/login", async (c) => {
  const payload = await c.req.json().catch(() => null);

  const parsed = loginSchema.safeParse(payload);
  if (!parsed.success) {
    return c.json({ success: false, error: "Invalid payload" }, 400);
  }

  const email = parsed.data.email.toLowerCase();
  const user = findUserByEmail(email);

  if (!user) {
    return c.json({ success: false, error: "Invalid credentials" }, 401);
  }

  const valid = verifyPassword(user, parsed.data.password);

  if (!valid) {
    return c.json({ success: false, error: "Invalid credentials" }, 401);
  }

  const session = createSession(user.id);
  return c.json({ success: true, token: session.token, user: sanitizeUser(user) });
});

app.post("/api/auth/register", async (c) => {
  const payload = await c.req.json().catch(() => null);

  const parsed = registerSchema.safeParse(payload);
  if (!parsed.success) {
    return c.json({ success: false, error: "Invalid payload" }, 400);
  }

  try {
    const normalizedEmail = parsed.data.email.toLowerCase();
    const role = normalizedEmail === SUPER_ADMIN_EMAIL ? "superadmin" : "user";
    const user = createUser({
      email: normalizedEmail,
      username: parsed.data.username,
      displayName: parsed.data.displayName,
      password: parsed.data.password,
      role,
    });

    const session = createSession(user.id);
    return c.json({ success: true, token: session.token, user: sanitizeUser(user) });
  } catch (error) {
    return c.json({ success: false, error: error instanceof Error ? error.message : "Registration failed" }, 400);
  }
});

app.get("/api/auth/me", (c) => {
  const token = normalizeToken(c.req.header("authorization") ?? null);
  if (!token) {
    return c.json({ success: false, error: "Missing token" }, 401);
  }

  const session = findSession(token);
  if (!session) {
    return c.json({ success: false, error: "Invalid session" }, 401);
  }

  const user = findUserById(session.userId);
  if (!user) {
    revokeSession(token);
    return c.json({ success: false, error: "User not found" }, 401);
  }

  return c.json({ success: true, user: sanitizeUser(user) });
});

app.post("/api/auth/logout", (c) => {
  const token = normalizeToken(c.req.header("authorization") ?? null);
  if (!token) {
    return c.json({ success: true });
  }

  revokeSession(token);
  return c.json({ success: true });
});

app.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

app.get("/api/health", (c) => {
  return c.json({ 
    status: "ok", 
    message: "Backend API is healthy",
    timestamp: new Date().toISOString(),
    endpoints: {
      tRPC: "/api/trpc",
      auth: "/api/auth/*"
    }
  });
});

export default app;
