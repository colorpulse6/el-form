import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import React, { useRef } from "react";
import { useForm, FormProvider, useWatch } from "..";

beforeEach(cleanup);

type Form = {
  first: string;
  last: string;
  nick?: string;
  user: { name: string };
};

const defaults = (): Form => ({ first: "", last: "", user: { name: "" } });

// Memoized so the watcher re-renders ONLY via its own subscription, never just
// because the form-owning App re-rendered.
const Single = React.memo(function Single({ path }: { path: any }) {
  const renders = useRef(0);
  renders.current += 1;
  const value = useWatch<Form, any>(path);
  return (
    <>
      <div aria-label="single-renders">{renders.current}</div>
      <div aria-label="single-value">{String(value ?? "")}</div>
    </>
  );
});

const Multi = React.memo(function Multi() {
  const renders = useRef(0);
  renders.current += 1;
  const v = useWatch<Form, "first" | "last">(["first", "last"]);
  return (
    <>
      <div aria-label="multi-renders">{renders.current}</div>
      <div aria-label="multi-value">{JSON.stringify(v)}</div>
    </>
  );
});

const All = React.memo(function All() {
  const v = useWatch<Form>();
  return <div aria-label="all-value">{JSON.stringify(v)}</div>;
});

const Nested = React.memo(function Nested() {
  const renders = useRef(0);
  renders.current += 1;
  const user = useWatch<Form, "user">("user");
  return (
    <>
      <div aria-label="nested-renders">{renders.current}</div>
      <div aria-label="nested-value">{JSON.stringify(user)}</div>
    </>
  );
});

function App({ children }: { children: React.ReactNode }) {
  const form = useForm<Form>({ defaultValues: defaults() });
  return (
    <FormProvider form={form}>
      {children}
      <button aria-label="set-first" onClick={() => form.setValue("first", "ada")}>
        first
      </button>
      <button aria-label="set-last" onClick={() => form.setValue("last", "byron")}>
        last
      </button>
      <button aria-label="set-user" onClick={() => form.setValue("user.name", "carol")}>
        user
      </button>
      <button aria-label="set-nick" onClick={() => form.setValue("nick", "nicky")}>
        nick
      </button>
    </FormProvider>
  );
}

describe("useWatch", () => {
  it("useWatch(name) reflects updates to that field", () => {
    render(
      <App>
        <Single path="first" />
      </App>
    );
    expect(screen.getByLabelText("single-value").textContent).toBe("");
    fireEvent.click(screen.getByLabelText("set-first"));
    expect(screen.getByLabelText("single-value").textContent).toBe("ada");
  });

  it("useWatch(name) does not re-render when an unrelated field changes", () => {
    render(
      <App>
        <Single path="first" />
      </App>
    );
    const before = Number(screen.getByLabelText("single-renders").textContent);
    fireEvent.click(screen.getByLabelText("set-last")); // unrelated
    expect(Number(screen.getByLabelText("single-renders").textContent)).toBe(before);
    fireEvent.click(screen.getByLabelText("set-first")); // related
    expect(
      Number(screen.getByLabelText("single-renders").textContent)
    ).toBeGreaterThan(before);
  });

  it("useWatch(names[]) returns a keyed object and reflects updates", () => {
    render(
      <App>
        <Multi />
      </App>
    );
    expect(JSON.parse(screen.getByLabelText("multi-value").textContent!)).toEqual({
      first: "",
      last: "",
    });
    fireEvent.click(screen.getByLabelText("set-first"));
    expect(JSON.parse(screen.getByLabelText("multi-value").textContent!)).toEqual({
      first: "ada",
      last: "",
    });
  });

  it("useWatch() reflects all values", () => {
    render(
      <App>
        <All />
      </App>
    );
    expect(JSON.parse(screen.getByLabelText("all-value").textContent!).first).toBe("");
    fireEvent.click(screen.getByLabelText("set-first"));
    expect(JSON.parse(screen.getByLabelText("all-value").textContent!).first).toBe(
      "ada"
    );
  });

  it("throws when used outside a FormProvider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Single path="first" />)).toThrow(/FormProvider/);
    spy.mockRestore();
  });

  it("does not over-render when watching an unset field and an unrelated field changes", () => {
    // The watched slice is `undefined`; React's useSyncExternalStore bails via
    // Object.is(undefined, undefined), so there is no extra render even though the
    // store signals a potential change. (This asserts the user-facing guarantee —
    // no over-render — not the internal selector call count.)
    render(
      <App>
        <Single path="nick" />
      </App>
    );
    const before = Number(screen.getByLabelText("single-renders").textContent);
    fireEvent.click(screen.getByLabelText("set-first")); // unrelated; nick stays undefined
    expect(Number(screen.getByLabelText("single-renders").textContent)).toBe(before);
  });

  it("reflects an unset field once it is set", () => {
    render(
      <App>
        <Single path="nick" />
      </App>
    );
    expect(screen.getByLabelText("single-value").textContent).toBe("");
    fireEvent.click(screen.getByLabelText("set-nick"));
    expect(screen.getByLabelText("single-value").textContent).toBe("nicky");
  });

  it("watches a whole nested object: re-renders on a child change, not on unrelated edits", () => {
    render(
      <App>
        <Nested />
      </App>
    );
    expect(JSON.parse(screen.getByLabelText("nested-value").textContent!)).toEqual({
      name: "",
    });
    const before = Number(screen.getByLabelText("nested-renders").textContent);

    // unrelated top-level edit: the `user` object reference is untouched → no re-render
    fireEvent.click(screen.getByLabelText("set-first"));
    expect(Number(screen.getByLabelText("nested-renders").textContent)).toBe(before);

    // editing a child rebuilds the `user` reference → re-render with new value
    fireEvent.click(screen.getByLabelText("set-user"));
    expect(
      Number(screen.getByLabelText("nested-renders").textContent)
    ).toBeGreaterThan(before);
    expect(JSON.parse(screen.getByLabelText("nested-value").textContent!)).toEqual({
      name: "carol",
    });
  });

  it("re-subscribes when the watched name changes between renders", () => {
    function SwitchApp() {
      const form = useForm<Form>({ defaultValues: { ...defaults(), last: "byron" } });
      const [path, setPath] = React.useState<"first" | "last">("first");
      return (
        <FormProvider form={form}>
          <Single path={path} />
          <button aria-label="switch" onClick={() => setPath("last")}>
            switch
          </button>
        </FormProvider>
      );
    }
    render(<SwitchApp />);
    expect(screen.getByLabelText("single-value").textContent).toBe(""); // first
    fireEvent.click(screen.getByLabelText("switch"));
    expect(screen.getByLabelText("single-value").textContent).toBe("byron"); // last
  });
});
