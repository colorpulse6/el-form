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

function DirtyDemo() {
  const form = useForm<{ name: string; tags: string[] }>({
    defaultValues: { name: "", tags: [] },
  });
  const { register, formState, addArrayItem, getDirtyFields } = form;
  return (
    <div>
      <input aria-label="name" {...register("name")} />
      <span data-testid="dirtyFields">{JSON.stringify(formState.dirtyFields)}</span>
      <span data-testid="getDirty">{JSON.stringify(getDirtyFields())}</span>
      <span data-testid="isDirty">{String(formState.isDirty)}</span>
      <button onClick={() => addArrayItem("tags", "a")}>addTag</button>
      <button onClick={() => form.reset()}>resetDirty</button>
      <button onClick={() => form.reset({ keepDirty: true })}>resetKeepDirty</button>
    </div>
  );
}

describe("reactive dirtyFields", () => {
  it("populates on edit and matches getDirtyFields()", () => {
    render(<DirtyDemo />);
    expect(screen.getByTestId("dirtyFields").textContent).toBe("{}");
    fireEvent.change(screen.getByLabelText("name"), { target: { value: "x" } });
    expect(JSON.parse(screen.getByTestId("dirtyFields").textContent!)).toEqual({ name: true });
    expect(screen.getByTestId("dirtyFields").textContent).toBe(screen.getByTestId("getDirty").textContent);
    expect(screen.getByTestId("isDirty").textContent).toBe("true");
  });

  it("marks the array path dirty on an array op", () => {
    render(<DirtyDemo />);
    fireEvent.click(screen.getByText("addTag"));
    expect(JSON.parse(screen.getByTestId("dirtyFields").textContent!).tags).toBe(true);
    expect(screen.getByTestId("isDirty").textContent).toBe("true");
  });

  it("reset() clears a populated dirtyFields back to {}", () => {
    render(<DirtyDemo />);
    fireEvent.change(screen.getByLabelText("name"), { target: { value: "x" } });
    expect(JSON.parse(screen.getByTestId("dirtyFields").textContent!)).toEqual({ name: true });
    fireEvent.click(screen.getByText("resetDirty"));
    expect(screen.getByTestId("dirtyFields").textContent).toBe("{}");
    expect(screen.getByTestId("isDirty").textContent).toBe("false");
  });

  it("reset({ keepDirty: true }) keeps dirtyFields populated and consistent with isDirty", () => {
    render(<DirtyDemo />);
    fireEvent.change(screen.getByLabelText("name"), { target: { value: "x" } });
    expect(JSON.parse(screen.getByTestId("dirtyFields").textContent!)).toEqual({ name: true });
    fireEvent.click(screen.getByText("resetKeepDirty"));
    expect(JSON.parse(screen.getByTestId("dirtyFields").textContent!)).toEqual({ name: true });
    expect(screen.getByTestId("isDirty").textContent).toBe("true");
  });
});
