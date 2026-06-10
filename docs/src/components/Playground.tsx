import React, { useEffect, useState } from "react";
import CodeBlock from "@theme/CodeBlock";
import { Sandbox } from "./Sandbox";
import {
  PLAYGROUND_EXAMPLES,
  DEFAULT_EXAMPLE_ID,
  findExample,
} from "../sandboxes/registry";

/**
 * The interactive playground: a left-hand list of examples and a panel that
 * renders the selected one. Live examples mount a <Sandbox>; static-only ones
 * (e.g. AutoForm while its field-gen bug is open) show source. The selection is
 * mirrored to the URL hash so doc sections can deep-link (`/playground#autoform`).
 */
export function Playground() {
  const [selectedId, setSelectedId] = useState<string>(DEFAULT_EXAMPLE_ID);

  useEffect(() => {
    const fromQuery = new URLSearchParams(window.location.search).get(
      "example"
    );
    if (fromQuery) setSelectedId(findExample(fromQuery).id);
  }, []);

  const select = (id: string) => {
    setSelectedId(id);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `?example=${id}`);
    }
  };

  const example = findExample(selectedId);

  return (
    <div className="row" style={{ margin: 0 }}>
      <nav
        className="col col--3"
        aria-label="Playground examples"
        style={{ paddingLeft: 0 }}
      >
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            position: "sticky",
            top: "5rem",
          }}
        >
          {PLAYGROUND_EXAMPLES.map((e) => {
            const active = e.id === example.id;
            return (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => select(e.id)}
                  aria-current={active ? "true" : undefined}
                  className="button button--block"
                  style={{
                    justifyContent: "flex-start",
                    marginBottom: 6,
                    background: active
                      ? "var(--ifm-color-primary)"
                      : "transparent",
                    color: active ? "white" : "var(--ifm-font-color-base)",
                    border: "1px solid var(--ifm-color-emphasis-300)",
                  }}
                >
                  {e.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="col col--9">
        <h2 style={{ marginTop: 0 }}>{example.label}</h2>
        <p>{example.blurb}</p>
        {example.files ? (
          <Sandbox files={example.files} previewHeight={520} />
        ) : (
          <>
            {example.note && (
              <div
                className="admonition admonition-info alert alert--info"
                role="note"
                style={{ marginBottom: 16, padding: "12px 16px" }}
              >
                {example.note}
              </div>
            )}
            <CodeBlock language="tsx" title="App.tsx">
              {example.staticCode}
            </CodeBlock>
          </>
        )}
      </div>
    </div>
  );
}
