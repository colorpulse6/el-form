import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import React from "react";
import { useForm } from "..";

beforeEach(cleanup);

function Demo() {
  const { register, setFocus } = useForm<{ a: string; b: string }>({
    defaultValues: { a: "", b: "" },
  });
  return (
    <div>
      <input aria-label="a" {...register("a")} />
      <input aria-label="b" {...register("b")} />
      <button onClick={() => setFocus("b")}>focus-b</button>
    </div>
  );
}

describe("setFocus", () => {
  it("moves focus to the named field", () => {
    render(<Demo />);
    const b = screen.getByLabelText("b");
    screen.getByText("focus-b").click();
    expect(document.activeElement).toBe(b);
  });
});
