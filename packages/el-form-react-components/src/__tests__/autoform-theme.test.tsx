import { it, expect, beforeEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { z } from "zod";
import { AutoForm } from "..";
beforeEach(cleanup);
const schema = z.object({ name: z.string() });

it("sets data-el-form-theme when theme is given", () => {
  const { container } = render(
    <AutoForm schema={schema} theme="dark" onSubmit={() => {}} />
  );
  expect(
    container
      .querySelector(".el-form-container")
      ?.getAttribute("data-el-form-theme")
  ).toBe("dark");
});
it("sets no theme attribute by default", () => {
  const { container } = render(
    <AutoForm schema={schema} onSubmit={() => {}} />
  );
  expect(
    container
      .querySelector(".el-form-container")
      ?.hasAttribute("data-el-form-theme")
  ).toBe(false);
});
