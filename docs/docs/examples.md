---
sidebar_position: 6
---

# Examples

Explore practical examples of El Form in action.

## Registration Form

A complete user registration form with validation:

```tsx
import { AutoForm } from "el-form";
import { z } from "zod";

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
    dateOfBirth: z.string().transform((str) => new Date(str)),
    terms: z.boolean().refine((val) => val, "You must accept the terms"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

function RegistrationForm() {
  const handleSubmit = (data: z.infer<typeof registrationSchema>) => {
    console.log("Registration data:", data);
    // Process registration
  };

  return (
    <AutoForm
      schema={registrationSchema}
      onSubmit={handleSubmit}
      fieldConfig={{
        firstName: {
          label: "First Name",
          placeholder: "Enter your first name",
        },
        lastName: {
          label: "Last Name",
          placeholder: "Enter your last name",
        },
        email: {
          label: "Email Address",
          placeholder: "you@example.com",
        },
        password: {
          label: "Password",
          fieldType: "password",
          description: "Must contain uppercase, lowercase, and number",
        },
        confirmPassword: {
          label: "Confirm Password",
          fieldType: "password",
        },
        dateOfBirth: {
          label: "Date of Birth",
          fieldType: "date",
        },
        terms: {
          label: "I accept the terms and conditions",
          fieldType: "checkbox",
        },
      }}
      submitButton={{
        text: "Create Account",
        className:
          "w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700",
      }}
    />
  );
}
```

### Try it out:

:::info Interactive Example
This example shows a complete registration form with validation. To try it out, check the `/examples/react` directory in the repository.
:::

## Contact Form

A simple contact form with dropdown selections:

### Try it out:

:::info Interactive Example
This example demonstrates a contact form with different field types. To try it out, check the `/examples/react` directory in the repository.
:::

## Profile Form

A comprehensive profile form with arrays and various field types:

### Try it out:

:::info Interactive Example
This example shows a user profile form with nested objects and complex validation. To try it out, check the `/examples/react` directory in the repository.
:::

## Contact Form with Custom Styling

A contact form with Tailwind CSS styling:

```tsx
const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  company: z.string().optional(),
  subject: z.enum(["general", "support", "sales", "partnership"]),
  message: z.string().min(10, "Message must be at least 10 characters"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

function ContactForm() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>

      <AutoForm
        schema={contactSchema}
        onSubmit={(data) => console.log("Contact:", data)}
        className="space-y-6"
        fieldConfig={{
          name: {
            label: "Full Name",
            placeholder: "Enter your full name",
            className: "mb-4",
            inputClassName:
              "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
            labelClassName: "block text-sm font-medium text-gray-700 mb-1",
          },
          email: {
            label: "Email Address",
            placeholder: "you@company.com",
            className: "mb-4",
            inputClassName:
              "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
            labelClassName: "block text-sm font-medium text-gray-700 mb-1",
          },
          company: {
            label: "Company (Optional)",
            placeholder: "Your company name",
            className: "mb-4",
            inputClassName:
              "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
            labelClassName: "block text-sm font-medium text-gray-700 mb-1",
          },
          subject: {
            label: "Subject",
            fieldType: "select",
            options: [
              { value: "general", label: "General Inquiry" },
              { value: "support", label: "Technical Support" },
              { value: "sales", label: "Sales Question" },
              { value: "partnership", label: "Partnership Opportunity" },
            ],
            className: "mb-4",
            inputClassName:
              "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
            labelClassName: "block text-sm font-medium text-gray-700 mb-1",
          },
          priority: {
            label: "Priority Level",
            fieldType: "radio",
            options: [
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
            ],
            className: "mb-4",
            labelClassName: "block text-sm font-medium text-gray-700 mb-2",
          },
          message: {
            label: "Message",
            fieldType: "textarea",
            placeholder: "Tell us how we can help...",
            className: "mb-6",
            inputClassName:
              "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]",
            labelClassName: "block text-sm font-medium text-gray-700 mb-1",
          },
        }}
        submitButton={{
          text: "Send Message",
          className:
            "w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors font-medium",
        }}
      />
    </div>
  );
}
```

## Survey Form with Conditional Logic

A survey form that shows different questions based on previous answers:

```tsx
import { useForm } from "el-form";

const surveySchema = z.object({
  userType: z.enum(["student", "professional", "other"]),
  experience: z.number().min(0).max(50),
  currentRole: z.string().optional(),
  university: z.string().optional(),
  favoriteFeatures: z.array(z.string()).min(1, "Select at least one feature"),
  feedback: z.string().min(10, "Please provide detailed feedback"),
});

function SurveyForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    schema: surveySchema,
  });

  const userType = watch("userType");

  const onSubmit = (data: z.infer<typeof surveySchema>) => {
    console.log("Survey data:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">User Experience Survey</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          What best describes you?
        </label>
        <select {...register("userType")} className="w-full p-2 border rounded">
          <option value="">Select...</option>
          <option value="student">Student</option>
          <option value="professional">Professional</option>
          <option value="other">Other</option>
        </select>
        {errors.userType && (
          <span className="text-red-600 text-sm">
            {errors.userType.message}
          </span>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Years of experience
        </label>
        <input
          type="number"
          {...register("experience", { valueAsNumber: true })}
          className="w-full p-2 border rounded"
          min="0"
          max="50"
        />
        {errors.experience && (
          <span className="text-red-600 text-sm">
            {errors.experience.message}
          </span>
        )}
      </div>

      {/* Conditional fields based on user type */}
      {userType === "professional" && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Current Role</label>
          <input
            {...register("currentRole")}
            className="w-full p-2 border rounded"
            placeholder="e.g., Senior Developer, Product Manager"
          />
        </div>
      )}

      {userType === "student" && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">University</label>
          <input
            {...register("university")}
            className="w-full p-2 border rounded"
            placeholder="Your university name"
          />
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Favorite Features (select all that apply)
        </label>
        <div className="space-y-2">
          {[
            "Auto-generated forms",
            "Type safety",
            "Custom validation",
            "Styling flexibility",
            "Performance",
          ].map((feature) => (
            <label key={feature} className="flex items-center">
              <input
                type="checkbox"
                {...register("favoriteFeatures")}
                value={feature}
                className="mr-2"
              />
              {feature}
            </label>
          ))}
        </div>
        {errors.favoriteFeatures && (
          <span className="text-red-600 text-sm">
            {errors.favoriteFeatures.message}
          </span>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Additional Feedback
        </label>
        <textarea
          {...register("feedback")}
          className="w-full p-2 border rounded h-32"
          placeholder="Tell us what you think about El Form..."
        />
        {errors.feedback && (
          <span className="text-red-600 text-sm">
            {errors.feedback.message}
          </span>
        )}
      </div>

      <button
        type="submit"
        className="w-full bg-green-600 text-white py-3 px-6 rounded hover:bg-green-700 transition-colors"
      >
        Submit Survey
      </button>
    </form>
  );
}
```

## E-commerce Product Form

A product creation form for an e-commerce platform:

```tsx
const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().positive("Price must be positive"),
  category: z.enum(["electronics", "clothing", "books", "home", "sports"]),
  tags: z.array(z.string()).optional(),
  inStock: z.boolean().default(true),
  images: z.array(z.string().url()).min(1, "At least one image is required"),
  specifications: z
    .object({
      weight: z.number().optional(),
      dimensions: z
        .object({
          length: z.number(),
          width: z.number(),
          height: z.number(),
        })
        .optional(),
      color: z.string().optional(),
      material: z.string().optional(),
    })
    .optional(),
});

function ProductForm() {
  return (
    <AutoForm
      schema={productSchema}
      onSubmit={(data) => console.log("Product:", data)}
      fieldConfig={{
        name: {
          label: "Product Name",
          placeholder: "Enter product name",
        },
        description: {
          label: "Description",
          fieldType: "textarea",
          placeholder: "Describe your product...",
        },
        price: {
          label: "Price ($)",
          fieldType: "number",
          placeholder: "0.00",
        },
        category: {
          label: "Category",
          fieldType: "select",
          options: [
            { value: "electronics", label: "Electronics" },
            { value: "clothing", label: "Clothing" },
            { value: "books", label: "Books" },
            { value: "home", label: "Home & Garden" },
            { value: "sports", label: "Sports" },
          ],
        },
        inStock: {
          label: "Currently in stock",
          fieldType: "checkbox",
        },
      }}
      submitButton={{
        text: "Create Product",
        className:
          "bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700",
      }}
    />
  );
}
```

## Multi-Step Form

Break complex forms into multiple steps:

```tsx
import { useState } from "react";

const personalInfoSchema = z.object({
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
  email: z.string().email("Invalid email"),
});

const addressSchema = z.object({
  street: z.string().min(1, "Street address required"),
  city: z.string().min(1, "City required"),
  zipCode: z.string().min(5, "Valid zip code required"),
  country: z.string().min(1, "Country required"),
});

const preferencesSchema = z.object({
  newsletter: z.boolean().default(false),
  notifications: z.boolean().default(true),
  theme: z.enum(["light", "dark"]).default("light"),
});

function MultiStepForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});

  const handleStepSubmit = (stepData: any) => {
    setFormData({ ...formData, ...stepData });
    setStep(step + 1);
  };

  const handleFinalSubmit = (finalData: any) => {
    const completeData = { ...formData, ...finalData };
    console.log("Complete form data:", completeData);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {[1, 2, 3].map((stepNumber) => (
            <div
              key={stepNumber}
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= stepNumber ? "bg-blue-600 text-white" : "bg-gray-300"
              }`}
            >
              {stepNumber}
            </div>
          ))}
        </div>
        <div className="mt-2 text-center text-sm text-gray-600">
          Step {step} of 3
        </div>
      </div>

      {step === 1 && (
        <AutoForm
          schema={personalInfoSchema}
          onSubmit={handleStepSubmit}
          submitButton={{ text: "Next Step" }}
        />
      )}

      {step === 2 && (
        <AutoForm
          schema={addressSchema}
          onSubmit={handleStepSubmit}
          submitButton={{ text: "Next Step" }}
        />
      )}

      {step === 3 && (
        <AutoForm
          schema={preferencesSchema}
          onSubmit={handleFinalSubmit}
          submitButton={{ text: "Complete Registration" }}
        />
      )}
    </div>
  );
}
```

These examples demonstrate various patterns and use cases for El Form. Each example is production-ready and shows different aspects of the library's capabilities.
