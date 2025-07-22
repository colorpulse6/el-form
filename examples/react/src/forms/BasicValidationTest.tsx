import { useForm } from "el-form-react-hooks";
import { useState } from "react";
import z from "zod";

const basicSchema = z.object({
  name: z
    .string()
    .nonempty({ message: "Name is required" })
    .min(2, "Name must be at least 2 characters")
    .max(20, "Name must be no more than 20 characters"),
  email: z.string().email("Invalid email format"),
  age: z.number().min(18, "Must be 18 or older").max(100, "Must be under 100"),
});

export function BasicValidationTest() {
  const [submitResult, setSubmitResult] = useState<any>(null);

  const { register, handleSubmit, formState, reset, watch } = useForm({
    validators: { onChange: basicSchema },
    defaultValues: { name: "", email: "", age: 18 },
  });

  const watchedValues = watch();

  return (
    <div className="form-section">
      <h2>🔹 Basic Validation Test</h2>
      <p>Schema: name (required), email (valid email), age (18-100)</p>

      <div className="form-state">
        <strong>Form State:</strong>
        <br />
        Values: {JSON.stringify(watchedValues, null, 2)}
        <br />
        Errors: {JSON.stringify(formState.errors, null, 2)}
        <br />
        Valid: {formState.isValid ? "✅" : "❌"}
        <br />
        Dirty: {formState.isDirty ? "✅" : "❌"}
      </div>

      <form
        onSubmit={handleSubmit((data) => {
          setSubmitResult({ success: true, data });
        })}
      >
        <div className="form-group">
          <label>Name *</label>
          <input {...register("name")} placeholder="Enter your name" />
          {formState.errors.name && (
            <span className="error">{formState.errors.name}</span>
          )}
        </div>

        <div className="form-group">
          <label>Email *</label>
          <input
            {...register("email")}
            type="email"
            placeholder="Enter your email"
          />
          {formState.errors.email && (
            <span className="error">{formState.errors.email}</span>
          )}
        </div>

        <div className="form-group">
          <label>Age *</label>
          <input
            {...register("age")}
            type="number"
            placeholder="Enter your age"
          />
          {formState.errors.age && (
            <span className="error">{formState.errors.age}</span>
          )}
        </div>

        <button type="submit" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? "Submitting..." : "Submit"}
        </button>

        <button
          type="button"
          onClick={() => reset()}
          style={{ marginLeft: "1rem" }}
        >
          Reset
        </button>
      </form>

      {submitResult && (
        <div className="success">
          <strong>Submitted successfully!</strong>
          <br />
          {JSON.stringify(submitResult.data, null, 2)}
        </div>
      )}
    </div>
  );
}
