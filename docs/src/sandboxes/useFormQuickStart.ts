import type { SandpackFiles } from "@codesandbox/sandpack-react";

const APP = `import { useForm } from "el-form-react-hooks";
import { z } from "zod";

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
        Message
        <textarea {...register("message")} rows={3} />
      </label>
      {formState.errors.message && (
        <span style={{ color: "crimson" }}>{formState.errors.message}</span>
      )}

      <button type="submit">Submit</button>
    </form>
  );
}
`;

export const useFormQuickStartFiles: SandpackFiles = {
  "/App.tsx": APP,
};
