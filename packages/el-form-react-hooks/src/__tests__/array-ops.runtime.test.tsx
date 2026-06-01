import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { useForm } from "..";

beforeEach(cleanup);

function ArrayDemo() {
  const { watch, addArrayItem, removeArrayItem } = useForm<{ tags: string[] }>({
    defaultValues: { tags: ["a"] },
  });
  const tags = watch("tags") || [];
  return (
    <div>
      <span data-testid="count">{tags.length}</span>
      <span data-testid="tags">{JSON.stringify(tags)}</span>
      <button onClick={() => addArrayItem("tags", "")}>add</button>
      <button onClick={() => removeArrayItem("tags", 0)}>removeFirst</button>
    </div>
  );
}

describe("array operations", () => {
  it("addArrayItem appends an item", () => {
    render(<ArrayDemo />);
    expect(screen.getByTestId("count").textContent).toBe("1");
    fireEvent.click(screen.getByText("add"));
    expect(screen.getByTestId("count").textContent).toBe("2");
  });

  it("removeArrayItem removes by index", () => {
    render(<ArrayDemo />);
    fireEvent.click(screen.getByText("add"));
    fireEvent.click(screen.getByText("removeFirst"));
    expect(screen.getByTestId("count").textContent).toBe("1");
  });
});
