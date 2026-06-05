import React from "react";

const CHIPS = ["Zod v3 / v4", "Yup", "Valibot", "Custom function"];

export function ValidationRow() {
  return (
    <section className="validation" id="validation">
      <div className="wrap">
        <div className="card val-panel reveal">
          <div className="val-grid">
            <div className="section-head" style={{ margin: 0 }}>
              <span className="eyebrow">Validation-agnostic</span>
              <h2 style={{ fontSize: "clamp(28px, 3.6vw, 42px)" }}>
                Bring your own <em>validation.</em>
              </h2>
              <p style={{ marginTop: 14 }}>
                Swap validators without rewriting the form. The schema is an input, not a lock-in —
                start with Zod today, move to Valibot tomorrow, drop validation entirely for a
                prototype.
              </p>
            </div>
            <div>
              <div className="chips">
                {CHIPS.map((label) => (
                  <span className="chip" key={label}>
                    <span className="v" />
                    {label}
                  </span>
                ))}
                <span className="chip none">
                  <span className="v" />
                  None
                </span>
              </div>
              <p className="val-foot">
                One form component. <code>schema</code> in, validated <code>data</code> out — whatever
                the source.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
