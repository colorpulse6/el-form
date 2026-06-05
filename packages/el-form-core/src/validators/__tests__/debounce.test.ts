import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { z } from "zod";
import { ValidationEngine } from "../engine";
import { SchemaAdapter } from "../adapters";

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
});

describe("async debounce (characterization — existing behavior)", () => {
  it("coalesces rapid async field validations with onChangeAsyncDebounceMs", async () => {
    const engine = new ValidationEngine();
    // Async validator function returning undefined = valid. SchemaAdapter treats a
    // plain function as a validator function (validateAsyncFunction awaits it).
    const spy = vi.fn(async () => undefined);
    const config: any = { onChangeAsync: spy, onChangeAsyncDebounceMs: 200 };
    const ev: any = { type: "onChange", isAsync: true, fieldName: "email" };

    // Fire 3 times rapidly; only the last should actually run after 200ms.
    // NOTE: superseded calls have their timers cleared and their promises never
    // resolve (an existing quirk of the debounce machinery), so we only await the
    // last call's promise — which is the one whose timer survives to fire.
    void engine.validateField("email", "a", { email: "a" }, config, ev);
    void engine.validateField("email", "ab", { email: "ab" }, config, ev);
    const last = engine.validateField("email", "abc", { email: "abc" }, config, ev);

    await vi.advanceTimersByTimeAsync(250);
    await last;

    expect(spy).toHaveBeenCalledTimes(1); // debounced to a single run
    expect(spy).toHaveBeenLastCalledWith(
      expect.objectContaining({ value: "abc" })
    );
  });

  it("coalesces rapid async form validations with asyncDebounceMs", async () => {
    const engine = new ValidationEngine();
    const spy = vi.fn(async () => undefined);
    const config: any = { onChangeAsync: spy, asyncDebounceMs: 200 };
    const ev: any = { type: "onChange", isAsync: true };

    void engine.validateForm({ email: "a" }, config, ev);
    void engine.validateForm({ email: "ab" }, config, ev);
    const last = engine.validateForm({ email: "abc" }, config, ev);

    await vi.advanceTimersByTimeAsync(250);
    await last;

    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe("sync debounce (new — validationDebounceMs)", () => {
  it("coalesces rapid sync FIELD validations with validationDebounceMs", async () => {
    const engine = new ValidationEngine();
    // Sync validator function returning undefined = valid. SchemaAdapter treats a
    // plain function as a validator function (validateFunction).
    const spy = vi.fn(() => undefined);
    const config: any = { onChange: spy, validationDebounceMs: 200 };
    const ev: any = { type: "onChange", isAsync: false, fieldName: "name" };

    // Fire 3 times rapidly; only the last should actually run after 200ms.
    void engine.validateField("name", "a", { name: "a" }, config, ev);
    void engine.validateField("name", "ab", { name: "ab" }, config, ev);
    const last = engine.validateField("name", "abc", { name: "abc" }, config, ev);

    await vi.advanceTimersByTimeAsync(250);
    await last;

    expect(spy).toHaveBeenCalledTimes(1); // debounced to a single run
    expect(spy).toHaveBeenLastCalledWith(
      expect.objectContaining({ value: "abc" })
    );
  });

  it("propagates the validation RESULT (errors) through the debounced sync path", async () => {
    const engine = new ValidationEngine();
    // A field-level schema that rejects empty strings; the debounced result must carry
    // the failure, not silently resolve valid.
    const schema = z.string().min(1, "name required");
    const config: any = { onChange: schema, validationDebounceMs: 200 };
    const ev: any = { type: "onChange", isAsync: false, fieldName: "name" };

    const last = engine.validateField("name", "", { name: "" }, config, ev);
    await vi.advanceTimersByTimeAsync(250);
    const result = await last;

    expect(result.isValid).toBe(false);
    expect(Object.keys(result.errors).length).toBeGreaterThan(0);
  });

  it("coalesces rapid sync FORM validations with validationDebounceMs", async () => {
    const engine = new ValidationEngine();
    // Use a real schema (NOT a function) so the form-level schema-validate path —
    // the one that debounces — is exercised. Spy on SchemaAdapter.validate to count
    // real schema evaluations (zod v4 resolves via the Standard Schema branch, so
    // spying on safeParse would miss it; SchemaAdapter.validate is the choke point
    // the debounce wraps regardless of which library branch runs).
    const schema = z.object({ name: z.string().min(1) });
    const validateSpy = vi.spyOn(SchemaAdapter, "validate");
    const config: any = { onChange: schema, validationDebounceMs: 200 };
    const ev: any = { type: "onChange", isAsync: false };

    void engine.validateForm({ name: "a" }, config, ev);
    void engine.validateForm({ name: "ab" }, config, ev);
    const last = engine.validateForm({ name: "abc" }, config, ev);

    await vi.advanceTimersByTimeAsync(250);
    await last;

    expect(validateSpy).toHaveBeenCalledTimes(1); // debounced to a single run
    expect(validateSpy).toHaveBeenLastCalledWith(schema, { name: "abc" });

    validateSpy.mockRestore();
  });
});

describe("superseded debounced validations resolve (no hang)", () => {
  it(
    "resolves ALL awaited debounced calls in a rapid burst, not just the last",
    async () => {
      const engine = new ValidationEngine();
      // A field-level schema that rejects empty strings. Only the LAST call's value
      // ("abc") is non-empty, so the authoritative result is valid; the superseded
      // calls must resolve with the safe sentinel { isValid: true, errors: {} }.
      const schema = z.string().min(1, "name required");
      const config: any = { onChange: schema, validationDebounceMs: 200 };
      const ev: any = { type: "onChange", isAsync: false, fieldName: "name" };

      // Fire 3 rapidly and AWAIT ALL THREE. Against the buggy code the first two
      // promises never resolve, so Promise.all hangs and this test times out.
      const p1 = engine.validateField("name", "a", { name: "a" }, config, ev);
      const p2 = engine.validateField("name", "ab", { name: "ab" }, config, ev);
      const p3 = engine.validateField("name", "abc", { name: "abc" }, config, ev);

      await vi.advanceTimersByTimeAsync(250);
      const [r1, r2, r3] = await Promise.all([p1, p2, p3]);

      // The two superseded calls resolve with the safe sentinel.
      expect(r1).toEqual({ isValid: true, errors: {} });
      expect(r2).toEqual({ isValid: true, errors: {} });
      // The last (surviving) call resolves with the real result.
      expect(r3.isValid).toBe(true);
    },
    2000
  );
});
