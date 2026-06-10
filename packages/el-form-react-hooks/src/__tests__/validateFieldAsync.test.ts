import { describe, it, expect } from "vitest";
import { ValidationEngine } from "el-form-core";
import { createValidationManager } from "../utils/validation";

function makeManager(opts: Partial<Parameters<typeof createValidationManager>[0]> = {}) {
  return createValidationManager<{ email: string }>({
    validationEngine: { current: new ValidationEngine() } as any,
    validators: {},
    fieldValidators: {},
    mode: "onChange",
    ...(opts as any),
  });
}

describe("validateFieldAsync + gate", () => {
  it("invokes the field's onChangeAsync validator and returns its error", async () => {
    let calls = 0;
    const mgr = makeManager({
      fieldValidators: { email: { onChangeAsync: async () => { calls++; return "taken"; } } },
    });
    const r = await mgr.validateFieldAsync("email", "a@b.com", { email: "a@b.com" }, "onChange");
    expect(calls).toBe(1);
    expect(r.isValid).toBe(false);
    expect(r.errors.email).toBe("taken");
  });

  it("hasAsyncValidator detects field- and form-level async keys", () => {
    expect(makeManager().hasAsyncValidator("email", "onChange")).toBe(false);
    expect(
      makeManager({ fieldValidators: { email: { onChangeAsync: async () => undefined } } })
        .hasAsyncValidator("email", "onChange")
    ).toBe(true);
    expect(
      makeManager({ validators: { onSubmitAsync: async () => undefined } as any })
        .hasAsyncValidator("email", "onSubmit")
    ).toBe(true);
  });

  it("shouldRunAsync gates on sync-pass unless asyncAlways", () => {
    const base = { email: { onChangeAsync: async () => undefined } };
    const mgr = makeManager({ fieldValidators: base });
    expect(mgr.shouldRunAsync("email", "onChange", true)).toBe(true);   // sync passed
    expect(mgr.shouldRunAsync("email", "onChange", false)).toBe(false); // sync failed, no asyncAlways
    const always = makeManager({ fieldValidators: { email: { ...base.email, asyncAlways: true } } });
    expect(always.shouldRunAsync("email", "onChange", false)).toBe(true); // asyncAlways
  });
});
