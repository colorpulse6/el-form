// Re-export the validation surface from el-form-core (single source of truth).
// These were previously duplicated here (returning `null`); core returns `undefined`.
export {
  validateFile,
  validateFiles,
  type FileValidationOptions,
} from "el-form-core";

export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  formattedSize: string;
  isImage: boolean;
  extension: string;
}

export function getFileInfo(file: File): FileInfo {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    formattedSize: formatFileSize(file.size),
    isImage: file.type.startsWith("image/"),
    extension: getFileExtension(file.name),
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function getFileExtension(fileName: string): string {
  return fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2);
}

export async function getFilePreview(file: File): Promise<string | null> {
  if (!file.type.startsWith("image/")) return null;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}
