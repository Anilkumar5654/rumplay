const normalizeBaseUrl = (url: string) => url.trim().replace(/\/+$/, "");

let cachedBaseUrl: string | null = null;

export const getEnvApiBaseUrl = (): string => {
  if (cachedBaseUrl) {
    return cachedBaseUrl;
  }
  const raw = process.env.EXPO_PUBLIC_API_URL;
  if (!raw || raw.trim().length === 0) {
    throw new Error("Backend URL not configured");
  }
  const normalized = normalizeBaseUrl(raw);
  if (!/^https?:\/\//i.test(normalized)) {
    throw new Error("Backend URL not configured");
  }
  cachedBaseUrl = normalized;
  return cachedBaseUrl;
};

export const getEnvApiRootUrl = (): string => {
  const base = getEnvApiBaseUrl();
  return `${base}/api`;
};

export const getEnvTrpcEndpoint = (): string => {
  const root = getEnvApiRootUrl();
  return `${root}/trpc`;
};

export const getEnvUploadEndpoint = (): string => {
  const root = getEnvApiRootUrl();
  return `${root}/upload.php`;
};
