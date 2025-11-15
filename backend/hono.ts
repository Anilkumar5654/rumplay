import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { z } from "zod";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";
import { ensureUploadDirs } from "./utils/ensureUploadDirs";
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

app.use(
  "*",
  cors({
    origin: (origin) => {
      if (!origin || allowedOrigins.includes("*")) {
        return "*";
      }

      if (allowedOrigins.includes(origin)) {
        return origin;
      }

      return allowedOrigins.length === 0 ? "*" : allowedOrigins[0];
    },
    allowHeaders: ["Content-Type", "Authorization", "Accept"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length", "X-Request-Id"],
    credentials: true,
    maxAge: 86400,
  })
);

app.use(
  "/api/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
  })
);

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
