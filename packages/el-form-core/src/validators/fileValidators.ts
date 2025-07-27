import { ValidatorFunction } from "./types";

export interface FileValidationOptions {
  maxSize?: number;
  minSize?: number;
  maxFiles?: number;
  minFiles?: number;
  acceptedTypes?: string[];
  acceptedExtensions?: string[];
}

/**
 * Format file size for human-readable error messages
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Get file extension from filename
 */
function getFileExtension(fileName: string): string {
  return fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2);
}

/**
 * Validate a single file against options
 */
export function validateFile(
  file: File,
  options: FileValidationOptions
): string | undefined {
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

  return undefined;
}

/**
 * Validate multiple files against options
 */
export function validateFiles(
  files: FileList | File[],
  options: FileValidationOptions
): string | undefined {
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

  return undefined;
}

/**
 * Create a file validator function for el-form's validation system
 */
export function createFileValidator(
  options: FileValidationOptions
): ValidatorFunction {
  return ({ value }) => {
    if (!value) return undefined;

    if (value instanceof File) {
      return validateFile(value, options);
    }

    if (value instanceof FileList || Array.isArray(value)) {
      return validateFiles(value, options);
    }

    return undefined;
  };
}

/**
 * Preset file validators for common use cases
 */
export const fileValidators = {
  /**
   * Image files (JPEG, PNG, GIF, WebP) up to 5MB
   */
  image: createFileValidator({
    acceptedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    maxSize: 5 * 1024 * 1024, // 5MB
  }),

  /**
   * Avatar images (JPEG, PNG) up to 2MB, single file only
   */
  avatar: createFileValidator({
    acceptedTypes: ["image/jpeg", "image/png"],
    maxSize: 2 * 1024 * 1024, // 2MB
    maxFiles: 1,
  }),

  /**
   * Document files (PDF, Word, Text) up to 10MB
   */
  document: createFileValidator({
    acceptedTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ],
    maxSize: 10 * 1024 * 1024, // 10MB
  }),

  /**
   * Image gallery (multiple images) up to 5MB each, max 10 files
   */
  gallery: createFileValidator({
    acceptedTypes: ["image/jpeg", "image/png", "image/gif"],
    maxSize: 5 * 1024 * 1024, // 5MB each
    maxFiles: 10,
  }),

  /**
   * Video files (MP4, WebM, MOV) up to 50MB
   */
  video: createFileValidator({
    acceptedTypes: ["video/mp4", "video/webm", "video/quicktime"],
    maxSize: 50 * 1024 * 1024, // 50MB
  }),

  /**
   * Audio files (MP3, WAV, OGG) up to 20MB
   */
  audio: createFileValidator({
    acceptedTypes: ["audio/mpeg", "audio/wav", "audio/ogg"],
    maxSize: 20 * 1024 * 1024, // 20MB
  }),
};

/**
 * Helper to create custom file validator with specific options
 */
export function fileValidator(
  options: FileValidationOptions
): ValidatorFunction {
  return createFileValidator(options);
}
