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
    // Conditional fields that will be shown/hidden based on watch values
    adminCode: z.string().optional().or(z.literal("")),
    company: z.string().optional().or(z.literal("")),
    seniorDetails: z.string().optional().or(z.literal("")),
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

  // Watch specific fields for conditional rendering
  const currentRole = watch("role");
  const currentAge = watch("age");
  const currentSkills = watch("skills");

  // Conditional logic
  const showAdminCode = currentRole === "admin";
  const showCompanyField = currentAge >= 25;
  const hasAdvancedSkill = currentSkills?.some(
    (skill: any) => skill.level === "advanced"
  );

  return (
    <div className="form-section">
      <h2>🔹 Basic Validation Test</h2>
      <p>
        Schema: name (required), email (valid email), age (18-100), phone (10
        digits), website (optional URL), password + confirm (8+ chars, must
        match), role (enum), skills (array of objects), terms (required)
      </p>
      <p>
        <strong>🎯 Watch Function Testing:</strong> Admin Code (shows when
        role=admin), Company (shows when age≥25), Senior Details (shows when any
        skill=advanced)
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
        Can Submit: {canSubmit ? "✅" : "❌"}
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

        {/* Conditional field: Admin Code - only shows when role is admin */}
        {showAdminCode && (
          <div
            className="form-group"
            style={{
              backgroundColor: "#e8f5e8",
              padding: "1rem",
              borderRadius: "4px",
            }}
          >
            <label>Admin Code (conditional - shows when role=admin)</label>
            <input
              {...register("adminCode")}
              placeholder="Enter admin verification code"
            />
            {formState.errors.adminCode && (
              <span className="error">{formState.errors.adminCode}</span>
            )}
          </div>
        )}

        {/* Conditional field: Company - only shows when age >= 25 */}
        {showCompanyField && (
          <div
            className="form-group"
            style={{
              backgroundColor: "#e8f0ff",
              padding: "1rem",
              borderRadius: "4px",
            }}
          >
            <label>Company (conditional - shows when age ≥ 25)</label>
            <input
              {...register("company")}
              placeholder="Enter your company name"
            />
            {formState.errors.company && (
              <span className="error">{formState.errors.company}</span>
            )}
          </div>
        )}

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
                  marginBottom: "1.5rem",
                  padding: "1rem",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "4px",
                  border: "2px solid #ddd",
                }}
              >
                {/* Skill Header */}
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "flex-start",
                    marginBottom: "1rem",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "0.9rem", fontWeight: "bold" }}>
                      Skill Name
                    </label>
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
                    <label style={{ fontSize: "0.9rem", fontWeight: "bold" }}>
                      Level
                    </label>
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
                    <label style={{ fontSize: "0.9rem", fontWeight: "bold" }}>
                      Years Experience
                    </label>
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
                      height: "fit-content",
                      marginTop: "1.5rem",
                    }}
                  >
                    Remove Skill
                  </button>
                </div>

                {/* Projects Array (nested array) */}
                <div
                  style={{
                    backgroundColor: "#e8f4fd",
                    padding: "1rem",
                    borderRadius: "4px",
                    border: "1px dashed #007acc",
                  }}
                >
                  <label
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: "bold",
                      marginBottom: "0.5rem",
                      display: "block",
                    }}
                  >
                    Projects using this skill:
                  </label>

                  {skill.projects?.map((project: any, projectIndex: number) => (
                    <div
                      key={projectIndex}
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        alignItems: "flex-start",
                        marginBottom: "0.5rem",
                        padding: "0.5rem",
                        backgroundColor: "white",
                        borderRadius: "4px",
                      }}
                    >
                      <div style={{ flex: 2 }}>
                        <input
                          {...register(
                            `skills.${index}.projects.${projectIndex}.name`
                          )}
                          placeholder="Project name (e.g., E-commerce App)"
                          style={{ width: "100%" }}
                        />
                        {formState.errors[
                          `skills.${index}.projects.${projectIndex}.name` as keyof typeof formState.errors
                        ] && (
                          <span
                            className="error"
                            style={{ fontSize: "0.8rem" }}
                          >
                            {
                              formState.errors[
                                `skills.${index}.projects.${projectIndex}.name` as keyof typeof formState.errors
                              ]
                            }
                          </span>
                        )}
                      </div>

                      <div style={{ flex: 1 }}>
                        <input
                          {...register(
                            `skills.${index}.projects.${projectIndex}.duration`
                          )}
                          type="number"
                          placeholder="Duration (months)"
                          style={{ width: "100%" }}
                        />
                        {formState.errors[
                          `skills.${index}.projects.${projectIndex}.duration` as keyof typeof formState.errors
                        ] && (
                          <span
                            className="error"
                            style={{ fontSize: "0.8rem" }}
                          >
                            {
                              formState.errors[
                                `skills.${index}.projects.${projectIndex}.duration` as keyof typeof formState.errors
                              ]
                            }
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeArrayItem(
                            `skills.${index}.projects`,
                            projectIndex
                          )
                        }
                        style={{
                          backgroundColor: "#ffc107",
                          color: "#000",
                          padding: "0.25rem 0.5rem",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "0.8rem",
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() =>
                      addArrayItem(`skills.${index}.projects`, {
                        name: "",
                        duration: 1,
                      })
                    }
                    style={{
                      backgroundColor: "#17a2b8",
                      color: "white",
                      padding: "0.25rem 0.5rem",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                    }}
                  >
                    + Add Project
                  </button>

                  {formState.errors[
                    `skills.${index}.projects` as keyof typeof formState.errors
                  ] && (
                    <div
                      className="error"
                      style={{ marginTop: "0.5rem", fontSize: "0.8rem" }}
                    >
                      {
                        formState.errors[
                          `skills.${index}.projects` as keyof typeof formState.errors
                        ]
                      }
                    </div>
                  )}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                addArrayItem("skills", {
                  name: "",
                  level: "beginner",
                  yearsExperience: 0,
                  projects: [{ name: "", duration: 1 }],
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

        {/* Conditional field: Senior Details - only shows when any skill level is advanced */}
        {hasAdvancedSkill && (
          <div
            className="form-group"
            style={{
              backgroundColor: "#fff3cd",
              padding: "1rem",
              borderRadius: "4px",
            }}
          >
            <label>
              Senior Level Details (conditional - shows when any skill is
              advanced)
            </label>
            <textarea
              {...register("seniorDetails")}
              placeholder="Describe your senior-level experience and leadership..."
              rows={3}
              style={{ width: "100%", resize: "vertical" }}
            />
            {formState.errors.seniorDetails && (
              <span className="error">{formState.errors.seniorDetails}</span>
            )}
          </div>
        )}

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

        <button type="submit" disabled={!canSubmit || formState.isSubmitting}>
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
