import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from "@testing-library/react";
import { useForm } from "..";

beforeEach(cleanup);
afterEach(() => vi.unstubAllGlobals());

const mk = (name: string) => new File(["x"], name, { type: "image/png" });

function FileMethodsDemo() {
  const { watch, addFile, removeFile, clearFiles } = useForm<{ docs: File[] }>({
    defaultValues: { docs: [] },
  });
  const value = watch("docs") as File[] | null;
  const docs = value || [];

  return (
    <div>
      <span data-testid="count">{docs.length}</span>
      <span data-testid="names">{docs.map((file) => file.name).join(",")}</span>
      <span data-testid="kind">
        {value === null ? "null" : Array.isArray(value) ? "array" : typeof value}
      </span>
      <button onClick={() => addFile("docs", mk("a.png"))}>add-a</button>
      <button onClick={() => addFile("docs", mk("b.png"))}>add-b</button>
      <button onClick={() => removeFile("docs", 0)}>remove-0</button>
      <button onClick={() => removeFile("docs")}>remove-all</button>
      <button onClick={() => clearFiles("docs")}>clear</button>
    </div>
  );
}

function FilePreviewDemo() {
  const { register, filePreview, removeFile } = useForm<{ docs: File | null }>({
    defaultValues: { docs: null },
  });
  const registration = register("docs");

  return (
    <div>
      <button
        onClick={() =>
          void registration.onChange({
            target: { type: "file", files: [mk("a.png")] },
          } as any)
        }
      >
        select-a
      </button>
      <span data-testid="preview">{filePreview.docs ?? ""}</span>
      <button onClick={() => removeFile("docs")}>remove-all</button>
    </div>
  );
}

describe("file methods", () => {
  it("addFile appends to an array field", () => {
    render(<FileMethodsDemo />);

    fireEvent.click(screen.getByText("add-a"));
    fireEvent.click(screen.getByText("add-b"));

    expect(screen.getByTestId("count").textContent).toBe("2");
    expect(screen.getByTestId("names").textContent).toBe("a.png,b.png");
    expect(screen.getByTestId("kind").textContent).toBe("array");
  });

  it("removeFile removes a specific file by index", () => {
    render(<FileMethodsDemo />);

    fireEvent.click(screen.getByText("add-a"));
    fireEvent.click(screen.getByText("add-b"));
    fireEvent.click(screen.getByText("remove-0"));

    expect(screen.getByTestId("count").textContent).toBe("1");
    expect(screen.getByTestId("names").textContent).toBe("b.png");
  });

  it("removeFile without an index clears the field to null", () => {
    render(<FileMethodsDemo />);

    fireEvent.click(screen.getByText("add-a"));
    fireEvent.click(screen.getByText("remove-all"));

    expect(screen.getByTestId("count").textContent).toBe("0");
    expect(screen.getByTestId("kind").textContent).toBe("null");
  });

  it("clearFiles sets the field to null", () => {
    render(<FileMethodsDemo />);

    fireEvent.click(screen.getByText("add-a"));
    fireEvent.click(screen.getByText("clear"));

    expect(screen.getByTestId("count").textContent).toBe("0");
    expect(screen.getByTestId("kind").textContent).toBe("null");
  });

  it("removeFile without an index clears filePreview state", async () => {
    const dataUrl = "data:image/png;base64,cHJldmlldw==";

    class MockFileReader {
      onload: ((event: { target?: { result: string } }) => void) | null = null;
      onerror: (() => void) | null = null;

      readAsDataURL() {
        this.onload?.({ target: { result: dataUrl } });
      }
    }

    vi.stubGlobal("FileReader", MockFileReader);

    render(<FilePreviewDemo />);

    fireEvent.click(screen.getByText("select-a"));

    await waitFor(() => {
      expect(screen.getByTestId("preview").textContent).toBe(dataUrl);
    });

    fireEvent.click(screen.getByText("remove-all"));

    expect(screen.getByTestId("preview").textContent).toBe("");
  });
});
