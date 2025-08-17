import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import React, { useRef } from "react";
import { useForm, FormProvider } from "el-form-react-hooks";
import { FormSwitch, FormCase } from "../Form";

describe("FormSwitch", () => {
  beforeEach(() => {
    cleanup();
  });

  it("renders only the matching case with field prop and switches correctly", () => {
    function App() {
      const form = useForm<{ kind: "a" | "b"; a?: string; b?: string }>({
        defaultValues: { kind: "a" },
      });
      return (
        <FormProvider form={form}>
          <select aria-label="kind-1" {...form.register("kind")}>
            <option value="a">A</option>
            <option value="b">B</option>
          </select>

          <FormSwitch field="kind">
            <FormCase value="a">
              {() => <div aria-label="pane-a">Pane A</div>}
            </FormCase>
            <FormCase value="b">
              {() => <div aria-label="pane-b">Pane B</div>}
            </FormCase>
          </FormSwitch>
        </FormProvider>
      );
    }

    render(<App />);
    expect(screen.queryByLabelText("pane-a")).toBeTruthy();
    expect(screen.queryByLabelText("pane-b")).toBeNull();
    const kind = screen.getByLabelText("kind-1");
    fireEvent.change(kind, { target: { value: "b" } });
    expect(screen.queryByLabelText("pane-a")).toBeNull();
    expect(screen.queryByLabelText("pane-b")).toBeTruthy();
  });

  it("supports back-compat on+form props", () => {
    function App() {
      const form = useForm<{ kind: "left" | "right" }>({
        defaultValues: { kind: "left" },
      });
      return (
        <div>
          <select aria-label="kind-2" {...form.register("kind")}>
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
          <FormSwitch on={form.watch("kind")} form={form}>
            <FormCase value="left">
              {() => <div aria-label="left-pane">Left</div>}
            </FormCase>
            <FormCase value="right">
              {() => <div aria-label="right-pane">Right</div>}
            </FormCase>
          </FormSwitch>
        </div>
      );
    }

    render(<App />);
    expect(screen.queryByLabelText("left-pane")).toBeTruthy();
    const kind = screen.getByLabelText("kind-2");
    fireEvent.change(kind, { target: { value: "right" } });
    expect(screen.queryByLabelText("right-pane")).toBeTruthy();
  });
});
