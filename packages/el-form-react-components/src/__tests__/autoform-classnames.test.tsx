import { it, expect, beforeEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { z } from "zod";
import { AutoForm } from "..";

beforeEach(cleanup);

const schema = z.object({ name: z.string() });

it("appends classNames slots to the base classes", () => {
  const { container } = render(
    <AutoForm
      schema={schema}
      classNames={{
        container: "my-container",
        input: "my-input",
        label: "my-label",
      }}
      onSubmit={() => {}}
    />
  );
  const c = container.querySelector(".el-form-container")!;
  expect(c.classList.contains("my-container")).toBe(true);
  expect(
    container.querySelector(".el-form-input")?.classList.contains("my-input")
  ).toBe(true);
  expect(
    container.querySelector(".el-form-label")?.classList.contains("my-label")
  ).toBe(true);
});

it("merges a per-field legacy className with classNames.field (both append over base)", () => {
  const { container } = render(
    <AutoForm
      schema={schema}
      fields={[
        { name: "name", type: "text", label: "Name", className: "legacy-field" },
      ]}
      classNames={{ field: "global-field" }}
      onSubmit={() => {}}
    />
  );
  const field = container.querySelector(".el-form-field")!;
  expect(field.classList.contains("el-form-field")).toBe(true); // base still present
  expect(field.classList.contains("legacy-field")).toBe(true); // per-field legacy prop
  expect(field.classList.contains("global-field")).toBe(true); // global slot
});
