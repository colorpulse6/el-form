import React from "react";
import { FEATURE_ICONS } from "./Icons";

const FEATURES = [
  {
    title: "Type-safe inference",
    body: "Field names, values, and errors are inferred from your schema. The compiler catches typos before your users do.",
  },
  {
    title: "Minimal re-renders",
    body: "State is isolated per field, so typing in one input doesn't re-render the whole form. Fast by default, even at scale.",
  },
  {
    title: "Styled out of the box",
    body: "AutoForm ships clean, accessible defaults you can theme — or override entirely. Beautiful before you touch the CSS.",
  },
  {
    title: "RHF-compatible API",
    body: "useForm mirrors React Hook Form's surface — register, handleSubmit, formState. Migrate with muscle memory intact.",
  },
  {
    title: "Modular packages",
    body: "Install only the layer you need — hooks, components, or both. No mandatory UI bundle riding along for the trip.",
  },
  {
    title: "Framework-friendly",
    body: "Works with Next.js, Vite, Remix, and CRA. React 16.8 and up — wherever your app already lives, El Form fits.",
  },
];

export function FeatureGrid() {
  return (
    <section className="features" id="features">
      <div className="wrap">
        <div className="section-head reveal">
          <span className="eyebrow">Why El Form</span>
          <h2>
            Built for developers who want <em>control</em> and convenience.
          </h2>
        </div>
        <div className="feat-grid">
          {FEATURES.map((f, i) => (
            <div className="feat reveal" data-d={(i % 6) + 1} key={f.title}>
              <span className="num">{String(i + 1).padStart(2, "0")}</span>
              <span className="ficon" aria-hidden="true">
                {FEATURE_ICONS[i]}
              </span>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
