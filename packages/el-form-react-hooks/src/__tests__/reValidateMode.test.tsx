import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { z } from "zod";
import { useForm } from "..";

beforeEach(cleanup);
const schema = z.object({ email: z.string().email("Invalid email") });

function Demo() {
  const { register, handleSubmit, formState } = useForm<{ email: string }>({
    validators: { onChange: schema, onBlur: schema, onSubmit: schema },
    reValidateMode: "onBlur",
    defaultValues: { email: "" },
  });
  return (
    <form onSubmit={handleSubmit(() => {})}>
      <input aria-label="email" {...register("email")} />
      <button type="submit">Submit</button>
      <span data-testid="err">{formState.errors.email ?? ""}</span>
    </form>
  );
}

// el-form's register onChange handler clears the field error UNCONDITIONALLY (outside
// the shouldValidate gate), then re-validation (gated by shouldValidate) re-adds it if
// still invalid. So the observable effect of reValidateMode "onBlur" is: after submit,
// an onChange to a still-invalid value clears the error and does NOT re-add it
// (onChange re-validation suppressed); a blur re-adds it.
describe("reValidateMode", () => {
  it("after submit, an onChange does not re-validate (reValidateMode onBlur); a blur does", async () => {
    render(<Demo />);
    const input = screen.getByLabelText("email");

    // Pre-submit: smart-validation runs onChange (reValidateMode inactive until submitted).
    fireEvent.change(input, { target: { value: "bad" } });
    await waitFor(() =>
      expect(screen.getByTestId("err").textContent).toBe("Invalid email")
    );

    // Submit -> isSubmitted becomes true; the error stays.
    fireEvent.click(screen.getByText("Submit"));
    await waitFor(() =>
      expect(screen.getByTestId("err").textContent).toBe("Invalid email")
    );

    // Post-submit onChange to another invalid value: the handler eager-clears the error,
    // and reValidateMode:"onBlur" suppresses onChange re-validation, so it stays cleared.
    // The 50ms wait gives any (incorrect) re-validation time to land — without the
    // reValidateMode impl, smart-validation would re-add "Invalid email" here.
    fireEvent.change(input, { target: { value: "alsobad" } });
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.getByTestId("err").textContent).toBe("");

    // A blur DOES re-validate (eventType === reValidateMode) -> the error returns.
    fireEvent.blur(input);
    await waitFor(() =>
      expect(screen.getByTestId("err").textContent).toBe("Invalid email")
    );
  });

  it("without reValidateMode set, post-submit onChange re-validates (unchanged default)", async () => {
    function DefaultDemo() {
      const { register, handleSubmit, formState } = useForm<{ email: string }>({
        validators: { onChange: schema, onBlur: schema, onSubmit: schema },
        defaultValues: { email: "" },
      });
      return (
        <form onSubmit={handleSubmit(() => {})}>
          <input aria-label="email" {...register("email")} />
          <button type="submit">Submit</button>
          <span data-testid="err2">{formState.errors.email ?? ""}</span>
        </form>
      );
    }
    render(<DefaultDemo />);
    const input = screen.getByLabelText("email");
    fireEvent.click(screen.getByText("Submit"));
    await waitFor(() =>
      expect(screen.getByTestId("err2").textContent).toBe("Invalid email")
    );
    // Default (no reValidateMode): post-submit onChange re-validates immediately.
    fireEvent.change(input, { target: { value: "stillbad" } });
    await waitFor(() =>
      expect(screen.getByTestId("err2").textContent).toBe("Invalid email")
    );
  });
});
