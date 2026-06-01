import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { z } from "zod";
import { AutoForm } from "../AutoForm";

beforeEach(() => {
  cleanup();
});

const schema = z.object({
  email: z.string().email("Invalid email"),
  name: z.string().min(1, "Name is required"),
});

describe("AutoForm submit", () => {
  it("calls onSubmit with typed data when valid", async () => {
    const onSubmit = vi.fn();
    render(<AutoForm schema={schema} initialValues={{ email: "", name: "" }} onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a@b.com" } });
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Ada" } });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ email: "a@b.com", name: "Ada" });
  });

  it("calls onError on invalid submit", async () => {
    const onSubmit = vi.fn();
    const onError = vi.fn();
    render(<AutoForm schema={schema} initialValues={{ email: "", name: "" }} onSubmit={onSubmit} onError={onError} />);
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() => expect(onError).toHaveBeenCalled());
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
