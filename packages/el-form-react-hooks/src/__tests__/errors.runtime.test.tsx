import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { z } from "zod";
import { useForm } from "..";

beforeEach(cleanup);

const schema = z.object({ email: z.string().email("Invalid email") });

function ErrorsDemo() {
  const form = useForm<{ email: string }>({
    validators: { onSubmit: schema },
    defaultValues: { email: "" },
  });
  const { register, formState } = form;
  return (
    <div>
      <input aria-label="email" {...register("email")} />
      <button onClick={() => form.setError("email", "Taken")}>setErr</button>
      <button onClick={() => form.clearErrors("email")}>clearErr</button>
      <button onClick={() => form.trigger("email")}>trigger</button>
      <span data-testid="err">{formState.errors.email ?? ""}</span>
    </div>
  );
}

describe("setError / clearErrors / trigger", () => {
  it("setError sets a field error", () => {
    render(<ErrorsDemo />);
    fireEvent.click(screen.getByText("setErr"));
    expect(screen.getByTestId("err").textContent).toBe("Taken");
  });

  it("clearErrors clears a field error", () => {
    render(<ErrorsDemo />);
    fireEvent.click(screen.getByText("setErr"));
    fireEvent.click(screen.getByText("clearErr"));
    expect(screen.getByTestId("err").textContent).toBe("");
  });

  it("trigger validates a field on demand", async () => {
    render(<ErrorsDemo />);
    fireEvent.change(screen.getByLabelText("email"), { target: { value: "bad" } });
    fireEvent.click(screen.getByText("trigger"));
    await waitFor(() => expect(screen.getByTestId("err").textContent).toBe("Invalid email"));
  });
});
