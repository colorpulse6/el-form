import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { useForm } from "..";

beforeEach(cleanup);

let calls = 0;
function Demo() {
  const { register, formState } = useForm<{ email: string }>({
    defaultValues: { email: "" },
    validateOn: "onChange",
    fieldValidators: {
      email: { onChangeAsync: async () => { calls++; return "Already taken"; } },
    },
  });
  return (
    <div>
      <input aria-label="email" {...register("email")} />
      <span data-testid="err">{formState.errors.email ?? ""}</span>
    </div>
  );
}

function BlurDemo() {
  const { register, formState } = useForm<{ email: string }>({
    defaultValues: { email: "" },
    validateOn: "onBlur",
    fieldValidators: { email: { onBlurAsync: async () => { calls++; return "Already taken"; } } },
  });
  return (<div><input aria-label="email" {...register("email")} /><span data-testid="err">{formState.errors.email ?? ""}</span></div>);
}

function GateDemo({ asyncAlways = false }: { asyncAlways?: boolean }) {
  const { register, formState } = useForm<{ email: string }>({
    defaultValues: { email: "" },
    validateOn: "onChange",
    fieldValidators: {
      email: {
        onChange: ({ value: v }: { value: string; values: any; fieldName: string }) => (v.includes("@") ? undefined : "Invalid"),
        onChangeAsync: async () => { calls++; return "Taken"; },
        asyncAlways,
      },
    },
  });
  return (<div><input aria-label="email" {...register("email")} /><span data-testid="err">{formState.errors.email ?? ""}</span></div>);
}

describe("async dispatch", () => {
  it("runs onChangeAsync and surfaces its error", async () => {
    calls = 0;
    render(<Demo />);
    fireEvent.change(screen.getByLabelText("email"), { target: { value: "a@b.com" } });
    await waitFor(() => expect(screen.getByTestId("err").textContent).toBe("Already taken"));
    expect(calls).toBeGreaterThan(0); // UNGUARDED — the bug made this 0
  });

  it("runs onBlurAsync on blur (mirrored wiring)", async () => {
    calls = 0;
    render(<BlurDemo />);
    const input = screen.getByLabelText("email");
    fireEvent.change(input, { target: { value: "a@b.com" } });
    fireEvent.blur(input);
    await waitFor(() => expect(screen.getByTestId("err").textContent).toBe("Already taken"));
    expect(calls).toBeGreaterThan(0);
  });

  it("does not run async when sync fails (no asyncAlways)", async () => {
    calls = 0;
    render(<GateDemo />);
    fireEvent.change(screen.getByLabelText("email"), { target: { value: "bad" } });
    await waitFor(() => expect(screen.getByTestId("err").textContent).toBe("Invalid"));
    await new Promise((r) => setTimeout(r, 50));
    expect(calls).toBe(0);
  });

  it("runs async despite sync failure when asyncAlways", async () => {
    calls = 0;
    render(<GateDemo asyncAlways />);
    fireEvent.change(screen.getByLabelText("email"), { target: { value: "bad" } });
    await waitFor(() => expect(calls).toBeGreaterThan(0));
  });

  it("discards a stale async result when the value changed", async () => {
    // async validator echoes which value it saw, after a tick
    function StaleDemo() {
      const { register, formState } = useForm<{ email: string }>({
        defaultValues: { email: "" },
        validateOn: "onChange",
        fieldValidators: {
          email: { onChangeAsync: async ({ value }: any) => { await new Promise((r) => setTimeout(r, 30)); return `err:${value}`; } },
        },
      });
      return (<div><input aria-label="email" {...register("email")} /><span data-testid="err">{formState.errors.email ?? ""}</span></div>);
    }
    render(<StaleDemo />);
    const input = screen.getByLabelText("email");
    fireEvent.change(input, { target: { value: "A" } });
    fireEvent.change(input, { target: { value: "B" } });
    await waitFor(() => expect(screen.getByTestId("err").textContent).toBe("err:B"));
    // the stale "err:A" must never have been applied
    expect(screen.getByTestId("err").textContent).not.toBe("err:A");
  });

  it("clears the async error when the field becomes async-valid", async () => {
    function ClearDemo() {
      const { register, formState } = useForm<{ email: string }>({
        defaultValues: { email: "" },
        validateOn: "onChange",
        fieldValidators: {
          email: { onChangeAsync: async ({ value }: any) => (value === "taken@x.com" ? "Taken" : undefined) },
        },
      });
      return (<div><input aria-label="email" {...register("email")} /><span data-testid="err">{formState.errors.email ?? ""}</span></div>);
    }
    render(<ClearDemo />);
    const input = screen.getByLabelText("email");
    fireEvent.change(input, { target: { value: "taken@x.com" } });
    await waitFor(() => expect(screen.getByTestId("err").textContent).toBe("Taken"));
    fireEvent.change(input, { target: { value: "free@x.com" } });
    await waitFor(() => expect(screen.getByTestId("err").textContent).toBe("")); // async-valid -> error cleared
  });
});
