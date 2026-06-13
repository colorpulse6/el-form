import { describe, it, expect, beforeEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import React from "react";
import { useForm, FormProvider } from "el-form-react-hooks";
import { TextField, TextareaField, SelectField } from "..";

beforeEach(cleanup);

type Demo = { name: string; bio: string; role: string };

function Harness() {
  const form = useForm<Demo>({
    defaultValues: { name: "", bio: "", role: "" },
  });
  return (
    <FormProvider form={form}>
      <TextField name="name" label="Name" />
      <TextareaField name="bio" label="Bio" />
      <SelectField
        name="role"
        label="Role"
        options={[{ value: "admin", label: "Admin" }]}
      />
    </FormProvider>
  );
}

describe("FieldComponents semantic classes", () => {
  it("renders fields with semantic .el-form-* classes", () => {
    const { container } = render(<Harness />);

    expect(container.querySelector(".el-form-input")).not.toBeNull();
    expect(container.querySelector(".el-form-textarea")).not.toBeNull();
    expect(container.querySelector(".el-form-select")).not.toBeNull();
    expect(container.querySelectorAll(".el-form-label").length).toBe(3);
    expect(container.querySelectorAll(".el-form-field").length).toBe(3);
  });

  it("does not emit raw Tailwind utility classes", () => {
    const { container } = render(<Harness />);

    expect(container.innerHTML).not.toMatch(/\bw-full\b/);
    expect(container.innerHTML).not.toMatch(/\bpx-3\b/);
    expect(container.innerHTML).not.toMatch(/\bspace-y-1\b/);
    expect(container.innerHTML).not.toMatch(/\btext-gray-700\b/);
    expect(container.innerHTML).not.toMatch(/\bfocus:ring-blue-500\b/);
  });
});
