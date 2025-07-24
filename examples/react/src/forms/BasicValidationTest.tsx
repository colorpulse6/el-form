import { useForm } from "el-form-react-hooks";
import { useState } from "react";
import z from "zod";

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
      errorMap: () => ({ message: "Please select a valid role" }),
    }),
    skills: z
      .array(
        z.object({
          name: z.string().min(1, "Skill name is required"),
          level: z.enum(["beginner", "intermediate", "advanced"], {
            errorMap: () => ({ message: "Please select a skill level" }),
          }),
          yearsExperience: z
            .number()
            .min(0, "Years must be 0 or more")
            .max(50, "Years must be 50 or less")
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
      role: "user" as const,
      skills: [{ name: "", level: "beginner" as const, yearsExperience: 0 }],
      terms: false,
    },
  });

  const watchedValues = watch();

  return (
    <div className="form-section">
      <h2>🔹 Basic Validation Test</h2>
      <p>
        Schema: name (required), email (valid email), age (18-100), phone (10
        digits), website (optional URL), password + confirm (8+ chars, must
        match), role (enum), skills (array of objects), terms (required)
      </p>

      <div className="form-state">
        <strong>Form State:</strong>
        <br />
        Values: {JSON.stringify(watchedValues, null, 2)}
        <br />
        Errors: {JSON.stringify(formState.errors, null, 2)}
        <br />
        Valid: {formState.isValid ? "✅" : "❌"}
        <br />
        Dirty: {formState.isDirty ? "✅" : "❌"}
        <br />
        Can Submit: {canSubmit() ? "✅" : "❌"}
      </div>

      <form
        onSubmit={handleSubmit((data) => {
          setSubmitResult({ success: true, data });
        })}
      >
        <div className="form-group">
          <label>Name *</label>
          <input {...register("name")} placeholder="Enter your name" />
          {formState.errors.name && (
            <span className="error">{formState.errors.name}</span>
          )}
        </div>

        <div className="form-group">
          <label>Email *</label>
          <input
            {...register("email")}
            type="email"
            placeholder="Enter your email"
          />
          {formState.errors.email && (
            <span className="error">{formState.errors.email}</span>
          )}
        </div>

        <div className="form-group">
          <label>Age *</label>
          <input
            {...register("age")}
            type="number"
            placeholder="Enter your age"
          />
          {formState.errors.age && (
            <span className="error">{formState.errors.age}</span>
          )}
        </div>

        <div className="form-group">
          <label>Phone *</label>
          <input {...register("phone")} type="tel" placeholder="1234567890" />
          {formState.errors.phone && (
            <span className="error">{formState.errors.phone}</span>
          )}
        </div>

        <div className="form-group">
          <label>Website (optional)</label>
          <input
            {...register("website")}
            type="url"
            placeholder="https://example.com"
          />
          {formState.errors.website && (
            <span className="error">{formState.errors.website}</span>
          )}
        </div>

        <div className="form-group">
          <label>Password *</label>
          <input
            {...register("password")}
            type="password"
            placeholder="Enter password (8+ characters)"
          />
          {formState.errors.password && (
            <span className="error">{formState.errors.password}</span>
          )}
        </div>

        <div className="form-group">
          <label>Confirm Password *</label>
          <input
            {...register("confirmPassword")}
            type="password"
            placeholder="Confirm your password"
          />
          {formState.errors.confirmPassword && (
            <span className="error">{formState.errors.confirmPassword}</span>
          )}
        </div>

        <div className="form-group">
          <label>Role *</label>
          <select {...register("role")}>
            <option value="user">User</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
          </select>
          {formState.errors.role && (
            <span className="error">{formState.errors.role}</span>
          )}
        </div>

        <div className="form-group">
          <label>Skills *</label>
          <div
            style={{
              border: "1px solid #ccc",
              padding: "1rem",
              borderRadius: "4px",
            }}
          >
            {watchedValues.skills?.map((skill: any, index: number) => (
              <div
                key={index}
                style={{
                  marginBottom: "1rem",
                  padding: "1rem",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "4px",
                  display: "flex",
                  gap: "0.5rem",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ flex: 1 }}>
                  <input
                    {...register(`skills.${index}.name`)}
                    placeholder="Skill name (e.g., React, TypeScript)"
                    style={{ width: "100%", marginBottom: "0.5rem" }}
                  />
                  {formState.errors[
                    `skills.${index}.name` as keyof typeof formState.errors
                  ] && (
                    <span className="error">
                      {
                        formState.errors[
                          `skills.${index}.name` as keyof typeof formState.errors
                        ]
                      }
                    </span>
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <select
                    {...register(`skills.${index}.level`)}
                    style={{ width: "100%", marginBottom: "0.5rem" }}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                  {formState.errors[
                    `skills.${index}.level` as keyof typeof formState.errors
                  ] && (
                    <span className="error">
                      {
                        formState.errors[
                          `skills.${index}.level` as keyof typeof formState.errors
                        ]
                      }
                    </span>
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <input
                    {...register(`skills.${index}.yearsExperience`)}
                    type="number"
                    placeholder="Years of experience"
                    style={{ width: "100%", marginBottom: "0.5rem" }}
                  />
                  {formState.errors[
                    `skills.${index}.yearsExperience` as keyof typeof formState.errors
                  ] && (
                    <span className="error">
                      {
                        formState.errors[
                          `skills.${index}.yearsExperience` as keyof typeof formState.errors
                        ]
                      }
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => removeArrayItem("skills", index)}
                  style={{
                    backgroundColor: "#dc3545",
                    color: "white",
                    padding: "0.5rem",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                addArrayItem("skills", {
                  name: "",
                  level: "beginner",
                  yearsExperience: 0,
                })
              }
              style={{
                backgroundColor: "#28a745",
                color: "white",
                padding: "0.5rem 1rem",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              + Add Skill
            </button>

            {formState.errors.skills &&
              typeof formState.errors.skills === "string" && (
                <div className="error" style={{ marginTop: "0.5rem" }}>
                  {formState.errors.skills}
                </div>
              )}
          </div>
        </div>

        <div className="form-group">
          <label>
            <input
              {...register("terms")}
              type="checkbox"
              style={{ marginRight: "0.5rem" }}
            />
            I accept the terms and conditions *
          </label>
          {formState.errors.terms && (
            <span className="error">{formState.errors.terms}</span>
          )}
        </div>

        <button type="submit" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? "Submitting..." : "Submit"}
        </button>

        <button
          type="button"
          onClick={() => reset()}
          style={{ marginLeft: "1rem" }}
        >
          Reset
        </button>
      </form>

      {submitResult && (
        <div className="success">
          <strong>Submitted successfully!</strong>
          <br />
          {JSON.stringify(submitResult.data, null, 2)}
        </div>
      )}
    </div>
  );
}
