import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { useForm } from "..";

beforeEach(cleanup);

function ResetDemo() {
  const { register, reset, resetField, formState } = useForm<{ name: string; email: string }>({
    defaultValues: { name: "default", email: "" },
  });
  return (
    <div>
      <input aria-label="name" {...register("name")} />
      <input aria-label="email" {...register("email")} />
      <button onClick={() => reset()}>reset</button>
      <button onClick={() => reset({ values: { name: "seed", email: "seed@x.com" } })}>resetTo</button>
      <button onClick={() => resetField("name")}>resetName</button>
      <span data-testid="dirty">{String(formState.isDirty)}</span>
    </div>
  );
}

describe("reset / resetField", () => {
  it("resets all fields to defaults", () => {
    render(<ResetDemo />);
    const name = screen.getByLabelText("name") as HTMLInputElement;
    fireEvent.change(name, { target: { value: "changed" } });
    expect(name.value).toBe("changed");
    fireEvent.click(screen.getByText("reset"));
    expect((screen.getByLabelText("name") as HTMLInputElement).value).toBe("default");
  });

  it("resets to explicit values", () => {
    render(<ResetDemo />);
    fireEvent.click(screen.getByText("resetTo"));
    expect((screen.getByLabelText("name") as HTMLInputElement).value).toBe("seed");
    expect((screen.getByLabelText("email") as HTMLInputElement).value).toBe("seed@x.com");
  });

  it("clears isDirty after reset", () => {
    render(<ResetDemo />);
    fireEvent.change(screen.getByLabelText("name"), { target: { value: "x" } });
    expect(screen.getByTestId("dirty").textContent).toBe("true");
    fireEvent.click(screen.getByText("reset"));
    expect(screen.getByTestId("dirty").textContent).toBe("false");
  });

  it("resets a single field via resetField", () => {
    render(<ResetDemo />);
    fireEvent.change(screen.getByLabelText("name"), { target: { value: "x" } });
    fireEvent.click(screen.getByText("resetName"));
    expect((screen.getByLabelText("name") as HTMLInputElement).value).toBe("default");
  });
});
