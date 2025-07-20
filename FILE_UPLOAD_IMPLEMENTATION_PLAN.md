# 📁 File Upload Support Implementation Plan

> **Comprehensive plan for adding file upload capabilities to el-form**  
> **Target:** Full file input support with validation, preview, and management

---

## 🎯 **Overview**

This plan outlines the implementation of native file upload support in el-form, making it the first form library to provide comprehensive file handling with zero configuration.

### **Current State**

- ❌ No file input support
- ❌ `register()` doesn't handle `type="file"`
- ❌ No file validation
- ❌ No file management utilities

### **Target State**

- ✅ Automatic file input detection
- ✅ File validation (size, type, count)
- ✅ File preview and management
- ✅ Upload progress tracking
- ✅ Drag & drop support

---

## 📋 **Implementation Phases**

### **Phase 1: Core File Input Support** 🔴 Critical

#### **1.1 Update register() Function**

**Location:** `packages/el-form-react-hooks/src/useForm.ts`

```typescript
// Current register function needs to detect file inputs
const register = useCallback((name: string) => {
  const fieldName = name as keyof T;
  const fieldValue = getNestedValue(formState.values, name) ?? "";

  // NEW: Detect if this is a file input
  const inputRef = useRef<HTMLInputElement>(null);

  const baseProps = {
    name,
    ref: inputRef,
    onChange: async (e: React.ChangeEvent<HTMLInputElement>) => {
      // NEW: Handle file inputs differently
      if (e.target.type === "file") {
        const files = e.target.files;
        const value = e.target.multiple
          ? files // FileList for multiple
          : files?.[0] || null; // Single File or null

        // Update form state with file(s)
        handleFileChange(name, value);
      } else {
        // Existing logic for other inputs
        const value = isCheckbox ? e.target.checked : e.target.value;
        handleValueChange(name, value);
      }
    },
  };

  // Return different props for file inputs
  if (inputRef.current?.type === "file") {
    return {
      ...baseProps,
      // Don't set value for file inputs (read-only)
      files: getNestedValue(formState.values, name),
    };
  }

  return isCheckbox
    ? { ...baseProps, checked: Boolean(fieldValue) }
    : { ...baseProps, value: fieldValue || "" };
});
```

#### **1.2 Update Type Definitions**

**Location:** `packages/el-form-react-hooks/src/types.ts`

```typescript
// Update register return type
export interface UseFormReturn<T extends Record<string, any>> {
  register: (name: string) => {
    name: string;
    ref: React.RefObject<HTMLInputElement>;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  } & (
    | { checked: boolean; value?: never; files?: never }
    | { value: any; checked?: never; files?: never }
    | { files: FileList | File | null; value?: never; checked?: never }
  );

  // NEW: File-specific methods
  addFile: (name: string, file: File) => void;
  removeFile: (name: string, index?: number) => void;
  clearFiles: (name: string) => void;
  getFileInfo: (file: File) => FileInfo;
  getFilePreview: (file: File) => Promise<string | null>;
}

// NEW: File-related types
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
```

#### **1.3 Add File Utilities**

**Location:** `packages/el-form-react-hooks/src/utils/fileUtils.ts` (NEW FILE)

```typescript
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
```

---

### **Phase 2: File Validation Integration** 🟡 High Priority

#### **2.1 Extend Validation System**

**Location:** `packages/el-form-core/src/validators/fileValidators.ts` (NEW FILE)

```typescript
import { ValidatorFunction } from "./types";
import {
  FileValidationOptions,
  validateFile,
  validateFiles,
} from "../utils/fileUtils";

export function createFileValidator(
  options: FileValidationOptions
): ValidatorFunction {
  return ({ value, fieldName }) => {
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

// Preset validators
export const fileValidators = {
  image: createFileValidator({
    acceptedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    maxSize: 5 * 1024 * 1024, // 5MB
  }),

  document: createFileValidator({
    acceptedTypes: ["application/pdf", "application/msword", "text/plain"],
    maxSize: 10 * 1024 * 1024, // 10MB
  }),

  avatar: createFileValidator({
    acceptedTypes: ["image/jpeg", "image/png"],
    maxSize: 2 * 1024 * 1024, // 2MB
    maxFiles: 1,
  }),

  gallery: createFileValidator({
    acceptedTypes: ["image/jpeg", "image/png", "image/gif"],
    maxSize: 5 * 1024 * 1024, // 5MB each
    maxFiles: 10,
  }),
};
```

#### **2.2 Update useForm Options**

```typescript
export interface UseFormOptions<T extends Record<string, any>> {
  defaultValues?: Partial<T>;
  validators?: ValidatorConfig;
  onSubmit?: (values: T) => void | Promise<void>;
  fieldValidators?: Partial<Record<keyof T, ValidatorConfig>>;

  // NEW: File-specific validation
  fileValidators?: Partial<Record<keyof T, FileValidationOptions>>;

  mode?: "onChange" | "onBlur" | "onSubmit" | "all";
  validateOn?: "onChange" | "onBlur" | "onSubmit" | "manual";
}
```

---

### **Phase 3: File Management Methods** 🟡 High Priority

#### **3.1 Implement File Management**

**Location:** `packages/el-form-react-hooks/src/useForm.ts`

```typescript
// Add to useForm return object
const addFile = useCallback(
  (name: string, file: File) => {
    const currentValue = getNestedValue(formState.values, name);

    if (currentValue instanceof FileList || Array.isArray(currentValue)) {
      // Add to existing files
      const newFiles = [...Array.from(currentValue), file];
      setValue(name, newFiles);
    } else {
      // Replace single file or set new file
      setValue(name, file);
    }
  },
  [setValue, formState.values]
);

const removeFile = useCallback(
  (name: string, index?: number) => {
    const currentValue = getNestedValue(formState.values, name);

    if (
      typeof index === "number" &&
      (currentValue instanceof FileList || Array.isArray(currentValue))
    ) {
      // Remove specific file by index
      const files = Array.from(currentValue);
      files.splice(index, 1);
      setValue(name, files);
    } else {
      // Clear all files
      setValue(name, null);
    }
  },
  [setValue, formState.values]
);

const clearFiles = useCallback(
  (name: string) => {
    setValue(name, null);
  },
  [setValue]
);

return {
  // ... existing methods
  addFile,
  removeFile,
  clearFiles,
  getFileInfo,
  getFilePreview,
};
```

---

### **Phase 4: File Preview & UI Components** 🟢 Medium Priority

#### **4.1 Create File Preview Components**

**Location:** `packages/el-form-react-components/src/FilePreview.tsx` (NEW FILE)

```typescript
import React from "react";
import { getFileInfo, getFilePreview } from "el-form-core";

interface FilePreviewProps {
  file: File;
  onRemove?: () => void;
  showPreview?: boolean;
  className?: string;
}

export function FilePreview({
  file,
  onRemove,
  showPreview = true,
  className = "",
}: FilePreviewProps) {
  const [preview, setPreview] = React.useState<string | null>(null);
  const fileInfo = getFileInfo(file);

  React.useEffect(() => {
    if (showPreview && fileInfo.isImage) {
      getFilePreview(file).then(setPreview);
    }
  }, [file, showPreview, fileInfo.isImage]);

  return (
    <div className={`file-preview ${className}`}>
      {preview && (
        <img src={preview} alt={file.name} className="file-preview-image" />
      )}

      <div className="file-info">
        <span className="file-name">{file.name}</span>
        <span className="file-size">{fileInfo.formattedSize}</span>
      </div>

      {onRemove && (
        <button type="button" onClick={onRemove} className="file-remove-btn">
          ×
        </button>
      )}
    </div>
  );
}
```

#### **4.2 Create File Drop Zone**

**Location:** `packages/el-form-react-components/src/FileDropZone.tsx` (NEW FILE)

```typescript
import React from "react";

interface FileDropZoneProps {
  onFilesAdded: (files: FileList) => void;
  accept?: string;
  multiple?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FileDropZone({
  onFilesAdded,
  accept,
  multiple = false,
  children,
  className = "",
}: FileDropZoneProps) {
  const [isDragActive, setIsDragActive] = React.useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFilesAdded(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  return (
    <div
      className={`file-drop-zone ${isDragActive ? "active" : ""} ${className}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {children}
    </div>
  );
}
```

---

### **Phase 5: Upload Integration** 🟢 Medium Priority

#### **5.1 Upload Progress Tracking**

**Location:** `packages/el-form-react-hooks/src/utils/uploadUtils.ts` (NEW FILE)

```typescript
export interface UploadOptions {
  url: string;
  method?: "POST" | "PUT";
  headers?: Record<string, string>;
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
  onSuccess?: (response: any) => void;
}

export interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  success: boolean;
}

export async function uploadFile(
  file: File,
  options: UploadOptions
): Promise<any> {
  const formData = new FormData();
  formData.append("file", file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const progress = (e.loaded / e.total) * 100;
        options.onProgress?.(progress);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const response = JSON.parse(xhr.responseText);
        options.onSuccess?.(response);
        resolve(response);
      } else {
        const error = new Error(`Upload failed: ${xhr.statusText}`);
        options.onError?.(error);
        reject(error);
      }
    });

    xhr.addEventListener("error", () => {
      const error = new Error("Upload failed");
      options.onError?.(error);
      reject(error);
    });

    xhr.open(options.method || "POST", options.url);

    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
    }

    xhr.send(formData);
  });
}

export function useFileUpload() {
  const [uploadStates, setUploadStates] = React.useState<
    Record<string, UploadState>
  >({});

  const uploadFile = useCallback(
    async (fieldName: string, file: File, options: UploadOptions) => {
      setUploadStates((prev) => ({
        ...prev,
        [fieldName]: {
          isUploading: true,
          progress: 0,
          error: null,
          success: false,
        },
      }));

      try {
        const response = await uploadFile(file, {
          ...options,
          onProgress: (progress) => {
            setUploadStates((prev) => ({
              ...prev,
              [fieldName]: { ...prev[fieldName], progress },
            }));
            options.onProgress?.(progress);
          },
        });

        setUploadStates((prev) => ({
          ...prev,
          [fieldName]: {
            isUploading: false,
            progress: 100,
            error: null,
            success: true,
          },
        }));

        return response;
      } catch (error) {
        setUploadStates((prev) => ({
          ...prev,
          [fieldName]: {
            isUploading: false,
            progress: 0,
            error: error.message,
            success: false,
          },
        }));
        throw error;
      }
    },
    []
  );

  return { uploadStates, uploadFile };
}
```

---

## 🏗️ **Development Timeline**

### **Week 1-2: Phase 1 - Core Implementation**

- [ ] Update `register()` function for file detection
- [ ] Modify type definitions
- [ ] Create basic file utilities
- [ ] Update form state handling for files
- [ ] Write unit tests for core functionality

### **Week 3: Phase 2 - Validation**

- [ ] Implement file validation system
- [ ] Create preset validators (image, document, etc.)
- [ ] Integrate validation with existing system
- [ ] Add file validation tests

### **Week 4: Phase 3 - File Management**

- [ ] Implement `addFile`, `removeFile`, `clearFiles` methods
- [ ] Add file manipulation capabilities
- [ ] Create comprehensive file management tests
- [ ] Update documentation

### **Week 5-6: Phase 4 - UI Components**

- [ ] Create `FilePreview` component
- [ ] Implement `FileDropZone` component
- [ ] Add file management UI utilities
- [ ] Style components and add CSS
- [ ] Create interactive examples

### **Week 7: Phase 5 - Upload Integration**

- [ ] Implement upload progress tracking
- [ ] Create upload utilities
- [ ] Add upload state management
- [ ] Build upload examples and documentation

### **Week 8: Polish & Documentation**

- [ ] Complete testing suite
- [ ] Write comprehensive documentation
- [ ] Create migration guide
- [ ] Prepare release notes

---

## 🧪 **Testing Strategy**

### **Unit Tests**

- File input detection and handling
- File validation logic
- File management methods
- Upload utilities
- Type safety verification

### **Integration Tests**

- Complete file upload workflows
- Validation integration
- Form submission with files
- Error handling scenarios

### **Browser Compatibility Tests**

- File API support across browsers
- Drag & drop functionality
- Upload progress tracking
- Mobile device testing

---

## 📖 **Documentation Plan**

### **New Documentation Pages**

1. **File Upload Guide** - Complete guide to file handling
2. **File Validation** - Validation options and examples
3. **File Management** - Preview, drag & drop, upload
4. **Migration Guide** - Upgrading existing forms

### **Updated Documentation**

- Update `useForm` API reference
- Add file examples to existing guides
- Update TypeScript documentation
- Add file upload to AutoForm docs

---

## 🚀 **Release Strategy**

### **Version Planning**

- **v4.0.0** - Major release with file upload support
- Breaking changes to `register()` return type
- New peer dependencies for file handling
- Comprehensive migration guide

### **Backwards Compatibility**

- Maintain existing API for non-file inputs
- Gradual migration path for existing users
- Clear deprecation warnings where needed

---

## 💡 **Example Usage After Implementation**

```typescript
function FileUploadForm() {
  const { register, handleSubmit, addFile, removeFile, getFilePreview } =
    useForm({
      defaultValues: {
        avatar: null,
        documents: [],
        name: "",
      },
      fileValidators: {
        avatar: {
          maxSize: 2 * 1024 * 1024,
          acceptedTypes: ["image/jpeg", "image/png"],
        },
        documents: { maxFiles: 5, acceptedTypes: ["application/pdf"] },
      },
    });

  return (
    <form
      onSubmit={handleSubmit((data) => {
        console.log("Form data:", data);
        console.log("Avatar file:", data.avatar);
        console.log("Documents:", data.documents);
      })}
    >
      <input {...register("name")} placeholder="Name" />

      {/* Single file upload */}
      <input type="file" accept="image/*" {...register("avatar")} />

      {/* Multiple file upload */}
      <input type="file" multiple accept=".pdf" {...register("documents")} />

      <button type="submit">Submit</button>
    </form>
  );
}
```

This comprehensive plan provides a roadmap for implementing full file upload support in el-form, making it a complete form solution with zero-configuration file handling.
