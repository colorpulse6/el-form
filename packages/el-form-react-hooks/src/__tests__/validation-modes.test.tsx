import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { z } from "zod";
import { useForm } from "..";

beforeEach(() => {
  cleanup();
});

const schema = z.object({ email: z.string().email("Invalid email") });

function ModeDemo({ mode }: { mode: "onChange" | "onBlur" | "onSubmit" }) {
  const { register, handleSubmit, formState } = useForm<{ email: string }>({
    validators: { [mode]: schema } as any,
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

describe("validation modes", () => {
  it("onChange surfaces the error as the user types", async () => {
    render(<ModeDemo mode="onChange" />);
    fireEvent.change(screen.getByLabelText("email"), { target: { value: "bad" } });
    await waitFor(() => expect(screen.getByTestId("err").textContent).toBe("Invalid email"));
  });

  it("onChange clears the error when corrected", async () => {
    render(<ModeDemo mode="onChange" />);
    fireEvent.change(screen.getByLabelText("email"), { target: { value: "bad" } });
    await waitFor(() => expect(screen.getByTestId("err").textContent).toBe("Invalid email"));
    fireEvent.change(screen.getByLabelText("email"), { target: { value: "a@b.com" } });
    await waitFor(() => expect(screen.getByTestId("err").textContent).toBe(""));
  });

  it("onBlur surfaces the error only after blur", async () => {
    render(<ModeDemo mode="onBlur" />);
    fireEvent.change(screen.getByLabelText("email"), { target: { value: "bad" } });
    expect(screen.getByTestId("err").textContent).toBe("");
    fireEvent.blur(screen.getByLabelText("email"));
    await waitFor(() => expect(screen.getByTestId("err").textContent).toBe("Invalid email"));
  });

  it("onSubmit surfaces the error only on submit", async () => {
    render(<ModeDemo mode="onSubmit" />);
    fireEvent.change(screen.getByLabelText("email"), { target: { value: "bad" } });
    expect(screen.getByTestId("err").textContent).toBe("");
    fireEvent.click(screen.getByText("Submit"));
    await waitFor(() => expect(screen.getByTestId("err").textContent).toBe("Invalid email"));
  });
});
