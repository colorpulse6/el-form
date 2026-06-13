import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { useForm } from "..";

beforeEach(cleanup);

function Demo() {
  const form = useForm<{ name: string }>({ defaultValues: { name: "" } });
  const { register, formState, reset } = form;
  return (
    <div>
      <input aria-label="name" {...register("name")} />
      <span data-testid="isValidating">{String(formState.isValidating)}</span>
      <span data-testid="dirtyFields">{JSON.stringify(formState.dirtyFields)}</span>
      <button onClick={() => reset()}>reset</button>
    </div>
  );
}

describe("formState completeness — defaults & reset", () => {
  it("starts with isValidating=false and dirtyFields={}", () => {
    render(<Demo />);
    expect(screen.getByTestId("isValidating").textContent).toBe("false");
    expect(screen.getByTestId("dirtyFields").textContent).toBe("{}");
  });

  it("reset() restores isValidating=false and dirtyFields={}", () => {
    render(<Demo />);
    fireEvent.change(screen.getByLabelText("name"), { target: { value: "x" } });
    fireEvent.click(screen.getByText("reset"));
    expect(screen.getByTestId("isValidating").textContent).toBe("false");
    expect(screen.getByTestId("dirtyFields").textContent).toBe("{}");
  });
});
