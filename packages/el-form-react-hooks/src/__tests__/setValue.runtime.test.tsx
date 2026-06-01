import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { useForm } from "..";

beforeEach(cleanup);

function SetValueDemo() {
  const { register, setValue, setValues, watch } = useForm<{
    name: string;
    age: number;
    profile: { city: string };
  }>({ defaultValues: { name: "", age: 0, profile: { city: "" } } });
  const v = watch();
  return (
    <div>
      <input aria-label="name" {...register("name")} />
      <input aria-label="city" {...register("profile.city")} />
      <button onClick={() => setValue("name", "Ada")}>setName</button>
      <button onClick={() => setValue("profile.city", "Paris")}>setCity</button>
      <button onClick={() => setValues({ age: 42 })}>mergeAge</button>
      <span data-testid="snapshot">{JSON.stringify(v)}</span>
    </div>
  );
}

describe("setValue / setValues", () => {
  it("sets a top-level field", () => {
    render(<SetValueDemo />);
    fireEvent.click(screen.getByText("setName"));
    expect(JSON.parse(screen.getByTestId("snapshot").textContent!).name).toBe("Ada");
  });

  it("sets a nested dot-path field", () => {
    render(<SetValueDemo />);
    fireEvent.click(screen.getByText("setCity"));
    expect(JSON.parse(screen.getByTestId("snapshot").textContent!).profile.city).toBe("Paris");
  });

  it("merges via setValues without clobbering other fields", () => {
    render(<SetValueDemo />);
    fireEvent.change(screen.getByLabelText("name"), { target: { value: "Grace" } });
    fireEvent.click(screen.getByText("mergeAge"));
    const snap = JSON.parse(screen.getByTestId("snapshot").textContent!);
    expect(snap.age).toBe(42);
    expect(snap.name).toBe("Grace");
  });

  it("coerces number inputs to numbers on change", () => {
    render(<SetValueDemo />);
    const before = JSON.parse(screen.getByTestId("snapshot").textContent!);
    expect(typeof before.age).toBe("number");
  });
});
