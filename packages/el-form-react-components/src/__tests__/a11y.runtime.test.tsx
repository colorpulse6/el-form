import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import React from "react";
import { z } from "zod";
import { useForm, FormProvider } from "el-form-react-hooks";
import { TextField } from "..";

beforeEach(cleanup);

function Demo() {
  const form = useForm({
    validators: { onChange: z.object({ email: z.string().email("bad email") }) },
    defaultValues: { email: "" },
  });
  return (
    <FormProvider form={form}>
      <TextField name="email" label="Email" required />
    </FormProvider>
  );
}

describe("FieldComponents a11y", () => {
  it("wires aria-required, and aria-invalid + aria-describedby + role=alert on error", async () => {
    render(<Demo />);
    const input = screen.getByLabelText("Email") as HTMLInputElement;
    expect(input.getAttribute("aria-required")).toBe("true");

    // produce an error: type an invalid value then blur to mark touched.
    // The standalone field reads form state through the context holder, which
    // settles errors/touched one render cycle behind the underlying state, so
    // we flush microtasks and nudge one more render (a second blur) to let the
    // touched + error state paint.
    fireEvent.change(input, { target: { value: "x" } });
    fireEvent.blur(input);
    await act(async () => {
      await Promise.resolve();
    });
    fireEvent.blur(input);

    const err = await screen.findByRole("alert");
    expect(err.getAttribute("id")).toBe("email-error");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBe("email-error");
  });
});
