import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React, { useRef } from "react";
import { useFormContext } from "../FormContext";
import {
  useForm,
  FormProvider,
  useFormSelector,
  useField,
  shallowEqual,
} from "..";

// Test component that ONLY uses useField (no register props)
const FieldOnlyComponent = React.memo(function FieldOnlyComponent({
  field,
}: {
  field: string;
}) {
  const renderCount = useRef(0);
  renderCount.current += 1;
  const { value } = useField<any, any>(field as any);
  return (
    <div>
      <div aria-label={`${field}-count`}>{renderCount.current}</div>
      <div aria-label={`${field}-value`}>{String(value)}</div>
    </div>
  );
});

// Control component that provides input (using register)
const InputComponent = React.memo(function InputComponent({
  field,
}: {
  field: string;
}) {
  const { form } = useFormContext<any>();
  const props = form.register(field);
  return (
    <input
      aria-label={`${field}-input`}
      value={(props as any).value}
      onChange={(props as any).onChange}
    />
  );
});

const ItemsView = React.memo(function ItemsView() {
  const renderCount = useRef(0);
  renderCount.current += 1;
  const items = useFormSelector((s) => s.values.items ?? [], shallowEqual);

  return (
    <>
      <div aria-label="items-render-count">{renderCount.current}</div>
      <div aria-label="items-length">{items.length}</div>
    </>
  );
});

describe("selector subscriptions", () => {
  it("useField('x') re-renders only when x changes", () => {
    function App() {
      const form = useForm<{ x: string; y: string }>({
        defaultValues: { x: "x", y: "y" },
      });

      return (
        <FormProvider form={form}>
          <FieldOnlyComponent field="x" />
          <FieldOnlyComponent field="y" />
          <InputComponent field="x" />
          <InputComponent field="y" />
        </FormProvider>
      );
    }

    render(<App />);
    const xInput = screen.getByLabelText("x-input") as HTMLInputElement;
    const yInput = screen.getByLabelText("y-input") as HTMLInputElement;

    const initialXCount = Number(screen.getByLabelText("x-count").textContent);

    // Change y only - x component should not re-render
    fireEvent.change(yInput, { target: { value: "y2" } });
    const afterYChangeXCount = Number(
      screen.getByLabelText("x-count").textContent
    );
    expect(afterYChangeXCount).toBe(initialXCount); // X did not re-render

    // Change x - x component should re-render
    fireEvent.change(xInput, { target: { value: "x2" } });
    const afterXChangeXCount = Number(
      screen.getByLabelText("x-count").textContent
    );
    expect(afterXChangeXCount).toBeGreaterThan(initialXCount); // X re-rendered
  });

  it("useFormSelector with shallowEqual avoids re-renders for equal arrays", () => {
    function App() {
      const form = useForm<{ items: Array<{ id: number }>; unrelated: string }>(
        {
          defaultValues: { items: [{ id: 1 }], unrelated: "test" },
        }
      );

      // Get reference to the current items array
      const currentItems = form.formState.values.items;

      function AddSame() {
        return (
          <button
            aria-label="same"
            onClick={() => {
              // Set the exact same array reference - shallow equal should prevent re-render
              form.setValue("items" as any, currentItems as any);
            }}
          >
            same
          </button>
        );
      }
      function ChangeUnrelated() {
        return (
          <button
            aria-label="unrelated"
            onClick={() => {
              // Change a different field that should not affect ItemsView
              form.setValue("unrelated" as any, "changed" as any);
            }}
          >
            unrelated
          </button>
        );
      }
      return (
        <FormProvider form={form}>
          <ItemsView />
          <AddSame />
          <ChangeUnrelated />
        </FormProvider>
      );
    }

    render(<App />);
    const initial = Number(
      screen.getByLabelText("items-render-count").textContent
    );

    // Test 1: changing unrelated field should not cause re-render
    const unrelatedBtn = screen.getByLabelText("unrelated");
    fireEvent.click(unrelatedBtn);
    const afterUnrelated = Number(
      screen.getByLabelText("items-render-count").textContent
    );
    expect(afterUnrelated).toBe(initial); // no re-render for unrelated change

    // Test 2: setting same array content should not cause re-render
    const sameBtn = screen.getByLabelText("same");
    fireEvent.click(sameBtn);
    const afterSame = Number(
      screen.getByLabelText("items-render-count").textContent
    );
    expect(afterSame).toBe(initial); // no re-render because shallowEqual considers equal
  });
});
