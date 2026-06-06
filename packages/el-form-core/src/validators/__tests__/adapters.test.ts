import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  isArkTypeSchema,
  isEffectSchema,
  isStandardSchema,
  isValibotSchema,
  isValidatorFunction,
  isYupSchema,
  isZodSchema,
  SchemaAdapter,
} from "../adapters";

describe("schema detection helpers", () => {
  it("detects supported schema shapes", () => {
    expect(isZodSchema(z.string())).toBe(true);
    expect(isYupSchema(yupLike())).toBe(true);
    expect(isValibotSchema(valibotLike())).toBe(true);
    expect(isArkTypeSchema(arkTypeLike())).toBe(true);
    expect(isEffectSchema(effectLike())).toBe(true);
    expect(isStandardSchema(standardSchema())).toBe(true);
    expect(isValidatorFunction(() => undefined)).toBe(true);
  });

  it("rejects unrelated objects", () => {
    expect(isZodSchema({ safeParse: () => ({ success: true }) })).toBe(false);
    expect(isYupSchema({ validate: () => undefined })).toBe(false);
    expect(isValibotSchema({ kind: "schema" })).toBe(false);
    expect(isArkTypeSchema({ kind: "schema" })).toBe(false);
    expect(isEffectSchema({ validate: () => undefined })).toBe(false);
    expect(isStandardSchema({})).toBe(false);
    expect(isValidatorFunction({})).toBe(false);
  });
});

describe("SchemaAdapter.validate - function validators", () => {
  it("treats undefined/null validator results as valid", () => {
    expect(
      SchemaAdapter.validate(() => undefined, "value", {
        value: "value",
        values: { name: "value" },
        fieldName: "name",
      })
    ).toEqual({ isValid: true, errors: {} });

    expect(
      SchemaAdapter.validate(() => null, "value", {
        value: "value",
        values: { name: "value" },
        fieldName: "name",
      })
    ).toEqual({ isValid: true, errors: {} });
  });

  it("maps string results to the field error key", () => {
    expect(
      SchemaAdapter.validate(() => "Required", "", {
        value: "",
        values: { name: "" },
        fieldName: "name",
      })
    ).toEqual({ isValid: false, errors: { name: "Required" } });
  });

  it("passes through form-level field errors", () => {
    expect(
      SchemaAdapter.validate(
        () => ({ fields: { email: "Invalid", password: "Too short" } }),
        {},
        { value: {}, values: {}, fieldName: "form" }
      )
    ).toEqual({
      isValid: false,
      errors: { email: "Invalid", password: "Too short" },
    });
  });

  it("coerces other non-empty results to a string error", () => {
    expect(
      SchemaAdapter.validate(() => ({ unexpected: true }), "x", {
        value: "x",
        values: {},
        fieldName: "field",
      })
    ).toEqual({
      isValid: false,
      errors: { field: "[object Object]" },
    });
  });
});

describe("SchemaAdapter.validateAsync", () => {
  it("awaits async validator functions", async () => {
    await expect(
      SchemaAdapter.validateAsync(async () => "Taken", "ada", {
        value: "ada",
        values: { username: "ada" },
        fieldName: "username",
      })
    ).resolves.toEqual({
      isValid: false,
      errors: { username: "Taken" },
    });
  });

  it("wraps thrown async errors under the contextual field key", async () => {
    await expect(
      SchemaAdapter.validateAsync(
        async () => {
          throw new Error("Network unavailable");
        },
        "ada",
        { value: "ada", values: {}, fieldName: "username" }
      )
    ).resolves.toEqual({
      isValid: false,
      errors: { username: "Network unavailable" },
    });
  });
});

describe("SchemaAdapter.validate - schema branches", () => {
  it("validates Standard Schema success and issues", () => {
    expect(SchemaAdapter.validate(standardSchema(), "ok")).toEqual({
      isValid: true,
      errors: {},
    });

    expect(
      SchemaAdapter.validate(
        standardSchema([
          { path: ["user", "email"], message: "Invalid email" },
          { message: "Form invalid" },
        ]),
        "bad"
      )
    ).toEqual({
      isValid: false,
      errors: {
        "user.email": "Invalid email",
        form: "Form invalid",
      },
    });
  });

  it("validates Zod success and issues", () => {
    const schema = z.object({
      name: z.string().min(2, "too short"),
    });

    expect(SchemaAdapter.validate(schema, { name: "Ada" })).toEqual({
      isValid: true,
      errors: {},
    });
    expect(SchemaAdapter.validate(schema, { name: "A" })).toEqual({
      isValid: false,
      errors: { name: "too short" },
    });
  });

  it("validates Yup-like success, inner errors, and single errors", () => {
    expect(SchemaAdapter.validate(yupLike(), { name: "Ada" })).toEqual({
      isValid: true,
      errors: {},
    });

    expect(
      SchemaAdapter.validate(yupLike([yupError("name", "Required")]), {})
    ).toEqual({
      isValid: false,
      errors: { name: "Required" },
    });

    expect(SchemaAdapter.validate(yupLike([], yupError("", "Invalid form")), {}))
      .toEqual({
        isValid: false,
        errors: { form: "Invalid form" },
      });
  });

  it("validates Valibot-like success and failures", () => {
    expect(SchemaAdapter.validate(valibotLike(), "ok")).toEqual({
      isValid: true,
      errors: {},
    });
    expect(
      SchemaAdapter.validate(
        valibotLike(() => {
          throw new Error("Valibot failed");
        }),
        "bad"
      )
    ).toEqual({
      isValid: false,
      errors: { form: "Valibot failed" },
    });
  });

  it("validates ArkType-like success and failures", () => {
    expect(SchemaAdapter.validate(arkTypeLike(), "ok")).toEqual({
      isValid: true,
      errors: {},
    });
    expect(
      SchemaAdapter.validate(
        arkTypeLike(() => {
          throw new Error("ArkType failed");
        }),
        "bad"
      )
    ).toEqual({
      isValid: false,
      errors: { form: "ArkType failed" },
    });
  });

  it("validates Effect-like success and failures", () => {
    expect(SchemaAdapter.validate(effectLike(), "ok")).toEqual({
      isValid: true,
      errors: {},
    });
    expect(SchemaAdapter.validate(effectLike("Failure"), "bad")).toEqual({
      isValid: false,
      errors: { form: "Validation failed" },
    });
    expect(
      SchemaAdapter.validate(
        effectLike(() => {
          throw new Error("Effect failed");
        }),
        "bad"
      )
    ).toEqual({
      isValid: false,
      errors: { form: "Effect failed" },
    });
  });

  it("reports unsupported schemas under the contextual field key", () => {
    expect(
      SchemaAdapter.validate({}, "value", {
        value: "value",
        values: {},
        fieldName: "field",
      })
    ).toEqual({
      isValid: false,
      errors: { field: "Unsupported schema type" },
    });

    expect(SchemaAdapter.validate({}, "value")).toEqual({
      isValid: false,
      errors: { form: "Unsupported schema type" },
    });
  });
});

function standardSchema(issues: Array<{ path?: string[]; message: string }> = []) {
  return {
    "~standard": {
      validate: () => ({ issues }),
    },
  };
}

function yupError(path: string, message: string) {
  return { path, message };
}

function yupLike(
  inner: Array<{ path: string; message: string }> = [],
  singleError?: { path: string; message: string }
) {
  return {
    __isYupSchema__: true,
    validate: () => undefined,
    validateSync: () => {
      if (inner.length > 0 || singleError) {
        throw {
          inner,
          path: singleError?.path,
          message: singleError?.message,
        };
      }
    },
  };
}

function valibotLike(parse: () => void = () => undefined) {
  return {
    _types: {},
    kind: "schema",
    parse,
  };
}

function arkTypeLike(assert: () => void = () => undefined) {
  return {
    kind: "schema",
    assert,
  };
}

function effectLike(
  result: "Success" | "Failure" | (() => never) = "Success"
) {
  return {
    _schema: {},
    validate: () => {
      if (typeof result === "function") result();
      return { _tag: result };
    },
  };
}
