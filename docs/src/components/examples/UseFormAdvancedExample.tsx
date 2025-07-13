import { useEffect } from "react";
import { useForm } from "el-form-react-hooks";
import { z } from "zod";

const advancedSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    age: z
      .number()
      .min(18, "Must be at least 18 years old")
      .max(120, "Age must be realistic"),
    newsletter: z.boolean().optional(),
    terms: z
      .boolean()
      .refine((val) => val === true, "You must accept the terms"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof advancedSchema>;

// Simulate async email check
const checkEmailExists = async (email: string): Promise<boolean> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return email === "taken@example.com";
};

export default function UseFormAdvancedExample() {
  const {
    register,
    handleSubmit,
    formState,
    watch,
    trigger,
    setFocus,
    isDirty,
    getFieldState,
    setError,
    clearErrors,
    reset,
    resetField,
    getDirtyFields,
    getTouchedFields,
  } = useForm<FormData>({
    validators: {
      onChange: advancedSchema,
      onBlur: advancedSchema,
    },
    fieldValidators: {
      email: {
        onChangeAsync: async ({ value }: { value: string }) => {
          if (!value) return undefined;
          const exists = await checkEmailExists(value);
          return exists ? "Email already taken" : undefined;
        },
        asyncDebounceMs: 500,
      },
    },
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      age: 18,
      newsletter: false,
      terms: false,
    },
  });

  // Watch specific fields for reactive updates
  const password = watch("password");
  const firstName = watch("firstName");
  const lastName = watch("lastName");
  const email = watch("email");

  // Auto-validate confirm password when password changes
  useEffect(() => {
    if (formState.touched.confirmPassword && password) {
      trigger("confirmPassword");
    }
  }, [password, trigger, formState.touched.confirmPassword]);

  // Generate full name preview
  const fullName = firstName && lastName ? `${firstName} ${lastName}` : "";

  const onSubmit = handleSubmit(
    async (data) => {
      console.log("✅ Form submitted successfully:", data);
      alert("Form submitted successfully! Check console for data.");

      // Simulate successful submission
      await new Promise((resolve) => setTimeout(resolve, 1000));
      reset();
    },
    (errors) => {
      console.log("❌ Form validation errors:", errors);

      // Focus first error field for better UX
      const firstErrorField = Object.keys(errors)[0] as keyof FormData;
      setFocus(firstErrorField);
    }
  );

  const handleEmailCheck = async () => {
    const isEmailValid = await trigger("email");
    if (isEmailValid && email) {
      try {
        const emailExists = await checkEmailExists(email);
        if (emailExists) {
          setError("email", "This email is already taken");
        } else {
          clearErrors("email");
          alert("✅ Email is available!");
        }
      } catch (error) {
        setError("email", "Failed to check email availability");
      }
    }
  };

  const handleFocusFirstName = () => {
    setFocus("firstName", { shouldSelect: true });
  };

  const handleResetSpecificFields = () => {
    resetField("firstName");
    resetField("lastName");
    resetField("email");
  };

  // Get field states for conditional rendering
  const emailState = getFieldState("email");
  const passwordState = getFieldState("password");
  const confirmPasswordState = getFieldState("confirmPassword");

  const dirtyFields = getDirtyFields();
  const touchedFields = getTouchedFields();

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        🚀 Advanced useForm Example
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  First Name
                </label>
                <input
                  {...register("firstName")}
                  type="text"
                  placeholder="Enter first name"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                    getFieldState("firstName").error
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                />
                {getFieldState("firstName").error && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                    {getFieldState("firstName").error}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Last Name
                </label>
                <input
                  {...register("lastName")}
                  type="text"
                  placeholder="Enter last name"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                    getFieldState("lastName").error
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                />
                {getFieldState("lastName").error && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                    {getFieldState("lastName").error}
                  </p>
                )}
              </div>
            </div>

            {/* Full Name Preview */}
            {fullName && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-md">
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  👋 Hello, <strong>{fullName}</strong>!
                </p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Email
              </label>
              <div className="flex gap-2">
                <input
                  {...register("email")}
                  type="email"
                  placeholder="Enter email address"
                  className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                    emailState.error
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                />
                <button
                  type="button"
                  onClick={handleEmailCheck}
                  disabled={!email || !!emailState.error}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Check
                </button>
              </div>
              {emailState.error && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                  {emailState.error}
                </p>
              )}
              {emailState.isDirty && !emailState.error && (
                <p className="text-green-500 dark:text-green-400 text-xs mt-1">
                  ✅ Email format is valid
                </p>
              )}
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Password
                </label>
                <input
                  {...register("password")}
                  type="password"
                  placeholder="Enter password"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                    passwordState.error
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                />
                {passwordState.error && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                    {passwordState.error}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Confirm Password
                </label>
                <input
                  {...register("confirmPassword")}
                  type="password"
                  placeholder="Confirm password"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                    confirmPasswordState.error
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                />
                {confirmPasswordState.error && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                    {confirmPasswordState.error}
                  </p>
                )}
                {password &&
                  formState.values.confirmPassword &&
                  !confirmPasswordState.error && (
                    <p className="text-green-500 dark:text-green-400 text-xs mt-1">
                      ✅ Passwords match
                    </p>
                  )}
              </div>
            </div>

            {/* Age Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Age
              </label>
              <input
                {...register("age")}
                type="number"
                min="18"
                max="120"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                  getFieldState("age").error
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              />
              {getFieldState("age").error && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                  {getFieldState("age").error}
                </p>
              )}
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded"
                  {...register("newsletter")}
                />
                <span className="text-sm text-gray-700 dark:text-gray-200">
                  Subscribe to newsletter
                </span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded"
                  {...register("terms")}
                />
                <span className="text-sm text-gray-700 dark:text-gray-200">
                  I accept the terms and conditions *
                </span>
              </label>
              {getFieldState("terms").error && (
                <p className="text-red-500 dark:text-red-400 text-xs">
                  {getFieldState("terms").error}
                </p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex flex-wrap gap-3 pt-4">
              <button
                type="submit"
                disabled={formState.isSubmitting || !formState.isValid}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {formState.isSubmitting ? "Submitting..." : "Submit Form"}
              </button>

              <button
                type="button"
                onClick={() => reset()}
                disabled={!isDirty()}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset All
              </button>

              <button
                type="button"
                onClick={handleResetSpecificFields}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
              >
                Reset Names & Email
              </button>

              <button
                type="button"
                onClick={handleFocusFirstName}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Focus First Name
              </button>
            </div>
          </form>
        </div>

        {/* Debug Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-4">
            {/* Form State */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">
                📊 Form State
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    Valid:
                  </span>
                  <span
                    className={
                      formState.isValid
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }
                  >
                    {formState.isValid ? "✅ Yes" : "❌ No"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    Dirty:
                  </span>
                  <span
                    className={
                      isDirty()
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-gray-600 dark:text-gray-400"
                    }
                  >
                    {isDirty() ? "📝 Yes" : "✨ Pristine"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    Submitting:
                  </span>
                  <span
                    className={
                      formState.isSubmitting
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-400"
                    }
                  >
                    {formState.isSubmitting ? "⏳ Yes" : "⏹️ No"}
                  </span>
                </div>
              </div>
            </div>

            {/* Dirty Fields */}
            {Object.keys(dirtyFields).length > 0 && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">
                  📝 Dirty Fields
                </h3>
                <div className="flex flex-wrap gap-1">
                  {Object.keys(dirtyFields).map((field) => (
                    <span
                      key={field}
                      className="px-2 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded text-xs"
                    >
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Touched Fields */}
            {Object.keys(touchedFields).length > 0 && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">
                  👆 Touched Fields
                </h3>
                <div className="flex flex-wrap gap-1">
                  {Object.keys(touchedFields).map((field) => (
                    <span
                      key={field}
                      className="px-2 py-1 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-xs"
                    >
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Errors */}
            {Object.keys(formState.errors).length > 0 && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">
                  ❌ Current Errors
                </h3>
                <div className="space-y-1 text-xs">
                  {Object.entries(formState.errors).map(([field, error]) => (
                    <div key={field} className="text-red-700 dark:text-red-300">
                      <strong>{field}:</strong> {error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Watch Demo */}
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">
                👀 Watch Demo
              </h3>
              <div className="space-y-2 text-xs">
                <div className="text-gray-700 dark:text-gray-300">
                  <strong>First Name:</strong> {firstName || "(empty)"}
                </div>
                <div className="text-gray-700 dark:text-gray-300">
                  <strong>Email:</strong> {email || "(empty)"}
                </div>
                <div className="text-gray-700 dark:text-gray-300">
                  <strong>Password Length:</strong> {password?.length || 0}{" "}
                  chars
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
