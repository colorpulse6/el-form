import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { useForm } from "..";

beforeEach(cleanup);

function SnapshotDemo() {
  const form = useForm<{ name: string }>({ defaultValues: { name: "start" } });
  const { register } = form;
  return (
    <div>
      <input aria-label="name" {...register("name")} />
      <button onClick={() => ((window as any).__snap = form.getSnapshot())}>snap</button>
      <button onClick={() => form.restoreSnapshot((window as any).__snap)}>restore</button>
      <span data-testid="changes">{String(form.hasChanges())}</span>
    </div>
  );
}

describe("snapshots & change tracking", () => {
  it("captures and restores a snapshot", () => {
    render(<SnapshotDemo />);
    fireEvent.click(screen.getByText("snap")); // capture { name: "start" }
    fireEvent.change(screen.getByLabelText("name"), { target: { value: "edited" } });
    expect((screen.getByLabelText("name") as HTMLInputElement).value).toBe("edited");
    fireEvent.click(screen.getByText("restore"));
    expect((screen.getByLabelText("name") as HTMLInputElement).value).toBe("start");
  });

  it("hasChanges reflects edits vs defaults", () => {
    render(<SnapshotDemo />);
    expect(screen.getByTestId("changes").textContent).toBe("false");
    fireEvent.change(screen.getByLabelText("name"), { target: { value: "x" } });
    expect(screen.getByTestId("changes").textContent).toBe("true");
  });
});
