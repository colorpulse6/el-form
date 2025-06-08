import { AutoForm } from "../../../packages/react/src";
import { userSchema, User } from "../../react/userSchema";

export function RenderPropDemo() {
  // AutoForm field configuration
  const autoFormFields = [
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

  const handleFormSubmit = (data: User) => {
    console.log("✅ Render Prop AutoForm validation successful! Data:", data);
    alert("✅ Render Prop AutoForm is valid and submitted successfully!");
  };

  const handleFormError = (errors: Record<keyof User, string>) => {
    console.log("❌ Render Prop AutoForm validation failed! Errors:", errors);
    alert(
      "❌ Render Prop AutoForm has validation errors. Check console for details."
    );
  };

  return (
    <div>
      <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-lg mb-6">
        <h2 className="text-xl font-semibold text-emerald-800 mb-4">
          🎯 API #3: AutoForm with Render Props
        </h2>
        <p className="text-emerald-700 text-sm mb-2">
          <strong>Best of Both Worlds:</strong> AutoForm's declarative
          convenience + access to useForm state
        </p>
        <p className="text-emerald-600 text-xs">
          Use the children render prop to access formState (including isDirty),
          while still getting automatic field rendering.
        </p>
      </div>

      <AutoForm
        schema={userSchema}
        fields={autoFormFields}
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
      >
        {({ formState, handleSubmit, reset }) => (
          <div className="space-y-6">
            {/* Form Status Bar */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="text-sm font-medium text-gray-800 mb-3">
                🎛️ Live Form State (via Render Props)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
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
                  <strong className="text-gray-600">Touched:</strong>{" "}
                  <span className="text-blue-600">
                    {Object.keys(formState.touched).length} fields
                  </span>
                </div>
              </div>
            </div>

            {/* AutoForm renders its fields automatically here */}
            {/* This is where the magic happens - we get the form fields rendered automatically */}
            {/* but we can also access the form state through the render prop */}

            {/* Custom Actions with Conditional Rendering */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={formState.isSubmitting}
                className={`px-5 py-2.5 text-white rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${
                  formState.isValid && formState.isDirty
                    ? "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
                    : "bg-gray-400 cursor-not-allowed"
                } disabled:opacity-60 disabled:cursor-not-allowed`}
                onClick={handleSubmit(handleFormSubmit, handleFormError)}
              >
                {formState.isSubmitting
                  ? "Submitting..."
                  : formState.isDirty
                  ? "Save Changes"
                  : "Submit"}
              </button>

              <button
                type="button"
                onClick={reset}
                disabled={!formState.isDirty}
                className="px-5 py-2.5 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Reset
              </button>

              {formState.isDirty && (
                <div className="flex items-center px-3 py-2 bg-orange-100 text-orange-700 rounded-md text-sm">
                  <span className="text-xs">⚠️ Unsaved changes</span>
                </div>
              )}
            </div>
          </div>
        )}
      </AutoForm>
    </div>
  );
}
