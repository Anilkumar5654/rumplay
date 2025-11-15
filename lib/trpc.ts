import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import Constants from "expo-constants";
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

export const getApiBaseUrl = () => {
  const explicitUrl = resolveEnv("EXPO_PUBLIC_API_URL");
  if (explicitUrl && explicitUrl.length > 0) {
    return explicitUrl.replace(/\/$/, "");
  }

  throw new Error("Missing EXPO_PUBLIC_API_URL environment variable");
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
