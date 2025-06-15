import React from "react";
import { AutoForm } from "el-form/react";
import { z } from "zod";

// Registration Form Schema (simplified for supported field types)
const registrationSchema = z
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
    dateOfBirth: z.string().min(1, "Date of birth is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const RegistrationFormExample: React.FC = () => {
  const handleSubmit = (data: Record<string, any>) => {
    console.log("Registration data:", data);
    alert(`Registration successful! Welcome, ${data.firstName}!`);
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
      name: "dateOfBirth",
      label: "Date of Birth",
      type: "text" as const,
      placeholder: "YYYY-MM-DD",
      colSpan: 12 as const,
    },
  ];

  return (
    <AutoForm
      schema={registrationSchema}
      fields={fields}
      layout="grid"
      columns={12}
      onSubmit={handleSubmit}
      onError={handleError}
    />
  );
};

// Contact Form Schema
const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  priority: z.enum(["low", "medium", "high"], {
    required_error: "Please select a priority",
  }),
  contactMethod: z.enum(["email", "phone", "both"], {
    required_error: "Please select a contact method",
  }),
});

export const ContactFormExample: React.FC = () => {
  const handleSubmit = (data: Record<string, any>) => {
    console.log("Contact form data:", data);
    alert(`Thank you ${data.name}! We'll get back to you soon.`);
  };

  const handleError = (errors: Record<string, string>) => {
    console.log("Validation errors:", errors);
  };

  const fields = [
    {
      name: "name",
      label: "Full Name",
      type: "text" as const,
      placeholder: "Enter your full name",
      colSpan: 6 as const,
    },
    {
      name: "email",
      label: "Email Address",
      type: "email" as const,
      placeholder: "Enter your email",
      colSpan: 6 as const,
    },
    {
      name: "subject",
      label: "Subject",
      type: "text" as const,
      placeholder: "What's this about?",
      colSpan: 12 as const,
    },
    {
      name: "priority",
      label: "Priority",
      type: "select" as const,
      colSpan: 6 as const,
      options: [
        { label: "Low", value: "low" },
        { label: "Medium", value: "medium" },
        { label: "High", value: "high" },
      ],
    },
    {
      name: "contactMethod",
      label: "Preferred Contact Method",
      type: "select" as const,
      colSpan: 6 as const,
      options: [
        { label: "Email", value: "email" },
        { label: "Phone", value: "phone" },
        { label: "Both", value: "both" },
      ],
    },
    {
      name: "message",
      label: "Message",
      type: "textarea" as const,
      placeholder: "Tell us more about your inquiry...",
      colSpan: 12 as const,
    },
  ];

  return (
    <AutoForm
      schema={contactSchema}
      fields={fields}
      layout="grid"
      columns={12}
      onSubmit={handleSubmit}
      onError={handleError}
    />
  );
};

// Profile Form Schema (simplified)
const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  displayName: z.string().min(1, "Display name is required"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  website: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  location: z.string().optional(),
  skills: z
    .array(z.string().min(1, "Skill cannot be empty"))
    .min(1, "At least one skill is required"),
  experience: z.enum(["junior", "mid", "senior", "lead"], {
    required_error: "Please select your experience level",
  }),
});

export const ProfileFormExample: React.FC = () => {
  const handleSubmit = (data: Record<string, any>) => {
    console.log("Profile data:", data);
    alert(`Profile updated successfully for ${data.displayName}!`);
  };

  const handleError = (errors: Record<string, string>) => {
    console.log("Validation errors:", errors);
  };

  const fields = [
    {
      name: "username",
      label: "Username",
      type: "text" as const,
      placeholder: "Enter username",
      colSpan: 6 as const,
    },
    {
      name: "displayName",
      label: "Display Name",
      type: "text" as const,
      placeholder: "Enter display name",
      colSpan: 6 as const,
    },
    {
      name: "bio",
      label: "Bio",
      type: "textarea" as const,
      placeholder: "Tell us about yourself...",
      colSpan: 12 as const,
    },
    {
      name: "website",
      label: "Website",
      type: "text" as const,
      placeholder: "https://yourwebsite.com",
      colSpan: 6 as const,
    },
    {
      name: "location",
      label: "Location",
      type: "text" as const,
      placeholder: "City, Country",
      colSpan: 6 as const,
    },
    {
      name: "skills",
      label: "Skills",
      type: "array" as const,
      colSpan: 12 as const,
    },
    {
      name: "experience",
      label: "Experience Level",
      type: "select" as const,
      colSpan: 12 as const,
      options: [
        { label: "Junior", value: "junior" },
        { label: "Mid-level", value: "mid" },
        { label: "Senior", value: "senior" },
        { label: "Lead", value: "lead" },
      ],
    },
  ];

  return (
    <AutoForm
      schema={profileSchema}
      fields={fields}
      layout="grid"
      columns={12}
      onSubmit={handleSubmit}
      onError={handleError}
    />
  );
};
