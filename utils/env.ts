const normalizeBaseUrl = (url: string) => url.trim().replace(/\/+$/, "");

let cachedBaseUrl: string | null = null;

export const getEnvApiBaseUrl = (): string => {
  if (cachedBaseUrl) {
    return cachedBaseUrl;
  }
  const raw = process.env.EXPO_PUBLIC_API_URL || "https://moviedbr.com";
  const normalized = normalizeBaseUrl(raw);
  if (!/^https?:\/\//i.test(normalized)) {
    throw new Error("Backend URL must start with http:// or https://");
  }
  cachedBaseUrl = normalized;
  return cachedBaseUrl;
};

const ensureApiRoot = (baseUrl: string): string => {
  if (/\/api$/i.test(baseUrl)) {
    return baseUrl;
  }
  return `${baseUrl}/api`;
};

export const getEnvApiRootUrl = (): string => {
  const base = getEnvApiBaseUrl();
  return ensureApiRoot(base);
};

export const getEnvTrpcEndpoint = (): string => {
  const root = getEnvApiRootUrl();
  return `${root}/trpc`;
};

export const getEnvUploadEndpoint = (): string => {
  const root = getEnvApiRootUrl();
  return `${root}/upload.php`;
};
