import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { z } from "zod";
import { AutoForm } from "../AutoForm";

beforeEach(() => {
  cleanup();
});

describe("AutoForm validation user feedback", () => {
  const schema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    age: z.number().min(18, "Must be at least 18"),
  });

  it("should show error immediately after blur when validateOn='onBlur'", async () => {
    render(
      <AutoForm
        schema={schema}
        initialValues={{ username: "", email: "", age: 0 }}
        validateOn="onBlur"
        onSubmit={() => {}}
      />
    );

    const usernameInput = screen.getByLabelText("Username") as HTMLInputElement;

    // Type invalid value and blur
    fireEvent.change(usernameInput, { target: { value: "ab" } });
    fireEvent.blur(usernameInput);

    await waitFor(() => {
      // Error may appear in multiple places (summary and field), use getAllBy
      const errorTexts = screen.getAllByText(/at least 3 characters/i);
      expect(errorTexts.length).toBeGreaterThan(0);
    });
  });

  it("should clear error when field becomes valid", async () => {
    render(
      <AutoForm
        schema={schema}
        initialValues={{ username: "", email: "", age: 0 }}
        validateOn="onBlur"
        onSubmit={() => {}}
      />
    );

    const usernameInput = screen.getByLabelText("Username") as HTMLInputElement;

    // Enter invalid value and blur to trigger validation
    fireEvent.change(usernameInput, { target: { value: "ab" } });
    fireEvent.blur(usernameInput);

    await waitFor(() => {
      const errorTexts = screen.getAllByText(/at least 3 characters/i);
      expect(errorTexts.length).toBeGreaterThan(0);
    });

    // Enter valid value and blur again
    fireEvent.change(usernameInput, { target: { value: "abcd" } });
    fireEvent.blur(usernameInput);

    await waitFor(() => {
      const errorText = screen.queryByText(/at least 3 characters/i);
      expect(errorText).toBeNull();
    });
  });

  it("should validate all fields on submit", async () => {
    const onSubmit = vi.fn();
    const onError = vi.fn();

    render(
      <AutoForm
        schema={schema}
        initialValues={{ username: "", email: "", age: 0 }}
        validateOn="onSubmit"
        onSubmit={onSubmit}
        onError={onError}
      />
    );

    // Submit without filling any fields
    const submitButton = screen.getByRole("button", { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      // onError should have been called since validation failed
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  it("should call onSubmit with valid data", async () => {
    const onSubmit = vi.fn();

    render(
      <AutoForm
        schema={schema}
        initialValues={{ username: "", email: "", age: 0 }}
        validateOn="onSubmit"
        onSubmit={onSubmit}
      />
    );

    // Fill in valid values
    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "validuser" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Age"), {
      target: { value: "25", valueAsNumber: 25 },
    });

    // Submit
    const submitButton = screen.getByRole("button", { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  it("should render form with all fields from schema", () => {
    render(
      <AutoForm
        schema={schema}
        initialValues={{ username: "", email: "", age: 0 }}
        validateOn="onChange"
        onSubmit={() => {}}
      />
    );

    // Verify all fields are rendered
    expect(screen.getByLabelText("Username")).toBeTruthy();
    expect(screen.getByLabelText("Email")).toBeTruthy();
    expect(screen.getByLabelText("Age")).toBeTruthy();

    // Verify field types
    const usernameInput = screen.getByLabelText("Username") as HTMLInputElement;
    const ageInput = screen.getByLabelText("Age") as HTMLInputElement;

    expect(usernameInput.type).toBe("text");
    expect(ageInput.type).toBe("number");
  });

  it("should work with custom error component", async () => {
    const CustomError = ({
      errors,
      touched,
    }: {
      errors: Record<string, string>;
      touched: Record<string, boolean>;
    }) => (
      <div data-testid="custom-errors">
        {Object.entries(errors).map(
          ([field, error]) =>
            touched[field] && (
              <span key={field} className="custom-error">
                {field}: {error}
              </span>
            )
        )}
      </div>
    );

    render(
      <AutoForm
        schema={schema}
        initialValues={{ username: "", email: "", age: 0 }}
        validateOn="onBlur"
        customErrorComponent={CustomError}
        onSubmit={() => {}}
      />
    );

    const usernameInput = screen.getByLabelText("Username");
    fireEvent.change(usernameInput, { target: { value: "ab" } });
    fireEvent.blur(usernameInput);

    await waitFor(() => {
      const customErrors = screen.getByTestId("custom-errors");
      expect(customErrors).toBeTruthy();
    });
  });
});
