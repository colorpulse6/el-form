import type { SandpackFiles } from "@codesandbox/sandpack-react";

const APP = `import { AutoForm } from "el-form-react-components";
import "el-form-react-components/styles.css";
import { z } from "zod";

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  email: z.string().email("Please enter a valid email"),
  age: z.number().min(18, "Must be 18 or older"),
});

export default function App() {
  return (
    <div style={{ padding: 16 }}>
      <AutoForm
        schema={schema}
        onSubmit={(data) => alert(JSON.stringify(data, null, 2))}
      />
    </div>
  );
}
`;

export const autoFormBasicFiles: SandpackFiles = { "/App.tsx": APP };
