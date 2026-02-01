import { useForm } from "el-form-react-hooks";
import { useState } from "react";
import z from "zod";
import { Button, FormSection, FormGroup, Card, FormStatusBar, inputBaseClasses, inputErrorClasses } from "../components/ui";

const registrationSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  company: z.string().min(2, "Company name is required"),
  domain: z.string().min(3, "Domain is required"),
});

type RegistrationData = z.infer<typeof registrationSchema>;

// Simulated API calls
const checkUsernameAvailable = async (username: string): Promise<boolean> => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  const taken = ["admin", "root", "system", "user", "test"];
  return !taken.includes(username.toLowerCase());
};

const checkEmailAvailable = async (email: string): Promise<boolean> => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  const taken = ["admin@example.com", "test@example.com", "user@example.com"];
  return !taken.includes(email.toLowerCase());
};

const checkDomainAvailable = async (domain: string): Promise<boolean> => {
  await new Promise((resolve) => setTimeout(resolve, 700));
  const taken = ["google", "facebook", "amazon", "microsoft"];
  return !taken.includes(domain.toLowerCase());
};

export function AsyncValidationTest() {
  const [submitResult, setSubmitResult] = useState<RegistrationData | null>(null);
  const [validatingFields, setValidatingFields] = useState<Set<string>>(new Set());

  const addValidating = (field: string) => {
    setValidatingFields((prev) => new Set([...prev, field]));
  };

  const removeValidating = (field: string) => {
    setValidatingFields((prev) => {
      const next = new Set(prev);
      next.delete(field);
      return next;
    });
  };

  const {
    register,
    handleSubmit,
    formState,
    reset,
  } = useForm<RegistrationData>({
    validators: { onChange: registrationSchema },
    defaultValues: {
      username: "",
      email: "",
      company: "",
      domain: "",
    },
    fieldValidators: {
      username: {
        onChangeAsync: async ({ value }: { value: string }) => {
          if (!value || value.length < 3) return undefined;
          addValidating("username");
          try {
            const available = await checkUsernameAvailable(value);
            if (!available) {
              return "This username is already taken";
            }
          } finally {
            removeValidating("username");
          }
          return undefined;
        },
        onChangeAsyncDebounceMs: 500,
      },
      email: {
        onChangeAsync: async ({ value }: { value: string }) => {
          if (!value || !value.includes("@")) return undefined;
          addValidating("email");
          try {
            const available = await checkEmailAvailable(value);
            if (!available) {
              return "This email is already registered";
            }
          } finally {
            removeValidating("email");
          }
          return undefined;
        },
        onChangeAsyncDebounceMs: 500,
      },
      domain: {
        onChangeAsync: async ({ value }: { value: string }) => {
          if (!value || value.length < 3) return undefined;
          addValidating("domain");
          try {
            const available = await checkDomainAvailable(value);
            if (!available) {
              return "This domain is not available";
            }
          } finally {
            removeValidating("domain");
          }
          return undefined;
        },
        onChangeAsyncDebounceMs: 500,
      },
    },
  });

  const onSubmit = (data: RegistrationData) => {
    console.log("Form submitted:", data);
    setSubmitResult(data);
  };

  const isFieldValidating = (field: string) => validatingFields.has(field);

  const getInputClass = (fieldName: string) =>
    `${inputBaseClasses} ${formState.errors[fieldName as keyof typeof formState.errors] ? inputErrorClasses : ""}`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Async Validation Test</h2>
        <p className="mt-1 text-sm text-gray-600">
          Demonstrates async field validation with simulated server-side availability checks.
        </p>
      </div>

      <Card variant="warning" className="text-sm">
        <strong>Test Data (already taken):</strong>
        <ul className="mt-2 ml-4 list-disc space-y-1">
          <li>Usernames: admin, root, system, user, test</li>
          <li>Emails: admin@example.com, test@example.com, user@example.com</li>
          <li>Domains: google, facebook, amazon, microsoft</li>
        </ul>
      </Card>

      <FormStatusBar
        isValid={formState.isValid}
        isDirty={formState.isDirty}
        extra={{
          Validating: validatingFields.size > 0 ? Array.from(validatingFields).join(", ") : "None"
        }}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormSection title="Account Registration" variant="gray">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormGroup
              label="Username"
              htmlFor="username"
              required
              error={formState.errors.username as string}
              hint={
                isFieldValidating("username")
                  ? "Checking availability..."
                  : !formState.errors.username && formState.touched.username
                    ? "Username available"
                    : undefined
              }
            >
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  {...register("username")}
                  placeholder="Choose a username"
                  className={getInputClass("username")}
                />
                {isFieldValidating("username") && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 text-sm">
                    ...
                  </span>
                )}
                {!formState.errors.username && formState.touched.username && !isFieldValidating("username") && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                    ✓
                  </span>
                )}
              </div>
            </FormGroup>

            <FormGroup
              label="Email"
              htmlFor="email"
              required
              error={formState.errors.email as string}
              hint={
                isFieldValidating("email")
                  ? "Checking..."
                  : !formState.errors.email && formState.touched.email
                    ? "Email available"
                    : undefined
              }
            >
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="your@email.com"
                  className={getInputClass("email")}
                />
                {isFieldValidating("email") && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 text-sm">
                    ...
                  </span>
                )}
                {!formState.errors.email && formState.touched.email && !isFieldValidating("email") && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                    ✓
                  </span>
                )}
              </div>
            </FormGroup>
          </div>
        </FormSection>

        <FormSection title="Company Details" variant="gray">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormGroup
              label="Company Name"
              htmlFor="company"
              required
              error={formState.errors.company as string}
            >
              <input
                id="company"
                type="text"
                {...register("company")}
                placeholder="Your company name"
                className={getInputClass("company")}
              />
            </FormGroup>

            <FormGroup
              label="Domain"
              htmlFor="domain"
              required
              error={formState.errors.domain as string}
              hint={
                isFieldValidating("domain")
                  ? "Checking availability..."
                  : !formState.errors.domain && formState.touched.domain
                    ? "Domain available"
                    : undefined
              }
            >
              <div className="flex">
                <div className="relative flex-1">
                  <input
                    id="domain"
                    type="text"
                    {...register("domain")}
                    placeholder="yourcompany"
                    className={`${getInputClass("domain")} rounded-r-none`}
                  />
                  {isFieldValidating("domain") && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 text-sm">
                      ...
                    </span>
                  )}
                  {!formState.errors.domain && formState.touched.domain && !isFieldValidating("domain") && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                      ✓
                    </span>
                  )}
                </div>
                <span className="inline-flex items-center px-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-gray-600 text-sm">
                  .example.com
                </span>
              </div>
            </FormGroup>
          </div>
        </FormSection>

        <div className="flex gap-3">
          <Button
            type="submit"
            variant="primary"
            disabled={formState.isSubmitting || validatingFields.size > 0}
          >
            {formState.isSubmitting
              ? "Submitting..."
              : validatingFields.size > 0
                ? "Validating..."
                : "Register"
            }
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              reset();
              setSubmitResult(null);
              setValidatingFields(new Set());
            }}
          >
            Reset
          </Button>
        </div>
      </form>

      {submitResult && (
        <Card variant="success">
          <h4 className="font-semibold text-green-800 mb-2">Registration Successful!</h4>
          <pre className="text-xs overflow-auto max-h-48">
            {JSON.stringify(submitResult, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
}

export default AsyncValidationTest;
