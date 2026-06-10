import type { SandpackFiles } from "@codesandbox/sandpack-react";

const APP = `import { useForm } from "el-form-react-hooks";
import { z } from "zod";

// El Form is schema-agnostic — pass any validator. Here we use Zod on every
// keystroke via validators.onChange, and surface formState.errors live.
const schema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  age: z.number().min(18, "Must be 18 or older"),
});

export default function App() {
  const { register, handleSubmit, formState } = useForm({
    validators: { onChange: schema },
    defaultValues: { email: "", password: "", age: 18 },
  });

  return (
    <form
      onSubmit={handleSubmit((data) => alert(JSON.stringify(data, null, 2)))}
      style={{ display: "grid", gap: 12, maxWidth: 380, fontFamily: "sans-serif" }}
    >
      <label style={{ display: "grid", gap: 4 }}>
        Email
        <input {...register("email")} />
      </label>
      {formState.errors.email && (
        <span style={{ color: "crimson" }}>{formState.errors.email}</span>
      )}

      <label style={{ display: "grid", gap: 4 }}>
        Password
        <input type="password" {...register("password")} />
      </label>
      {formState.errors.password && (
        <span style={{ color: "crimson" }}>{formState.errors.password}</span>
      )}

      <label style={{ display: "grid", gap: 4 }}>
        Age
        <input type="number" {...register("age")} />
      </label>
      {formState.errors.age && (
        <span style={{ color: "crimson" }}>{formState.errors.age}</span>
      )}

      <button type="submit">Submit</button>
    </form>
  );
}
`;

export const validationFiles: SandpackFiles = { "/App.tsx": APP };
