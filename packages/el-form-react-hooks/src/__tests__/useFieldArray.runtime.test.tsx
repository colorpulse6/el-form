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
