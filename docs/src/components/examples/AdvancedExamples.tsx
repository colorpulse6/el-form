import React, { useState } from "react";
import { AutoForm } from "el-form-react";
import { z } from "zod";

// Conditional Form Example
const basePersonSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  accountType: z.enum(["personal", "business"], {
    required_error: "Please select account type",
  }),
});

const personalAccountSchema = basePersonSchema.extend({
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
});

const businessAccountSchema = basePersonSchema.extend({
  companyName: z.string().min(1, "Company name is required"),
  taxId: z.string().min(1, "Tax ID is required"),
  employeeCount: z.number().min(1, "Must have at least 1 employee"),
});

export const ConditionalFormExample: React.FC = () => {
  const [accountType, setAccountType] = useState<
    "personal" | "business" | null
  >(null);

  const handleAccountTypeChange = (data: Record<string, any>) => {
    setAccountType(data.accountType as "personal" | "business");
  };

  const handleSubmit = (data: Record<string, any>) => {
    console.log("Conditional form data:", data);
    alert(`Account created successfully! Type: ${data.accountType}`);
  };

  const handleError = (errors: Record<string, string>) => {
    console.log("Validation errors:", errors);
  };

  // Base fields for account type selection
  const baseFields = [
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
      name: "accountType",
      label: "Account Type",
      type: "select" as const,
      colSpan: 12 as const,
      options: [
        { label: "Personal Account", value: "personal" },
        { label: "Business Account", value: "business" },
      ],
    },
  ];

  // Additional fields for personal accounts
  const personalFields = [
    ...baseFields,
    {
      name: "dateOfBirth",
      label: "Date of Birth",
      type: "text" as const,
      colSpan: 6 as const,
      placeholder: "YYYY-MM-DD",
    },
    {
      name: "phoneNumber",
      label: "Phone Number",
      type: "text" as const,
      colSpan: 6 as const,
      placeholder: "(555) 123-4567",
    },
  ];

  // Additional fields for business accounts
  const businessFields = [
    ...baseFields,
    {
      name: "companyName",
      label: "Company Name",
      type: "text" as const,
      colSpan: 12 as const,
      placeholder: "Enter company name",
    },
    {
      name: "taxId",
      label: "Tax ID",
      type: "text" as const,
      colSpan: 6 as const,
      placeholder: "Enter tax ID",
    },
    {
      name: "employeeCount",
      label: "Number of Employees",
      type: "number" as const,
      colSpan: 6 as const,
      placeholder: "Enter employee count",
    },
  ];

  const getSchema = () => {
    switch (accountType) {
      case "personal":
        return personalAccountSchema;
      case "business":
        return businessAccountSchema;
      default:
        return basePersonSchema;
    }
  };

  const getFields = () => {
    switch (accountType) {
      case "personal":
        return personalFields;
      case "business":
        return businessFields;
      default:
        return baseFields;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6">
        <h3 className="text-lg font-semibold text-amber-800 mb-2">
          🔄 Conditional Form Fields
        </h3>
        <p className="text-amber-700 text-sm">
          Form fields change dynamically based on user selections. Try selecting
          different account types to see conditional fields appear.
        </p>
      </div>

      <AutoForm
        key={accountType} // Force re-render when account type changes
        schema={getSchema()}
        fields={getFields()}
        layout="grid"
        columns={12}
        onSubmit={accountType ? handleSubmit : handleAccountTypeChange}
        onError={handleError}
        initialValues={{
          firstName: "",
          lastName: "",
          email: "",
          accountType: undefined,
        }}
      />

      {accountType && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">
            Selected account type:{" "}
            <strong className="capitalize">{accountType}</strong>
          </p>
        </div>
      )}
    </div>
  );
};

// Multi-step Form Example
const steps = [
  {
    title: "Personal Information",
    schema: z.object({
      firstName: z.string().min(1, "First name is required"),
      lastName: z.string().min(1, "Last name is required"),
      email: z.string().email("Please enter a valid email"),
      phone: z.string().min(10, "Phone number must be at least 10 digits"),
    }),
  },
  {
    title: "Address Information",
    schema: z.object({
      street: z.string().min(1, "Street address is required"),
      city: z.string().min(1, "City is required"),
      state: z.string().min(2, "State is required"),
      zipCode: z.string().min(5, "ZIP code must be at least 5 digits"),
    }),
  },
  {
    title: "Preferences",
    schema: z.object({
      newsletter: z.string().min(1, "Please select newsletter preference"),
      language: z.enum(["en", "es", "fr"], {
        required_error: "Please select a language",
      }),
      experience: z.enum(["beginner", "intermediate", "advanced"], {
        required_error: "Please select your experience level",
      }),
    }),
  },
];

export const MultiStepFormExample: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleStepSubmit = (data: Record<string, any>) => {
    const updatedData = { ...formData, ...data };
    setFormData(updatedData);

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      console.log("Final form data:", updatedData);
      alert("🎉 Multi-step form completed successfully!");
      // Reset form
      setCurrentStep(0);
      setFormData({});
    }
  };

  const handleStepError = (errors: Record<string, string>) => {
    console.log(`Step ${currentStep + 1} validation errors:`, errors);
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepConfig = steps[currentStep];

  const getFieldsForStep = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        return [
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
            name: "phone",
            label: "Phone Number",
            type: "text" as const,
            colSpan: 12 as const,
            placeholder: "(555) 123-4567",
          },
        ];
      case 1:
        return [
          {
            name: "street",
            label: "Street Address",
            type: "text" as const,
            colSpan: 12 as const,
            placeholder: "Enter street address",
          },
          {
            name: "city",
            label: "City",
            type: "text" as const,
            colSpan: 6 as const,
            placeholder: "Enter city",
          },
          {
            name: "state",
            label: "State",
            type: "text" as const,
            colSpan: 3 as const,
            placeholder: "State",
          },
          {
            name: "zipCode",
            label: "ZIP Code",
            type: "text" as const,
            colSpan: 3 as const,
            placeholder: "12345",
          },
        ];
      case 2:
        return [
          {
            name: "newsletter",
            label: "Newsletter Subscription",
            type: "select" as const,
            colSpan: 12 as const,
            options: [
              { label: "Yes, send me newsletters", value: "yes" },
              { label: "No, thank you", value: "no" },
            ],
          },
          {
            name: "language",
            label: "Preferred Language",
            type: "select" as const,
            colSpan: 6 as const,
            options: [
              { label: "English", value: "en" },
              { label: "Spanish", value: "es" },
              { label: "French", value: "fr" },
            ],
          },
          {
            name: "experience",
            label: "Experience Level",
            type: "select" as const,
            colSpan: 6 as const,
            options: [
              { label: "Beginner", value: "beginner" },
              { label: "Intermediate", value: "intermediate" },
              { label: "Advanced", value: "advanced" },
            ],
          },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg mb-6">
        <h3 className="text-lg font-semibold text-indigo-800 mb-2">
          📋 Multi-Step Form
        </h3>
        <p className="text-indigo-700 text-sm">
          Break complex forms into manageable steps. Data is preserved as you
          navigate between steps.
        </p>
      </div>

      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-sm text-gray-500">
            {currentStepConfig.title}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((currentStep + 1) / steps.length) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      <AutoForm
        key={currentStep} // Force re-render when step changes
        schema={currentStepConfig.schema}
        fields={getFieldsForStep(currentStep)}
        layout="grid"
        columns={12}
        onSubmit={handleStepSubmit}
        onError={handleStepError}
        initialValues={formData}
      />

      {/* Navigation buttons */}
      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={goBack}
          disabled={currentStep === 0}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="text-sm text-gray-500">
          {currentStep === steps.length - 1 ? "Complete" : "Next"}
        </span>
      </div>

      {/* Data preview */}
      {Object.keys(formData).length > 0 && (
        <div className="mt-6 p-3 bg-gray-50 rounded-md">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Collected Data:
          </h4>
          <pre className="text-xs text-gray-600 overflow-auto">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
