import { AutoForm } from "../../../packages/auto-form/src";
import { z } from "zod";

// Simple nested array schema for testing
const simpleNestedSchema = z.object({
  title: z.string().min(1, "Title is required"),
  items: z
    .array(
      z.object({
        name: z.string().min(1, "Item name is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        tags: z
          .array(
            z.object({
              label: z.string().min(1, "Tag label is required"),
              color: z.string().min(1, "Color is required"),
            })
          )
          .optional(),
      })
    )
    .optional(),
});

type SimpleNestedData = z.infer<typeof simpleNestedSchema>;

export function SimpleNestedTest() {
  const fields = [
    {
      name: "title",
      label: "Title",
      type: "text" as const,
      colSpan: 12 as const,
      placeholder: "Enter title",
    },
    {
      name: "items",
      label: "Items",
      type: "array" as const,
      colSpan: 12 as const,
      fields: [
        {
          name: "name",
          label: "Item Name",
          type: "text" as const,
          placeholder: "Enter item name",
        },
        {
          name: "quantity",
          label: "Quantity",
          type: "number" as const,
          placeholder: "Enter quantity",
        },
        {
          name: "tags",
          label: "Tags",
          type: "array" as const,
          fields: [
            {
              name: "label",
              label: "Tag Label",
              type: "text" as const,
              placeholder: "Enter tag label",
            },
            {
              name: "color",
              label: "Color",
              type: "text" as const,
              placeholder: "Enter color",
            },
          ],
        },
      ],
    },
  ];

  const handleSubmit = (data: SimpleNestedData) => {
    console.log("✅ Simple nested form submitted:", data);
    alert("✅ Form submitted successfully! Check console for data structure.");
  };

  const handleError = (errors: any) => {
    console.log("❌ Form errors:", errors);
  };

  return (
    <div>
      <div
        style={{
          marginBottom: "24px",
          padding: "16px",
          backgroundColor: "#e1f5fe",
          borderRadius: "8px",
          border: "1px solid #03a9f4",
        }}
      >
        <h2 style={{ margin: "0 0 12px 0", color: "#0277bd" }}>
          🧪 Simple Nested Arrays Test
        </h2>
        <p style={{ margin: "0", fontSize: "14px", color: "#0288d1" }}>
          <strong>Test Structure:</strong> Title → Items → Tags (3 levels deep)
        </p>
      </div>

      <AutoForm
        schema={simpleNestedSchema}
        fields={fields}
        layout="grid"
        columns={12}
        onSubmit={handleSubmit}
        onError={handleError}
        initialValues={{
          title: "",
          items: [],
        }}
      />
    </div>
  );
}
