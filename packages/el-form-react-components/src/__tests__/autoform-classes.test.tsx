import { it, expect, beforeEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { z } from "zod";
import { AutoForm } from "..";

beforeEach(cleanup);

it("renders the semantic layout + field classes, no raw Tailwind layout utilities", () => {
  const schema = z.object({ name: z.string(), tags: z.array(z.string()) });
  const { container } = render(<AutoForm schema={schema} layout="grid" columns={2} onSubmit={() => {}} />);
  expect(container.querySelector(".el-form-container")).toBeTruthy();
  expect(container.querySelector(".el-form-layout--grid")).toBeTruthy();
  expect(container.querySelector(".el-form-input, .el-form-field")).toBeTruthy();
  expect(container.querySelector(".grid-cols-2")).toBeNull();
  expect(container.innerHTML).not.toMatch(/\bflex flex-wrap\b/);
});
