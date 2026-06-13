import { it, expect, beforeEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { useForm, FormProvider } from "el-form-react-hooks";
import { FormSwitch } from "..";

beforeEach(cleanup);

function Demo() {
  const form = useForm<{ kind: string }>({ defaultValues: { kind: "a" } });
  return (
    <FormProvider form={form}>
      <FormSwitch
        field="kind"
        unionOptions={{
          a: [{ name: "label", type: "text", label: "Label" }],
        }}
      />
    </FormProvider>
  );
}

it("default-rendered union fields use semantic classes, no raw Tailwind", () => {
  const { container } = render(<Demo />);
  expect(container.querySelector(".el-form-input")).toBeTruthy();
  expect(container.querySelector(".el-form-label")).toBeTruthy();
  expect(container.innerHTML).not.toMatch(/\bw-full px-3 py-2\b/);
  expect(container.innerHTML).not.toMatch(/\btext-red-500\b/);
});
