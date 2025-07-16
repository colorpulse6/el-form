import React from "react";
import { z } from "zod";
import {
  useApiForm,
  useMutationForm,
  useValidationForm,
  useOptimisticForm,
} from "../useApiForm";
import { errorExtractors } from "../useFormWithMutation";

// Example schemas
const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  age: z.number().min(18, "Must be 18 or older"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type User = z.infer<typeof userSchema>;
type LoginData = z.infer<typeof loginSchema>;
type UserWithId = User & { id: number };

/**
 * Example 1: Simple API Form
 * Automatically handles API submission and error mapping
 */
export function ApiFormExample() {
  const form = useApiForm({
    validators: { onChange: userSchema },
    defaultValues: { name: "", email: "", age: 18 },
    submitUrl: "/api/users",
    submitMethod: "POST",
    errorExtractor: "standard",
    onSuccess: (data) => {
      console.log("User created successfully:", data);
      form.reset();
    },
    onError: (error) => {
      console.error("Failed to create user:", error);
    },
  });

  return (
    <form onSubmit={form.handleSubmit(() => form.submitWithMutation())}>
      <div>
        <input {...form.register("name")} placeholder="Name" />
        {form.formState.errors.name && (
          <span className="error">{form.formState.errors.name}</span>
        )}
      </div>

      <div>
        <input {...form.register("email")} type="email" placeholder="Email" />
        {form.formState.errors.email && (
          <span className="error">{form.formState.errors.email}</span>
        )}
      </div>

      <div>
        <input {...form.register("age")} type="number" placeholder="Age" />
        {form.formState.errors.age && (
          <span className="error">{form.formState.errors.age}</span>
        )}
      </div>

      {form.formState.errors.root && (
        <div className="error general-error">{form.formState.errors.root}</div>
      )}

      <button
        type="submit"
        disabled={form.isSubmittingMutation || !form.formState.isValid}
      >
        {form.isSubmittingMutation ? "Creating..." : "Create User"}
      </button>
    </form>
  );
}

/**
 * Example 2: Custom Mutation Form
 * Uses a custom mutation function with full control
 */
export function CustomMutationExample() {
  const form = useMutationForm(
    {
      validators: { onChange: loginSchema },
      defaultValues: { email: "", password: "" },
    },
    {
      mutationFn: async (data: LoginData) => {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const error = await response.json();
          throw error;
        }

        return response.json();
      },
      onSuccess: (data, _variables) => {
        console.log("Login successful:", data);
        localStorage.setItem("token", data.token);
        // Redirect or update app state
      },
      onError: (error, _variables) => {
        console.error("Login failed:", error);
      },
      extractFieldErrors: errorExtractors.standard.extractFieldErrors,
      extractErrorMessage: errorExtractors.standard.extractErrorMessage,
      retry: 2,
    }
  );

  return (
    <form onSubmit={form.handleSubmit(() => form.submitWithMutation())}>
      <div>
        <input
          {...form.register("email")}
          type="email"
          placeholder="Email"
          autoComplete="email"
        />
        {form.formState.errors.email && (
          <span className="error">{form.formState.errors.email}</span>
        )}
      </div>

      <div>
        <input
          {...form.register("password")}
          type="password"
          placeholder="Password"
          autoComplete="current-password"
        />
        {form.formState.errors.password && (
          <span className="error">{form.formState.errors.password}</span>
        )}
      </div>

      {form.formState.errors.root && (
        <div className="error general-error">{form.formState.errors.root}</div>
      )}

      <button
        type="submit"
        disabled={form.isSubmittingMutation || !form.formState.isValid}
      >
        {form.isSubmittingMutation ? "Logging in..." : "Login"}
      </button>

      {form.mutation.isError && (
        <div className="error">
          Login attempt failed. {form.mutation.error?.message}
        </div>
      )}
    </form>
  );
}

/**
 * Example 3: Server-side Validation Form
 * Validates with server before allowing submission
 */
export function ServerValidationExample() {
  const form = useValidationForm({
    validators: { onChange: userSchema },
    defaultValues: { name: "", email: "", age: 18 },
    validateUrl: "/api/validate-user",
    errorExtractor: "zod", // Server returns Zod validation errors
    onValidationSuccess: (data) => {
      console.log("Validation passed:", data);
      // Now allow actual submission
    },
    onValidationError: (error) => {
      console.log("Server validation failed:", error);
    },
  });

  const handleValidateOnly = async () => {
    const result = await form.validateOnly();
    if (result.success) {
      alert("Validation passed! Ready to submit.");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(() => form.submitWithMutation())}>
      <div>
        <input {...form.register("name")} placeholder="Name" />
        {form.formState.errors.name && (
          <span className="error">{form.formState.errors.name}</span>
        )}
      </div>

      <div>
        <input {...form.register("email")} type="email" placeholder="Email" />
        {form.formState.errors.email && (
          <span className="error">{form.formState.errors.email}</span>
        )}
      </div>

      <div>
        <input {...form.register("age")} type="number" placeholder="Age" />
        {form.formState.errors.age && (
          <span className="error">{form.formState.errors.age}</span>
        )}
      </div>

      <div className="button-group">
        <button type="button" onClick={handleValidateOnly}>
          Validate Only
        </button>

        <button type="submit" disabled={form.isSubmittingMutation}>
          {form.isSubmittingMutation ? "Submitting..." : "Submit"}
        </button>
      </div>
    </form>
  );
}

/**
 * Example 4: Optimistic Updates
 * Shows immediate feedback while the mutation is processing
 */
export function OptimisticFormExample() {
  const [users, setUsers] = React.useState<UserWithId[]>([]);

  const form = useOptimisticForm(
    {
      validators: { onChange: userSchema },
      defaultValues: { name: "", email: "", age: 18 },
    },
    {
      mutationFn: async (data: User): Promise<UserWithId> => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Simulate potential failure
        if (Math.random() > 0.7) {
          throw new Error("Random server error for demo");
        }

        return { ...data, id: Date.now() };
      },
      optimisticUpdate: (variables: User) => {
        // Immediately add the user to the list
        const optimisticUser: UserWithId = { ...variables, id: -1 }; // Temporary ID
        setUsers((prev) => [...prev, optimisticUser]);
      },
      onSuccess: (data, _variables) => {
        // Replace optimistic user with real user
        setUsers((prev) => prev.map((user) => (user.id === -1 ? data : user)));
        form.reset();
      },
      onRollback: (_variables) => {
        // Remove optimistic user on error
        setUsers((prev) => prev.filter((user) => user.id !== -1));
      },
      extractFieldErrors: (error: any) => {
        // Example error extraction
        return error.fieldErrors;
      },
      extractErrorMessage: (error: any) => {
        return error.message || "Something went wrong";
      },
    }
  );

  return (
    <div>
      <form onSubmit={form.handleSubmit(() => form.submitWithMutation())}>
        <div>
          <input {...form.register("name")} placeholder="Name" />
          {form.formState.errors.name && (
            <span className="error">{form.formState.errors.name}</span>
          )}
        </div>

        <div>
          <input {...form.register("email")} type="email" placeholder="Email" />
          {form.formState.errors.email && (
            <span className="error">{form.formState.errors.email}</span>
          )}
        </div>

        <div>
          <input {...form.register("age")} type="number" placeholder="Age" />
          {form.formState.errors.age && (
            <span className="error">{form.formState.errors.age}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={form.isSubmittingMutation || !form.formState.isValid}
        >
          {form.isSubmittingMutation ? "Adding..." : "Add User"}
        </button>
      </form>

      <div className="user-list">
        <h3>Users ({users.length})</h3>
        {users.map((user, index) => (
          <div
            key={user.id || index}
            className={`user-item ${user.id === -1 ? "optimistic" : ""}`}
          >
            <strong>{user.name}</strong> - {user.email} ({user.age} years old)
            {user.id === -1 && <span className="badge">Saving...</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Example 5: GraphQL Integration
 * Shows how to integrate with GraphQL mutations
 */
export function GraphQLFormExample() {
  const form = useMutationForm(
    {
      validators: { onChange: userSchema },
      defaultValues: { name: "", email: "", age: 18 },
    },
    {
      mutationFn: async (data: User) => {
        const query = `
          mutation CreateUser($input: UserInput!) {
            createUser(input: $input) {
              id
              name
              email
              age
            }
          }
        `;

        const response = await fetch("/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query,
            variables: { input: data },
          }),
        });

        const result = await response.json();

        if (result.errors) {
          throw { graphQLErrors: result.errors };
        }

        return result.data.createUser;
      },
      extractFieldErrors: errorExtractors.graphql.extractFieldErrors,
      extractErrorMessage: errorExtractors.graphql.extractErrorMessage,
    }
  );

  return (
    <form onSubmit={form.handleSubmit(() => form.submitWithMutation())}>
      <div>
        <input {...form.register("name")} placeholder="Name" />
        {form.formState.errors.name && (
          <span className="error">{form.formState.errors.name}</span>
        )}
      </div>

      <div>
        <input {...form.register("email")} type="email" placeholder="Email" />
        {form.formState.errors.email && (
          <span className="error">{form.formState.errors.email}</span>
        )}
      </div>

      <div>
        <input {...form.register("age")} type="number" placeholder="Age" />
        {form.formState.errors.age && (
          <span className="error">{form.formState.errors.age}</span>
        )}
      </div>

      <button
        type="submit"
        disabled={form.isSubmittingMutation || !form.formState.isValid}
      >
        {form.isSubmittingMutation ? "Creating..." : "Create User"}
      </button>

      {form.mutation.data && (
        <div className="success">
          User created with ID: {form.mutation.data.id}
        </div>
      )}
    </form>
  );
}
