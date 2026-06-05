import React from "react";
import { AutoFormCode, UseFormCode } from "./Code";

// The centerpiece: AutoForm (fast path) vs useForm (control path), side by side,
// with a circular "vs" badge floating over the gap.
export function ApiCompare() {
  return (
    <section className="two-api" id="apis">
      <div className="wrap">
        <div className="section-head reveal">
          <span className="eyebrow">Two APIs, one library</span>
          <h2>
            Start from a schema. <em>Drop down</em> to the hook when you need the wheel.
          </h2>
          <p>
            One line gets you a complete form. When a flow demands bespoke logic, the same library
            hands you full programmatic control — no migration, no rewrite.
          </p>
        </div>

        <div className="api-grid">
          <div className="api-col reveal" data-d="1">
            <div className="card api-card">
              <div className="api-top">
                <span className="api-kicker">The fast path</span>
                <div className="api-name">
                  <span className="arr">→</span> AutoForm
                </div>
                <p className="api-desc">
                  Pass a schema; get a complete, validated, styled form. Fields, errors, and submit
                  wiring are generated for you.
                </p>
                <div className="api-when">
                  <span className="k">Use when</span>
                  <span>you want a correct form now and the schema is the source of truth.</span>
                </div>
              </div>
              <AutoFormCode />
            </div>
          </div>

          <div className="api-divider" aria-hidden="true">
            <span className="vs">vs</span>
          </div>

          <div className="api-col reveal" data-d="2">
            <div className="card api-card">
              <div className="api-top">
                <span className="api-kicker">The control path</span>
                <div className="api-name">
                  <span className="arr">→</span> useForm
                </div>
                <p className="api-desc">
                  A React Hook Form-compatible hook. Register fields, own your markup, and handle
                  submission exactly how you like.
                </p>
                <div className="api-when">
                  <span className="k">Use when</span>
                  <span>the layout is custom, the logic is bespoke, or you're migrating from RHF.</span>
                </div>
              </div>
              <UseFormCode />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
