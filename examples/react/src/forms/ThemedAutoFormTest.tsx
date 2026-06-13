import { z } from "zod";
import { AutoForm } from "el-form-react-components";

/**
 * Themed AutoForm Test
 *
 * Renders the SAME schema four times to visually compare the built-in
 * theming presets (`theme="default" | "dark" | "minimal"`) plus a
 * `classNames` slot override that proves cascade-override works without
 * Tailwind. Styling comes entirely from
 * `el-form-react-components/styles.css` (`@layer el-form` + `--el-form-*`
 * tokens), imported in `main.tsx`.
 */

const schema = z.object({
  name: z.string().min(2, "Min 2 chars"),
  email: z.string().email("Invalid email"),
  role: z.enum(["admin", "user", "guest"]),
  bio: z.string().optional(),
  subscribe: z.boolean().optional(),
});

const fields = [
  { name: "name", placeholder: "Ada Lovelace" },
  { name: "email", placeholder: "ada@example.com" },
  { name: "role" },
  { name: "bio", type: "textarea" as const, placeholder: "A short bio (optional)" },
  { name: "subscribe", label: "Subscribe to updates" },
];

const initialValues = {
  name: "",
  email: "",
  role: "user" as const,
  bio: "",
  subscribe: false,
};

const sectionStyle: React.CSSProperties = {
  marginBottom: 40,
};

const headingStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 600,
  marginBottom: 12,
};

export function ThemedAutoFormTest() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      {/* Inline style proving a classNames slot override cascades over the base class. */}
      <style>{`.custom-submit{ background:#7c3aed !important; border-color:#7c3aed !important; }`}</style>

      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
        Themed AutoForm
      </h1>
      <p style={{ color: "#555", marginBottom: 32 }}>
        The same schema rendered with each built-in theme preset, plus a
        per-slot <code>classNames</code> override.
      </p>

      {/* Default theme */}
      <section data-testid="theme-default" style={sectionStyle}>
        <h2 style={headingStyle}>Default theme</h2>
        <AutoForm
          schema={schema}
          theme="default"
          fields={fields}
          initialValues={initialValues}
          onSubmit={() => {}}
        />
      </section>

      {/* Dark theme — wrapped in a dark page background so it is visible. */}
      <section data-testid="theme-dark" style={sectionStyle}>
        <h2 style={headingStyle}>Dark theme</h2>
        <div style={{ background: "#0b1220", padding: 24, borderRadius: 8 }}>
          <AutoForm
            schema={schema}
            theme="dark"
            fields={fields}
            initialValues={initialValues}
            onSubmit={() => {}}
          />
        </div>
      </section>

      {/* Minimal theme */}
      <section data-testid="theme-minimal" style={sectionStyle}>
        <h2 style={headingStyle}>Minimal theme</h2>
        <AutoForm
          schema={schema}
          theme="minimal"
          fields={fields}
          initialValues={initialValues}
          onSubmit={() => {}}
        />
      </section>

      {/* classNames override — purple submit button via cascade. */}
      <section data-testid="theme-classnames" style={sectionStyle}>
        <h2 style={headingStyle}>classNames override (purple submit)</h2>
        <AutoForm
          schema={schema}
          theme="default"
          classNames={{ submitButton: "custom-submit" }}
          fields={fields}
          initialValues={initialValues}
          onSubmit={() => {}}
        />
      </section>
    </div>
  );
}

export default ThemedAutoFormTest;
