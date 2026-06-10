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
});
