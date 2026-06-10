import { describe, it, expect, beforeEach } from "vitest";
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
