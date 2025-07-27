export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  formattedSize: string;
  isImage: boolean;
  extension: string;
}

export interface FileValidationOptions {
  maxSize?: number;
  minSize?: number;
  maxFiles?: number;
  minFiles?: number;
  acceptedTypes?: string[];
  acceptedExtensions?: string[];
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

export function validateFile(
  file: File,
  options: FileValidationOptions
): string | null {
  if (options.maxSize && file.size > options.maxSize) {
    return `File size must be less than ${formatFileSize(options.maxSize)}`;
  }

  if (options.minSize && file.size < options.minSize) {
    return `File size must be at least ${formatFileSize(options.minSize)}`;
  }

  if (options.acceptedTypes && !options.acceptedTypes.includes(file.type)) {
    return `File type ${file.type} is not allowed`;
  }

  if (options.acceptedExtensions) {
    const ext = getFileExtension(file.name).toLowerCase();
    if (!options.acceptedExtensions.includes(ext)) {
      return `File extension .${ext} is not allowed`;
    }
  }

  return null;
}

export function validateFiles(
  files: FileList | File[],
  options: FileValidationOptions
): string | null {
  const fileArray = Array.from(files);

  if (options.maxFiles && fileArray.length > options.maxFiles) {
    return `Maximum ${options.maxFiles} files allowed`;
  }

  if (options.minFiles && fileArray.length < options.minFiles) {
    return `Minimum ${options.minFiles} files required`;
  }

  // Validate each file
  for (const file of fileArray) {
    const error = validateFile(file, options);
    if (error) return error;
  }

  return null;
}
