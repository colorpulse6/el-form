import { AutoForm } from "el-form-react";
import { z } from "zod";

// Quick Start Contact Form Example
const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export function QuickStartExample() {
  const handleSubmit = (data: Record<string, any>) => {
    alert(`Thank you ${data.name}! We'll get back to you at ${data.email}.`);
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
      name: "email",
      label: "Email",
      type: "email" as const,
      colSpan: 12 as const,
      placeholder: "you@example.com",
    },
    {
      name: "message",
      label: "Message",
      type: "textarea" as const,
      colSpan: 12 as const,
      placeholder: "Tell us what you think...",
    },
  ];

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-slate-700 rounded-lg shadow-lg border border-slate-200 dark:border-slate-600">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
        Contact Us
      </h2>
      <AutoForm
        schema={contactSchema}
        fields={fields}
        layout="grid"
        columns={12}
        onSubmit={handleSubmit}
        initialValues={{
          name: "",
          email: "",
          message: "",
        }}
      />
    </div>
  );
}
