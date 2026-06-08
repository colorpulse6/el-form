import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import React from "react";
import { useFormContext } from "../FormContext";
import { useForm, FormProvider } from "..";

beforeEach(cleanup);

type Values = { name: string };

// Reads form state DIRECTLY from the context getter during render, with no
// selector subscription (useField / useFormSelector). This is the path that
// previously lagged one render behind because the context getter read a ref
// that was only refreshed in a post-commit effect.
function DirectReader() {
  const { form } = useFormContext<Values>();
  const value = form.formState.values.name ?? "";
  const touched = form.formState.touched.name ? "touched" : "untouched";
  const error = form.formState.errors.name ?? "no-error";
  return (
    <>
      <div data-testid="value">{value}</div>
      <div data-testid="touched">{touched}</div>
      <div data-testid="error">{error}</div>
    </>
  );
}

describe("FormProvider context getter reactivity", () => {
  it("reflects updated values to a direct form.formState reader in the same render", () => {
    function App() {
      const form = useForm<Values>({ defaultValues: { name: "" } });
      return (
        <FormProvider form={form}>
          <input aria-label="name" {...(form.register("name") as any)} />
          <DirectReader />
        </FormProvider>
      );
    }

    render(<App />);
    expect(screen.getByTestId("value").textContent).toBe("");

    fireEvent.change(screen.getByLabelText("name"), {
      target: { value: "ada" },
    });
    expect(screen.getByTestId("value").textContent).toBe("ada");
  });

  it("reflects updated touched state to a direct reader after blur", () => {
    function App() {
      const form = useForm<Values>({ defaultValues: { name: "" } });
      return (
        <FormProvider form={form}>
          <input aria-label="name" {...(form.register("name") as any)} />
          <DirectReader />
        </FormProvider>
      );
    }

    render(<App />);
    expect(screen.getByTestId("touched").textContent).toBe("untouched");

    fireEvent.blur(screen.getByLabelText("name"));
    expect(screen.getByTestId("touched").textContent).toBe("touched");
  });

  it("reflects setError updates to a direct reader", () => {
    function App() {
      const form = useForm<Values>({ defaultValues: { name: "" } });
      return (
        <FormProvider form={form}>
          <button
            aria-label="set-error"
            onClick={() => form.setError("name", "Required")}
          >
            set
          </button>
          <DirectReader />
        </FormProvider>
      );
    }

    render(<App />);
    expect(screen.getByTestId("error").textContent).toBe("no-error");

    fireEvent.click(screen.getByLabelText("set-error"));
    expect(screen.getByTestId("error").textContent).toBe("Required");
  });
});
