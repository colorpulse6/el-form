import type { SandpackFiles } from "@codesandbox/sandpack-react";

// Demonstrates AutoForm's Tailwind-free theming: the `theme="dark"` preset plus
// a couple of `classNames` slots layered on top. Imports only the shipped
// stylesheet — no consumer Tailwind required.
const APP = `import { AutoForm } from "el-form-react-components";
import "el-form-react-components/styles.css";
import "./styles.css";
import { z } from "zod";

const schema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Please enter a valid email"),
  role: z.enum(["engineer", "designer", "manager"]),
});

export default function App() {
  return (
    <div style={{ padding: 16, background: "#0b1120", minHeight: "100vh" }}>
      <AutoForm
        schema={schema}
        theme="dark"
        classNames={{
          submitButton: "themed-submit",
        }}
        onSubmit={(data) => alert(JSON.stringify(data, null, 2))}
      />
    </div>
  );
}
`;

const STYLES = `/* A single unlayered class layered on top via classNames.submitButton.
   Because el-form's base styles live in @layer el-form, this wins the cascade. */
.themed-submit {
  letter-spacing: 0.02em;
  text-transform: uppercase;
  font-weight: 700;
}
`;

export const autoFormThemedFiles: SandpackFiles = {
  "/App.tsx": APP,
  "/styles.css": STYLES,
};
