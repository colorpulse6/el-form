import { useForm } from "el-form-react-hooks";
import { fileValidator, fileValidators } from "el-form-core";

interface AdvancedFileFormData {
  profilePicture: File | null;
  portfolio: File[];
  resume: File | null;
  name: string;
  email: string;
}

export default function AdvancedFileValidationTest() {
  const {
    register,
    handleSubmit,
    formState,
    addFile,
    removeFile,
    clearFiles,
    getFileInfo,
    filePreview,
  } = useForm<AdvancedFileFormData>({
    defaultValues: {
      profilePicture: null,
      portfolio: [],
      resume: null,
      name: "",
      email: "",
    },
    // Mix of preset and custom file validators
    fieldValidators: {
      // Use preset avatar validator
      profilePicture: { onChange: fileValidators.avatar },

      // Custom portfolio validator for image gallery
      portfolio: {
        onChange: fileValidator({
          acceptedTypes: ["image/jpeg", "image/png", "image/gif"],
          maxSize: 3 * 1024 * 1024, // 3MB each
          maxFiles: 8,
          minFiles: 2,
        }),
      },

      // Custom resume validator
      resume: {
        onChange: fileValidator({
          acceptedTypes: ["application/pdf"],
          maxSize: 5 * 1024 * 1024, // 5MB
          maxFiles: 1,
        }),
      },
    },
  });

  const onSubmit = (data: AdvancedFileFormData) => {
    console.log("Advanced Form submitted:", data);

    // Show file information
    if (data.profilePicture) {
      console.log("Profile Picture:", getFileInfo(data.profilePicture));
    }

    if (data.resume) {
      console.log("Resume:", getFileInfo(data.resume));
    }

    if (data.portfolio && data.portfolio.length > 0) {
      console.log("Portfolio files:", data.portfolio.map(getFileInfo));
    }
  };

  const handleAddMockPortfolioImage = () => {
    const mockImage = new File(["mock image"], "portfolio-image.jpg", {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
    addFile("portfolio", mockImage);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">Advanced File Validation Test</h2>
      <p className="text-sm text-gray-600 mb-6">
        Testing advanced file validation with custom validators, multiple file
        types, and comprehensive error handling.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name and Email */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              {...register("name")}
              type="text"
              placeholder="Your name"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {formState.errors.name && (
              <p className="text-red-500 text-sm mt-1">
                {formState.errors.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="your@email.com"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {formState.errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {formState.errors.email}
              </p>
            )}
          </div>
        </div>

        {/* Profile Picture (Avatar Validator) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Profile Picture
            <span className="text-xs text-gray-500 ml-1">
              (JPEG/PNG, max 2MB)
            </span>
          </label>
          <input
            {...register("profilePicture")}
            type="file"
            accept="image/*"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {formState.errors.profilePicture && (
            <p className="text-red-500 text-sm mt-1">
              {formState.errors.profilePicture}
            </p>
          )}

          {formState.values.profilePicture && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              {filePreview.profilePicture && (
                <div className="mb-3">
                  <img
                    src={filePreview.profilePicture}
                    alt="Profile preview"
                    className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
                  />
                </div>
              )}

              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700">
                  📷 {formState.values.profilePicture.name}
                </p>
                <p className="text-xs text-gray-500">
                  Size:{" "}
                  {getFileInfo(formState.values.profilePicture).formattedSize}
                </p>
                <p className="text-xs text-green-600">
                  ✓ Valid profile picture
                </p>
              </div>

              <button
                type="button"
                onClick={() => clearFiles("profilePicture")}
                className="mt-2 text-red-500 text-sm hover:underline"
              >
                🗑️ Remove photo
              </button>
            </div>
          )}
        </div>

        {/* Portfolio (Custom Validator) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Portfolio Images
            <span className="text-xs text-gray-500 ml-1">
              (2-8 images, JPEG/PNG/GIF, max 3MB each)
            </span>
          </label>
          <input
            {...register("portfolio")}
            type="file"
            multiple
            accept="image/*"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {formState.errors.portfolio && (
            <p className="text-red-500 text-sm mt-1">
              {formState.errors.portfolio}
            </p>
          )}

          {formState.values.portfolio &&
            formState.values.portfolio.length > 0 && (
              <div className="mt-3 space-y-3">
                <p className="text-sm font-medium text-gray-700">
                  🎨 Portfolio Images ({formState.values.portfolio.length}/8)
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {Array.from(formState.values.portfolio).map((file, index) => {
                    const fileInfo = getFileInfo(file);
                    return (
                      <div
                        key={index}
                        className="relative p-3 bg-gray-50 rounded-lg border"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-700 truncate">
                              🖼️ {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {fileInfo.formattedSize}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile("portfolio", index)}
                            className="ml-2 text-red-500 hover:bg-red-50 p-1 rounded"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddMockPortfolioImage}
                    className="text-blue-500 text-sm hover:underline"
                  >
                    ➕ Add mock image
                  </button>
                  <button
                    type="button"
                    onClick={() => clearFiles("portfolio")}
                    className="text-red-500 text-sm hover:underline"
                  >
                    🗑️ Clear all
                  </button>
                </div>
              </div>
            )}
        </div>

        {/* Resume (Custom PDF Validator) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Resume
            <span className="text-xs text-gray-500 ml-1">
              (PDF only, max 5MB)
            </span>
          </label>
          <input
            {...register("resume")}
            type="file"
            accept=".pdf"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {formState.errors.resume && (
            <p className="text-red-500 text-sm mt-1">
              {formState.errors.resume}
            </p>
          )}

          {formState.values.resume && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700">
                  📄 {formState.values.resume.name}
                </p>
                <p className="text-xs text-gray-500">
                  Size: {getFileInfo(formState.values.resume).formattedSize}
                </p>
                <p className="text-xs text-green-600">✓ Valid PDF resume</p>
              </div>

              <button
                type="button"
                onClick={() => clearFiles("resume")}
                className="mt-2 text-red-500 text-sm hover:underline"
              >
                🗑️ Remove resume
              </button>
            </div>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={formState.isSubmitting || !formState.isValid}
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-300 transition-colors font-medium"
        >
          {formState.isSubmitting ? "Submitting..." : "Submit Application"}
        </button>
      </form>

      {/* Advanced form state debug */}
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-medium mb-2">🔍 Form State Debug:</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Valid: {formState.isValid ? "✅ Yes" : "❌ No"}</div>
          <div>Dirty: {formState.isDirty ? "✅ Yes" : "❌ No"}</div>
          <div>Submitting: {formState.isSubmitting ? "⏳ Yes" : "❌ No"}</div>
          <div>
            Has Errors:{" "}
            {Object.keys(formState.errors).length > 0 ? "❌ Yes" : "✅ No"}
          </div>
        </div>

        {Object.keys(formState.errors).length > 0 && (
          <div className="mt-2">
            <p className="text-sm font-medium text-red-600">Current Errors:</p>
            <ul className="text-xs text-red-500 mt-1 space-y-1">
              {Object.entries(formState.errors).map(([field, error]) => (
                <li key={field}>
                  • {field}: {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-2 text-xs space-y-1 text-gray-600">
          <div>
            Profile Picture:{" "}
            {formState.values.profilePicture ? "✅ Selected" : "❌ None"}
          </div>
          <div>Portfolio: {formState.values.portfolio?.length || 0} images</div>
          <div>
            Resume: {formState.values.resume ? "✅ Selected" : "❌ None"}
          </div>
        </div>
      </div>
    </div>
  );
}
