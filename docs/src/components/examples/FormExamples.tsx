import { AutoForm } from "el-form-react";
import { z } from "zod";

const registrationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  dob: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Please enter a valid date",
    })
    .optional(),
});

// Simplified field configuration - CSS custom properties handle theming
const fieldConfig = {
  inputClassName:
    "w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500",
  labelClassName: "text-sm font-medium mb-1 block",
  errorClassName: "text-sm mt-1",
};

export const RegistrationFormExample = () => {
  const handleSubmit = (data: z.infer<typeof registrationSchema>) => {
    alert(`Welcome, ${data.firstName}!`);
  };

  return (
    <AutoForm
      schema={registrationSchema}
      onSubmit={handleSubmit}
      fields={[
        {
          name: "firstName",
          label: "First Name",
          placeholder: "Enter your first name",
          ...fieldConfig,
        },
        {
          name: "lastName",
          label: "Last Name",
          placeholder: "Enter your last name",
          ...fieldConfig,
        },
        {
          name: "email",
          label: "Email Address",
          placeholder: "Enter your email",
          ...fieldConfig,
        },
        {
          name: "password",
          label: "Password",
          type: "password",
          placeholder: "Enter password",
          ...fieldConfig,
        },
        {
          name: "confirmPassword",
          label: "Confirm Password",
          type: "password",
          placeholder: "Confirm password",
          ...fieldConfig,
        },
        {
          name: "dob",
          label: "Date of Birth",
          type: "date",
          ...fieldConfig,
        },
      ]}
      submitButtonProps={{
        className:
          "bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md font-semibold",
      }}
      resetButtonProps={{
        className:
          "bg-gray-200 text-gray-800 hover:bg-gray-300 px-4 py-2 rounded-md font-semibold",
      }}
    />
  );
};

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export const ContactFormExample = () => {
  const handleSubmit = (data: z.infer<typeof contactSchema>) => {
    alert(`Thank you ${data.name}! We'll get back to you at ${data.email}.`);
  };

  return (
    <AutoForm
      schema={contactSchema}
      onSubmit={handleSubmit}
      fields={[
        {
          name: "name",
          label: "Name",
          placeholder: "Enter your name",
          ...fieldConfig,
        },
        {
          name: "email",
          label: "Email Address",
          placeholder: "you@example.com",
          ...fieldConfig,
        },
        {
          name: "message",
          label: "Message",
          type: "textarea",
          placeholder: "Tell us what you think...",
          ...fieldConfig,
        },
      ]}
      submitButtonProps={{
        className:
          "bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md font-semibold",
      }}
      resetButtonProps={{
        className:
          "bg-gray-200 text-gray-800 hover:bg-gray-300 px-4 py-2 rounded-md font-semibold",
      }}
    />
  );
};

const profileSchema = z.object({
  username: z.string().min(1, "Username is required"),
  bio: z.string().optional(),
  links: z
    .array(
      z.object({
        type: z.enum(["website", "github", "twitter"]),
        url: z.string().url(),
      })
    )
    .optional(),
});

export const ProfileFormExample = () => {
  const handleSubmit = (data: z.infer<typeof profileSchema>) => {
    alert(JSON.stringify(data, null, 2));
  };

  return (
    <AutoForm
      schema={profileSchema}
      onSubmit={handleSubmit}
      fields={[
        {
          name: "username",
          label: "Username",
          placeholder: "Enter your username",
          ...fieldConfig,
        },
        {
          name: "bio",
          label: "Bio",
          type: "textarea",
          placeholder: "Tell us about yourself",
          ...fieldConfig,
        },
        {
          name: "links",
          label: "Links",
          type: "array",
          ...fieldConfig,
        },
      ]}
      submitButtonProps={{
        className:
          "bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md font-semibold",
      }}
      resetButtonProps={{
        className:
          "bg-gray-200 text-gray-800 hover:bg-gray-300 px-4 py-2 rounded-md font-semibold",
      }}
    />
  );
};
