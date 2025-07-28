---
sidebar_position: 5
---

# Handling Field Types

The `useForm` hook automatically handles value extraction for different input types based on the `type` attribute of your `input` element. This makes it easy to work with native HTML inputs without writing custom logic.

## Number Inputs

When you use `type="number"`, `useForm` automatically handles type conversion for you:

- **Valid numbers**: Automatically converted from string to number
- **Empty inputs**: Treated as `undefined` (not empty string)
- **Invalid inputs**: Remain as string for validation to handle

This means you don't need to use `z.coerce.number()` in your Zod schemas - the form library handles the conversion automatically and in a way that's compatible with optional number fields.

```tsx
// ✅ This works automatically - no z.coerce needed
const schema = z.object({
  age: z.number().min(18).optional(), // Empty input = undefined, not validation error
  requiredAge: z.number().min(18), // Required number field
});

// The form handles type conversion automatically
<input type="number" {...register("age")} />;
```

## Checkbox Inputs

For `type="checkbox"`, `useForm` correctly uses the `checked` property to get a boolean `true` or `false` value.

## File Inputs

When you use `type="file"`, `useForm` automatically detects file inputs and handles them appropriately:

- **Single files**: Returns a `File` object or `null`
- **Multiple files**: Returns an array of `File` objects
- **File management**: Provides methods to add, remove, and clear files programmatically
- **File information**: Built-in utilities to extract file metadata and generate previews
- **Automatic previews**: Image previews are automatically generated and available at `formState.filePreview.fieldName`

### File Management Methods

The `useForm` hook provides several methods for working with files:

```tsx
const {
  register,
  addFile,
  removeFile,
  clearFiles,
  getFileInfo,
  getFilePreview,
  formState,
} = useForm();

// Add a file programmatically
addFile("documents", myFile);

// Remove a specific file by index (for multiple files)
removeFile("documents", 0);

// Clear all files from a field
clearFiles("avatar");

// Get detailed file information
const info = getFileInfo(file); // { name, size, type, formattedSize, isImage, etc. }

// Generate preview for images (manual method)
const preview = await getFilePreview(file); // Returns data URL or null

// Access automatic previews (recommended)
const avatarPreview = formState.filePreview.avatar; // Auto-generated preview
```

### Basic File Input Example

```typescript
import { useForm } from "el-form-react-hooks";

interface FileFormData {
  avatar: File | null;
  documents: File[];
  name: string;
}

function BasicFileUploadForm() {
  const {
    register,
    handleSubmit,
    formState,
    getFileInfo,
    clearFiles,
    filePreview,
  } = useForm<FileFormData>({
    defaultValues: {
      avatar: null,
      documents: [],
      name: "",
    },
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <div>
        <label>Name</label>
        <input {...register("name")} />
      </div>

      <div>
        <label>Avatar (Single Image)</label>
        <input type="file" accept="image/*" {...register("avatar")} />

        {/* Show preview and file info */}
        {formState.values.avatar && (
          <div>
            {filePreview.avatar && (
              <img src={filePreview.avatar} alt="Preview" width="100" />
            )}
            <p>File: {getFileInfo(formState.values.avatar).formattedSize}</p>
            <button type="button" onClick={() => clearFiles("avatar")}>
              Clear
            </button>
          </div>
        )}
      </div>

      <div>
        <label>Documents (Multiple Files)</label>
        <input
          type="file"
          multiple
          accept=".pdf,.txt"
          {...register("documents")}
        />

        {/* Show selected files */}
        {formState.values.documents?.map((file, index) => (
          <div key={index}>
            📄 {file.name} ({getFileInfo(file).formattedSize})
          </div>
        ))}
      </div>

      <button type="submit">Submit</button>
    </form>
  );
}
```

## File Validation

El Form provides comprehensive file validation with both preset validators for common use cases and the ability to create custom validators for specific requirements.

### Preset File Validators

Use built-in validators for common file types:

```typescript
import { useForm } from "el-form-react-hooks";
import { fileValidators } from "el-form-core";

function ValidatedFileForm() {
  const { register, handleSubmit, formState } = useForm({
    defaultValues: {
      avatar: null,
      documents: [],
      gallery: [],
    },
    fieldValidators: {
      // Avatar: JPEG/PNG, max 2MB, single file
      avatar: { onChange: fileValidators.avatar },

      // Documents: PDF/Word/Text, max 10MB each
      documents: { onChange: fileValidators.document },

      // Gallery: Images, max 5MB each, up to 10 files
      gallery: { onChange: fileValidators.gallery },
    },
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <div>
        <label>Profile Picture</label>
        <input type="file" accept="image/*" {...register("avatar")} />
        {formState.errors.avatar && (
          <p className="error">{formState.errors.avatar}</p>
        )}
      </div>

      <div>
        <label>Documents</label>
        <input
          type="file"
          multiple
          accept=".pdf,.doc,.txt"
          {...register("documents")}
        />
        {formState.errors.documents && (
          <p className="error">{formState.errors.documents}</p>
        )}
      </div>

      <button type="submit">Submit</button>
    </form>
  );
}
```

**Available Preset Validators:**

- **`fileValidators.avatar`** - Profile pictures (JPEG/PNG, max 2MB, single file)
- **`fileValidators.image`** - General images (JPEG/PNG/GIF/WebP, max 5MB)
- **`fileValidators.document`** - Documents (PDF/Word/Text, max 10MB)
- **`fileValidators.gallery`** - Image galleries (max 10 images, 5MB each)
- **`fileValidators.video`** - Videos (MP4/WebM/MOV, max 50MB)
- **`fileValidators.audio`** - Audio files (MP3/WAV/OGG, max 20MB)

### Custom File Validators

Create validators with specific requirements:

```typescript
import { fileValidator } from "el-form-core";

function CustomValidationForm() {
  const { register, formState } = useForm({
    defaultValues: {
      resume: null,
      portfolio: [],
      presentations: [],
    },
    fieldValidators: {
      // Custom resume validator
      resume: {
        onChange: fileValidator({
          acceptedTypes: ["application/pdf"],
          maxSize: 5 * 1024 * 1024, // 5MB
          maxFiles: 1,
        }),
      },

      // Custom portfolio validator
      portfolio: {
        onChange: fileValidator({
          acceptedTypes: ["image/jpeg", "image/png", "image/gif"],
          maxSize: 3 * 1024 * 1024, // 3MB each
          maxFiles: 8,
          minFiles: 2, // Require at least 2 images
        }),
      },

      // Custom presentation validator
      presentations: {
        onChange: fileValidator({
          acceptedExtensions: ["ppt", "pptx", "pdf"],
          maxSize: 25 * 1024 * 1024, // 25MB each
          maxFiles: 5,
        }),
      },
    },
  });

  return (
    <form>
      <div>
        <label>Resume (PDF only, max 5MB)</label>
        <input type="file" accept=".pdf" {...register("resume")} />
        {formState.errors.resume && (
          <p className="error">{formState.errors.resume}</p>
        )}
      </div>

      <div>
        <label>Portfolio (2-8 images, max 3MB each)</label>
        <input
          type="file"
          multiple
          accept="image/*"
          {...register("portfolio")}
        />
        {formState.errors.portfolio && (
          <p className="error">{formState.errors.portfolio}</p>
        )}
      </div>

      <button type="submit">Submit</button>
    </form>
  );
}
```

### File Validation Options

When creating custom file validators, you can specify:

```typescript
fileValidator({
  // Size limits
  maxSize: 5 * 1024 * 1024, // Maximum file size in bytes (5MB)
  minSize: 1024, // Minimum file size in bytes (1KB)

  // File count limits (for multiple files)
  maxFiles: 10, // Maximum number of files
  minFiles: 2, // Minimum number of files

  // File type restrictions
  acceptedTypes: [
    // MIME types
    "image/jpeg",
    "image/png",
    "application/pdf",
  ],

  acceptedExtensions: [
    // File extensions
    "jpg",
    "jpeg",
    "png",
    "pdf",
  ],
});
```

### Real-World Validation Examples

#### Job Application Form

```typescript
function JobApplicationForm() {
  const { register, handleSubmit, formState, filePreview } = useForm({
    defaultValues: {
      resume: null,
      coverLetter: null,
      portfolio: [],
      references: [],
    },
    fieldValidators: {
      resume: {
        onChange: fileValidator({
          acceptedTypes: ["application/pdf"],
          maxSize: 5 * 1024 * 1024,
          maxFiles: 1,
        }),
      },
      coverLetter: {
        onChange: fileValidator({
          acceptedTypes: ["application/pdf", "text/plain"],
          maxSize: 2 * 1024 * 1024,
          maxFiles: 1,
        }),
      },
      portfolio: {
        onChange: fileValidator({
          acceptedTypes: ["image/jpeg", "image/png", "application/pdf"],
          maxSize: 10 * 1024 * 1024,
          maxFiles: 5,
          minFiles: 1,
        }),
      },
    },
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <div>
        <label>Resume (Required - PDF, max 5MB)</label>
        <input type="file" accept=".pdf" {...register("resume")} />
        {formState.errors.resume && (
          <p className="error">{formState.errors.resume}</p>
        )}
      </div>

      <div>
        <label>Cover Letter (PDF or Text, max 2MB)</label>
        <input type="file" accept=".pdf,.txt" {...register("coverLetter")} />
        {formState.errors.coverLetter && (
          <p className="error">{formState.errors.coverLetter}</p>
        )}
      </div>

      <div>
        <label>Portfolio (1-5 files: Images or PDFs, max 10MB each)</label>
        <input
          type="file"
          multiple
          accept="image/*,.pdf"
          {...register("portfolio")}
        />
        {formState.errors.portfolio && (
          <p className="error">{formState.errors.portfolio}</p>
        )}

        {/* Show portfolio previews */}
        {formState.values.portfolio?.map((file, index) => (
          <div key={index}>
            📎 {file.name} ({getFileInfo(file).formattedSize})
          </div>
        ))}
      </div>

      <button type="submit" disabled={!formState.isValid}>
        Submit Application
      </button>
    </form>
  );
}
```

#### User Profile Form

```typescript
function UserProfileForm() {
  const { register, handleSubmit, formState, filePreview } = useForm({
    defaultValues: {
      profilePicture: null,
      backgroundImage: null,
      documents: [],
    },
    fieldValidators: {
      profilePicture: { onChange: fileValidators.avatar },
      backgroundImage: {
        onChange: fileValidator({
          acceptedTypes: ["image/jpeg", "image/png"],
          maxSize: 8 * 1024 * 1024, // 8MB for high-res backgrounds
          maxFiles: 1,
        }),
      },
      documents: { onChange: fileValidators.document },
    },
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <div>
        <label>Profile Picture</label>
        <input type="file" accept="image/*" {...register("profilePicture")} />
        {filePreview.profilePicture && (
          <img src={filePreview.profilePicture} alt="Profile" width="100" />
        )}
        {formState.errors.profilePicture && (
          <p className="error">{formState.errors.profilePicture}</p>
        )}
      </div>

      <div>
        <label>Background Image (High Resolution)</label>
        <input type="file" accept="image/*" {...register("backgroundImage")} />
        {formState.errors.backgroundImage && (
          <p className="error">{formState.errors.backgroundImage}</p>
        )}
      </div>

      <button type="submit">Update Profile</button>
    </form>
  );
}
```

### Error Handling

File validation errors appear automatically in `formState.errors` and can be displayed like any other validation error:

```typescript
// Error messages are user-friendly and specific
{
  formState.errors.avatar && (
    <div className="error-message">
      {formState.errors.avatar}
      {/* Examples of error messages:
        "File size must be less than 2.00 MB"
        "File type image/gif is not allowed" 
        "Maximum 1 files allowed"
    */}
    </div>
  );
}
```

### Common Validation Scenarios

```typescript
// Large file uploads (videos, archives)
const largeFileValidator = fileValidator({
  maxSize: 100 * 1024 * 1024, // 100MB
  acceptedTypes: ["video/mp4", "application/zip"],
});

// Strict image requirements
const strictImageValidator = fileValidator({
  acceptedTypes: ["image/jpeg", "image/png"],
  maxSize: 1 * 1024 * 1024, // 1MB
  minSize: 50 * 1024, // 50KB minimum
});

// Document collection
const documentCollectionValidator = fileValidator({
  acceptedExtensions: ["pdf", "doc", "docx", "txt"],
  maxFiles: 20,
  minFiles: 1,
  maxSize: 15 * 1024 * 1024, // 15MB each
});
```

### Schema Validation (Zod, Yup, etc.)

El Form supports schema validation for File objects using libraries like Zod. This provides a unified validation approach:

```typescript
import { z } from "zod";

// Define schema with File validation
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),

  // Single file validation
  resume: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "File must be less than 5MB"
    )
    .refine(
      (file) => file.type === "application/pdf",
      "Only PDF files allowed"
    ),

  // Optional file
  avatar: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 2 * 1024 * 1024,
      "File must be less than 2MB"
    )
    .optional(),

  // Array of files
  portfolio: z
    .array(z.instanceof(File))
    .min(1, "At least one file required")
    .max(5, "Maximum 5 files allowed")
    .refine(
      (files) => files.every((file) => file.size <= 10 * 1024 * 1024),
      "Each file must be less than 10MB"
    ),
});

function SchemaValidatedForm() {
  const { register, handleSubmit, formState } = useForm({
    defaultValues: {
      name: "",
      email: "",
      resume: null as any, // Type assertion for Zod compatibility
      avatar: undefined,
      portfolio: [],
    },
    validators: {
      onChange: formSchema.partial(), // Progressive validation
      onSubmit: formSchema, // Full validation on submit
    },
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input {...register("name")} placeholder="Name" />
      {formState.errors.name && <p>{formState.errors.name}</p>}

      <input {...register("email")} type="email" placeholder="Email" />
      {formState.errors.email && <p>{formState.errors.email}</p>}

      <input {...register("resume")} type="file" accept=".pdf" />
      {formState.errors.resume && <p>{formState.errors.resume}</p>}

      <input {...register("portfolio")} type="file" multiple accept="image/*" />
      {formState.errors.portfolio && <p>{formState.errors.portfolio}</p>}

      <button type="submit">Submit</button>
    </form>
  );
}
```

**Advantages of Schema Validation for Files:**

- **Unified validation** - All validation rules in one schema
- **Type safety** - Full TypeScript integration with `z.infer<typeof schema>`
- **Progressive validation** - Use `.partial()` for onChange, full schema for onSubmit
- **Complex validation** - Custom refinements for advanced file validation logic
- **Error consistency** - File validation errors appear alongside other field errors

**Hybrid Approach:**

You can also combine schema validation with `fileValidators` for maximum flexibility:

```typescript
const { register } = useForm({
  // Schema for basic fields and file type checking
  validators: {
    onChange: z.object({
      name: z.string().min(1),
      email: z.string().email(),
      resume: z.instanceof(File).optional(),
    }),
  },

  // Advanced file validation using fileValidators
  fieldValidators: {
    resume: { onChange: fileValidators.document },
    gallery: { onChange: fileValidators.gallery },
  },
});
```

> **Note**: File validation works seamlessly with the existing validation system. Choose between dedicated `fileValidators` for quick setup, or schema validation for unified type-safe validation across your entire form.

## Example

Here is a comprehensive example showing how `useForm` handles common input types.

```typescript
import { useForm } from "el-form";
import { z } from "zod";

const settingsSchema = z.object({
  username: z.string().min(3),
  age: z.number().min(18),
  enableNotifications: z.boolean(),
});

function SettingsForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    validators: { onChange: settingsSchema },
    defaultValues: {
      username: "",
      age: 18,
      enableNotifications: true,
    },
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <div>
        <label>Username</label>
        <input {...register("username")} />
        {errors.username && <span>{errors.username.message}</span>}
      </div>

      <div>
        <label>Age</label>
        <input type="number" {...register("age")} />
        {errors.age && <span>{errors.age.message}</span>}
      </div>

      <div>
        <label>
          <input type="checkbox" {...register("enableNotifications")} />
          Enable Notifications
        </label>
      </div>

      <button type="submit">Save Settings</button>
    </form>
  );
}
```
