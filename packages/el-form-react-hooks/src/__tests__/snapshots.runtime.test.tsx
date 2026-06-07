import { describe, it, expect, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from "@testing-library/react";
import { useForm } from "..";

beforeEach(() => {
  cleanup();
  delete (window as any).__snap;
});

function SnapshotDemo() {
  const form = useForm<{
    name: string;
    profile: { city: string; newsletter: boolean };
    tags: string[];
  }>({
    defaultValues: {
      name: "start",
      profile: { city: "London", newsletter: false },
      tags: ["stable"],
    },
  });
  const { register } = form;

  return (
    <div>
      <input aria-label="name" {...register("name")} />
      <input aria-label="city" {...register("profile.city")} />
      <button onClick={() => ((window as any).__snap = form.getSnapshot())}>snap</button>
      <button onClick={() => form.restoreSnapshot((window as any).__snap)}>restore</button>
      <button onClick={() => form.setValue("profile.city", "Paris")}>set-city-paris</button>
      <button onClick={() => form.setValue("profile.city", "Rome")}>set-city-rome</button>
      <span data-testid="changes">{String(form.hasChanges())}</span>
      <span data-testid="changes-json">{JSON.stringify(form.getChanges())}</span>
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

  it("restores a clean snapshot and clears nested changes", async () => {
    render(<SnapshotDemo />);

    fireEvent.click(screen.getByText("snap"));
    fireEvent.change(screen.getByLabelText("city"), {
      target: { value: "Paris" },
    });

    expect((screen.getByLabelText("city") as HTMLInputElement).value).toBe("Paris");
    expect(screen.getByTestId("changes").textContent).toBe("true");
    await waitFor(() =>
      expect(screen.getByTestId("changes-json").textContent).toBe(
        JSON.stringify({ profile: { city: "Paris" } })
      )
    );

    fireEvent.click(screen.getByText("restore"));

    await waitFor(() => {
      expect((screen.getByLabelText("city") as HTMLInputElement).value).toBe("London");
      expect(screen.getByTestId("changes").textContent).toBe("false");
      expect(screen.getByTestId("changes-json").textContent).toBe("{}");
    });
  });

  it("restores a dirty nested snapshot with a leaf-shaped change object", async () => {
    render(<SnapshotDemo />);

    fireEvent.click(screen.getByText("set-city-paris"));
    await waitFor(() =>
      expect(screen.getByTestId("changes-json").textContent).toBe(
        JSON.stringify({ profile: { city: "Paris" } })
      )
    );

    fireEvent.click(screen.getByText("snap"));
    fireEvent.click(screen.getByText("set-city-rome"));
    await waitFor(() =>
      expect(screen.getByTestId("changes-json").textContent).toBe(
        JSON.stringify({ profile: { city: "Rome" } })
      )
    );

    fireEvent.click(screen.getByText("restore"));

    await waitFor(() => {
      expect((screen.getByLabelText("city") as HTMLInputElement).value).toBe("Paris");
      expect(screen.getByTestId("changes").textContent).toBe("true");
      expect(screen.getByTestId("changes-json").textContent).toBe(
        JSON.stringify({ profile: { city: "Paris" } })
      );
    });
  });
});
