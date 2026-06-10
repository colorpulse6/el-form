import type { SandpackFiles } from "@codesandbox/sandpack-react";
import { EXAMPLE_STYLES } from "./exampleStyles";

const APP = `import { useForm } from "el-form-react-hooks";
import { z } from "zod";
import "./styles.css";

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
    <form onSubmit={handleSubmit((data) => alert(JSON.stringify(data, null, 2)))}>
      <label>
        Email
        <input {...register("email")} placeholder="you@example.com" />
      </label>
      {formState.errors.email && (
        <span className="error">{formState.errors.email}</span>
      )}

      <label>
        Password
        <input type="password" {...register("password")} />
      </label>
      {formState.errors.password && (
        <span className="error">{formState.errors.password}</span>
      )}

      <label>
        Age
        <input type="number" {...register("age")} />
      </label>
      {formState.errors.age && (
        <span className="error">{formState.errors.age}</span>
      )}

      <button type="submit">Submit</button>
    </form>
  );
}
`;

export const validationFiles: SandpackFiles = {
  "/App.tsx": APP,
  "/styles.css": EXAMPLE_STYLES,
};
