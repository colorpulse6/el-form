import { useForm } from "el-form-react-hooks";
import { fileValidators } from "el-form-core";
import { useState } from "react";

interface FileFormData {
  avatar: File | null;
  documents: File[];
  name: string;
}

export default function FileUploadTest() {
  const [submitResult, setSubmitResult] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState,
    addFile,
    removeFile,
    clearFiles,
    getFileInfo,
    filePreview,
  } = useForm<FileFormData>({
    defaultValues: {
      avatar: null,
      documents: [],
      name: "",
    },
    // File validation using preset validators
    fieldValidators: {
      avatar: { onChange: fileValidators.avatar },
      documents: { onChange: fileValidators.document },
    },
  });

  // File previews are automatically managed and separate from formState
  const avatarPreview = filePreview.avatar;

  const registerFileInput = (name: "avatar" | "documents") => {
    const { value: _value, files: _files, ...registration } = register(
      name
    ) as any;
    return registration;
  };

  const summarizeFile = (file: File) => ({
    name: file.name,
    type: file.type || "Unknown type",
    size: file.size,
    formattedSize: getFileInfo(file).formattedSize,
  });

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

    setSubmitResult({
      name: data.name,
      avatar: data.avatar ? summarizeFile(data.avatar) : null,
      documents: {
        count: data.documents?.length ?? 0,
        files: (data.documents ?? []).map(summarizeFile),
      },
    });
  };

  // Demo function to show addFile in action
  const handleAddMockFile = () => {
    const mockFile = new File(["Mock file content"], "demo-file.txt", {
      type: "text/plain",
      lastModified: Date.now(),
    });
    addFile("documents", mockFile);
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">File Upload Test (Beta)</h2>
      <p className="text-sm text-gray-600 mb-4">
        Testing basic file input support including the <code>addFile()</code>{" "}
        method.
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
            {...registerFileInput("avatar")}
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
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              {/* Image Preview */}
              {avatarPreview && (
                <div className="mb-3">
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                  />
                </div>
              )}

              {/* File Info */}
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700">
                  📄 {formState.values.avatar.name}
                </p>
                <p className="text-xs text-gray-500">
                  Size: {getFileInfo(formState.values.avatar).formattedSize}
                </p>
                <p className="text-xs text-gray-500">
                  Type: {formState.values.avatar.type}
                </p>
                {getFileInfo(formState.values.avatar).isImage && (
                  <p className="text-xs text-green-600">✓ Image file</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => clearFiles("avatar")}
                className="mt-2 text-red-500 text-sm hover:underline"
              >
                🗑️ Clear avatar
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
            {...registerFileInput("documents")}
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
              <div className="mt-3 space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  📁 Selected Files ({formState.values.documents.length})
                </p>
                {Array.from(formState.values.documents).map((file, index) => {
                  const fileInfo = getFileInfo(file);
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">
                          📄 {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {fileInfo.formattedSize} •{" "}
                          {file.type || "Unknown type"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile("documents", index)}
                        className="ml-2 text-red-500 text-sm hover:bg-red-50 px-2 py-1 rounded"
                      >
                        🗑️
                      </button>
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={() => clearFiles("documents")}
                  className="text-red-500 text-sm hover:underline"
                >
                  🗑️ Clear all documents
                </button>
              </div>
            )}
        </div>

        {/* Demo addFile button */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleAddMockFile}
            className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
          >
            🧪 Test addFile() - Add Mock Document
          </button>
          <p className="text-xs text-gray-500 text-center">
            This demonstrates programmatically adding files
          </p>
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

      {submitResult && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <h3 className="text-sm font-medium text-green-800 mb-2">
            Submit Result
          </h3>
          <pre
            data-testid="submit-result"
            className="text-xs text-green-900 whitespace-pre-wrap overflow-auto"
          >
            {JSON.stringify(submitResult, null, 2)}
          </pre>
        </div>
      )}

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
