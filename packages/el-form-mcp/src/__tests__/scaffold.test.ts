import { describe, it, expect } from "vitest";
import { scaffoldForm } from "../scaffold";

describe("scaffoldForm (autoform)", () => {
  const code = scaffoldForm(
    [
      { name: "email", type: "email" },
      { name: "role", type: "select", options: ["admin", "user"] },
      { name: "bio", type: "textarea", optional: true },
    ],
    "autoform"
  );

  it("imports AutoForm and styles", () => {
    expect(code).toContain('import { AutoForm } from "el-form-react-components"');
    expect(code).toContain('import "el-form-react-components/styles.css"');
  });

  it("emits a typed Zod schema per field", () => {
    expect(code).toContain("email: z.string().email(");
    expect(code).toContain('role: z.enum(["admin", "user"])');
    // optional, non-required string field
    expect(code).toContain("bio: z.string().optional()");
  });

  it("humanizes labels and carries select options", () => {
    expect(code).toContain('label: "Email"');
    expect(code).toContain('options: ["admin","user"]');
  });

  it("renders a valid component shell", () => {
    expect(code).toContain("export function GeneratedForm()");
    expect(code).toContain("<AutoForm");
    expect(code).toContain("onSubmit={(data) => console.log(data)}");
  });
});

describe("scaffoldForm (useform)", () => {
  const code = scaffoldForm(
    [
      { name: "email", type: "email" },
      { name: "agree", type: "checkbox" },
    ],
    "useform"
  );

  it("uses the useForm hook with onChange validation", () => {
    expect(code).toContain('import { useForm } from "el-form-react-hooks"');
    expect(code).toContain("validators: { onChange: schema }");
  });

  it("seeds defaultValues by type (checkbox=false, string='')", () => {
    expect(code).toContain('email: ""');
    expect(code).toContain("agree: false");
  });

  it("registers each field and shows its error", () => {
    expect(code).toContain('{...register("email")}');
    expect(code).toContain("formState.errors.email");
    expect(code).toContain('type="checkbox"');
  });
});

describe("scaffoldForm humanization", () => {
  it("turns camelCase / snake_case names into Title Case labels", () => {
    const code = scaffoldForm([{ name: "firstName" }, { name: "home_phone" }], "autoform");
    expect(code).toContain('label: "First Name"');
    expect(code).toContain('label: "Home Phone"');
  });

  it("defaults to autoform when api is omitted", () => {
    const code = scaffoldForm([{ name: "x" }]);
    expect(code).toContain("<AutoForm");
  });
});
