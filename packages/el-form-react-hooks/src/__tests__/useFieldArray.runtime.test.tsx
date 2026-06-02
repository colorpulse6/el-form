import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import React from "react";
import { useForm, FormProvider, useFieldArray } from "..";

beforeEach(cleanup);

type Form = { items: { name: string }[] };

function Demo() {
  const form = useForm<Form>({ defaultValues: { items: [{ name: "a" }, { name: "b" }] } });
  return (<FormProvider form={form}><List /></FormProvider>);
}
function List() {
  const { fields, append, remove, move, prepend, swap } = useFieldArray<Form, "items">({ name: "items" });
  return (
    <div>
      <span data-testid="count">{fields.length}</span>
      <span data-testid="ids">{fields.map((f) => f.id).join(",")}</span>
      <span data-testid="names">{fields.map((f) => f.name).join(",")}</span>
      <button onClick={() => append({ name: "new" })}>append</button>
      <button onClick={() => prepend({ name: "first" })}>prepend</button>
      <button onClick={() => remove(0)}>removeFirst</button>
      <button onClick={() => move(0, 1)}>move01</button>
      <button onClick={() => swap(0, 1)}>swap01</button>
    </div>
  );
}

describe("useFieldArray (context mode)", () => {
  it("exposes fields with stable ids and supports append/remove", () => {
    render(<Demo />);
    expect(screen.getByTestId("count").textContent).toBe("2");
    const idsBefore = screen.getByTestId("ids").textContent!;
    fireEvent.click(screen.getByText("append"));
    expect(screen.getByTestId("count").textContent).toBe("3");
    expect(screen.getByTestId("ids").textContent!.startsWith(idsBefore)).toBe(true);
    fireEvent.click(screen.getByText("removeFirst"));
    expect(screen.getByTestId("count").textContent).toBe("2");
  });
  it("keeps each row's id attached to its data across move (the correctness win)", () => {
    render(<Demo />);
    const ids = screen.getByTestId("ids").textContent!.split(",");
    const names = screen.getByTestId("names").textContent!.split(",");
    fireEvent.click(screen.getByText("move01"));
    const idsAfter = screen.getByTestId("ids").textContent!.split(",");
    const namesAfter = screen.getByTestId("names").textContent!.split(",");
    expect(namesAfter).toEqual([names[1], names[0]]);
    expect(idsAfter).toEqual([ids[1], ids[0]]);
  });
  it("mints fresh unique ids for prepended/appended rows", () => {
    render(<Demo />);
    fireEvent.click(screen.getByText("prepend"));
    const ids = screen.getByTestId("ids").textContent!.split(",");
    expect(new Set(ids).size).toBe(ids.length);
  });
});

import { useRef as useReactRef } from "react";

type Form2 = { items: { name: string }[]; other: string };

const Counter = React.memo(function Counter() {
  const rc = useReactRef(0); rc.current += 1;
  const { fields } = useFieldArray<Form2, "items">({ name: "items" });
  return (<><div aria-label="rc">{rc.current}</div><div aria-label="len">{fields.length}</div></>);
});
function IsolationApp() {
  const form = useForm<Form2>({ defaultValues: { items: [{ name: "a" }], other: "x" } });
  return (
    <FormProvider form={form}>
      <Counter />
      <button aria-label="other" onClick={() => form.setValue("other" as any, "y")}>other</button>
    </FormProvider>
  );
}
describe("useFieldArray isolation", () => {
  it("does not re-render when an unrelated field changes", () => {
    render(<IsolationApp />);
    const before = Number(screen.getByLabelText("rc").textContent);
    fireEvent.click(screen.getByLabelText("other"));
    const after = Number(screen.getByLabelText("rc").textContent);
    expect(after).toBe(before);
  });
});

type NestForm = { team: { skills: string[] }[] };

function PropModeDemo() {
  const form = useForm<{ items: string[] }>({ defaultValues: { items: ["a"] } });
  const { fields, append, remove } = useFieldArray<{ items: string[] }, "items">({ name: "items", form });
  return (
    <div>
      <span data-testid="p-count">{fields.length}</span>
      <span data-testid="p-vals">{fields.map((f: any) => f.value).join(",")}</span>
      <button onClick={() => append("b" as any)}>p-append</button>
      <button onClick={() => remove(0)}>p-remove</button>
    </div>
  );
}
describe("useFieldArray prop mode + primitives + nested", () => {
  it("works without a FormProvider when form is passed, primitive items get {id,value}", () => {
    render(<PropModeDemo />);
    expect(screen.getByTestId("p-count").textContent).toBe("1");
    expect(screen.getByTestId("p-vals").textContent).toBe("a");
    fireEvent.click(screen.getByText("p-append"));
    expect(screen.getByTestId("p-count").textContent).toBe("2");
    expect(screen.getByTestId("p-vals").textContent).toBe("a,b");
  });
  it("supports nested array paths", () => {
    function Nested() {
      const form = useForm<NestForm>({ defaultValues: { team: [{ skills: ["js"] }] } });
      const fa = useFieldArray<NestForm, "team.0.skills">({ name: "team.0.skills" as any, form });
      return (
        <div>
          <span data-testid="n">{fa.fields.map((f: any) => f.value).join(",")}</span>
          <button onClick={() => fa.append("ts" as any)}>n-add</button>
        </div>
      );
    }
    render(<Nested />);
    expect(screen.getByTestId("n").textContent).toBe("js");
    fireEvent.click(screen.getByText("n-add"));
    expect(screen.getByTestId("n").textContent).toBe("js,ts");
  });
});

describe("useFieldArray batched synchronous ops", () => {
  it("two synchronous appends in one handler both land", () => {
    type F = { items: { name: string }[] };
    function App() {
      const form = useForm<F>({ defaultValues: { items: [] } });
      return (<FormProvider form={form}><L /></FormProvider>);
    }
    function L() {
      const { fields, append } = useFieldArray<F, "items">({ name: "items" });
      return (
        <div>
          <span data-testid="bc">{fields.length}</span>
          <span data-testid="bnames">{fields.map((f) => f.name).join(",")}</span>
          <button onClick={() => { append({ name: "a" }); append({ name: "b" }); }}>add2</button>
        </div>
      );
    }
    render(<App />);
    fireEvent.click(screen.getByText("add2"));
    expect(screen.getByTestId("bc").textContent).toBe("2");
    expect(screen.getByTestId("bnames").textContent).toBe("a,b");
  });
  it("append then remove in one handler nets the appended item only", () => {
    type F = { items: { name: string }[] };
    function App() {
      const form = useForm<F>({ defaultValues: { items: [{ name: "x" }] } });
      return (<FormProvider form={form}><L /></FormProvider>);
    }
    function L() {
      const { fields, append, remove } = useFieldArray<F, "items">({ name: "items" });
      return (
        <div>
          <span data-testid="bc2">{fields.map((f) => f.name).join(",")}</span>
          <button onClick={() => { append({ name: "y" }); remove(0); }}>seq</button>
        </div>
      );
    }
    render(<App />);
    fireEvent.click(screen.getByText("seq"));
    // started [x]; append y -> [x,y]; remove(0) -> [y]
    expect(screen.getByTestId("bc2").textContent).toBe("y");
  });
});

describe("useFieldArray keyName", () => {
  it("default keyName 'id' shadows a domain id (documented behavior)", () => {
    type F = { items: { id: string; name: string }[] };
    function C() {
      const { fields } = useFieldArray<F, "items">({ name: "items" });
      return <span data-testid="k1">{fields.map((f: any) => f.id).join(",")}</span>;
    }
    function App() {
      const form = useForm<F>({ defaultValues: { items: [{ id: "domain-1", name: "a" }] } });
      return <FormProvider form={form}><C /></FormProvider>;
    }
    render(<App />);
    // generated id, NOT the domain id
    expect(screen.getByTestId("k1").textContent).toMatch(/^field-/);
  });
  it("custom keyName avoids clobbering the domain id", () => {
    type F = { items: { id: string; name: string }[] };
    function C() {
      const { fields } = useFieldArray<F, "items">({ name: "items", keyName: "_key" });
      return (
        <span data-testid="k2">
          {fields.map((f: any) => `${f.id}:${f._key}`).join(",")}
        </span>
      );
    }
    function App() {
      const form = useForm<F>({ defaultValues: { items: [{ id: "domain-1", name: "a" }] } });
      return <FormProvider form={form}><C /></FormProvider>;
    }
    render(<App />);
    const txt = screen.getByTestId("k2").textContent!;
    // domain id preserved under f.id; generated key under f._key
    expect(txt).toMatch(/^domain-1:field-/);
  });
});
