import { it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { useForm } from "..";

beforeEach(cleanup);

it("onSubmitAsync blocks submission when it fails", async () => {
  let submitted = false;
  function Demo() {
    const { register, handleSubmit, formState } = useForm<{ email: string }>({
      defaultValues: { email: "a@b.com" },
      // Form-level async error shape: the engine maps `result.fields` to field errors
      // (FormLevelValidator). A bare string lands under errors.form instead.
      validators: { onSubmitAsync: async () => ({ fields: { email: "Taken" } }) } as any,
      onSubmit: () => { submitted = true; },
    });
    return (
      <form onSubmit={handleSubmit(() => { submitted = true; })}>
        <input aria-label="email" {...register("email")} />
        <button type="submit">Submit</button>
        <span data-testid="err">{(formState.errors as any).email ?? ""}</span>
      </form>
    );
  }
  render(<Demo />);
  fireEvent.click(screen.getByText("Submit"));
  await waitFor(() => expect(screen.getByTestId("err").textContent).toBe("Taken"));
  expect(submitted).toBe(false);
});

it("trigger('email') runs the field's onChangeAsync and surfaces its error", async () => {
  function Demo() {
    const form = useForm<{ email: string }>({
      defaultValues: { email: "test@example.com" },
      fieldValidators: {
        email: { onChangeAsync: async () => "Taken" },
      } as any,
    });
    return (
      <div>
        <input aria-label="email" {...form.register("email")} />
        <button
          type="button"
          onClick={async () => { await form.trigger("email"); }}
        >
          Trigger
        </button>
        <span data-testid="err">{(form.formState.errors as any).email ?? ""}</span>
      </div>
    );
  }
  render(<Demo />);
  fireEvent.click(screen.getByText("Trigger"));
  await waitFor(() => expect(screen.getByTestId("err").textContent).toBe("Taken"));
});

it("async passes — submit succeeds when onSubmitAsync returns no errors", async () => {
  let submitted = false;
  function Demo() {
    const { register, handleSubmit, formState } = useForm<{ email: string }>({
      defaultValues: { email: "ok@example.com" },
      // Returning undefined/null means "no error" — the engine treats { fields: {} } as invalid
      // (empty-object is truthy), so we explicitly return undefined for a clean pass.
      validators: { onSubmitAsync: async () => undefined } as any,
      onSubmit: () => { submitted = true; },
    });
    return (
      <form onSubmit={handleSubmit(() => { submitted = true; })}>
        <input aria-label="email" {...register("email")} />
        <button type="submit">Submit</button>
        <span data-testid="err">{(formState.errors as any).email ?? ""}</span>
      </form>
    );
  }
  render(<Demo />);
  fireEvent.click(screen.getByText("Submit"));
  await waitFor(() => expect(submitted).toBe(true));
  expect(screen.getByTestId("err").textContent).toBe("");
});
