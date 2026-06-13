import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { useForm } from "..";

beforeEach(cleanup);

// fieldValidators async does NOT trigger on change via "smart validation" (which only
// inspects form-level `validators`), so the demo sets validateOn:"onChange" to force it —
// exactly like the existing asyncValidation.test.tsx.
function Demo({ reject = false }: { reject?: boolean }) {
  const form = useForm<{ email: string }>({
    defaultValues: { email: "" },
    validateOn: "onChange",
    fieldValidators: {
      email: {
        onChangeAsync: reject
          ? async () => { throw new Error("boom"); }
          : async () => { await new Promise((r) => setTimeout(r, 30)); return "bad"; },
      },
    } as any,
  });
  const { register, formState } = form;
  return (
    <div>
      <input aria-label="email" {...register("email")} />
      <span data-testid="isValidating">{String(formState.isValidating)}</span>
    </div>
  );
}

describe("isValidating", () => {
  it("is true while async validation runs, then false", async () => {
    render(<Demo />);
    fireEvent.change(screen.getByLabelText("email"), { target: { value: "x" } });
    await waitFor(() => expect(screen.getByTestId("isValidating").textContent).toBe("true"));
    await waitFor(() => expect(screen.getByTestId("isValidating").textContent).toBe("false"));
  });

  it("returns to false even if the async validator throws", async () => {
    render(<Demo reject />);
    fireEvent.change(screen.getByLabelText("email"), { target: { value: "x" } });
    await waitFor(() => expect(screen.getByTestId("isValidating").textContent).toBe("false"));
  });
});
