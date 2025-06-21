import { AutoForm } from "el-form-react";
import { z } from "zod";

// Simple AutoForm Example
const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.number().min(18, "Must be 18 or older"),
  email: z.string().email("Invalid email address"),
});

export function SimpleAutoFormExample() {
  const handleSubmit = (data: Record<string, any>) => {
    alert(
      `Form submitted!\nName: ${data.name}\nAge: ${data.age}\nEmail: ${data.email}`
    );
  };

  const fields = [
    {
      name: "name",
      label: "Name",
      type: "text" as const,
      colSpan: 12 as const,
      placeholder: "Enter your name",
    },
    {
      name: "age",
      label: "Age",
      type: "number" as const,
      colSpan: 12 as const,
      placeholder: "Enter your age",
    },
    {
      name: "email",
      label: "Email",
      type: "email" as const,
      colSpan: 12 as const,
      placeholder: "Enter your email",
    },
  ];

  return (
    <div className="w-full max-w-md mx-auto">
      <AutoForm
        schema={userSchema}
        fields={fields}
        layout="grid"
        columns={12}
        onSubmit={handleSubmit}
        initialValues={{
          name: "",
          age: undefined,
          email: "",
        }}
      />
    </div>
  );
}

// Field Configuration Example
export function FieldConfigExample() {
  const handleSubmit = (data: Record<string, any>) => {
    alert(
      `Form submitted!\nName: ${data.name}\nAge: ${data.age}\nEmail: ${data.email}`
    );
  };

  const fields = [
    {
      name: "name",
      label: "Full Name",
      type: "text" as const,
      colSpan: 12 as const,
      placeholder: "Enter your full name",
    },
    {
      name: "age",
      label: "Your Age",
      type: "number" as const,
      colSpan: 12 as const,
      placeholder: "Enter your age",
    },
    {
      name: "email",
      label: "Email Address",
      type: "email" as const,
      colSpan: 12 as const,
      placeholder: "you@example.com",
    },
  ];

  return (
    <div className="w-full max-w-md mx-auto">
      <AutoForm
        schema={userSchema}
        fields={fields}
        layout="grid"
        columns={12}
        onSubmit={handleSubmit}
        initialValues={{
          name: "",
          age: undefined,
          email: "",
        }}
      />
    </div>
  );
}

// Custom Field Types Example
const profileSchema = z.object({
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  category: z.enum(["tech", "design", "marketing"]),
  experience: z.number().min(0, "Experience must be positive"),
});

export function CustomFieldTypesExample() {
  const handleSubmit = (data: Record<string, any>) => {
    alert(
      `Profile updated!\nBio: ${data.bio.substring(0, 50)}...\nCategory: ${
        data.category
      }\nExperience: ${data.experience} years`
    );
  };

  const fields = [
    {
      name: "bio",
      label: "Biography",
      type: "textarea" as const,
      colSpan: 12 as const,
      placeholder: "Tell us about yourself...",
    },
    {
      name: "category",
      label: "Category",
      type: "select" as const,
      colSpan: 12 as const,
      options: [
        { value: "tech", label: "Technology" },
        { value: "design", label: "Design" },
        { value: "marketing", label: "Marketing" },
      ],
    },
    {
      name: "experience",
      label: "Years of Experience",
      type: "number" as const,
      colSpan: 12 as const,
      placeholder: "Enter years of experience",
    },
  ];

  return (
    <div className="w-full max-w-md mx-auto">
      <AutoForm
        schema={profileSchema}
        fields={fields}
        layout="grid"
        columns={12}
        onSubmit={handleSubmit}
        initialValues={{
          bio: "",
          category: "tech",
          experience: undefined,
        }}
      />
    </div>
  );
}
