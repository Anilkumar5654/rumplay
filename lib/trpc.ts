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

const sanitizeUrl = (value: string) => value.replace(/\/$/, "");

const guessFromWindow = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const origin = window.location?.origin;
  if (typeof origin === "string" && origin.length > 0 && origin !== "null") {
    return sanitizeUrl(origin);
  }

  return null;
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

  const explicitPort = resolveEnv("EXPO_PUBLIC_API_PORT");
  const inferredPort = explicitPort ?? portPart ?? "8787";

  const protocol = isLocalHost ? "http" : "https";
  const portSegment = inferredPort.length > 0 ? `:${inferredPort.replace(/[^0-9]/g, "")}` : "";

  if (portSegment.length === 1) {
    return null;
  }

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

  const windowUrl = Platform.OS === "web" ? guessFromWindow() : null;
  if (windowUrl) {
    console.warn("Using window origin as API base URL. Configure EXPO_PUBLIC_API_URL for production.");
    cachedBaseUrl = windowUrl;
    return cachedBaseUrl;
  }

  const expoHostUrl = guessFromExpoHost();
  if (expoHostUrl) {
    console.warn("Using Expo host derived API URL. Configure EXPO_PUBLIC_API_URL to avoid this fallback.");
    cachedBaseUrl = expoHostUrl;
    return cachedBaseUrl;
  }

  throw new Error("Missing EXPO_PUBLIC_API_URL environment variable and unable to derive a fallback base URL");
};

let authToken: string | null = null;

export const setTrpcAuthToken = (token: string | null) => {
  authToken = token;
};

export const getTrpcAuthToken = () => authToken;

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${getApiBaseUrl()}/api/trpc`,
      transformer: superjson,
      headers() {
        if (!authToken) {
          return {};
        }

        return {
          authorization: `Bearer ${authToken}`,
        };
      },
    }),
  ],
});
