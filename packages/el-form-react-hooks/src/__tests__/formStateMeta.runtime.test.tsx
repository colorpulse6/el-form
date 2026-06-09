import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, act, cleanup, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { z } from "zod";
import { useForm } from "..";

beforeEach(cleanup);

function makeApp(onSubmit?: (d: any) => void) {
  let api: any;
  function App() {
    const form = useForm<{ name: string }>({
      defaultValues: { name: "" },
      validators: { onSubmit: z.object({ name: z.string().min(1, "required") }) },
      onSubmit,
    });
    api = form;
    return (
      <>
        <div data-testid="submitted">{String(form.formState.isSubmitted)}</div>
        <div data-testid="count">{form.formState.submitCount}</div>
        <div data-testid="success">{String(form.formState.isSubmitSuccessful)}</div>
      </>
    );
  }
  return { App, getApi: () => api };
}

const submitted = () => screen.getByTestId("submitted").textContent;
const count = () => screen.getByTestId("count").textContent;
const success = () => screen.getByTestId("success").textContent;

describe("formState submit metadata", () => {
  it("starts at isSubmitted=false, submitCount=0, isSubmitSuccessful=false", () => {
    const { App } = makeApp();
    render(<App />);
    expect(submitted()).toBe("false");
    expect(count()).toBe("0");
    expect(success()).toBe("false");
  });

  it("a valid submit sets isSubmitted, submitCount, and isSubmitSuccessful", async () => {
    const onSubmit = vi.fn();
    const { App, getApi } = makeApp(onSubmit);
    render(<App />);
    await act(async () => {
      getApi().setValue("name", "ada");
    });
    await act(async () => {
      await getApi().submit();
    });
    expect(submitted()).toBe("true");
    expect(count()).toBe("1");
    expect(success()).toBe("true");
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("an invalid submit marks submitted + counts, but isSubmitSuccessful stays false", async () => {
    const onSubmit = vi.fn();
    const { App, getApi } = makeApp(onSubmit);
    render(<App />); // name "" -> invalid
    await act(async () => {
      await getApi().submit();
    });
    expect(submitted()).toBe("true");
    expect(count()).toBe("1");
    expect(success()).toBe("false");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submitCount increments per attempt", async () => {
    const { App, getApi } = makeApp(() => {});
    render(<App />);
    await act(async () => {
      await getApi().submit();
    });
    await act(async () => {
      await getApi().submit();
    });
    expect(count()).toBe("2");
  });

  it("handleSubmit also sets the submit metadata", async () => {
    const onValid = vi.fn();
    function App() {
      const form = useForm<{ name: string }>({
        defaultValues: { name: "ada" }, // valid
        validators: { onSubmit: z.object({ name: z.string().min(1, "required") }) },
      });
      return (
        <form data-testid="form" onSubmit={form.handleSubmit(onValid)}>
          <div data-testid="count">{form.formState.submitCount}</div>
          <div data-testid="success">{String(form.formState.isSubmitSuccessful)}</div>
        </form>
      );
    }
    render(<App />);
    fireEvent.submit(screen.getByTestId("form"));
    await waitFor(() => expect(count()).toBe("1"));
    expect(success()).toBe("true");
    expect(onValid).toHaveBeenCalledTimes(1);
  });

  it("a submit whose handler throws leaves isSubmitSuccessful false (count still increments)", async () => {
    const onSubmit = vi.fn(() => {
      throw new Error("boom");
    });
    const { App, getApi } = makeApp(onSubmit);
    render(<App />);
    await act(async () => {
      getApi().setValue("name", "x"); // valid -> handler runs
    });
    await act(async () => {
      await expect(getApi().submit()).rejects.toThrow("boom");
    });
    expect(submitted()).toBe("true");
    expect(count()).toBe("1");
    expect(success()).toBe("false");
  });

  it("reset() clears submit metadata", async () => {
    const { App, getApi } = makeApp(() => {});
    render(<App />);
    await act(async () => {
      getApi().setValue("name", "x");
    });
    await act(async () => {
      await getApi().submit();
    });
    expect(count()).toBe("1");
    await act(async () => {
      getApi().reset();
    });
    expect(submitted()).toBe("false");
    expect(count()).toBe("0");
    expect(success()).toBe("false");
  });
});
