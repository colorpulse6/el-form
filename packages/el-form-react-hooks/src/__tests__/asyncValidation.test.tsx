import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { useForm } from "..";
import { z } from "zod";

beforeEach(() => {
  cleanup();
});

interface FormData {
  username: string;
  email: string;
}

const schema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email"),
});

function AsyncValidationForm({
  onValidate,
}: {
  onValidate?: (values: Partial<FormData>) => void;
}) {
  const { register, formState, handleSubmit } = useForm<FormData>({
    defaultValues: { username: "", email: "" },
    validateOn: "onChange",
    validators: {
      onChangeAsync: async ({ value: _value, values }) => {
        onValidate?.(values);
        const result = schema.safeParse(values);
        if (!result.success) {
          return "Validation failed";
        }
        return undefined;
      },
    },
  });

  return (
    <form onSubmit={handleSubmit(() => {})}>
      <input aria-label="username" type="text" {...register("username")} />
      <span data-testid="username-error">{formState.errors.username}</span>
      <input aria-label="email" type="text" {...register("email")} />
      <span data-testid="email-error">{formState.errors.email}</span>
      <span data-testid="is-valid">{formState.isValid ? "valid" : "invalid"}</span>
    </form>
  );
}

function RapidInputForm() {
  const { register, formState } = useForm<FormData>({
    defaultValues: { username: "", email: "" },
    validateOn: "onChange",
    fieldValidators: {
      username: {
        onChange: ({ value }) => {
          if (value && value.length < 3) {
            return "Too short";
          }
          return undefined;
        },
      },
    },
  });

  return (
    <div>
      <input aria-label="username" type="text" {...register("username")} />
      <span data-testid="username-error">{formState.errors.username}</span>
      <input aria-label="email" type="text" {...register("email")} />
    </div>
  );
}

describe("async validation behavior", () => {
  it("should validate against current values, not stale closure values", async () => {
    const onValidate = vi.fn();
    render(<AsyncValidationForm onValidate={onValidate} />);

    const usernameInput = screen.getByLabelText("username");
    const emailInput = screen.getByLabelText("email");

    // Change username first
    fireEvent.change(usernameInput, { target: { value: "abc" } });

    // Change email while username validation might still be running
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    // Wait for validations to complete
    await waitFor(() => {
      // The validator should have been called with the most recent values
      const lastCall = onValidate.mock.calls[onValidate.mock.calls.length - 1];
      if (lastCall) {
        expect(lastCall[0]).toMatchObject({
          username: "abc",
          email: "test@example.com",
        });
      }
    });
  });

  it("should handle rapid sequential changes correctly", async () => {
    render(<RapidInputForm />);

    const usernameInput = screen.getByLabelText("username");

    // Rapidly type characters
    fireEvent.change(usernameInput, { target: { value: "a" } });
    fireEvent.change(usernameInput, { target: { value: "ab" } });
    fireEvent.change(usernameInput, { target: { value: "abc" } });

    // Wait for validation to settle
    await waitFor(
      () => {
        // Final value should be valid (3 chars)
        const error = screen.getByTestId("username-error");
        expect(error.textContent).toBe("");
      },
      { timeout: 500 }
    );
  });

  it("should update isValid state after validation completes", async () => {
    render(<AsyncValidationForm />);

    const usernameInput = screen.getByLabelText("username");
    const emailInput = screen.getByLabelText("email");

    // Enter valid values
    fireEvent.change(usernameInput, { target: { value: "validuser" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    await waitFor(() => {
      const isValid = screen.getByTestId("is-valid");
      expect(isValid.textContent).toBe("valid");
    });
  });

  it("should clear error when field becomes valid", async () => {
    render(<RapidInputForm />);

    const usernameInput = screen.getByLabelText("username");

    // Enter invalid value
    fireEvent.change(usernameInput, { target: { value: "ab" } });

    // Wait for validation to update state
    await waitFor(() => {
      const error = screen.getByTestId("username-error");
      expect(error.textContent).toBe("Too short");
    });

    // Enter valid value
    fireEvent.change(usernameInput, { target: { value: "abc" } });

    await waitFor(() => {
      const error = screen.getByTestId("username-error");
      expect(error.textContent).toBe("");
    });
  });
});
