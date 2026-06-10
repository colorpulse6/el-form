import type { SandpackFiles } from "@codesandbox/sandpack-react";
import { EXAMPLE_STYLES } from "./exampleStyles";

const APP = `import { useForm } from "el-form-react-hooks";
import { z } from "zod";
import "./styles.css";

const schema = z.object({
  email: z.string().email("Please enter a valid email"),
  message: z.string().min(1, "Message is required"),
});

export default function App() {
  const { register, handleSubmit, formState } = useForm({
    validators: { onChange: schema },
    defaultValues: { email: "", message: "" },
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
        Message
        <textarea {...register("message")} rows={3} placeholder="Say hello…" />
      </label>
      {formState.errors.message && (
        <span className="error">{formState.errors.message}</span>
      )}

      <button type="submit">Submit</button>
    </form>
  );
}
`;

export const useFormQuickStartFiles: SandpackFiles = {
  "/App.tsx": APP,
  "/styles.css": EXAMPLE_STYLES,
};
