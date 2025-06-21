import React from "react";
import { AutoForm } from "el-form-react";
import { z } from "zod";

// Basic Array Example
const skillsSchema = z.object({
  name: z.string().min(1, "Name is required"),
  skills: z
    .array(z.string().min(1, "Skill cannot be empty"))
    .min(1, "At least one skill is required"),
});

export const BasicArrayExample: React.FC = () => {
  const handleSubmit = (data: Record<string, any>) => {
    console.log("Skills data:", data);
    alert(`Submitted: ${JSON.stringify(data, null, 2)}`);
  };

  const handleError = (errors: Record<string, string>) => {
    console.log("Validation errors:", errors);
  };

  const fields = [
    {
      name: "name",
      label: "Your Name",
      type: "text" as const,
      placeholder: "Enter your name",
      colSpan: 12 as const,
    },
    {
      name: "skills",
      label: "Skills",
      type: "array" as const,
      placeholder: "Add your technical skills",
      colSpan: 12 as const,
    },
  ];

  return (
    <AutoForm
      schema={skillsSchema}
      fields={fields}
      layout="grid"
      columns={12}
      onSubmit={handleSubmit}
      onError={handleError}
    />
  );
};

// Object Array Example
const contactsSchema = z.object({
  name: z.string().min(1, "Name required"),
  contacts: z
    .array(
      z.object({
        name: z.string().min(1, "Contact name is required"),
        email: z.string().email("Valid email required"),
        phone: z.string().optional(),
        type: z.enum(["personal", "work", "other"], {
          required_error: "Please select a contact type",
        }),
      })
    )
    .min(1, "At least one contact is required"),
});

export const ObjectArrayExample: React.FC = () => {
  const handleSubmit = (data: Record<string, any>) => {
    console.log("Contacts data:", data);
    alert(`Submitted: ${JSON.stringify(data, null, 2)}`);
  };

  const handleError = (errors: Record<string, string>) => {
    console.log("Validation errors:", errors);
  };

  const fields = [
    {
      name: "name",
      label: "Your Name",
      type: "text" as const,
      placeholder: "Enter your name",
      colSpan: 12 as const,
    },
    {
      name: "contacts",
      label: "Contacts",
      type: "array" as const,
      placeholder: "Add your emergency contacts",
      colSpan: 12 as const,
    },
  ];

  return (
    <AutoForm
      schema={contactsSchema}
      fields={fields}
      layout="grid"
      columns={12}
      onSubmit={handleSubmit}
      onError={handleError}
    />
  );
};

// Nested Array Example (simplified version of the complex one)
const nestedArraySchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  departments: z
    .array(
      z.object({
        name: z.string().min(1, "Department name is required"),
        employees: z
          .array(
            z.object({
              name: z.string().min(1, "Employee name is required"),
              position: z.string().min(1, "Position is required"),
              salary: z.number().min(0, "Salary must be positive"),
            })
          )
          .optional(),
      })
    )
    .min(1, "At least one department is required"),
});

export const NestedArrayExample: React.FC = () => {
  const handleSubmit = (data: Record<string, any>) => {
    console.log("Nested array data:", data);
    alert(`Submitted: ${JSON.stringify(data, null, 2)}`);
  };

  const handleError = (errors: Record<string, string>) => {
    console.log("Validation errors:", errors);
  };

  const fields = [
    {
      name: "companyName",
      label: "Company Name",
      type: "text" as const,
      placeholder: "Enter company name",
      colSpan: 12 as const,
    },
    {
      name: "departments",
      label: "Departments",
      type: "array" as const,
      placeholder: "Add company departments",
      colSpan: 12 as const,
    },
  ];

  return (
    <AutoForm
      schema={nestedArraySchema}
      fields={fields}
      layout="grid"
      columns={12}
      onSubmit={handleSubmit}
      onError={handleError}
    />
  );
};
