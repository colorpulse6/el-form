import { AutoForm } from "el-form-react";
import { useForm } from "el-form-react-hooks";
import { z } from "zod";

// Basic useForm Example
const userSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  age: z.number().min(18, "Must be at least 18 years old"),
  bio: z.string().optional(),
});

export const UseFormExample: React.FC = () => {
  const { register, handleSubmit, formState, reset } = useForm({
    validators: { onChange: userSchema },
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      age: 18,
      bio: "",
    },
    validateOn: "onChange",
  });

  const handleFormSubmit = (data: Record<string, any>) => {
    console.log("✅ useForm Hook validation successful! Data:", data);
    alert(`✅ Form submitted successfully! Welcome, ${data.firstName}!`);
  };

  const handleFormError = (errors: Record<string, string>) => {
    console.log("❌ useForm Hook validation failed! Errors:", errors);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg mb-6">
        <h3 className="text-lg font-semibold text-purple-800 mb-2">
          🎣 useForm Hook (Manual Control)
        </h3>
        <p className="text-purple-700 text-sm">
          React-Hook-Form style API with register(), handleSubmit(), formState,
          and reset(). Maximum flexibility and control.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(handleFormSubmit, handleFormError)}
        className="space-y-4"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {formState.errors.firstName && (
              <p className="text-sm text-red-600">
                {formState.errors.firstName}
              </p>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {formState.errors.lastName && (
              <p className="text-sm text-red-600">
                {formState.errors.lastName}
              </p>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {formState.errors.email && (
            <p className="text-sm text-red-600">{formState.errors.email}</p>
          )}
        </div>

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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {formState.errors.age && (
            <p className="text-sm text-red-600">{formState.errors.age}</p>
          )}
        </div>

        <div className="space-y-1">
          <label
            htmlFor="bio"
            className="block text-sm font-medium text-gray-700"
          >
            Biography (Optional)
          </label>
          <textarea
            {...register("bio")}
            id="bio"
            rows={3}
            placeholder="Tell us about yourself..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {formState.errors.bio && (
            <p className="text-sm text-red-600">{formState.errors.bio}</p>
          )}
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={formState.isSubmitting}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {formState.isSubmitting ? "Submitting..." : "Submit"}
          </button>
          <button
            type="button"
            onClick={() => reset()}
            className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Reset
          </button>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Form State Debug:
          </h4>
          <div className="text-xs text-gray-600 space-y-1">
            <div>Valid: {formState.isValid ? "✅" : "❌"}</div>
            <div>Dirty: {formState.isDirty ? "✅" : "❌"}</div>
            <div>Submitting: {formState.isSubmitting ? "✅" : "❌"}</div>
            <div>
              Touched Fields:{" "}
              {Object.keys(formState.touched).join(", ") || "None"}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

// Simple AutoForm Example (Comparison with useForm)
export const SimpleAutoFormExample: React.FC = () => {
  const fields = [
    {
      name: "firstName",
      label: "First Name",
      type: "text" as const,
      colSpan: 6 as const,
      placeholder: "Enter your first name",
    },
    {
      name: "lastName",
      label: "Last Name",
      type: "text" as const,
      colSpan: 6 as const,
      placeholder: "Enter your last name",
    },
    {
      name: "email",
      label: "Email Address",
      type: "email" as const,
      colSpan: 12 as const,
      placeholder: "Enter your email",
    },
    {
      name: "age",
      label: "Age",
      type: "number" as const,
      colSpan: 4 as const,
      placeholder: "Enter your age",
    },
    {
      name: "bio",
      label: "Biography",
      type: "textarea" as const,
      colSpan: 8 as const,
      placeholder: "Tell us about yourself",
    },
  ];

  const handleFormSubmit = (data: Record<string, any>) => {
    console.log("✅ AutoForm validation successful! Data:", data);
    alert(`✅ AutoForm submitted successfully! Welcome, ${data.firstName}!`);
  };

  const handleFormError = (errors: Record<string, string>) => {
    console.log("❌ AutoForm validation failed! Errors:", errors);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          🚀 AutoForm Component (Declarative)
        </h3>
        <p className="text-blue-700 text-sm">
          Just pass schema + field config. Automatic rendering, layout, and
          styling with minimal code required.
        </p>
      </div>

      <AutoForm
        schema={userSchema}
        fields={fields}
        layout="grid"
        columns={12}
        onSubmit={handleFormSubmit}
        onError={handleFormError}
        initialValues={{
          firstName: "",
          lastName: "",
          email: "",
          age: undefined,
          bio: "",
        }}
      />
    </div>
  );
};
