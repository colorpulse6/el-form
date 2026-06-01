import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";

beforeEach(() => {
  cleanup();
});
import { z } from "zod";
import { useForm } from "..";

const schema = z.object({
  email: z.string().email("Invalid email"),
  age: z.number().min(18, "Must be 18+"),
});

function SubmitDemo({ onValid, onInvalid }: { onValid: (d: any) => void; onInvalid?: (e: any) => void }) {
  const { register, handleSubmit, formState } = useForm<{ email: string; age: number }>({
    validators: { onChange: schema },
    defaultValues: { email: "", age: 0 },
  });
  return (
    <form onSubmit={handleSubmit(onValid, onInvalid)}>
      <input aria-label="email" {...register("email")} />
      <input aria-label="age" type="number" {...register("age")} />
      <button type="submit">Submit</button>
      <span data-testid="submitting">{String(formState.isSubmitting)}</span>
    </form>
  );
}

describe("handleSubmit", () => {
  it("calls onValid with typed data when valid", async () => {
    const onValid = vi.fn();
    render(<SubmitDemo onValid={onValid} />);
    fireEvent.change(screen.getByLabelText("email"), { target: { value: "a@b.com" } });
    fireEvent.change(screen.getByLabelText("age"), { target: { value: "21" } });
    fireEvent.click(screen.getByText("Submit"));
    await waitFor(() => expect(onValid).toHaveBeenCalledTimes(1));
    expect(onValid.mock.calls[0][0]).toEqual({ email: "a@b.com", age: 21 });
  });

  it("does not call onValid when invalid", async () => {
    const onValid = vi.fn();
    const onInvalid = vi.fn();
    render(<SubmitDemo onValid={onValid} onInvalid={onInvalid} />);
    fireEvent.change(screen.getByLabelText("email"), { target: { value: "not-an-email" } });
    fireEvent.click(screen.getByText("Submit"));
    await waitFor(() => expect(onInvalid).toHaveBeenCalled());
    expect(onValid).not.toHaveBeenCalled();
  });

  it("awaits an async onSubmit and toggles isSubmitting", async () => {
    let resolve!: () => void;
    const pending = new Promise<void>((r) => (resolve = r));
    const onValid = vi.fn(() => pending);
    render(<SubmitDemo onValid={onValid} />);
    fireEvent.change(screen.getByLabelText("email"), { target: { value: "a@b.com" } });
    fireEvent.change(screen.getByLabelText("age"), { target: { value: "30" } });
    fireEvent.click(screen.getByText("Submit"));
    await waitFor(() => expect(screen.getByTestId("submitting").textContent).toBe("true"));
    resolve();
    await waitFor(() => expect(screen.getByTestId("submitting").textContent).toBe("false"));
  });
});
