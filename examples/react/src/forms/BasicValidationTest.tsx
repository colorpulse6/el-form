import { useForm } from "el-form-react-hooks";
import { useState } from "react";
import z from "zod";
import { Button, FormSection, FormGroup, Card, FormStatusBar, DebugPanel, inputBaseClasses, inputErrorClasses, selectBaseClasses } from "../components/ui";

const basicSchema = z
  .object({
    name: z
      .string()
      .nonempty({ message: "Name is required" })
      .min(2, "Name must be at least 2 characters")
      .max(20, "Name must be no more than 20 characters"),
    email: z.string().email("Invalid email format"),
    age: z
      .number()
      .min(18, "Must be 18 or older")
      .max(100, "Must be under 100"),
    phone: z.string().regex(/^\d{10}$/, "Phone must be exactly 10 digits"),
    website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    role: z.enum(["admin", "user", "moderator"], {
      message: "Please select a valid role",
    }),
    adminCode: z.string().optional().or(z.literal("")),
    company: z.string().optional().or(z.literal("")),
    seniorDetails: z.string().optional().or(z.literal("")),
    skills: z
      .array(
        z.object({
          name: z.string().min(1, "Skill name is required"),
          level: z.enum(["beginner", "intermediate", "advanced"], {
            message: "Please select a skill level",
          }),
          yearsExperience: z
            .number()
            .min(0, "Years must be 0 or more")
            .max(50, "Years must be 50 or less")
            .optional(),
          projects: z
            .array(
              z.object({
                name: z.string().min(1, "Project name is required"),
                duration: z
                  .number()
                  .min(1, "Duration must be at least 1 month")
                  .max(120, "Duration must be less than 120 months")
                  .optional(),
              })
            )
            .min(1, "At least one project is required for each skill")
            .optional(),
        })
      )
      .min(1, "At least one skill is required"),
    terms: z.boolean().refine((val) => val === true, "You must accept terms"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export function BasicValidationTest() {
  const [submitResult, setSubmitResult] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState,
    reset,
    watch,
    canSubmit,
    addArrayItem,
    removeArrayItem,
  } = useForm({
    validators: { onChange: basicSchema },
    defaultValues: {
      name: "",
      email: "",
      age: 18,
      phone: "",
      website: "",
      password: "",
      confirmPassword: "",
      role: "user",
      adminCode: "",
      company: "",
      seniorDetails: "",
      skills: [
        {
          name: "",
          level: "beginner" as const,
          yearsExperience: 0,
          projects: [{ name: "", duration: 1 }],
        },
      ],
      terms: false,
    },
  });

  const watchedValues = watch();
  const currentRole = watch("role");
  const currentAge = watch("age");
  const currentSkills = watch("skills");

  const showAdminCode = currentRole === "admin";
  const showCompanyField = currentAge >= 25;
  const hasAdvancedSkill = currentSkills?.some(
    (skill: any) => skill.level === "advanced"
  );

  const getInputClass = (fieldName: string) =>
    `${inputBaseClasses} ${formState.errors[fieldName as keyof typeof formState.errors] ? inputErrorClasses : ""}`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Basic Validation Test</h2>
        <p className="mt-1 text-sm text-gray-600">
          Comprehensive form with nested arrays, conditional fields, and cross-field validation.
        </p>
      </div>

      <Card variant="info" className="text-sm">
        <strong>Watch Function Testing:</strong> Admin Code (shows when role=admin),
        Company (shows when age ≥ 25), Senior Details (shows when any skill=advanced)
      </Card>

      <FormStatusBar
        isValid={formState.isValid}
        isDirty={formState.isDirty}
        extra={{ "Can Submit": canSubmit ? "Yes" : "No" }}
      />

      <form onSubmit={handleSubmit((data) => setSubmitResult({ success: true, data }))} className="space-y-6">
        {/* Basic Info Section */}
        <FormSection title="Basic Information" variant="gray">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormGroup label="Name" htmlFor="name" required error={formState.errors.name as string}>
              <input
                id="name"
                {...register("name")}
                placeholder="Enter your name"
                className={getInputClass("name")}
              />
            </FormGroup>

            <FormGroup label="Email" htmlFor="email" required error={formState.errors.email as string}>
              <input
                id="email"
                type="email"
                {...register("email")}
                placeholder="Enter your email"
                className={getInputClass("email")}
              />
            </FormGroup>

            <FormGroup label="Age" htmlFor="age" required error={formState.errors.age as string}>
              <input
                id="age"
                type="number"
                {...register("age")}
                placeholder="Enter your age"
                className={getInputClass("age")}
              />
            </FormGroup>

            <FormGroup label="Phone" htmlFor="phone" required error={formState.errors.phone as string}>
              <input
                id="phone"
                type="tel"
                {...register("phone")}
                placeholder="1234567890"
                className={getInputClass("phone")}
              />
            </FormGroup>

            <FormGroup label="Website" htmlFor="website" error={formState.errors.website as string}>
              <input
                id="website"
                type="url"
                {...register("website")}
                placeholder="https://example.com"
                className={getInputClass("website")}
              />
            </FormGroup>

            <FormGroup label="Role" htmlFor="role" required error={formState.errors.role as string}>
              <select id="role" {...register("role")} className={selectBaseClasses}>
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
            </FormGroup>
          </div>
        </FormSection>

        {/* Password Section */}
        <FormSection title="Security" variant="gray">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormGroup label="Password" htmlFor="password" required error={formState.errors.password as string}>
              <input
                id="password"
                type="password"
                {...register("password")}
                placeholder="Enter password (8+ characters)"
                className={getInputClass("password")}
              />
            </FormGroup>

            <FormGroup label="Confirm Password" htmlFor="confirmPassword" required error={formState.errors.confirmPassword as string}>
              <input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
                placeholder="Confirm your password"
                className={getInputClass("confirmPassword")}
              />
            </FormGroup>
          </div>
        </FormSection>

        {/* Conditional Admin Code */}
        {showAdminCode && (
          <FormSection title="Admin Verification" variant="green">
            <p className="text-xs text-gray-500 mb-3">This field appears because role is set to admin</p>
            <FormGroup label="Admin Code" htmlFor="adminCode" error={formState.errors.adminCode as string}>
              <input
                id="adminCode"
                {...register("adminCode")}
                placeholder="Enter admin verification code"
                className={inputBaseClasses}
              />
            </FormGroup>
          </FormSection>
        )}

        {/* Conditional Company */}
        {showCompanyField && (
          <FormSection title="Professional Info" variant="blue">
            <p className="text-xs text-gray-500 mb-3">This field appears because age is 25 or older</p>
            <FormGroup label="Company" htmlFor="company" error={formState.errors.company as string}>
              <input
                id="company"
                {...register("company")}
                placeholder="Enter your company name"
                className={inputBaseClasses}
              />
            </FormGroup>
          </FormSection>
        )}

        {/* Skills Section */}
        <FormSection
          title={`Skills (${watchedValues.skills?.length || 0})`}
          variant="gray"
          headerAction={
            <Button
              type="button"
              variant="success"
              size="sm"
              onClick={() =>
                addArrayItem("skills", {
                  name: "",
                  level: "beginner",
                  yearsExperience: 0,
                  projects: [{ name: "", duration: 1 }],
                })
              }
            >
              + Add Skill
            </Button>
          }
        >
          {formState.errors.skills && typeof formState.errors.skills === "string" && (
            <p className="text-sm text-red-600 mb-4">{formState.errors.skills}</p>
          )}

          <div className="space-y-4">
            {watchedValues.skills?.map((skill: any, index: number) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-sm font-medium text-gray-700">Skill #{index + 1}</span>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => removeArrayItem("skills", index)}
                  >
                    Remove
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <FormGroup label="Skill Name" error={formState.errors[`skills.${index}.name` as keyof typeof formState.errors] as string}>
                    <input
                      {...register(`skills.${index}.name`)}
                      placeholder="e.g., React, TypeScript"
                      className={inputBaseClasses}
                    />
                  </FormGroup>

                  <FormGroup label="Level" error={formState.errors[`skills.${index}.level` as keyof typeof formState.errors] as string}>
                    <select {...register(`skills.${index}.level`)} className={selectBaseClasses}>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </FormGroup>

                  <FormGroup label="Years Experience" error={formState.errors[`skills.${index}.yearsExperience` as keyof typeof formState.errors] as string}>
                    <input
                      type="number"
                      {...register(`skills.${index}.yearsExperience`)}
                      placeholder="Years"
                      className={inputBaseClasses}
                    />
                  </FormGroup>
                </div>

                {/* Nested Projects */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      Projects ({skill.projects?.length || 0})
                    </span>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        addArrayItem(`skills.${index}.projects`, { name: "", duration: 1 })
                      }
                    >
                      + Project
                    </Button>
                  </div>

                  {formState.errors[`skills.${index}.projects` as keyof typeof formState.errors] && (
                    <p className="text-xs text-red-600 mb-2">
                      {formState.errors[`skills.${index}.projects` as keyof typeof formState.errors] as string}
                    </p>
                  )}

                  <div className="space-y-2">
                    {skill.projects?.map((_project: any, projectIndex: number) => (
                      <div key={projectIndex} className="flex gap-2 items-end bg-white p-2 rounded">
                        <div className="flex-[2]">
                          <label className="text-xs text-gray-500">Project Name</label>
                          <input
                            {...register(`skills.${index}.projects.${projectIndex}.name`)}
                            placeholder="Project name"
                            className={`${inputBaseClasses} text-sm`}
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-gray-500">Duration (months)</label>
                          <input
                            type="number"
                            {...register(`skills.${index}.projects.${projectIndex}.duration`)}
                            placeholder="Months"
                            className={`${inputBaseClasses} text-sm`}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeArrayItem(`skills.${index}.projects`, projectIndex)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          x
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </FormSection>

        {/* Conditional Senior Details */}
        {hasAdvancedSkill && (
          <FormSection title="Senior Level Details" variant="amber">
            <p className="text-xs text-gray-500 mb-3">This field appears because you have an advanced skill</p>
            <FormGroup label="Experience Details" error={formState.errors.seniorDetails as string}>
              <textarea
                {...register("seniorDetails")}
                placeholder="Describe your senior-level experience and leadership..."
                rows={3}
                className={`${inputBaseClasses} resize-y`}
              />
            </FormGroup>
          </FormSection>
        )}

        {/* Terms */}
        <FormSection title="Terms & Conditions" variant="gray">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register("terms")} className="w-4 h-4 rounded" />
            <span className="text-sm">I accept the terms and conditions *</span>
          </label>
          {formState.errors.terms && (
            <p className="text-sm text-red-600 mt-1">{formState.errors.terms}</p>
          )}
        </FormSection>

        {/* Actions */}
        <div className="flex gap-3">
          <Button type="submit" variant="primary" disabled={!canSubmit || formState.isSubmitting}>
            {formState.isSubmitting ? "Submitting..." : "Submit"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => reset()}>
            Reset
          </Button>
        </div>
      </form>

      {submitResult && (
        <Card variant="success">
          <h4 className="font-semibold text-green-800 mb-2">Submitted successfully!</h4>
          <pre className="text-xs overflow-auto max-h-48">
            {JSON.stringify(submitResult.data, null, 2)}
          </pre>
        </Card>
      )}

      <DebugPanel title="Form Values" data={watchedValues} />
      <DebugPanel title="Validation Errors" data={formState.errors} variant="errors" defaultCollapsed={false} />
    </div>
  );
}
