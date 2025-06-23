import React, { useState, createContext, useContext } from "react";
import { useForm } from "el-form-react";
import { z } from "zod";

// Mock FormProvider and useFormContext for documentation purposes
// In real implementation, these would come from el-form-react-hooks
const FormContext = createContext<{ form: any } | null>(null);

function FormProvider({
  children,
  form,
}: {
  children: React.ReactNode;
  form: any;
}) {
  return (
    <FormContext.Provider value={{ form }}>{children}</FormContext.Provider>
  );
}

function useFormContext() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useFormContext must be used within a FormProvider");
  }
  return context as { form: any };
}

// User schema for examples
const userSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  bio: z.string().optional(),
});

type UserForm = z.infer<typeof userSchema>;

// Example 1: Context Pattern (TanStack-style)
function ContextPatternField<T extends Record<string, any>>({
  name,
  label,
  type = "text",
}: {
  name: keyof T;
  label: string;
  type?: string;
}) {
  const { form } = useFormContext();
  const fieldState = form.getFieldState(String(name));

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {type === "textarea" ? (
        <textarea
          {...form.register(String(name))}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            fieldState.error ? "border-red-500" : "border-gray-300"
          }`}
          rows={3}
        />
      ) : (
        <input
          {...form.register(String(name))}
          type={type}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            fieldState.error ? "border-red-500" : "border-gray-300"
          }`}
        />
      )}
      {fieldState.error && (
        <p className="text-red-500 text-sm">{fieldState.error}</p>
      )}
    </div>
  );
}

// Example 2: Form Passing Pattern (Conform-style)
function FormPassingField<T extends Record<string, any>>({
  name,
  label,
  form,
  type = "text",
}: {
  name: keyof T;
  label: string;
  form: any; // UseFormReturn<T> but simplified for demo
  type?: string;
}) {
  const fieldState = form.getFieldState(String(name));

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {type === "textarea" ? (
        <textarea
          {...form.register(String(name))}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            fieldState.error ? "border-red-500" : "border-gray-300"
          }`}
          rows={3}
        />
      ) : (
        <input
          {...form.register(String(name))}
          type={type}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            fieldState.error ? "border-red-500" : "border-gray-300"
          }`}
        />
      )}
      {fieldState.error && (
        <p className="text-red-500 text-sm">{fieldState.error}</p>
      )}
    </div>
  );
}

// Example 3: Hybrid Pattern
function HybridField<T extends Record<string, any>>({
  name,
  label,
  form, // Optional
  type = "text",
}: {
  name: keyof T;
  label: string;
  form?: any; // UseFormReturn<T> but simplified for demo
  type?: string;
}) {
  // Try to get form from context first, fallback to passed form
  let formInstance: any;

  try {
    const { form: contextForm } = useFormContext();
    formInstance = form || contextForm;
  } catch {
    if (!form) {
      throw new Error(
        "HybridField must be used within FormProvider or receive form prop"
      );
    }
    formInstance = form;
  }

  const fieldState = formInstance.getFieldState(String(name));

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {type === "textarea" ? (
        <textarea
          {...formInstance.register(String(name))}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            fieldState.error ? "border-red-500" : "border-gray-300"
          }`}
          rows={3}
        />
      ) : (
        <input
          {...formInstance.register(String(name))}
          type={type}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            fieldState.error ? "border-red-500" : "border-gray-300"
          }`}
        />
      )}
      {fieldState.error && (
        <p className="text-red-500 text-sm">{fieldState.error}</p>
      )}
    </div>
  );
}

// Context Pattern Example
export const ContextPatternExample: React.FC = () => {
  const form = useForm({
    schema: userSchema,
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      bio: "",
    },
  });

  const handleSubmit = (data: UserForm) => {
    alert(
      `Context Pattern - Form submitted! Name: ${data.firstName} ${data.lastName}`
    );
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Context Pattern (TanStack-style)
      </h3>
      <FormProvider form={form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <ContextPatternField<UserForm> name="firstName" label="First Name" />
          <ContextPatternField<UserForm> name="lastName" label="Last Name" />
          <ContextPatternField<UserForm>
            name="email"
            label="Email"
            type="email"
          />
          <ContextPatternField<UserForm>
            name="bio"
            label="Bio"
            type="textarea"
          />

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Submit with Context
          </button>
        </form>
      </FormProvider>
    </div>
  );
};

// Form Passing Pattern Example
export const FormPassingExample: React.FC = () => {
  const form = useForm({
    schema: userSchema,
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      bio: "",
    },
  });

  const handleSubmit = (data: UserForm) => {
    alert(
      `Form Passing - Form submitted! Name: ${data.firstName} ${data.lastName}`
    );
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Form Passing Pattern (Conform-style)
      </h3>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormPassingField<UserForm>
          name="firstName"
          label="First Name"
          form={form}
        />
        <FormPassingField<UserForm>
          name="lastName"
          label="Last Name"
          form={form}
        />
        <FormPassingField<UserForm>
          name="email"
          label="Email"
          type="email"
          form={form}
        />
        <FormPassingField<UserForm>
          name="bio"
          label="Bio"
          type="textarea"
          form={form}
        />

        <button
          type="submit"
          className="w-full px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Submit with Form Passing
        </button>
      </form>
    </div>
  );
};

// Hybrid Pattern Example
export const HybridPatternExample: React.FC = () => {
  const form = useForm({
    schema: userSchema,
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      bio: "",
    },
  });

  const handleSubmit = (data: UserForm) => {
    alert(
      `Hybrid Pattern - Form submitted! Name: ${data.firstName} ${data.lastName}`
    );
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Hybrid Pattern (Best of Both)
      </h3>
      <FormProvider form={form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* These use context */}
          <HybridField<UserForm> name="firstName" label="First Name" />
          <HybridField<UserForm> name="lastName" label="Last Name" />

          {/* These explicitly pass form (overrides context) */}
          <HybridField<UserForm>
            name="email"
            label="Email"
            type="email"
            form={form}
          />
          <HybridField<UserForm>
            name="bio"
            label="Bio"
            type="textarea"
            form={form}
          />

          <button
            type="submit"
            className="w-full px-4 py-2 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            Submit with Hybrid
          </button>
        </form>
      </FormProvider>
    </div>
  );
};

// Combined demo showing all three patterns
export const FormReusabilityDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"context" | "passing" | "hybrid">(
    "context"
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Form Component Reusability Patterns
        </h2>
        <p className="text-gray-600 mb-6">
          El Form supports multiple patterns for creating reusable form
          components. Choose the one that best fits your team's preferences and
          project needs.
        </p>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("context")}
            className={`px-4 py-2 font-medium text-sm border-b-2 ${
              activeTab === "context"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Context Pattern
          </button>
          <button
            onClick={() => setActiveTab("passing")}
            className={`px-4 py-2 font-medium text-sm border-b-2 ${
              activeTab === "passing"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Form Passing
          </button>
          <button
            onClick={() => setActiveTab("hybrid")}
            className={`px-4 py-2 font-medium text-sm border-b-2 ${
              activeTab === "hybrid"
                ? "border-purple-500 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Hybrid Pattern
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "context" && <ContextPatternExample />}
        {activeTab === "passing" && <FormPassingExample />}
        {activeTab === "hybrid" && <HybridPatternExample />}
      </div>

      {/* Pattern Information */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">
          {activeTab === "context" && "Context Pattern Benefits:"}
          {activeTab === "passing" && "Form Passing Benefits:"}
          {activeTab === "hybrid" && "Hybrid Pattern Benefits:"}
        </h4>

        {activeTab === "context" && (
          <ul className="text-sm text-gray-600 space-y-1">
            <li>✅ Clean, declarative API - no prop drilling</li>
            <li>✅ Automatic form state management</li>
            <li>✅ Type-safe field access</li>
            <li>❌ Components must be used within FormProvider</li>
          </ul>
        )}

        {activeTab === "passing" && (
          <ul className="text-sm text-gray-600 space-y-1">
            <li>✅ Explicit dependencies - easy to understand</li>
            <li>✅ Works across multiple forms</li>
            <li>✅ Easier to test in isolation</li>
            <li>❌ More verbose API with prop passing</li>
          </ul>
        )}

        {activeTab === "hybrid" && (
          <ul className="text-sm text-gray-600 space-y-1">
            <li>✅ Best of both worlds - flexible API</li>
            <li>✅ Context when available, explicit when needed</li>
            <li>✅ Maximum reusability across different patterns</li>
            <li>✅ Perfect for component libraries</li>
          </ul>
        )}
      </div>
    </div>
  );
};
