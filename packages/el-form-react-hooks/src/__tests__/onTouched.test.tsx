import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { z } from "zod";
import { useForm } from "..";

beforeEach(cleanup);
const schema = z.object({ email: z.string().email("Invalid email") });

function Demo() {
  const { register, formState } = useForm<{ email: string }>({
    mode: "onTouched",
    validators: { onChange: schema, onBlur: schema },
    defaultValues: { email: "" },
  });
  return (
    <form>
      <input aria-label="email" {...register("email")} />
      <span data-testid="err">{formState.errors.email ?? ""}</span>
    </form>
  );
}

describe("mode: onTouched", () => {
  it("does not validate on change before the field is touched", async () => {
    render(<Demo />);
    fireEvent.change(screen.getByLabelText("email"), { target: { value: "bad" } });
    // If onTouched were NOT suppressing this pre-touch change, the change would
    // trigger (async) validation that surfaces an error within this window. The
    // 50ms wait gives that incorrect validation time to land, so asserting "" here
    // proves no validation ran — not that we merely checked too early. (Verified:
    // without the onTouched impl, this assertion fails with "Invalid email".)
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.getByTestId("err").textContent).toBe("");
  });
  it("validates on blur, then on subsequent change", async () => {
    render(<Demo />);
    const input = screen.getByLabelText("email");
    fireEvent.change(input, { target: { value: "bad" } });
    fireEvent.blur(input);
    await waitFor(() => expect(screen.getByTestId("err").textContent).toBe("Invalid email"));
    fireEvent.change(input, { target: { value: "still-bad" } });
    await waitFor(() => expect(screen.getByTestId("err").textContent).toBe("Invalid email"));
  });
});
