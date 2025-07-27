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

### File Input Example

```tsx
import { useState, useEffect } from "react";
import { useForm } from "el-form";

interface FileFormData {
  avatar: File | null;
  documents: File[];
  name: string;
}

function FileUploadForm() {
  const {
    register,
    handleSubmit,
    formState,
    getFileInfo,
    getFilePreview,
    clearFiles,
  } = useForm<FileFormData>({
    defaultValues: {
      avatar: null,
      documents: [],
      name: "",
    },
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Generate preview when avatar changes
  useEffect(() => {
    const generatePreview = async () => {
      if (formState.values.avatar) {
        const preview = await getFilePreview(formState.values.avatar);
        setAvatarPreview(preview);
      } else {
        setAvatarPreview(null);
      }
    };
    generatePreview();
  }, [formState.values.avatar, getFilePreview]);

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
            {avatarPreview && (
              <img src={avatarPreview} alt="Preview" width="100" />
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

> **Note**: File upload support is currently in beta. Advanced features like drag & drop, file validation, and upload progress tracking are coming soon.

## Example

Here is a comprehensive example showing how `useForm` handles common input types.

```tsx
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
