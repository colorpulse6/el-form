import { z } from "zod";
import { useFormWithMutation, errorExtractors } from "./useFormWithMutation";

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

type User = z.infer<typeof userSchema>;

/**
 * Simple test component to demonstrate React Query integration
 * This replaces the complex examples file that had import issues
 */
export function ReactQueryFormTest() {
  const form = useFormWithMutation<User>({
    validators: { onChange: userSchema },
    defaultValues: { name: "", email: "" },
    mutation: {
      mutation: {
        mutationFn: async (data: User) => {
          // Simulate API call
          console.log("Submitting data:", data);
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Simulate random error for testing
          if (Math.random() > 0.7) {
            throw {
              response: {
                data: {
                  fieldErrors: {
                    email: "Email already exists",
                  },
                  message: "Validation failed",
                },
              },
            };
          }

          return { id: Date.now(), ...data };
        },
      },
      extractFieldErrors: errorExtractors.standard.extractFieldErrors,
      extractErrorMessage: errorExtractors.standard.extractErrorMessage,
      onMutationSuccess: (data: any) => {
        console.log("User created successfully:", data);
        form.reset();
      },
      onMutationError: (error: any) => {
        console.error("Failed to create user:", error);
      },
    },
  });

  return (
    <div style={{ maxWidth: "400px", margin: "2rem auto", padding: "1rem" }}>
      <h2>React Query Form Integration Test</h2>

      <form onSubmit={form.handleSubmit(() => form.submitWithMutation())}>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="name">Name:</label>
          <input
            {...form.register("name")}
            id="name"
            placeholder="Enter your name"
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              marginTop: "0.25rem",
            }}
          />
          {form.formState.errors.name && (
            <div
              style={{
                color: "red",
                fontSize: "0.875rem",
                marginTop: "0.25rem",
              }}
            >
              {form.formState.errors.name}
            </div>
          )}
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="email">Email:</label>
          <input
            {...form.register("email")}
            id="email"
            type="email"
            placeholder="Enter your email"
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              marginTop: "0.25rem",
            }}
          />
          {form.formState.errors.email && (
            <div
              style={{
                color: "red",
                fontSize: "0.875rem",
                marginTop: "0.25rem",
              }}
            >
              {form.formState.errors.email}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={form.isSubmittingMutation || !form.formState.isValid}
          style={{
            backgroundColor: form.isSubmittingMutation ? "#ccc" : "#007bff",
            color: "white",
            padding: "0.75rem 1.5rem",
            border: "none",
            borderRadius: "4px",
            cursor: form.isSubmittingMutation ? "not-allowed" : "pointer",
            width: "100%",
          }}
        >
          {form.isSubmittingMutation ? "Creating User..." : "Create User"}
        </button>
      </form>

      {/* Display mutation state for debugging */}
      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          backgroundColor: "#f8f9fa",
          borderRadius: "4px",
        }}
      >
        <h4>Form State Debug:</h4>
        <ul style={{ fontSize: "0.875rem", margin: 0, paddingLeft: "1rem" }}>
          <li>Is Valid: {form.formState.isValid ? "✅" : "❌"}</li>
          <li>Is Dirty: {form.formState.isDirty ? "✅" : "❌"}</li>
          <li>Is Submitting: {form.isSubmittingMutation ? "⏳" : "✅"}</li>
          <li>Mutation Pending: {form.mutation.isPending ? "⏳" : "✅"}</li>
          <li>Mutation Error: {form.mutation.isError ? "❌" : "✅"}</li>
          <li>Mutation Success: {form.mutation.isSuccess ? "✅" : "❌"}</li>
        </ul>

        {form.mutation.isSuccess && (
          <div style={{ marginTop: "1rem" }}>
            <strong>✅ User created successfully!</strong>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReactQueryFormTest;
