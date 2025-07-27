import { useForm } from "el-form-react-hooks";

interface FileFormData {
  avatar: File | null;
  documents: File[];
  name: string;
}

export default function FileUploadTest() {
  const { register, handleSubmit, formState, setValue } = useForm<FileFormData>(
    {
      defaultValues: {
        avatar: null,
        documents: [],
        name: "",
      },
    }
  );

  // Helper functions for file management
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileExtension = (fileName: string): string => {
    return fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2);
  };

  const getFileInfo = (file: File) => ({
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    formattedSize: formatFileSize(file.size),
    isImage: file.type.startsWith("image/"),
    extension: getFileExtension(file.name),
  });

  const addFile = (fieldName: string, file: File) => {
    if (fieldName === "documents") {
      const current = formState.values.documents || [];
      setValue("documents", [...current, file]);
    } else {
      setValue(fieldName, file);
    }
  };

  const removeFile = (fieldName: string, index?: number) => {
    if (fieldName === "documents" && typeof index === "number") {
      const current = formState.values.documents || [];
      const updated = current.filter((_, i) => i !== index);
      setValue("documents", updated);
    } else {
      setValue(fieldName, null);
    }
  };

  const clearFiles = (fieldName: string) => {
    setValue(fieldName, fieldName === "documents" ? [] : null);
  };

  const onSubmit = (data: FileFormData) => {
    console.log("Form submitted:", data);
    console.log("Avatar:", data.avatar);
    console.log("Documents:", data.documents);

    // Log file info for avatar
    if (data.avatar) {
      const avatarInfo = getFileInfo(data.avatar);
      console.log("Avatar info:", avatarInfo);
    }

    // Log file info for documents
    if (data.documents) {
      data.documents.forEach((doc, index) => {
        const docInfo = getFileInfo(doc);
        console.log(`Document ${index + 1} info:`, docInfo);
      });
    }
  };

  const handleAddFile = (fieldName: string) => {
    // Create a mock file for testing
    const mockFile = new File(["test content"], "test.txt", {
      type: "text/plain",
      lastModified: Date.now(),
    });
    addFile(fieldName, mockFile);
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">File Upload Test (Beta)</h2>
      <p className="text-sm text-gray-600 mb-4">
        Testing basic file input support. File validation and advanced features
        coming soon.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            {...register("name")}
            type="text"
            placeholder="Enter your name"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {formState.errors.name && (
            <p className="text-red-500 text-sm mt-1">{formState.errors.name}</p>
          )}
        </div>

        {/* Avatar upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Avatar (Single Image)
          </label>
          <input
            {...register("avatar")}
            type="file"
            accept="image/*"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {formState.errors.avatar && (
            <p className="text-red-500 text-sm mt-1">
              {formState.errors.avatar}
            </p>
          )}
          {formState.values.avatar && (
            <div className="mt-2 p-2 bg-gray-50 rounded">
              <p className="text-sm">
                Selected: {formState.values.avatar.name}
              </p>
              <button
                type="button"
                onClick={() => clearFiles("avatar")}
                className="text-red-500 text-sm hover:underline"
              >
                Clear avatar
              </button>
            </div>
          )}
        </div>

        {/* Multiple documents upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Documents (Multiple Files)
          </label>
          <input
            {...register("documents")}
            type="file"
            multiple
            accept=".pdf,.txt"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {formState.errors.documents && (
            <p className="text-red-500 text-sm mt-1">
              {formState.errors.documents}
            </p>
          )}

          {/* Display selected documents */}
          {formState.values.documents &&
            formState.values.documents.length > 0 && (
              <div className="mt-2 space-y-1">
                {Array.from(formState.values.documents).map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <span className="text-sm">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile("documents", index)}
                      className="text-red-500 text-sm hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => clearFiles("documents")}
                  className="text-red-500 text-sm hover:underline"
                >
                  Clear all documents
                </button>
              </div>
            )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={formState.isSubmitting}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
        >
          {formState.isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </form>

      {/* Form state debug */}
      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h3 className="font-medium mb-2">Form State Debug:</h3>
        <p className="text-sm">Valid: {formState.isValid ? "Yes" : "No"}</p>
        <p className="text-sm">Dirty: {formState.isDirty ? "Yes" : "No"}</p>
        <p className="text-sm">
          Submitting: {formState.isSubmitting ? "Yes" : "No"}
        </p>
        <p className="text-sm">
          Avatar:{" "}
          {formState.values.avatar ? formState.values.avatar.name : "None"}
        </p>
        <p className="text-sm">
          Documents:{" "}
          {formState.values.documents ? formState.values.documents.length : 0}{" "}
          files
        </p>
      </div>
    </div>
  );
}
