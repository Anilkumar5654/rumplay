import { Platform } from "react-native";
import { File } from "expo-file-system";
import { getEnvApiRootUrl } from "./env";

const LOG_PREFIX = "[UploadHelpers]";

type UploadResponse = {
  success: boolean;
  url?: string;
  path?: string;
  filename?: string;
  error?: string;
  message?: string;
};

type VideoUploadOptions = {
  videoUri: string;
  thumbnailUri?: string;
  title: string;
  description?: string;
  isShort?: boolean;
  token: string;
};

const readFileAsBase64 = async (uri: string): Promise<string> => {
  if (Platform.OS === "web") {
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error("Unable to access file data");
    }
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        if (typeof result === "string") {
          const base64String = result.split(",").pop();
          if (base64String) {
            resolve(base64String);
            return;
          }
        }
        reject(new Error("Failed to process file"));
      };
      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };
      reader.readAsDataURL(blob);
    });
  }

  try {
    const file = new File(uri);
    const base64Data = await file.text();
    return base64Data;
  } catch (error) {
    console.error(`${LOG_PREFIX} readFileAsBase64 error`, error);
    throw new Error("Failed to read file as Base64");
  }
};

const inferExtension = (uri: string, fallback: string): string => {
  const sanitized = uri.split("?")[0];
  const segment = sanitized.split("/").pop() ?? "";
  const ext = segment.split(".").pop();
  return ext ? ext.toLowerCase() : fallback;
};

const mimeFromExtension = (extension: string): string => {
  switch (extension) {
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "mp4":
      return "video/mp4";
    case "mov":
      return "video/quicktime";
    case "m4v":
      return "video/x-m4v";
    case "webm":
      return "video/webm";
    case "3gp":
      return "video/3gpp";
    default:
      return "application/octet-stream";
  }
};

export const uploadVideoToBackend = async (options: VideoUploadOptions): Promise<UploadResponse> => {
  const { videoUri, thumbnailUri, title, description, isShort, token } = options;

  try {
    const apiRoot = getEnvApiRootUrl();
    const uploadEndpoint = isShort ? `${apiRoot}/shorts/upload.php` : `${apiRoot}/video/upload.php`;

    console.log(`${LOG_PREFIX} Uploading ${isShort ? "short" : "video"} to ${uploadEndpoint}`);

    const videoExtension = inferExtension(videoUri, "mp4");
    const videoMimeType = mimeFromExtension(videoExtension);
    const videoBase64 = await readFileAsBase64(videoUri);

    const formData = new FormData();
    formData.append("title", title);
    if (description) {
      formData.append("description", description);
    }

    const videoBlob = await (async () => {
      if (Platform.OS === "web") {
        const response = await fetch(videoUri);
        return await response.blob();
      }
      const base64String = videoBase64.includes("base64,") ? videoBase64.split("base64,")[1] : videoBase64;
      const byteCharacters = atob(base64String);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: videoMimeType });
    })();

    formData.append("video", videoBlob, `video-${Date.now()}.${videoExtension}`);

    if (thumbnailUri) {
      const thumbnailExtension = inferExtension(thumbnailUri, "jpg");
      const thumbnailMimeType = mimeFromExtension(thumbnailExtension);
      const thumbnailBase64 = await readFileAsBase64(thumbnailUri);

      const thumbnailBlob = await (async () => {
        if (Platform.OS === "web") {
          const response = await fetch(thumbnailUri);
          return await response.blob();
        }
        const base64String = thumbnailBase64.includes("base64,") ? thumbnailBase64.split("base64,")[1] : thumbnailBase64;
        const byteCharacters = atob(base64String);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: thumbnailMimeType });
      })();

      formData.append("thumbnail", thumbnailBlob, `thumbnail-${Date.now()}.${thumbnailExtension}`);
    }

    const response = await fetch(uploadEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      const raw = await response.text();
      console.error(`${LOG_PREFIX} Non-JSON response`, raw);
      throw new Error("Server returned invalid response. Expected JSON.");
    }

    const result = (await response.json()) as UploadResponse;

    if (!response.ok || !result.success) {
      const errorMessage = result.error ?? result.message ?? "Upload failed";
      console.error(`${LOG_PREFIX} Upload failed`, errorMessage);
      throw new Error(errorMessage);
    }

    console.log(`${LOG_PREFIX} Upload successful`, result.url);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown upload error";
    console.error(`${LOG_PREFIX} uploadVideoToBackend error`, message, error);
    return {
      success: false,
      error: message,
    };
  }
};

export const uploadMediaFile = async (
  uri: string,
  fileName: string,
  folder: "videos" | "shorts" | "thumbnails" | "profiles",
  token: string
): Promise<UploadResponse> => {
  try {
    const apiRoot = getEnvApiRootUrl();
    const uploadEndpoint = `${apiRoot}/upload.php`;

    console.log(`${LOG_PREFIX} Uploading media file to ${uploadEndpoint}`);

    const extension = inferExtension(uri, "jpg");
    const mimeType = mimeFromExtension(extension);
    const base64Data = await readFileAsBase64(uri);

    const response = await fetch(uploadEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        fileName: fileName || `file-${Date.now()}.${extension}`,
        fileData: `data:${mimeType};base64,${base64Data}`,
        folder,
        mimeType,
      }),
    });

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      const raw = await response.text();
      console.error(`${LOG_PREFIX} Non-JSON response`, raw);
      throw new Error("Server returned invalid response. Expected JSON.");
    }

    const result = (await response.json()) as UploadResponse;

    if (!response.ok || !result.success) {
      const errorMessage = result.error ?? result.message ?? "Upload failed";
      console.error(`${LOG_PREFIX} Upload failed`, errorMessage);
      throw new Error(errorMessage);
    }

    console.log(`${LOG_PREFIX} Media upload successful`, result.url);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown upload error";
    console.error(`${LOG_PREFIX} uploadMediaFile error`, message, error);
    return {
      success: false,
      error: message,
    };
  }
};

export { readFileAsBase64 };
