import type { SandpackFiles } from "@codesandbox/sandpack-react";

export const quickStartBasicFiles: SandpackFiles = {
  "/src/App.tsx": {
    code: `import { useForm } from "el-form-react-hooks";
import "./styles.css";

export default function App(): JSX.Element {
  const { register, handleSubmit } = useForm({
    defaultValues: { email: "", message: "" },
  });

  return (
    <div className="app-shell">
      <h1 className="app-title">useForm Quick Start</h1>
      <form
        className="card"
        onSubmit={handleSubmit((data) => {
          console.log("Form data", data);
          alert("Thanks for reaching out, " + (data.email || "friend") + "!");
        })}
      >
        <label className="field">
          <span>Email</span>
          <input
            className="input"
            placeholder="you@example.com"
            {...register("email")}
          />
        </label>

        <label className="field">
          <span>Message</span>
          <textarea
            className="textarea"
            rows={4}
            placeholder="Say hello"
            {...register("message")}
          />
        </label>

        <button className="button" type="submit">
          Send
        </button>
      </form>
    </div>
  );
}
`,
  },
  "/src/main.tsx": {
    code: `import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`,
  },
  "/src/styles.css": {
    code: `:root {
  color-scheme: light dark;
  font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
}

body {
  margin: 0;
  background: linear-gradient(135deg, #f8fafc, #eef2ff);
  min-height: 100vh;
  display: grid;
  place-items: center;
}

.app-shell {
  width: min(520px, 92vw);
  display: grid;
  gap: 1.5rem;
}

.app-title {
  margin: 0;
  font-size: 1.75rem;
  text-align: center;
  color: #0f172a;
}

.card {
  background: white;
  padding: 1.75rem;
  border-radius: 1rem;
  box-shadow: 0 20px 45px -25px rgba(15, 23, 42, 0.35);
  display: grid;
  gap: 1.5rem;
}

.field {
  display: grid;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: #1e293b;
}

.input {
  border-radius: 0.65rem;
  border: 1px solid #cbd5f5;
  padding: 0.65rem 0.85rem;
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
}

.textarea {
  border-radius: 0.65rem;
  border: 1px solid #cbd5f5;
  padding: 0.65rem 0.85rem;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.textarea:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
}

.input.error {
  border-color: #f43f5e;
}

.error-message {
  color: #f43f5e;
  font-size: 0.8rem;
}

.button {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  color: white;
  font-weight: 600;
  padding: 0.75rem;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: transform 0.15s ease, filter 0.15s ease;
}

.button:hover {
  transform: translateY(-1px);
  filter: brightness(1.05);
}

.button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
}

.debug {
  background: rgba(15, 23, 42, 0.85);
  color: #e2e8f0;
  padding: 1rem;
  border-radius: 0.75rem;
  font-size: 0.8rem;
  overflow-x: auto;
}
`,
  },
  "/index.html": {
    code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>El Form Quick Start</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`,
  },
};
