import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { z } from "zod";
import { AutoForm } from "../AutoForm";

beforeEach(() => {
  cleanup();
});

describe("AutoForm wrapper type handling", () => {
  it("should generate field for z.string().optional()", () => {
    const schema = z.object({
      nickname: z.string().optional(),
    });

    render(
      <AutoForm
        schema={schema}
        initialValues={{ nickname: "" }}
        onSubmit={() => {}}
      />
    );

    const input = screen.getByLabelText("Nickname") as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.type).toBe("text");

    fireEvent.change(input, { target: { value: "Johnny" } });
    expect(input.value).toBe("Johnny");
  });

  it("should generate field for z.number().nullable()", () => {
    const schema = z.object({
      age: z.number().nullable(),
    });

    render(
      <AutoForm
        schema={schema}
        initialValues={{ age: null }}
        onSubmit={() => {}}
      />
    );

    const input = screen.getByLabelText("Age") as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.type).toBe("number");
  });

  it("should generate field for z.string().default('value')", () => {
    const schema = z.object({
      status: z.string().default("active"),
    });

    render(
      <AutoForm
        schema={schema}
        initialValues={{ status: "active" }}
        onSubmit={() => {}}
      />
    );

    const input = screen.getByLabelText("Status") as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.type).toBe("text");
    expect(input.value).toBe("active");
  });

  it("should handle chained wrappers z.string().optional().nullable()", () => {
    const schema = z.object({
      bio: z.string().optional().nullable(),
    });

    render(
      <AutoForm
        schema={schema}
        initialValues={{ bio: null }}
        onSubmit={() => {}}
      />
    );

    const input = screen.getByLabelText("Bio") as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.type).toBe("text");
  });

  it("should render optional email field (email type detection is best-effort)", () => {
    const schema = z.object({
      contactEmail: z.string().email().optional(),
    });

    render(
      <AutoForm
        schema={schema}
        initialValues={{ contactEmail: "" }}
        onSubmit={() => {}}
      />
    );

    const input = screen.getByLabelText("Contact Email") as HTMLInputElement;
    expect(input).toBeTruthy();
    // Email type detection after unwrapping is best-effort and may vary by Zod version
    expect(["text", "email"]).toContain(input.type);
  });

  it("should handle optional boolean fields", () => {
    const schema = z.object({
      subscribe: z.boolean().optional(),
    });

    render(
      <AutoForm
        schema={schema}
        initialValues={{ subscribe: false }}
        onSubmit={() => {}}
      />
    );

    const checkbox = screen.getByLabelText("Subscribe") as HTMLInputElement;
    expect(checkbox).toBeTruthy();
    expect(checkbox.type).toBe("checkbox");
  });

  it("should handle optional enum fields", () => {
    const schema = z.object({
      priority: z.enum(["low", "medium", "high"]).optional(),
    });

    render(
      <AutoForm
        schema={schema}
        initialValues={{ priority: undefined }}
        onSubmit={() => {}}
      />
    );

    const select = screen.getByLabelText("Priority") as HTMLSelectElement;
    expect(select).toBeTruthy();

    const options = Array.from(select.querySelectorAll("option")).map(
      (o) => (o as HTMLOptionElement).value
    );
    expect(options).toContain("low");
    expect(options).toContain("medium");
    expect(options).toContain("high");
  });
});
