import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import React from "react";
import { useForm, FormProvider } from "el-form-react-hooks";
import { TextField } from "..";

beforeEach(cleanup);

type Profile = { address: { street: string }; email: string };

describe("FieldComponents nested-path support", () => {
  it("TextField with a nested dotted path writes to nested form state", () => {
    function App() {
      const form = useForm<Profile>({
        defaultValues: { address: { street: "" }, email: "" },
      });
      return (
        <FormProvider form={form}>
          <TextField name="address.street" label="Street" />
          <div data-testid="street">
            {form.formState.values.address?.street ?? ""}
          </div>
        </FormProvider>
      );
    }

    render(<App />);
    const input = screen.getByLabelText("Street") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Main St" } });

    // Value is reflected on the input and lands at the nested path, not a
    // flat "address.street" key.
    expect(input.value).toBe("Main St");
    expect(screen.getByTestId("street").textContent).toBe("Main St");
  });
});
