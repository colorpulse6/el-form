import React from "react";
import { ArrowIcon } from "./Icons";

// Static, non-interactive version of the contact card. Used as the SSR /
// pre-hydration fallback for <HeroForm> (which is client-only because El Form's
// useForm touches browser globals at init). It mirrors HeroForm's initial state
// exactly — Name/Email valid, Message showing the "too short" rule — so the
// swap to the live form on hydration is visually seamless.
export function StaticFormCard() {
  return (
    <div
      className="card form-card"
      role="img"
      aria-label="The form AutoForm generates from the schema: Name, Email, and Message fields with inline validation and a Submit button."
    >
      <div className="fc-head">
        <span className="fc-title">Contact</span>
        <span className="fc-tag">live demo</span>
      </div>
      <div className="field ok">
        <label>Name</label>
        <div className="inp">
          <span className="ph">Ada Lovelace</span>
        </div>
      </div>
      <div className="field ok">
        <label>Email</label>
        <div className="inp">
          <span className="ph">ada@analytical.dev</span>
        </div>
      </div>
      <div className="field err">
        <label>Message</label>
        <div className="inp area">
          <span className="ph" style={{ color: "var(--text-mute)" }}>
            Hi there
          </span>
        </div>
        <div className="msg">Message too short</div>
      </div>
      <button className="fc-submit" type="button" tabIndex={-1} aria-hidden="true">
        Submit
        <ArrowIcon />
      </button>
    </div>
  );
}
