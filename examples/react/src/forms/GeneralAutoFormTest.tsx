import { AutoForm } from "el-form-react-components";
import { useState } from "react";
import z from "zod";

/**
 * General AutoForm Test
 *
 * This example demonstrates AutoForm's automatic form generation from Zod schemas:
 * - Automatic field type detection (text, email, number, checkbox, select, date)
 * - Optional and nullable field handling (z.optional(), z.nullable())
 * - Nested object flattening with dot notation
 * - Default values with z.default()
 * - Enum fields rendered as select dropdowns
 * - Mixed required and optional fields
 * - Validation feedback on blur and submit
 */

// Schema demonstrating various field types and wrapper types
const userProfileSchema = z.object({
  // Required string fields with different types
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),

  // Optional string field
  nickname: z.string().optional(),

  // Nullable number field
  age: z.number().min(0).max(120).nullable(),

  // Required number
  yearsOfExperience: z.number().min(0, "Must be 0 or more"),

  // Boolean field
  newsletter: z.boolean(),

  // Enum as select dropdown
  role: z.enum(["developer", "designer", "manager", "other"]),

  // String with default value
  country: z.string().default("United States"),

  // Optional URL
  website: z.string().url("Must be a valid URL").optional(),

  // Nested object - will be flattened
  preferences: z.object({
    theme: z.enum(["light", "dark", "system"]),
    language: z.string().default("en"),
    notifications: z.boolean(),
  }),

  // Deeply nested object
  address: z.object({
    street: z.string().optional(),
    city: z.string(),
    zipCode: z.string().regex(/^\d{5}$/, "Must be 5 digits").optional(),
  }),
});

type UserProfile = z.infer<typeof userProfileSchema>;

export function GeneralAutoFormTest() {
  const [submitResult, setSubmitResult] = useState<UserProfile | null>(null);
  const [submitError, setSubmitError] = useState<Record<string, string> | null>(null);

  const handleSubmit = (data: UserProfile) => {
    console.log("Form submitted:", data);
    setSubmitResult(data);
    setSubmitError(null);
  };

  const handleError = (errors: Record<string, string>) => {
    console.log("Form errors:", errors);
    setSubmitError(errors);
    setSubmitResult(null);
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h2>General AutoForm Test</h2>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        This demonstrates AutoForm's automatic form generation from a Zod schema.
        The form is generated entirely from the schema - no manual field definitions needed!
      </p>

      {/* Feature highlights */}
      <div
        style={{
          background: "#f0f9ff",
          padding: "16px",
          borderRadius: "8px",
          marginBottom: "24px",
        }}
      >
        <h4 style={{ margin: "0 0 8px 0" }}>Features Demonstrated:</h4>
        <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "14px" }}>
          <li>
            <strong>Wrapper Types:</strong> z.optional(), z.nullable(), z.default()
          </li>
          <li>
            <strong>Nested Objects:</strong> preferences.theme, address.city
          </li>
          <li>
            <strong>Field Types:</strong> text, email, number, checkbox, select
          </li>
          <li>
            <strong>Validation:</strong> onBlur mode with error feedback
          </li>
        </ul>
      </div>

      <AutoForm
        schema={userProfileSchema}
        initialValues={{
          username: "",
          email: "",
          nickname: undefined,
          age: null,
          yearsOfExperience: 0,
          newsletter: false,
          role: "developer",
          country: "United States",
          website: undefined,
          preferences: {
            theme: "system",
            language: "en",
            notifications: true,
          },
          address: {
            street: "",
            city: "",
            zipCode: "",
          },
        }}
        validateOn="onBlur"
        onSubmit={handleSubmit}
        onError={handleError}
        layout="grid"
        columns={12}
        fields={[
          // Customize specific fields
          { name: "username", colSpan: 6, placeholder: "Enter username" },
          { name: "email", colSpan: 6, placeholder: "your@email.com" },
          { name: "nickname", colSpan: 4, placeholder: "Optional nickname" },
          { name: "age", colSpan: 4, placeholder: "Your age (optional)" },
          { name: "yearsOfExperience", colSpan: 4, placeholder: "Years" },
          { name: "newsletter", colSpan: 6, label: "Subscribe to newsletter" },
          { name: "role", colSpan: 6 },
          { name: "country", colSpan: 6 },
          { name: "website", colSpan: 6, placeholder: "https://..." },
        ]}
        submitButtonProps={{
          children: "Save Profile",
          style: { background: "#3b82f6" },
        }}
        resetButtonProps={{
          children: "Clear Form",
          style: { background: "#6b7280" },
        }}
      />

      {/* Submit Result */}
      {submitResult && (
        <div
          style={{
            marginTop: "24px",
            padding: "16px",
            background: "#d1fae5",
            borderRadius: "8px",
          }}
        >
          <h3 style={{ marginBottom: "8px", color: "#065f46" }}>
            ✅ Form Submitted Successfully!
          </h3>
          <pre style={{ fontSize: "12px", overflow: "auto", maxHeight: "300px" }}>
            {JSON.stringify(submitResult, null, 2)}
          </pre>
        </div>
      )}

      {/* Submit Error */}
      {submitError && (
        <div
          style={{
            marginTop: "24px",
            padding: "16px",
            background: "#fee2e2",
            borderRadius: "8px",
          }}
        >
          <h3 style={{ marginBottom: "8px", color: "#991b1b" }}>
            ❌ Validation Errors
          </h3>
          <ul style={{ margin: 0, paddingLeft: "20px" }}>
            {Object.entries(submitError).map(([field, error]) => (
              <li key={field}>
                <strong>{field}:</strong> {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Schema Reference */}
      <div
        style={{
          marginTop: "24px",
          padding: "16px",
          background: "#f3f4f6",
          borderRadius: "8px",
        }}
      >
        <h4 style={{ margin: "0 0 8px 0" }}>Schema Structure:</h4>
        <pre style={{ fontSize: "11px", overflow: "auto", maxHeight: "200px" }}>
{`const userProfileSchema = z.object({
  username: z.string().min(3),        // required
  email: z.string().email(),          // required, email type
  nickname: z.string().optional(),    // optional
  age: z.number().nullable(),         // nullable
  yearsOfExperience: z.number(),      // required number
  newsletter: z.boolean(),            // checkbox
  role: z.enum([...]),                // select dropdown
  country: z.string().default("US"),  // default value
  website: z.string().url().optional(),
  preferences: z.object({             // nested object
    theme: z.enum([...]),
    language: z.string().default("en"),
    notifications: z.boolean(),
  }),
  address: z.object({...}),           // deeply nested
});`}
        </pre>
      </div>
    </div>
  );
}

export default GeneralAutoFormTest;
