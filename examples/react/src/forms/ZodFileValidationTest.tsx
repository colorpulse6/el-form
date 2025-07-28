import { useForm } from "el-form-react-hooks";
import { z } from "zod";

// Define a schema that includes File validation
const applicationSchema = z.object({
  // Regular fields
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),

  // File fields - using z.instanceof(File) for basic validation
  resume: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "File must be less than 5MB"
    )
    .refine(
      (file) => file.type === "application/pdf",
      "Only PDF files are allowed"
    ),

  // Optional file field
  coverLetter: z
    .instanceof(File)
    .refine(
      //   (file) => file.size <= 2 * 1024 * 1024,
      (file) => file.size <= 1,
      "File must be less than 2MB"
    )
    .optional(),

  // Array of files - more complex validation
  portfolio: z
    .array(z.instanceof(File))
    .min(1, "At least one portfolio item required")
    .max(5, "Maximum 5 portfolio items allowed")
    .refine(
      (files) => files.every((file) => file.size <= 10 * 1024 * 1024),
      "Each file must be less than 10MB"
    )
    .refine(
      (files) =>
        files.every((file) =>
          ["image/jpeg", "image/png", "application/pdf"].includes(file.type)
        ),
      "Only images (JPEG, PNG) and PDFs are allowed"
    ),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

export default function ZodFileValidationTest() {
  const { register, handleSubmit, formState, getFileInfo, clearFiles } =
    useForm<ApplicationFormData>({
      defaultValues: {
        firstName: "",
        lastName: "",
        email: "",
        resume: undefined,
        coverLetter: undefined,
        portfolio: [],
      },

      // Method 1: Pure Zod schema validation (ideal approach)
      validators: {
        onChange: applicationSchema.partial(), // Partial for progressive validation
        onSubmit: applicationSchema, // Full validation on submit
      },

      // Method 2: Hybrid approach - Zod for basic fields, fileValidators for advanced file rules
      // fieldValidators: {
      //   resume: { onChange: fileValidators.document },
      //   portfolio: { onChange: fileValidators.gallery },
      // },
    });

  const onSubmit = (data: ApplicationFormData) => {
    console.log("✅ Form submitted successfully:", data);

    // Log file information
    if (data.resume) {
      console.log("Resume info:", getFileInfo(data.resume));
    }

    if (data.coverLetter) {
      console.log("Cover letter info:", getFileInfo(data.coverLetter));
    }

    if (data.portfolio.length > 0) {
      console.log("Portfolio files:", data.portfolio.map(getFileInfo));
    }
  };

  const onError = (errors: Record<string, string>) => {
    console.log("❌ Validation errors:", errors);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">Zod + File Validation Test</h2>
      <p className="text-sm text-gray-600 mb-6">
        Testing Zod schema validation with File objects. This demonstrates how
        to use <code>z.instanceof(File)</code> and custom refinements for file
        validation.
      </p>

      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
        {/* Basic fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              {...register("firstName")}
              type="text"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {formState.errors.firstName && (
              <p className="text-red-500 text-sm mt-1">
                {formState.errors.firstName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              {...register("lastName")}
              type="text"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {formState.errors.lastName && (
              <p className="text-red-500 text-sm mt-1">
                {formState.errors.lastName}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            {...register("email")}
            type="email"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {formState.errors.email && (
            <p className="text-red-500 text-sm mt-1">
              {formState.errors.email}
            </p>
          )}
        </div>

        {/* Resume - Required file with Zod validation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Resume *
            <span className="text-xs text-gray-500 ml-1">
              (PDF only, max 5MB - validated by Zod schema)
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
                <p className="text-xs text-green-600">
                  ✓ Validated by Zod schema
                </p>
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

        {/* Cover Letter - Optional file */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cover Letter
            <span className="text-xs text-gray-500 ml-1">
              (Optional, max 2MB)
            </span>
          </label>
          <input
            {...register("coverLetter")}
            type="file"
            accept=".pdf,.txt,.doc,.docx"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {formState.errors.coverLetter && (
            <p className="text-red-500 text-sm mt-1">
              {formState.errors.coverLetter}
            </p>
          )}

          {formState.values.coverLetter && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700">
                  📄 {formState.values.coverLetter.name}
                </p>
                <p className="text-xs text-gray-500">
                  Size:{" "}
                  {getFileInfo(formState.values.coverLetter).formattedSize}
                </p>
              </div>

              <button
                type="button"
                onClick={() => clearFiles("coverLetter")}
                className="mt-2 text-red-500 text-sm hover:underline"
              >
                🗑️ Remove cover letter
              </button>
            </div>
          )}
        </div>

        {/* Portfolio - Array of files */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Portfolio *
            <span className="text-xs text-gray-500 ml-1">
              (1-5 files: Images or PDFs, max 10MB each)
            </span>
          </label>
          <input
            {...register("portfolio")}
            type="file"
            multiple
            accept="image/*,.pdf"
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
                  🎨 Portfolio Files ({formState.values.portfolio.length}/5)
                </p>

                <div className="space-y-2">
                  {Array.from(formState.values.portfolio).map((file, index) => {
                    const fileInfo = getFileInfo(file);
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700 truncate">
                            📎 {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {fileInfo.formattedSize} • {file.type}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => clearFiles("portfolio")}
                  className="text-red-500 text-sm hover:underline"
                >
                  🗑️ Clear all portfolio files
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

      {/* Schema validation info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium mb-2 text-blue-800">
          🧪 Schema Validation Info
        </h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p>
            • Uses <code>z.instanceof(File)</code> for file type checking
          </p>
          <p>• Custom refinements for size and type validation</p>
          <p>• Array validation for multiple files</p>
          <p>• Progressive validation (partial on change, full on submit)</p>
        </div>
      </div>

      {/* Form state debug */}
      <div className="mt-4 p-4 bg-gray-100 rounded-lg">
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
      </div>
    </div>
  );
}
