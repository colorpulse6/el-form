import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React, { useRef } from "react";
import {
  useForm,
  FormProvider,
  useFormSelector,
  useField,
  shallowEqual,
} from "..";

describe("selector subscriptions", () => {
  it("useField('x') re-renders only when x or its error/touched changes", () => {
    function App() {
      const form = useForm<{ x: string; y: string }>({
        defaultValues: { x: "x", y: "y" },
      });
      const xCount = useRef(0);
      const yCount = useRef(0);

      const X = React.memo(function X() {
        xCount.current += 1;
        const { value } = useField<any, any>("x" as any);
        const props = form.register("x");
        return (
          <div>
            <div aria-label="x-count">{xCount.current}</div>
            <input
              aria-label="x"
              value={(props as any).value}
              onChange={(props as any).onChange}
            />
            <div aria-label="x-value">{String(value)}</div>
          </div>
        );
      });

      const Y = React.memo(function Y() {
        yCount.current += 1;
        const props = form.register("y");
        return (
          <div>
            <div aria-label="y-count">{yCount.current}</div>
            <input
              aria-label="y"
              value={(props as any).value}
              onChange={(props as any).onChange}
            />
          </div>
        );
      });

      return (
        <FormProvider form={form}>
          <X />
          <Y />
        </FormProvider>
      );
    }

    render(<App />);
    const xInput = screen.getByLabelText("x") as HTMLInputElement;
    const yInput = screen.getByLabelText("y") as HTMLInputElement;

    const initialXCount = Number(screen.getByLabelText("x-count").textContent);

    // Change y only
    fireEvent.change(yInput, { target: { value: "y2" } });
    // Flush microtasks to allow any subscription notifications
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    queueMicrotask(() => {});
    const afterYChangeXCount = Number(
      screen.getByLabelText("x-count").textContent
    );
    expect(afterYChangeXCount).toBe(initialXCount); // X did not re-render

    // Change x
    fireEvent.change(xInput, { target: { value: "x2" } });
    const afterXChangeXCount = Number(
      screen.getByLabelText("x-count").textContent
    );
    expect(afterXChangeXCount).toBeGreaterThan(initialXCount); // X re-rendered
  });

  it("useFormSelector with shallowEqual avoids re-renders for equal arrays", () => {
    function App() {
      const form = useForm<{ items: Array<{ id: number }> }>({
        defaultValues: { items: [{ id: 1 }] },
      });
      const count = useRef(0);
      function ItemsView() {
        const items = useFormSelector(
          (s) => s.values.items ?? [],
          shallowEqual
        );
        count.current += 1;
        return (
          <>
            <div aria-label="items-render-count">{count.current}</div>
            <div aria-label="items-length">{items.length}</div>
          </>
        );
      }
      function AddSame() {
        return (
          <button
            aria-label="same"
            onClick={() => {
              // set to a new array with same shallow contents
              form.setValue("items" as any, [{ id: 1 }] as any);
            }}
          >
            same
          </button>
        );
      }
      return (
        <FormProvider form={form}>
          <ItemsView />
          <AddSame />
        </FormProvider>
      );
    }

    render(<App />);
    const initial = Number(
      screen.getByLabelText("items-render-count").textContent
    );
    const sameBtn = screen.getByLabelText("same");
    sameBtn && fireEvent.click(sameBtn);
    const after = Number(
      screen.getByLabelText("items-render-count").textContent
    );
    expect(after).toBe(initial); // no re-render because shallowEqual considers equal
  });
});
