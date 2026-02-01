import { useForm } from "el-form-react-hooks";
import { useState } from "react";
import z from "zod";
import { Button, FormSection, FormGroup, Card, FormStatusBar, inputBaseClasses, inputErrorClasses } from "../components/ui";

const onBlurSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  bio: z
    .string()
    .max(500, "Bio must be at most 500 characters")
    .optional()
    .or(z.literal("")),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type FormData = z.infer<typeof onBlurSchema>;

// Simulated async check for email uniqueness
const checkEmailUnique = async (email: string): Promise<string | undefined> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const takenEmails = ["test@example.com", "admin@example.com", "user@example.com"];
  if (takenEmails.includes(email.toLowerCase())) {
    return "This email is already taken";
  }
  return undefined;
};

export function OnBlurValidationTest() {
  const [submitResult, setSubmitResult] = useState<FormData | null>(null);
  const [asyncEmailError, setAsyncEmailError] = useState<string | undefined>();
  const [checkingEmail, setCheckingEmail] = useState(false);

  const {
    register,
    handleSubmit,
    formState,
    reset,
  } = useForm<FormData>({
    validators: { onBlur: onBlurSchema },
    defaultValues: {
      username: "",
      email: "",
      password: "",
      bio: "",
      website: "",
    },
  });

  // Custom onBlur handler for async email validation
  const handleEmailBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const email = e.target.value;
    if (email && !formState.errors.email) {
      setCheckingEmail(true);
      const error = await checkEmailUnique(email);
      setAsyncEmailError(error);
      setCheckingEmail(false);
    }
  };

  const onSubmit = (data: FormData) => {
    if (asyncEmailError) {
      alert("Please fix the email error before submitting");
      return;
    }
    setSubmitResult(data);
    console.log("Form submitted:", data);
  };

  const emailRegister = register("email");

  const getInputClass = (fieldName: string) => {
    const hasError = formState.errors[fieldName as keyof typeof formState.errors] && formState.touched[fieldName as keyof typeof formState.touched];
    return `${inputBaseClasses} ${hasError ? inputErrorClasses : ""}`;
  };

  const touchedFields = Object.entries(formState.touched)
    .filter(([, touched]) => touched)
    .map(([field]) => field)
    .join(", ") || "None yet";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">OnBlur Validation Test</h2>
        <p className="mt-1 text-sm text-gray-600">
          Fields are validated when you leave them (blur). Try filling out the form
          and clicking away from each field to see validation in action.
        </p>
      </div>

      <FormStatusBar
        isValid={formState.isValid}
        isDirty={formState.isDirty}
        isSubmitting={formState.isSubmitting}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormSection title="Account Details" variant="gray">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormGroup
              label="Username"
              htmlFor="username"
              required
              error={formState.touched.username ? formState.errors.username as string : undefined}
              hint={formState.touched.username && !formState.errors.username ? "Valid" : undefined}
            >
              <input
                id="username"
                type="text"
                {...register("username")}
                placeholder="Enter username (3-20 chars, alphanumeric)"
                className={getInputClass("username")}
              />
            </FormGroup>

            <FormGroup
              label="Email"
              htmlFor="email"
              required
              error={formState.touched.email ? (formState.errors.email as string || asyncEmailError) : undefined}
              hint={
                checkingEmail
                  ? "Checking..."
                  : formState.touched.email && !formState.errors.email && !asyncEmailError
                    ? "Available"
                    : undefined
              }
            >
              <input
                id="email"
                type="email"
                {...emailRegister}
                onBlur={(e) => {
                  emailRegister.onBlur(e);
                  handleEmailBlur(e);
                }}
                placeholder="Enter email"
                className={getInputClass("email")}
              />
              <p className="text-xs text-gray-500 mt-1">
                Try: test@example.com, admin@example.com (taken)
              </p>
            </FormGroup>
          </div>

          <FormGroup
            label="Password"
            htmlFor="password"
            required
            error={formState.touched.password ? formState.errors.password as string : undefined}
            hint={formState.touched.password && !formState.errors.password ? "Strong password" : undefined}
          >
            <input
              id="password"
              type="password"
              {...register("password")}
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              className={getInputClass("password")}
            />
          </FormGroup>
        </FormSection>

        <FormSection title="Profile Details" variant="gray">
          <FormGroup
            label="Bio"
            htmlFor="bio"
            error={formState.touched.bio ? formState.errors.bio as string : undefined}
          >
            <textarea
              id="bio"
              {...register("bio")}
              placeholder="Tell us about yourself (max 500 chars)"
              rows={3}
              className={`${getInputClass("bio")} resize-y`}
            />
          </FormGroup>

          <FormGroup
            label="Website"
            htmlFor="website"
            error={formState.touched.website ? formState.errors.website as string : undefined}
          >
            <input
              id="website"
              type="url"
              {...register("website")}
              placeholder="https://example.com"
              className={getInputClass("website")}
            />
          </FormGroup>
        </FormSection>

        <Card variant="warning" className="text-sm">
          <strong>Touched Fields:</strong> {touchedFields}
        </Card>

        <div className="flex gap-3">
          <Button
            type="submit"
            variant="primary"
            disabled={formState.isSubmitting || !!asyncEmailError}
          >
            {formState.isSubmitting ? "Submitting..." : "Submit"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              reset();
              setAsyncEmailError(undefined);
              setSubmitResult(null);
            }}
          >
            Reset
          </Button>
        </div>
      </form>

      {submitResult && (
        <Card variant="success">
          <h4 className="font-semibold text-green-800 mb-2">Form Submitted Successfully!</h4>
          <pre className="text-xs overflow-auto max-h-48">
            {JSON.stringify(submitResult, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
}

export default OnBlurValidationTest;
