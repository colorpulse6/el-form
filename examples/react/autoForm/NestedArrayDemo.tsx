// AutoForm is exported from the React-specific entry point
import { AutoForm } from "el-form/react";
import { z } from "zod";

// Define nested schema for deeply nested arrays
const nestedArraySchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  employees: z
    .array(
      z.object({
        name: z.string().min(1, "Employee name is required"),
        position: z.string().min(1, "Position is required"),
        salary: z.number().min(0, "Salary must be positive"),
        friends: z
          .array(
            z.object({
              name: z.string().min(1, "Friend name is required"),
              relationship: z.string().min(1, "Relationship is required"),
              addresses: z
                .array(
                  z.object({
                    street: z.string().min(1, "Street is required"),
                    city: z.string().min(1, "City is required"),
                    zipCode: z.string().min(1, "Zip code is required"),
                    residents: z
                      .array(
                        z.object({
                          name: z.string().min(1, "Resident name is required"),
                          age: z.number().min(0, "Age must be positive"),
                          isOwner: z
                            .string()
                            .min(1, "Please select owner status"),
                        })
                      )
                      .optional(),
                  })
                )
                .optional(),
            })
          )
          .optional(),
      })
    )
    .optional(),
});

type NestedArrayData = z.infer<typeof nestedArraySchema>;

export function NestedArrayDemo() {
  // Nested array field configuration
  const nestedFields = [
    {
      name: "companyName",
      label: "Company Name",
      type: "text" as const,
      colSpan: 12 as const,
      placeholder: "Enter company name",
    },
    {
      name: "employees",
      label: "Employees",
      type: "array" as const,
      colSpan: 12 as const,
      fields: [
        {
          name: "name",
          label: "Employee Name",
          type: "text" as const,
          placeholder: "Enter employee name",
        },
        {
          name: "position",
          label: "Position",
          type: "text" as const,
          placeholder: "Enter position",
        },
        {
          name: "salary",
          label: "Salary",
          type: "number" as const,
          placeholder: "Enter salary",
        },
        {
          name: "friends",
          label: "Friends",
          type: "array" as const,
          fields: [
            {
              name: "name",
              label: "Friend Name",
              type: "text" as const,
              placeholder: "Enter friend name",
            },
            {
              name: "relationship",
              label: "Relationship",
              type: "text" as const,
              placeholder: "e.g., colleague, family",
            },
            {
              name: "addresses",
              label: "Addresses",
              type: "array" as const,
              fields: [
                {
                  name: "street",
                  label: "Street",
                  type: "text" as const,
                  placeholder: "Enter street address",
                },
                {
                  name: "city",
                  label: "City",
                  type: "text" as const,
                  placeholder: "Enter city",
                },
                {
                  name: "zipCode",
                  label: "Zip Code",
                  type: "text" as const,
                  placeholder: "Enter zip code",
                },
                {
                  name: "residents",
                  label: "Residents",
                  type: "array" as const,
                  fields: [
                    {
                      name: "name",
                      label: "Resident Name",
                      type: "text" as const,
                      placeholder: "Enter resident name",
                    },
                    {
                      name: "age",
                      label: "Age",
                      type: "number" as const,
                      placeholder: "Enter age",
                    },
                    {
                      name: "isOwner",
                      label: "Is Owner",
                      type: "select" as const,
                      options: [
                        { value: "true", label: "Yes" },
                        { value: "false", label: "No" },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  const handleFormSubmit = (data: NestedArrayData) => {
    console.log("✅ Nested Array Form submitted successfully! Data:", data);
    console.log("📊 JSON Structure:", JSON.stringify(data, null, 2));
    alert(
      "✅ Nested Array Form submitted successfully! Check console for detailed structure."
    );
  };

  const handleFormError = (errors: Record<keyof NestedArrayData, string>) => {
    console.log("❌ Nested Array Form validation failed! Errors:", errors);
    alert(
      "❌ Nested Array Form has validation errors. Check console for details."
    );
  };

  return (
    <div>
      <div
        style={{
          marginBottom: "24px",
          padding: "16px",
          backgroundColor: "#f3e5f5",
          borderRadius: "8px",
          border: "1px solid #9c27b0",
        }}
      >
        <h2 style={{ margin: "0 0 12px 0", color: "#4a148c" }}>
          🌳 Deeply Nested Arrays Demo
        </h2>
        <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#6a1b9a" }}>
          <strong>4-Level Deep Nesting:</strong> Company → Employees → Friends →
          Addresses → Residents
        </p>
        <p style={{ margin: "0", fontSize: "12px", color: "#7b1fa2" }}>
          Demonstrates recursive array handling with automatic Add/Remove
          buttons at each level.
        </p>
      </div>

      <AutoForm
        schema={nestedArraySchema}
        fields={nestedFields}
        layout="grid"
        columns={12}
        onSubmit={handleFormSubmit}
        onError={handleFormError}
        initialValues={{
          companyName: "",
          employees: [],
        }}
      />

      <div
        style={{
          marginTop: "24px",
          padding: "16px",
          backgroundColor: "#e8f5e8",
          borderRadius: "8px",
          border: "1px solid #4caf50",
        }}
      >
        <h3 style={{ margin: "0 0 12px 0", color: "#2e7d32" }}>
          💡 How It Works
        </h3>
        <ul
          style={{
            margin: "0",
            paddingLeft: "20px",
            fontSize: "14px",
            color: "#388e3c",
          }}
        >
          <li>
            <strong>Level 1:</strong> Company has multiple Employees
          </li>
          <li>
            <strong>Level 2:</strong> Each Employee has multiple Friends
          </li>
          <li>
            <strong>Level 3:</strong> Each Friend has multiple Addresses
          </li>
          <li>
            <strong>Level 4:</strong> Each Address has multiple Residents
          </li>
          <li>
            <strong>Validation:</strong> All levels validate recursively with
            Zod
          </li>
          <li>
            <strong>State Management:</strong> Automatic dot-notation path
            handling
          </li>
        </ul>
      </div>
    </div>
  );
}
