// Import the hook from the packaged library
import { useForm } from "el-form";
import { userSchema, User } from "../../react/userSchema";

export function UseFormDemo() {
  // API #2: useForm Hook (Manual Control)
  const { register, handleSubmit, formState, reset } = useForm<User>({
    schema: userSchema,
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      age: undefined,
      bio: "",
    },
    validateOnChange: true,
    validateOnBlur: true,
  });

  const handleFormSubmit = (data: User) => {
    console.log("✅ useForm Hook validation successful! Data:", data);
    alert("✅ useForm Hook is valid and submitted successfully!");
  };

  const handleFormError = (errors: Record<keyof User, string>) => {
    console.log("❌ useForm Hook validation failed! Errors:", errors);
    alert("❌ useForm Hook has validation errors. Check console for details.");
  };

  return (
    <div>
      <div className="p-6 bg-purple-50 border border-purple-200 rounded-lg">
        <h2 className="text-xl font-semibold text-purple-800 mb-4">
          🎣 useForm Hook (Manual Control)
        </h2>
        <p className="text-purple-700 text-sm mb-6">
          React-Hook-Form style API with register(), handleSubmit(), formState,
          and reset(). Maximum flexibility and behavior using register().
        </p>
      </div>

      <form
        onSubmit={handleSubmit(handleFormSubmit, handleFormError)}
        className="mt-6 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700"
            >
              First Name
            </label>
            <input
              {...register("firstName")}
              id="firstName"
              placeholder="Enter your first name"
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                formState.touched.firstName && formState.errors.firstName
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300"
              }`}
            />
            {formState.touched.firstName && formState.errors.firstName && (
              <div className="text-red-500 text-xs mt-1">
                {formState.errors.firstName}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700"
            >
              Last Name
            </label>
            <input
              {...register("lastName")}
              id="lastName"
              placeholder="Enter your last name"
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                formState.touched.lastName && formState.errors.lastName
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300"
              }`}
            />
            {formState.touched.lastName && formState.errors.lastName && (
              <div className="text-red-500 text-xs mt-1">
                {formState.errors.lastName}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email Address
          </label>
          <input
            {...register("email")}
            id="email"
            type="email"
            placeholder="Enter your email"
            className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
              formState.touched.email && formState.errors.email
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300"
            }`}
          />
          {formState.touched.email && formState.errors.email && (
            <div className="text-red-500 text-xs mt-1">
              {formState.errors.email}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label
              htmlFor="age"
              className="block text-sm font-medium text-gray-700"
            >
              Age
            </label>
            <input
              {...register("age")}
              id="age"
              type="number"
              placeholder="Enter your age"
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                formState.touched.age && formState.errors.age
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300"
              }`}
            />
            {formState.touched.age && formState.errors.age && (
              <div className="text-red-500 text-xs mt-1">
                {formState.errors.age}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-gray-700"
            >
              Bio (Optional)
            </label>
            <textarea
              {...register("bio")}
              id="bio"
              placeholder="Tell us about yourself"
              rows={3}
              className={`w-full px-3 py-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                formState.touched.bio && formState.errors.bio
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300"
              }`}
            />
            {formState.touched.bio && formState.errors.bio && (
              <div className="text-red-500 text-xs mt-1">
                {formState.errors.bio}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={formState.isSubmitting}
            className="px-5 py-2.5 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {formState.isSubmitting ? "Submitting..." : "Submit"}
          </button>

          <button
            type="button"
            onClick={reset}
            className="px-5 py-2.5 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Reset
          </button>
        </div>

        {/* Form State Debug Info */}
        <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-sm font-medium text-gray-800 mb-2">
            📊 Form State
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <strong className="text-gray-600">isValid:</strong>{" "}
              <span
                className={
                  formState.isValid ? "text-green-600" : "text-red-600"
                }
              >
                {formState.isValid.toString()}
              </span>
            </div>
            <div>
              <strong className="text-gray-600">isSubmitting:</strong>{" "}
              <span
                className={
                  formState.isSubmitting ? "text-blue-600" : "text-gray-500"
                }
              >
                {formState.isSubmitting.toString()}
              </span>
            </div>
            <div>
              <strong className="text-gray-600">isDirty:</strong>{" "}
              <span
                className={
                  formState.isDirty ? "text-orange-600" : "text-gray-500"
                }
              >
                {formState.isDirty.toString()}
              </span>
            </div>
            <div>
              <strong className="text-gray-600">Touched Fields:</strong>{" "}
              <span className="text-blue-600">
                {Object.keys(formState.touched).length}
              </span>
            </div>
            <div>
              <strong className="text-gray-600">Errors:</strong>{" "}
              <span className="text-red-600">
                {Object.keys(formState.errors).length}
              </span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
