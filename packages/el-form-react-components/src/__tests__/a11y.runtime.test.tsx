import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import React from "react";
import { z } from "zod";
import { useForm, FormProvider } from "el-form-react-hooks";
import { TextField, AutoForm } from "..";

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
    fireEvent.change(input, { target: { value: "x" } });
    fireEvent.blur(input);
    const err = await screen.findByRole("alert");
    expect(err.getAttribute("id")).toBe("email-error");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBe("email-error");
  });
});

describe("AutoForm a11y", () => {
  it("wires aria-invalid/describedby/required + role=alert on generated fields", async () => {
    const schema = z.object({
      email: z.string().email("bad email"), // required
      nickname: z.string().optional(), // optional
    });
    render(<AutoForm schema={schema} onSubmit={() => {}} />);

    const email = screen.getByLabelText(/email/i) as HTMLInputElement;
    expect(email.getAttribute("aria-required")).toBe("true");

    const nickname = screen.getByLabelText(/nickname/i) as HTMLInputElement;
    expect(nickname.getAttribute("aria-required")).toBe(null); // optional => no aria-required

    // AutoForm defaults to validateOn="onSubmit", so submit to surface the
    // error (which also marks the field touched).
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    const err = await screen.findByRole("alert");
    expect(err.getAttribute("id")).toBe("field-email-error");
    expect(email.getAttribute("aria-invalid")).toBe("true");
    expect(email.getAttribute("aria-describedby")).toBe("field-email-error");
  });
});
