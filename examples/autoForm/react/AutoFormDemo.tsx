import { AutoForm } from "../../../packages/auto-form/src";
import { userSchema, User } from "../../react/userSchema";

export function AutoFormDemo() {
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
    console.log("✅ AutoForm validation successful! Data:", data);
    alert("✅ AutoForm is valid and submitted successfully!");
  };

  const handleFormError = (errors: Record<keyof User, string>) => {
    console.log("❌ AutoForm validation failed! Errors:", errors);
    alert("❌ AutoForm has validation errors. Check console for details.");
  };

  return (
    <div>
      <div
        style={{
          marginBottom: "24px",
          padding: "16px",
          backgroundColor: "#e0f7fa",
          borderRadius: "8px",
          border: "1px solid #26c6da",
        }}
      >
        <h2 style={{ margin: "0 0 12px 0", color: "#006064" }}>
          🚀 API #1: AutoForm Component
        </h2>
        <p style={{ margin: "0", fontSize: "14px", color: "#00838f" }}>
          <strong>Declarative:</strong> Just pass schema + field config.
          Automatic rendering, layout, and styling.
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
      />
    </div>
  );
}
