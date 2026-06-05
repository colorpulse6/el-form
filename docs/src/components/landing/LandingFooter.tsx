import React from "react";
import { BrandMark } from "./Icons";
import { LINKS } from "./links";

export function LandingFooter() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-brand">
            <a className="brand" href="#top">
              <BrandMark />
              <span className="name">
                El&nbsp;<b>Form</b>
              </span>
            </a>
            <p>
              A TypeScript-first React form library. From schema to form in one line — or drop down to
              the hook when you need the wheel.
            </p>
          </div>
          <div className="foot-cols">
            <div className="foot-col">
              <h4>Product</h4>
              <a href={LINKS.docs}>Documentation</a>
              <a href={LINKS.apis}>AutoForm &amp; useForm</a>
              <a href={LINKS.validation}>Validation</a>
              <a href={LINKS.features}>Features</a>
            </div>
            <div className="foot-col">
              <h4>Source</h4>
              <a href={LINKS.github}>GitHub</a>
              <a href={LINKS.npm}>npm</a>
              <a href={LINKS.issues}>Issues</a>
            </div>
          </div>
        </div>
        <div className="foot-bottom">
          <span className="mit">
            <span className="v" />
            MIT licensed
          </span>
          <span>
            Created by <a href={LINKS.portfolio}>Nichalas Barnes</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
