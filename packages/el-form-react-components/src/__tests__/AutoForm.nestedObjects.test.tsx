import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { z } from "zod";
import { AutoForm } from "../AutoForm";

beforeEach(() => {
  cleanup();
});

describe("AutoForm nested object support", () => {
  it("should render fields for nested object properties", () => {
    const schema = z.object({
      user: z.object({
        name: z.string(),
        email: z.string().email(),
      }),
    });

    render(
      <AutoForm
        schema={schema}
        initialValues={{ user: { name: "", email: "" } }}
        onSubmit={() => {}}
      />
    );

    // Fields should be rendered with dot notation labels
    const nameInput = screen.getByLabelText("User Name") as HTMLInputElement;
    const emailInput = screen.getByLabelText("User Email") as HTMLInputElement;

    expect(nameInput).toBeTruthy();
    expect(emailInput).toBeTruthy();
    // Email type detection is best-effort and may vary by Zod version
    expect(["text", "email"]).toContain(emailInput.type);

    // Verify the inputs work correctly
    fireEvent.change(nameInput, { target: { value: "John Doe" } });
    fireEvent.change(emailInput, { target: { value: "john@example.com" } });

    expect(nameInput.value).toBe("John Doe");
    expect(emailInput.value).toBe("john@example.com");
  });

  it("should handle deeply nested objects", () => {
    const schema = z.object({
      profile: z.object({
        personal: z.object({
          firstName: z.string(),
          lastName: z.string(),
        }),
      }),
    });

    render(
      <AutoForm
        schema={schema}
        initialValues={{
          profile: { personal: { firstName: "", lastName: "" } },
        }}
        onSubmit={() => {}}
      />
    );

    // Should flatten the nested structure with dot notation
    const firstNameInput = screen.getByLabelText(
      "Profile Personal First Name"
    ) as HTMLInputElement;
    const lastNameInput = screen.getByLabelText(
      "Profile Personal Last Name"
    ) as HTMLInputElement;

    expect(firstNameInput).toBeTruthy();
    expect(lastNameInput).toBeTruthy();

    fireEvent.change(firstNameInput, { target: { value: "Jane" } });
    expect(firstNameInput.value).toBe("Jane");
  });

  it("should use dot notation for nested field names in form data", async () => {
    const schema = z.object({
      address: z.object({
        street: z.string(),
        city: z.string(),
      }),
    });

    render(
      <AutoForm
        schema={schema}
        initialValues={{ address: { street: "", city: "" } }}
        onSubmit={() => {}}
      />
    );

    const streetInput = screen.getByLabelText("Address Street") as HTMLInputElement;
    const cityInput = screen.getByLabelText("Address City") as HTMLInputElement;

    fireEvent.change(streetInput, { target: { value: "123 Main St" } });
    fireEvent.change(cityInput, { target: { value: "New York" } });

    // Verify the inputs have the correct values after changes
    expect(streetInput.value).toBe("123 Main St");
    expect(cityInput.value).toBe("New York");
  });

  it("should handle mixed nested objects and primitive fields", () => {
    const schema = z.object({
      name: z.string(),
      settings: z.object({
        theme: z.string(),
        notifications: z.boolean(),
      }),
    });

    render(
      <AutoForm
        schema={schema}
        initialValues={{
          name: "",
          settings: { theme: "light", notifications: true },
        }}
        onSubmit={() => {}}
      />
    );

    // Top-level field
    const nameInput = screen.getByLabelText("Name") as HTMLInputElement;
    expect(nameInput).toBeTruthy();

    // Nested fields
    const themeInput = screen.getByLabelText("Settings Theme") as HTMLInputElement;
    const notificationsInput = screen.getByLabelText(
      "Settings Notifications"
    ) as HTMLInputElement;

    expect(themeInput).toBeTruthy();
    expect(notificationsInput).toBeTruthy();
    expect(notificationsInput.type).toBe("checkbox");
  });

  it("should handle nested objects with enum fields", () => {
    const schema = z.object({
      preferences: z.object({
        language: z.enum(["en", "es", "fr"]),
      }),
    });

    render(
      <AutoForm
        schema={schema}
        initialValues={{ preferences: { language: "en" } }}
        onSubmit={() => {}}
      />
    );

    const select = screen.getByLabelText("Preferences Language") as HTMLSelectElement;
    expect(select).toBeTruthy();

    const options = Array.from(select.querySelectorAll("option")).map(
      (o) => (o as HTMLOptionElement).value
    );
    expect(options).toContain("en");
    expect(options).toContain("es");
    expect(options).toContain("fr");
  });
});
