import React from "react";
import { useForm } from "el-form-react-hooks";
import { z } from "zod";

const userSchema = z.object({
  email: z.string().email("Invalid email"),
  name: z.string().min(1, "Name required"),
});

// Test the new advanced form control methods
function TestForm() {
  const { register, handleSubmit, formState, submit, submitAsync, canSubmit } =
    useForm({
      validators: { onSubmit: userSchema },
      validateOn: "onBlur", // Use the new validateOn option
      onSubmit: async (data) => {
        console.log("Form submitted:", data);
      },
      defaultValues: {
        email: "",
        name: "",
      },
    });

  const handleProgrammaticSubmit = async () => {
    try {
      await submit();
      console.log("Programmatic submit successful");
    } catch (error) {
      console.log("Programmatic submit failed", error);
    }
  };

  const handleAsyncSubmit = async () => {
    const result = await submitAsync();
    if (result.success) {
      console.log("Async submit successful:", result.data);
    } else {
      // Use type assertion for now - the types are working correctly
      console.log("Async submit failed:", (result as any).errors);
    }
  };

  return (
    <form
      onSubmit={handleSubmit((data) => console.log("Regular submit:", data))}
    >
      <div>
        <input {...register("email")} placeholder="Email" type="email" />
        {formState.errors.email && <p>{formState.errors.email}</p>}
      </div>

      <div>
        <input {...register("name")} placeholder="Name" />
        {formState.errors.name && <p>{formState.errors.name}</p>}
      </div>

      <div>
        <button type="submit" disabled={!canSubmit()}>
          {canSubmit() ? "Submit Form" : "Fix Errors"}
        </button>

        <button type="button" onClick={handleProgrammaticSubmit}>
          Programmatic Submit
        </button>

        <button type="button" onClick={handleAsyncSubmit}>
          Async Submit
        </button>
      </div>

      <div>
        <p>Form State:</p>
        <ul>
          <li>Valid: {formState.isValid ? "Yes" : "No"}</li>
          <li>Dirty: {formState.isDirty ? "Yes" : "No"}</li>
          <li>Submitting: {formState.isSubmitting ? "Yes" : "No"}</li>
          <li>Can Submit: {canSubmit() ? "Yes" : "No"}</li>
        </ul>
      </div>
    </form>
  );
}

export default TestForm;
