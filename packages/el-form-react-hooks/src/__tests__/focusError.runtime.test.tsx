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
    fireEvent.click(screen.getByText("submit"));
    await new Promise((r) => setTimeout(r, 50));
    expect(document.activeElement).not.toBe(screen.getByLabelText("a"));
  });
});
