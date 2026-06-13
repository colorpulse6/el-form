import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, cleanup, act } from "@testing-library/react";
import React from "react";
import { useForm, FormProvider } from "..";

beforeEach(cleanup);

type V = { a: string; b: string };

// App owns useForm and reads formState directly (current within the render pass).
// `api` exposes the form so tests can edit fields; `values`/`keepDirty` are props
// so tests can re-render with new external data.
function makeApp() {
  let api: any;
  function App({
    values,
    keepDirty,
  }: {
    values?: Partial<V>;
    keepDirty?: boolean;
  }) {
    const form = useForm<V>({
      defaultValues: { a: "", b: "" },
      values,
      keepDirtyValues: keepDirty,
    });
    api = form;
    return (
      <FormProvider form={form}>
        <div data-testid="a">{form.formState.values.a ?? ""}</div>
        <div data-testid="b">{form.formState.values.b ?? ""}</div>
        <div data-testid="dirty">{String(form.formState.isDirty)}</div>
        <div data-testid="dirtyFields">
          {JSON.stringify(form.formState.dirtyFields)}
        </div>
      </FormProvider>
    );
  }
  return { App, getApi: () => api };
}

const a = () => screen.getByTestId("a").textContent;
const b = () => screen.getByTestId("b").textContent;
const dirty = () => screen.getByTestId("dirty").textContent;
const dirtyFields = () => screen.getByTestId("dirtyFields").textContent;

describe("useForm reactive `values`", () => {
  it("seeds initial values from `values` (precedence over defaultValues)", () => {
    const { App } = makeApp();
    render(<App values={{ a: "X", b: "Y" }} />);
    expect(a()).toBe("X");
    expect(b()).toBe("Y");
  });

  it("re-syncs when `values` content changes", () => {
    const { App } = makeApp();
    const { rerender } = render(<App values={{ a: "1", b: "2" }} />);
    expect(a()).toBe("1");
    rerender(<App values={{ a: "3", b: "2" }} />);
    expect(a()).toBe("3");
    expect(b()).toBe("2");
  });

  it("does NOT clobber edits when re-rendered with an equal-content `values` object", () => {
    const { App, getApi } = makeApp();
    const { rerender } = render(<App values={{ a: "1", b: "1" }} />);
    act(() => {
      getApi().setValue("a", "edited");
    });
    expect(a()).toBe("edited");
    // new object, same content -> deep-compare guard should skip the re-sync
    rerender(<App values={{ a: "1", b: "1" }} />);
    expect(a()).toBe("edited");
  });

  it("keepDirtyValues=false (default): overwrites edited fields and clears dirty", () => {
    const { App, getApi } = makeApp();
    const { rerender } = render(<App values={{ a: "1", b: "1" }} />);
    act(() => {
      getApi().setValue("a", "edited");
    });
    expect(dirty()).toBe("true");
    expect(JSON.parse(dirtyFields()!)).toEqual({ a: true });
    rerender(<App values={{ a: "2", b: "2" }} />);
    expect(a()).toBe("2"); // overwritten
    expect(dirty()).toBe("false");
    // reactive dirtyFields must clear in lockstep with isDirty on overwrite-sync
    expect(dirtyFields()).toBe("{}");
  });

  it("keepDirtyValues=true: preserves edited fields, syncs the rest", () => {
    const { App, getApi } = makeApp();
    const { rerender } = render(
      <App values={{ a: "1", b: "1" }} keepDirty />
    );
    act(() => {
      getApi().setValue("a", "edited");
    });
    rerender(<App values={{ a: "2", b: "2" }} keepDirty />);
    expect(a()).toBe("edited"); // user edit preserved
    expect(b()).toBe("2"); // untouched field synced
    expect(dirty()).toBe("true");
  });

  it("syncs when `values` goes from undefined to defined", () => {
    const { App } = makeApp();
    const { rerender } = render(<App values={undefined} />);
    expect(a()).toBe(""); // falls back to defaultValues
    rerender(<App values={{ a: "later", b: "later" }} />);
    expect(a()).toBe("later");
  });

  it("keepDirtyValues=true preserves a nested dirty field while syncing siblings", () => {
    type NV = { user: { first: string; last: string } };
    let api: any;
    function App({ values }: { values?: Partial<NV> }) {
      const form = useForm<NV>({
        defaultValues: { user: { first: "", last: "" } },
        values,
        keepDirtyValues: true,
      });
      api = form;
      return (
        <FormProvider form={form}>
          <div data-testid="first">{form.formState.values.user?.first ?? ""}</div>
          <div data-testid="last">{form.formState.values.user?.last ?? ""}</div>
        </FormProvider>
      );
    }
    const { rerender } = render(
      <App values={{ user: { first: "A", last: "B" } }} />
    );
    act(() => {
      api.setValue("user.first", "edited");
    });
    rerender(<App values={{ user: { first: "X", last: "Y" } }} />);
    expect(screen.getByTestId("first").textContent).toBe("edited"); // nested dirty kept
    expect(screen.getByTestId("last").textContent).toBe("Y"); // sibling synced
  });
});
