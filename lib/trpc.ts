import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import Constants from "expo-constants";
import { Platform } from "react-native";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const resolveEnv = (key: string): string | null => {
  if (typeof process !== "undefined" && process.env && typeof process.env[key] === "string") {
    return process.env[key] ?? null;
  }

  const manifestValue = Constants.expoConfig?.extra?.[key];
  if (typeof manifestValue === "string" && manifestValue.length > 0) {
    return manifestValue;
  }

  return null;
};

const sanitizeUrl = (value: string) => {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return trimmed;
  }

  const withoutTrailingSlash = trimmed.replace(/\/+$/, "");
  const lowered = withoutTrailingSlash.toLowerCase();
  const suffixes: string[] = ["/api/trpc", "/trpc", "/api"];

  for (const suffix of suffixes) {
    if (lowered.endsWith(suffix)) {
      const normalized = withoutTrailingSlash.slice(0, withoutTrailingSlash.length - suffix.length);
      console.warn(`getApiBaseUrl received value ending with "${suffix}". Normalized to API root: ${normalized}`);
      return normalized;
    }
  }

  return withoutTrailingSlash;
};

const BUNDLER_PORTS = new Set([
  "19000",
  "19001",
  "19002",
  "19006",
  "19007",
  "8081",
  "8080",
  "5173",
]);

const normalizePort = (port: string | null | undefined): string | null => {
  if (!port) {
    return null;
  }

  const digits = port.replace(/[^0-9]/g, "");
  if (digits.length === 0) {
    return null;
  }

  if (BUNDLER_PORTS.has(digits)) {
    return null;
  }

  return digits;
};

const guessFromWindow = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const origin = window.location?.origin;
  if (typeof origin !== "string" || origin.length === 0 || origin === "null") {
    return null;
  }

  try {
    const parsed = new URL(origin);
    const explicitPort = normalizePort(resolveEnv("EXPO_PUBLIC_API_PORT"));
    const fallbackPort = explicitPort ?? "8787";
    const parsedPort = normalizePort(parsed.port) ?? fallbackPort;

    if (parsed.port && BUNDLER_PORTS.has(parsed.port)) {
      return sanitizeUrl(`${parsed.protocol}//${parsed.hostname}:${parsedPort}`);
    }

    if (!parsed.port && parsed.hostname === "localhost") {
      return sanitizeUrl(`${parsed.protocol}//${parsed.hostname}:${parsedPort}`);
    }

    return sanitizeUrl(origin);
  } catch (error) {
    console.error("guessFromWindow failed to parse origin", origin, error);
    return null;
  }
};

const guessFromExpoHost = (): string | null => {
  const rawHost = Constants.expoGoConfig?.debuggerHost ?? Constants.expoConfig?.hostUri;
  if (!rawHost) {
    return null;
  }

  const [hostPart, portPart] = rawHost.split(":");
  if (!hostPart || hostPart.length === 0) {
    return null;
  }

  const normalizedHost = hostPart.replace(/\/$/, "");
  const isLocalHost =
    normalizedHost === "localhost" ||
    normalizedHost.startsWith("127.") ||
    normalizedHost.startsWith("10.") ||
    normalizedHost.startsWith("192.168.") ||
    normalizedHost.endsWith(".local");

  const explicitPort = normalizePort(resolveEnv("EXPO_PUBLIC_API_PORT"));
  const fallbackPort = explicitPort ?? "8787";
  const normalizedPort = normalizePort(portPart) ?? fallbackPort;

  const protocol = isLocalHost ? "http" : "https";
  const portSegment = normalizedPort.length > 0 ? `:${normalizedPort}` : "";

  return sanitizeUrl(`${protocol}://${normalizedHost}${portSegment}`);
};

let cachedBaseUrl: string | null = null;

export const getApiBaseUrl = () => {
  if (cachedBaseUrl) {
    return cachedBaseUrl;
  }

  const explicitUrl = resolveEnv("EXPO_PUBLIC_API_URL");
  if (explicitUrl && explicitUrl.length > 0) {
    cachedBaseUrl = sanitizeUrl(explicitUrl);
    return cachedBaseUrl;
  }

  const expoHostUrl = guessFromExpoHost();
  if (expoHostUrl) {
    console.warn("Using Expo host derived API URL. Configure EXPO_PUBLIC_API_URL to avoid this fallback.");
    cachedBaseUrl = expoHostUrl;
    return cachedBaseUrl;
  }

  const windowUrl = Platform.OS === "web" ? guessFromWindow() : null;
  if (windowUrl) {
    console.warn("Using window origin as API base URL. Configure EXPO_PUBLIC_API_URL for production.");
    cachedBaseUrl = windowUrl;
    return cachedBaseUrl;
  }

  const defaultFallback = sanitizeUrl("http://localhost:8787");
  console.warn(
    "Falling back to default API base URL http://localhost:8787. Set EXPO_PUBLIC_API_URL to your backend endpoint for proper configuration."
  );
  cachedBaseUrl = defaultFallback;
  return cachedBaseUrl;
};

let authToken: string | null = null;

export const setTrpcAuthToken = (token: string | null) => {
  authToken = token;
};

export const getTrpcAuthToken = () => authToken;

export const trpcClient = trpc.createClient({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: `${getApiBaseUrl()}/api/trpc`,
      headers() {
        const baseUrl = getApiBaseUrl();
        console.log("[tRPC] Making request to:", `${baseUrl}/api/trpc`);
        
        if (!authToken) {
          return {};
        }

        return {
          authorization: `Bearer ${authToken}`,
        };
      },
      fetch(url, options) {
        console.log("[tRPC] Fetch URL:", url);
        console.log("[tRPC] Headers:", options?.headers);
        
        return fetch(url, options).then((res) => {
          console.log("[tRPC] Response status:", res.status);
          if (!res.ok && res.status !== 200) {
            console.error("[tRPC] Non-OK response:", res.status, res.statusText);
          }
          return res;
        }).catch((error) => {
          console.error("[tRPC] Fetch error:", error);
          throw error;
        });
      },
    }),
  ],
});
