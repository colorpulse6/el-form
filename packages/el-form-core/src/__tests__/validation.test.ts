import { describe, expect, it } from "vitest";
import { z } from "zod";
import { flattenObject, parseZodErrors } from "../validation";

describe("parseZodErrors", () => {
  it("maps nested issue paths to dot notation", () => {
    const schema = z.object({
      user: z.object({
        email: z.string().email("invalid email"),
        profile: z.object({
          age: z.number().min(18, "must be adult"),
        }),
      }),
    });

    const result = schema.safeParse({
      user: {
        email: "not-email",
        profile: { age: 12 },
      },
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(parseZodErrors(result.error)).toEqual({
      "user.email": "invalid email",
      "user.profile.age": "must be adult",
    });
  });

  it("maps root-level issues to form", () => {
    const schema = z.string().min(3, "too short");
    const result = schema.safeParse("a");

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(parseZodErrors(result.error)).toEqual({
      form: "too short",
    });
  });
});

describe("flattenObject", () => {
  it("flattens nested plain objects with dot paths", () => {
    expect(
      flattenObject({
        name: "Ada",
        profile: {
          city: "London",
          contact: {
            email: "ada@example.com",
          },
        },
      })
    ).toEqual({
      name: "Ada",
      "profile.city": "London",
      "profile.contact.email": "ada@example.com",
    });
  });

  it("preserves arrays and null as leaf values", () => {
    const tags = ["one", "two"];

    expect(
      flattenObject({
        tags,
        profile: {
          address: null,
        },
      })
    ).toEqual({
      tags,
      "profile.address": null,
    });
  });

  it("uses the prefix for every emitted key", () => {
    expect(flattenObject({ city: "London" }, "user.profile")).toEqual({
      "user.profile.city": "London",
    });
  });
});
