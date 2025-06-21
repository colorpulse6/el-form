import React from "react";
// Import the AutoForm component and types from the React-specific entry point
import { AutoForm, AutoFormErrorProps } from "el-form-react";
import { userSchema, User } from "../../react/userSchema";

// Custom Error Component Example 1: Elegant Style
const ElegantErrorComponent: React.FC<AutoFormErrorProps> = ({
  errors,
  touched,
}) => {
  const errorEntries = Object.entries(errors).filter(
    ([field]) => touched[field]
  );

  if (errorEntries.length === 0) return null;

  return (
    <div className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 border-2 border-pink-200 rounded-xl mb-4 shadow-sm">
      <div className="flex items-center mb-3">
        <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center mr-3">
          <span className="text-white text-sm font-bold">!</span>
        </div>
        <h3 className="text-lg font-semibold text-pink-800">
          Oops! Let's fix these issues:
        </h3>
      </div>
      <div className="grid gap-2">
        {errorEntries.map(([field, error]) => (
          <div
            key={field}
            className="flex items-center p-2 bg-white/60 rounded-lg"
          >
            <span className="w-2 h-2 bg-pink-400 rounded-full mr-3"></span>
            <div className="flex-1">
              <span className="font-medium text-pink-700 capitalize">
                {field}:
              </span>
              <span className="ml-2 text-pink-600">{error}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Custom Error Component Example 2: Minimal Style
const MinimalErrorComponent: React.FC<AutoFormErrorProps> = ({
  errors,
  touched,
}) => {
  const errorEntries = Object.entries(errors).filter(
    ([field]) => touched[field]
  );

  if (errorEntries.length === 0) return null;

  return (
    <div className="mb-4 p-3 border-l-4 border-orange-400 bg-orange-50">
      <div className="text-sm text-orange-800">
        {errorEntries.map(([field, error], index) => (
          <div key={field} className="flex items-center">
            <span className="text-orange-500 mr-2">⚠</span>
            <span className="font-medium capitalize">{field}</span>
            <span className="mx-1">-</span>
            <span>{error}</span>
            {index < errorEntries.length - 1 && <span className="mx-2">|</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

// Custom Error Component Example 3: Dark Mode Style
const DarkErrorComponent: React.FC<AutoFormErrorProps> = ({
  errors,
  touched,
}) => {
  const errorEntries = Object.entries(errors).filter(
    ([field]) => touched[field]
  );

  if (errorEntries.length === 0) return null;

  return (
    <div className="p-4 bg-gray-900 border border-gray-700 rounded-lg mb-4">
      <div className="flex items-center mb-3">
        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center mr-3">
          <span className="text-white text-xs font-bold">✕</span>
        </div>
        <h3 className="text-lg font-semibold text-red-400">
          Validation Errors
        </h3>
      </div>
      <div className="space-y-2">
        {errorEntries.map(([field, error]) => (
          <div key={field} className="flex items-start">
            <span className="text-red-400 mr-2 mt-0.5">→</span>
            <div className="text-gray-300">
              <span className="font-mono text-red-300 capitalize bg-gray-800 px-2 py-0.5 rounded text-xs mr-2">
                {field}
              </span>
              <span className="text-gray-400">{error}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Custom Error Component Example 4: Fun/Playful Style
const PlayfulErrorComponent: React.FC<AutoFormErrorProps> = ({
  errors,
  touched,
}) => {
  const errorEntries = Object.entries(errors).filter(
    ([field]) => touched[field]
  );

  if (errorEntries.length === 0) return null;

  const emojis = ["🤔", "😅", "🙈", "🔍", "💭"];

  return (
    <div className="p-4 bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100 border-2 border-dashed border-purple-300 rounded-2xl mb-4">
      <div className="flex items-center mb-3">
        <span className="text-2xl mr-3">🚨</span>
        <h3 className="text-lg font-bold text-purple-800">
          Whoops! Something needs attention!
        </h3>
      </div>
      <div className="space-y-2">
        {errorEntries.map(([field, error], index) => (
          <div
            key={field}
            className="flex items-center p-2 bg-white/80 rounded-lg border border-purple-200"
          >
            <span className="text-lg mr-3">
              {emojis[index % emojis.length]}
            </span>
            <div className="flex-1">
              <span className="font-bold text-purple-700 capitalize bg-purple-200 px-2 py-1 rounded-full text-xs mr-2">
                {field}
              </span>
              <span className="text-purple-600 italic">{error}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-xs text-purple-600 text-center">
        ✨ Fix these and you'll be golden! ✨
      </div>
    </div>
  );
};

// Custom Error Component Example 5: Toast-Style
const ToastErrorComponent: React.FC<AutoFormErrorProps> = ({
  errors,
  touched,
}) => {
  const errorEntries = Object.entries(errors).filter(
    ([field]) => touched[field]
  );

  if (errorEntries.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="bg-white border-l-4 border-red-500 rounded-lg shadow-lg p-4 mb-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className="text-red-500 text-xl">⚠️</span>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-gray-900">
              Form Validation Errors
            </h3>
            <div className="mt-2 text-sm text-gray-700">
              <ul className="list-disc list-inside space-y-1">
                {errorEntries.map(([field, error]) => (
                  <li key={field}>
                    <span className="font-medium capitalize">{field}:</span>{" "}
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button className="text-gray-400 hover:text-gray-600">
              <span className="sr-only">Close</span>
              <span className="text-lg">×</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export function ErrorComponentDemo() {
  // Fields that will trigger validation errors for demonstration
  const errorDemoFields = [
    {
      name: "firstName",
      label: "First Name",
      type: "text" as const,
      colSpan: 6 as const,
      placeholder: "Enter your first name",
    },
    {
      name: "email",
      label: "Email Address",
      type: "email" as const,
      colSpan: 6 as const,
      placeholder: "Enter your email",
    },
    {
      name: "age",
      label: "Age (18+)",
      type: "number" as const,
      colSpan: 12 as const,
      placeholder: "Enter your age",
    },
  ];

  const handleFormSubmit = (data: User) => {
    console.log("✅ Error Demo Form validation successful! Data:", data);
    alert("✅ Error Demo Form is valid and submitted successfully!");
  };

  const handleFormError = (errors: Record<keyof User, string>) => {
    console.log("❌ Error Demo Form validation failed! Errors:", errors);
  };

  return (
    <div className="space-y-8">
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-xl font-semibold text-red-800 mb-4">
          🚨 Error Component Demo
        </h2>
        <p className="text-red-700 text-sm mb-2">
          <strong>Built-in Error Handling:</strong> AutoForm now includes
          automatic error display with customizable components.
        </p>
        <p className="text-red-600 text-xs">
          Try submitting the forms below without filling them out to see the
          different error component styles in action!
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Default Error Component */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            📋 Default Error Component
          </h3>
          <AutoForm
            schema={userSchema}
            fields={errorDemoFields}
            layout="grid"
            columns={12}
            onSubmit={handleFormSubmit}
            onError={handleFormError}
            initialValues={{
              firstName: "",
              email: "",
              age: undefined,
            }}
          />
        </div>

        {/* Elegant Error Component */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            🎨 Elegant Error Component
          </h3>
          <AutoForm
            schema={userSchema}
            fields={errorDemoFields}
            layout="grid"
            columns={12}
            onSubmit={handleFormSubmit}
            onError={handleFormError}
            customErrorComponent={ElegantErrorComponent}
            initialValues={{
              firstName: "",
              email: "",
              age: undefined,
            }}
          />
        </div>

        {/* Minimal Error Component */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            ⚡ Minimal Error Component
          </h3>
          <AutoForm
            schema={userSchema}
            fields={errorDemoFields}
            layout="grid"
            columns={12}
            onSubmit={handleFormSubmit}
            onError={handleFormError}
            customErrorComponent={MinimalErrorComponent}
            initialValues={{
              firstName: "",
              email: "",
              age: undefined,
            }}
          />
        </div>

        {/* Dark Error Component */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            🌙 Dark Mode Error Component
          </h3>
          <AutoForm
            schema={userSchema}
            fields={errorDemoFields}
            layout="grid"
            columns={12}
            onSubmit={handleFormSubmit}
            onError={handleFormError}
            customErrorComponent={DarkErrorComponent}
            initialValues={{
              firstName: "",
              email: "",
              age: undefined,
            }}
          />
        </div>
      </div>

      {/* Playful Error Component - Full Width */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          🎉 Playful Error Component
        </h3>
        <AutoForm
          schema={userSchema}
          fields={errorDemoFields}
          layout="grid"
          columns={12}
          onSubmit={handleFormSubmit}
          onError={handleFormError}
          customErrorComponent={PlayfulErrorComponent}
          initialValues={{
            firstName: "",
            email: "",
            age: undefined,
          }}
        />
      </div>

      {/* Toast Error Component - Full Width */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          🍞 Toast-Style Error Component (Fixed Position)
        </h3>
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded mb-4">
          <p className="text-yellow-800 text-sm">
            ⚠️ <strong>Note:</strong> The toast component appears in the
            top-right corner of the screen when errors occur.
          </p>
        </div>
        <AutoForm
          schema={userSchema}
          fields={errorDemoFields}
          layout="grid"
          columns={12}
          onSubmit={handleFormSubmit}
          onError={handleFormError}
          customErrorComponent={ToastErrorComponent}
          initialValues={{
            firstName: "",
            email: "",
            age: undefined,
          }}
        />
      </div>

      {/* Code Example */}
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">
          💻 Creating Your Own Custom Error Component
        </h4>
        <p className="text-gray-600 text-sm mb-4">
          Creating custom error components is simple! Just implement the
          AutoFormErrorProps interface:
        </p>
        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto">
          <pre>{`import { AutoFormErrorProps } from 'el-form';

const MyCustomErrorComponent: React.FC<AutoFormErrorProps> = ({
  errors,
  touched,
}) => {
  const errorEntries = Object.entries(errors).filter(
    ([field]) => touched[field]
  );

  if (errorEntries.length === 0) return null;

  return (
    <div className="my-custom-error-styles">
      {errorEntries.map(([field, error]) => (
        <div key={field}>
          {field}: {error}
        </div>
      ))}
    </div>
  );
};

// Use it in your AutoForm
<AutoForm
  customErrorComponent={MyCustomErrorComponent}
  // ... other props
/>`}</pre>
        </div>
      </div>

      {/* Instructions */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-md font-semibold text-blue-800 mb-2">
          💡 How to Test:
        </h4>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>1. Click "Submit" on any form without filling anything out</li>
          <li>2. Notice how errors appear differently in each form style</li>
          <li>3. Fill in some fields and see how errors update dynamically</li>
          <li>
            4. Each form demonstrates a different custom error component
            approach
          </li>
          <li>
            5. You can easily create your own by implementing the
            AutoFormErrorProps interface
          </li>
        </ul>
      </div>
    </div>
  );
}
