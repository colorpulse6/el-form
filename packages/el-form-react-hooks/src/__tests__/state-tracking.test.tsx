import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { z } from "zod";
import { useForm } from "..";

beforeEach(cleanup);

const schema = z.object({ email: z.string().email() });

function StateDemo() {
  const form = useForm<{ email: string }>({
    validators: { onChange: schema },
    defaultValues: { email: "" },
  });
  const { register, formState } = form;
  return (
    <div>
      <input aria-label="email" {...register("email")} />
      <span data-testid="dirty">{String(formState.isDirty)}</span>
      <span data-testid="touched">{String(form.isFieldTouched("email"))}</span>
      <span data-testid="valid">{String(formState.isValid)}</span>
      <span data-testid="cansubmit">{String(form.canSubmit)}</span>
      <span data-testid="hasErrors">{String(form.hasErrors())}</span>
    </div>
  );
}

describe("state tracking", () => {
  it("isDirty flips when a value changes from default", () => {
    render(<StateDemo />);
    expect(screen.getByTestId("dirty").textContent).toBe("false");
    fireEvent.change(screen.getByLabelText("email"), { target: { value: "x" } });
    expect(screen.getByTestId("dirty").textContent).toBe("true");
  });

  it("touched flips on blur", () => {
    render(<StateDemo />);
    expect(screen.getByTestId("touched").textContent).toBe("false");
    fireEvent.blur(screen.getByLabelText("email"));
    expect(screen.getByTestId("touched").textContent).toBe("true");
  });

  it("isValid / hasErrors reflect validation", async () => {
    render(<StateDemo />);
    fireEvent.change(screen.getByLabelText("email"), { target: { value: "bad" } });
    await waitFor(() => expect(screen.getByTestId("hasErrors").textContent).toBe("true"));
    fireEvent.change(screen.getByLabelText("email"), { target: { value: "a@b.com" } });
    await waitFor(() => expect(screen.getByTestId("valid").textContent).toBe("true"));
  });
});
