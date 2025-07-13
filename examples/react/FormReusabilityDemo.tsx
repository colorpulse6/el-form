import React from "react";
import { z } from "zod";
import { useForm, FormProvider } from "el-form-react-hooks";
import {
  TextField,
  TextareaField,
  SelectField,
} from "el-form-react-components";

// Define your schema
const userSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  bio: z.string().optional(),
  country: z.string().min(1, "Please select a country"),
});

type UserForm = z.infer<typeof userSchema>;

// Reusable custom field component
function CustomNameField<T extends Record<string, any>>({
  name,
  label,
}: {
  name: keyof T;
  label: string;
}) {
  return (
    <div className="relative">
      <TextField<T, typeof name> name={name} label={label} className="pl-8" />
      <div className="absolute left-2 top-8 text-gray-400">👤</div>
    </div>
  );
}

// Pattern 1: Context-based reusable components
function UserFormWithContext() {
  const form = useForm<UserForm>({
    schema: userSchema,
    validateOn: "onBlur",
  });

  const handleSubmit = (data: UserForm) => {
    console.log("Form submitted:", data);
  };

  const countries = [
    { value: "us", label: "United States" },
    { value: "ca", label: "Canada" },
    { value: "uk", label: "United Kingdom" },
  ];

  return (
    <FormProvider form={form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <h2 className="text-xl font-bold">
          User Registration (Context Pattern)
        </h2>

        {/* Using custom reusable components */}
        <div className="grid grid-cols-2 gap-4">
          <CustomNameField<UserForm> name="firstName" label="First Name" />
          <CustomNameField<UserForm> name="lastName" label="Last Name" />
        </div>

        {/* Using built-in field components */}
        <TextField<UserForm, "email">
          name="email"
          type="email"
          label="Email Address"
          placeholder="Enter your email"
        />

        <SelectField<UserForm, "country">
          name="country"
          label="Country"
          placeholder="Select your country"
          options={countries}
        />

        <TextareaField<UserForm, "bio">
          name="bio"
          label="Bio (Optional)"
          placeholder="Tell us about yourself"
          rows={3}
        />

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {form.formState.isSubmitting ? "Submitting..." : "Submit"}
          </button>

          <button
            type="button"
            onClick={() => form.reset()}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Reset
          </button>
        </div>

        {/* Form state debug */}
        <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
          <strong>Form State:</strong> Valid:{" "}
          {form.formState.isValid.toString()}, Dirty:{" "}
          {form.formState.isDirty.toString()}, Errors:{" "}
          {Object.keys(form.formState.errors).length}
        </div>
      </form>
    </FormProvider>
  );
}

// Pattern 2: Direct form passing (like Conform)
function ReusableAddressFields<T extends Record<string, any>>({
  form,
  prefix = "",
}: {
  form: any; // In real usage, this would be properly typed
  prefix?: string;
}) {
  const getFieldName = (field: string) =>
    prefix ? `${prefix}.${field}` : field;

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <h3 className="font-medium text-gray-900">Address Information</h3>

      <input
        {...form.register(getFieldName("street"))}
        placeholder="Street Address"
        className="w-full px-3 py-2 border rounded-md"
      />

      <div className="grid grid-cols-2 gap-4">
        <input
          {...form.register(getFieldName("city"))}
          placeholder="City"
          className="w-full px-3 py-2 border rounded-md"
        />
        <input
          {...form.register(getFieldName("zipCode"))}
          placeholder="ZIP Code"
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>
    </div>
  );
}

// Extended schema with address
const userWithAddressSchema = z.object({
  ...userSchema.shape,
  address: z.object({
    street: z.string().min(1, "Street is required"),
    city: z.string().min(1, "City is required"),
    zipCode: z.string().min(1, "ZIP code is required"),
  }),
});

type UserWithAddressForm = z.infer<typeof userWithAddressSchema>;

function UserFormWithAddress() {
  const form = useForm<UserWithAddressForm>({
    schema: userWithAddressSchema,
    validateOn: "onBlur",
  });

  const handleSubmit = (data: UserWithAddressForm) => {
    console.log("Form with address submitted:", data);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <h2 className="text-xl font-bold">
        User Registration with Address (Form Passing Pattern)
      </h2>

      {/* Basic user fields */}
      <div className="grid grid-cols-2 gap-4">
        <input
          {...form.register("firstName")}
          placeholder="First Name"
          className="w-full px-3 py-2 border rounded-md"
        />
        <input
          {...form.register("lastName")}
          placeholder="Last Name"
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      {/* Reusable address component */}
      <ReusableAddressFields form={form} prefix="address" />

      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
      >
        {form.formState.isSubmitting ? "Submitting..." : "Submit with Address"}
      </button>
    </form>
  );
}

// Combined example showing both patterns
export function FormReusabilityDemo() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <UserFormWithContext />
      <div className="border-t border-gray-200 pt-8">
        <UserFormWithAddress />
      </div>
    </div>
  );
}
