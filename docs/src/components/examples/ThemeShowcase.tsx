import BrowserOnly from "@docusaurus/BrowserOnly";
import { AutoForm } from "el-form-react";
import { z } from "zod";

// A small schema covering a few field types so the themes have something to
// render: text, email, a <select> (enum), an optional <textarea>, and a
// checkbox.
const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(["admin", "user", "guest"]),
  bio: z.string().optional(),
  subscribe: z.boolean().optional(),
});

// No-op submit handler — this showcase is about appearance, not behavior.
const noop = () => {};

/**
 * ThemeShowcase renders the SAME schema through AutoForm once per official
 * theme, plus a `classNames` override demo, so readers can see the live themes
 * on the page.
 *
 * Wrapped in <BrowserOnly> because Docusaurus server-renders pages and
 * AutoForm's file-field detection references `FileList`, which is not defined
 * in the Node SSR environment.
 */
export function ThemeShowcase() {
  return (
    <BrowserOnly
      fallback={
        <p>
          <em>Loading live theme previews…</em>
        </p>
      }
    >
      {() => (
        <div style={{ display: "grid", gap: "2.5rem", marginTop: "1.5rem" }}>
          {/* Default theme */}
          <section>
            <h4>Default theme</h4>
            <p>
              The shipped light theme — same as omitting the <code>theme</code>{" "}
              prop.
            </p>
            <AutoForm schema={schema} theme="default" onSubmit={noop} />
          </section>

          {/* Dark theme — rendered on a dark surface so it's visible on the
              light docs page. */}
          <section>
            <h4>Dark theme</h4>
            <p>
              <code>theme="dark"</code>, shown on a dark background so the
              dark-surface styling reads correctly.
            </p>
            <div
              style={{
                background: "#0b1220",
                padding: "1.5rem",
                borderRadius: "0.75rem",
              }}
            >
              <AutoForm schema={schema} theme="dark" onSubmit={noop} />
            </div>
          </section>

          {/* Minimal theme */}
          <section>
            <h4>Minimal theme</h4>
            <p>
              <code>theme="minimal"</code> — a flatter, lower-chrome variant.
            </p>
            <AutoForm schema={schema} theme="minimal" onSubmit={noop} />
          </section>

          {/* classNames override — proves the cascade: an unlayered class
              appended via classNames beats the layered base styles. */}
          <section>
            <h4>
              <code>classNames</code> override
            </h4>
            <p>
              Appending a custom class through <code>classNames</code> (here{" "}
              <code>submitButton</code>) overrides the base styling without
              specificity wars — unlayered CSS always beats the{" "}
              <code>@layer el-form</code> base.
            </p>
            <style>{".ts-custom-submit{background:#7c3aed}"}</style>
            <AutoForm
              schema={schema}
              onSubmit={noop}
              classNames={{ submitButton: "ts-custom-submit" }}
            />
          </section>
        </div>
      )}
    </BrowserOnly>
  );
}
