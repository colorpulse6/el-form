import React from "react";
import { AutoForm, AutoFormErrorProps } from "el-form-react";
import { z } from "zod";

// Schema for demonstrating errors
const userSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Please enter a valid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain uppercase, lowercase, and number"
      ),
    confirmPassword: z.string(),
    age: z.number().min(18, "Must be at least 18 years old"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

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
              <span className="ml-2 text-pink-600">{String(error)}</span>
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
    <div className="border-l-4 border-red-400 bg-red-50 p-4 mb-4">
      <div className="flex">
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            {errorEntries.length} validation error(s)
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <ul className="list-disc pl-5 space-y-1">
              {errorEntries.map(([field, error]) => (
                <li key={field}>
                  <strong className="capitalize">{field}:</strong>{" "}
                  {String(error)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Default Error Example
export const DefaultErrorExample: React.FC = () => {
  const handleSubmit = (data: Record<string, any>) => {
    console.log("Form data:", data);
    alert(`Submitted: ${JSON.stringify(data, null, 2)}`);
  };

  const handleError = (errors: Record<string, string>) => {
    console.log("Validation errors:", errors);
  };

  const fields = [
    {
      name: "firstName",
      label: "First Name",
      type: "text" as const,
      placeholder: "Enter your first name",
      colSpan: 6 as const,
    },
    {
      name: "lastName",
      label: "Last Name",
      type: "text" as const,
      placeholder: "Enter your last name",
      colSpan: 6 as const,
    },
    {
      name: "email",
      label: "Email Address",
      type: "email" as const,
      placeholder: "Enter your email",
      colSpan: 12 as const,
    },
    {
      name: "password",
      label: "Password",
      type: "password" as const,
      placeholder: "Enter password",
      colSpan: 6 as const,
    },
    {
      name: "confirmPassword",
      label: "Confirm Password",
      type: "password" as const,
      placeholder: "Confirm password",
      colSpan: 6 as const,
    },
    {
      name: "age",
      label: "Age",
      type: "number" as const,
      placeholder: "Enter your age",
      colSpan: 12 as const,
    },
  ];

  return (
    <AutoForm
      schema={userSchema}
      fields={fields}
      layout="grid"
      columns={12}
      onSubmit={handleSubmit}
      onError={handleError}
    />
  );
};

// Elegant Error Example
export const ElegantErrorExample: React.FC = () => {
  const handleSubmit = (data: Record<string, any>) => {
    console.log("Form data:", data);
    alert(`Submitted: ${JSON.stringify(data, null, 2)}`);
  };

  const handleError = (errors: Record<string, string>) => {
    console.log("Validation errors:", errors);
  };

  const fields = [
    {
      name: "firstName",
      label: "First Name",
      type: "text" as const,
      placeholder: "Enter your first name",
      colSpan: 6 as const,
    },
    {
      name: "lastName",
      label: "Last Name",
      type: "text" as const,
      placeholder: "Enter your last name",
      colSpan: 6 as const,
    },
    {
      name: "email",
      label: "Email Address",
      type: "email" as const,
      placeholder: "Enter your email",
      colSpan: 12 as const,
    },
    {
      name: "password",
      label: "Password",
      type: "password" as const,
      placeholder: "Enter password",
      colSpan: 6 as const,
    },
    {
      name: "confirmPassword",
      label: "Confirm Password",
      type: "password" as const,
      placeholder: "Confirm password",
      colSpan: 6 as const,
    },
    {
      name: "age",
      label: "Age",
      type: "number" as const,
      placeholder: "Enter your age",
      colSpan: 12 as const,
    },
  ];

  return (
    <AutoForm
      schema={userSchema}
      fields={fields}
      layout="grid"
      columns={12}
      onSubmit={handleSubmit}
      onError={handleError}
      customErrorComponent={ElegantErrorComponent}
    />
  );
};

// Minimal Error Example
export const MinimalErrorExample: React.FC = () => {
  const handleSubmit = (data: Record<string, any>) => {
    console.log("Form data:", data);
    alert(`Submitted: ${JSON.stringify(data, null, 2)}`);
  };

  const handleError = (errors: Record<string, string>) => {
    console.log("Validation errors:", errors);
  };

  const fields = [
    {
      name: "firstName",
      label: "First Name",
      type: "text" as const,
      placeholder: "Enter your first name",
      colSpan: 6 as const,
    },
    {
      name: "lastName",
      label: "Last Name",
      type: "text" as const,
      placeholder: "Enter your last name",
      colSpan: 6 as const,
    },
    {
      name: "email",
      label: "Email Address",
      type: "email" as const,
      placeholder: "Enter your email",
      colSpan: 12 as const,
    },
    {
      name: "password",
      label: "Password",
      type: "password" as const,
      placeholder: "Enter password",
      colSpan: 6 as const,
    },
    {
      name: "confirmPassword",
      label: "Confirm Password",
      type: "password" as const,
      placeholder: "Confirm password",
      colSpan: 6 as const,
    },
    {
      name: "age",
      label: "Age",
      type: "number" as const,
      placeholder: "Enter your age",
      colSpan: 12 as const,
    },
  ];

  return (
    <AutoForm
      schema={userSchema}
      fields={fields}
      layout="grid"
      columns={12}
      onSubmit={handleSubmit}
      onError={handleError}
      customErrorComponent={MinimalErrorComponent}
    />
  );
};
