import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useForm } from "..";

function RegisterRuntimeDemo() {
  const { register } = useForm<{
    agreed: boolean;
    profile: { name: string };
  }>({
    defaultValues: { agreed: false, profile: { name: "John" } },
  });

  return (
    <div>
      <input aria-label="agreed" type="checkbox" {...register("agreed")} />
      <input aria-label="name" type="text" {...register("profile.name")} />
    </div>
  );
}

describe("register runtime behavior", () => {
  it("binds checkbox via checked and updates on change", () => {
    render(<RegisterRuntimeDemo />);
    const checkbox = screen.getByLabelText("agreed") as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
  });

  it("binds text via value and updates on input", () => {
    render(<RegisterRuntimeDemo />);
    const input = screen.getAllByLabelText("name")[0] as HTMLInputElement;
    expect(input.value).toBe("John");
    fireEvent.change(input, { target: { value: "Jane" } });
    expect(input.value).toBe("Jane");
  });
});
