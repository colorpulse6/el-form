import { describe, it, expect, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from "@testing-library/react";
import React from "react";
import { z } from "zod";
import { useForm } from "..";

beforeEach(cleanup);

const schema = z.object({
  a: z.string().min(1, "a required"),
  b: z.string().min(1, "b required"),
});

function makeForm(opts?: { shouldFocusError?: boolean }) {
  return function Demo() {
    const { register, handleSubmit } = useForm({
      validators: { onSubmit: schema },
      defaultValues: { a: "", b: "" },
      ...opts,
    });
    return (
      <form onSubmit={handleSubmit(() => {})}>
        <input aria-label="a" {...register("a")} />
        <input aria-label="b" {...register("b")} />
        <button type="submit">submit</button>
      </form>
    );
  };
}

describe("focus-on-error", () => {
  it("focuses the first errored field on invalid submit (default on)", async () => {
    const Demo = makeForm();
    render(<Demo />);
    fireEvent.click(screen.getByText("submit"));
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByLabelText("a"))
    );
  });

  it("does not focus when shouldFocusError is false", async () => {
    const Demo = makeForm({ shouldFocusError: false });
    render(<Demo />);
    // Pre-focus a sentinel; if focus-on-error were active it would steal focus to input "a".
    const sentinelBtn = document.createElement("button");
    sentinelBtn.setAttribute("data-testid", "sentinel");
    document.body.appendChild(sentinelBtn);
    sentinelBtn.focus();
    expect(document.activeElement).toBe(sentinelBtn);

    fireEvent.click(screen.getByText("submit"));
    await new Promise((r) => setTimeout(r, 50));
    // Focus must NOT have been programmatically moved to the first invalid field.
    expect(document.activeElement).not.toBe(screen.getByLabelText("a"));
    expect(document.activeElement).not.toBe(screen.getByLabelText("b"));

    document.body.removeChild(sentinelBtn);
  });
});
