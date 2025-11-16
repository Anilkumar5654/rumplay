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
});

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const allowedImageMimeTypes = new Set(["image/png", "image/jpeg"]);
const allowedImageExtensions = new Set(["png", "jpg", "jpeg"]);

const resolvePublicBaseUrl = () => {
  const raw = process.env.PUBLIC_BASE_URL;
  if (!raw) {
    return "";
  }
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
};

const publicBaseUrl = resolvePublicBaseUrl();

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
  const payload = await c.req.json().catch(() => null);
  const parsed = uploadRequestSchema.safeParse(payload);

  if (!parsed.success) {
    return c.json({ success: false, error: "Invalid payload" }, 400);
  }

  const { fileName, fileData, folder } = parsed.data;
  const dataMatch = fileData.match(/^data:(.+);base64,(.+)$/);
  let mimeType = "";
  let base64String = fileData;

  if (dataMatch) {
    mimeType = dataMatch[1]?.toLowerCase() ?? "";
    base64String = dataMatch[2];
  }

  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";

  if (!allowedImageExtensions.has(extension)) {
    return c.json({ success: false, error: "Unsupported file extension" }, 400);
  }

  if (!mimeType) {
    if (extension === "png") {
      mimeType = "image/png";
    } else if (extension === "jpg" || extension === "jpeg") {
      mimeType = "image/jpeg";
    }
  }

  if (!allowedImageMimeTypes.has(mimeType)) {
    return c.json({ success: false, error: "Unsupported file type" }, 400);
  }

  let buffer: Buffer;
  try {
    buffer = Buffer.from(base64String, "base64");
  } catch (error) {
    console.error("[Uploads] Failed to decode base64", error);
    return c.json({ success: false, error: "Invalid file data" }, 400);
  }

  if (buffer.length === 0) {
    return c.json({ success: false, error: "Empty file" }, 400);
  }

  if (buffer.length > MAX_IMAGE_BYTES) {
    return c.json({ success: false, error: "File too large" }, 400);
  }

  ensureUploadDirs();

  const { absolutePath, relativePath } = resolveUploadPath(folder as UploadFolder, fileName);

  try {
    writeFileSync(absolutePath, buffer);
    chmodSync(absolutePath, 0o644);
  } catch (error) {
    console.error("[Uploads] Failed to persist file", error);
    return c.json({ success: false, error: "Unable to save file" }, 500);
  }

  const url = publicBaseUrl ? `${publicBaseUrl}${relativePath}` : relativePath;

  return c.json({
    success: true,
    path: relativePath,
    url,
    mimeType,
    size: buffer.length,
    folder,
  });
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
