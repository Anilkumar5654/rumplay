import { mkdirSync, existsSync } from "fs";
import path from "path";

const folders = {
  videos: "videos",
  shorts: "shorts",
  thumbnails: "thumbnails",
  profiles: "profiles",
  banners: "banners",
  logs: "logs",
  temp: "temp",
} as const;

type UploadFolder = keyof typeof folders;

type EnsureResult = {
  absolutePath: string;
  relativePath: string;
  filename: string;
};

const uploadRoot = path.join(process.cwd(), "upload");

const sanitizeFilename = (rawName: string): string => {
  const trimmed = rawName.trim().replace(/\s+/g, "-");
  const cleaned = trimmed.replace(/[^a-zA-Z0-9_.-]/g, "");
  return cleaned.length > 0 ? cleaned : `file-${Date.now()}`;
};

export const ensureUploadDirs = (): void => {
  if (!existsSync(uploadRoot)) {
    mkdirSync(uploadRoot, { recursive: true });
  }

  Object.values(folders).forEach((folderName) => {
    const fullPath = path.join(uploadRoot, folderName);
    if (!existsSync(fullPath)) {
      mkdirSync(fullPath, { recursive: true });
    }
  });
};

export const resolveUploadPath = (folder: UploadFolder, rawFilename: string): EnsureResult => {
  const safeName = sanitizeFilename(rawFilename);
  const timestamp = Date.now();
  const uniqueName = `${timestamp}-${safeName}`;
  const relativePath = path.join("upload", folders[folder], uniqueName);
  const absolutePath = path.join(process.cwd(), relativePath);
  return {
    absolutePath,
    relativePath,
    filename: uniqueName,
  };
};
