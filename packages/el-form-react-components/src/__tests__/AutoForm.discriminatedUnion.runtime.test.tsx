import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { z } from "zod";
import { AutoForm } from "../AutoForm";

// Integration test: AutoForm discriminated union rendering via helpers.
// This asserts the end-to-end behavior (options, switching, and field rendering),
// relying only on public APIs so it works across Zod v3/v4.

describe("AutoForm discriminated union integration", () => {
  const catSchema = z.object({
    type: z.literal("cat"),
    meow: z.string().default("")
  });
  const dogSchema = z.object({
    type: z.literal("dog"),
    bark: z.string().default("")
  });

  const animalSchema = z.discriminatedUnion("type", [catSchema, dogSchema]);

  it("renders discriminator options and switches conditional fields", () => {
    render(
      <AutoForm
        schema={animalSchema as any}
        // Provide initial values so a case is selected on first render
        initialValues={{ type: "cat", meow: "" } as any}
        onSubmit={() => {}}
      />
    );

    // Discriminator select should exist with options "cat" and "dog"
    const select = screen.getByLabelText("type") as HTMLSelectElement;
    const optionValues = Array.from(select.querySelectorAll("option")).map(
      (o) => (o as HTMLOptionElement).value
    );
    expect(optionValues).toContain("cat");
    expect(optionValues).toContain("dog");

    // Initially cat case selected -> expect Meow field rendered
    // Auto-generated label should be capitalized from key
    expect(screen.queryByLabelText("Meow")).toBeTruthy();
    expect(screen.queryByLabelText("Bark")).toBeNull();

    // Switch to dog and assert fields switch accordingly
    fireEvent.change(select, { target: { value: "dog" } });

    expect(screen.queryByLabelText("Meow")).toBeNull();
    expect(screen.queryByLabelText("Bark")).toBeTruthy();

    // Update bark field to ensure it's registered properly
    const barkInput = screen.getByLabelText("Bark") as HTMLInputElement;
    fireEvent.change(barkInput, { target: { value: "woof" } });
    expect(barkInput.value).toBe("woof");
  });
});
