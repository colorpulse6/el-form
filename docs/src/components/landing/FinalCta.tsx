import React from "react";
import { ArrowIcon, GithubIcon } from "./Icons";
import { InstallCommand } from "./InstallCommand";
import { LINKS } from "./links";

export function FinalCta() {
  return (
    <section className="final" id="get-started">
      <div className="wrap">
        <div className="card final-card reveal">
          <span className="glow-edge" aria-hidden="true" />
          <span className="eyebrow" style={{ justifyContent: "center" }}>
            Ship the form, not the boilerplate
          </span>
          <h2>
            From schema to form in <em>one line.</em>
          </h2>
          <p>
            Install the package, point AutoForm at a schema, and you have a validated form. Reach for
            the hook the moment you need the wheel.
          </p>
          <InstallCommand />
          <div className="cta-row">
            <a className="btn btn-primary" href={LINKS.docs}>
              Get Started
              <ArrowIcon />
            </a>
            <a className="btn btn-ghost" href={LINKS.github}>
              <GithubIcon />
              GitHub
            </a>
          </div>
          <div className="final-links">
            <a href={LINKS.docs}>Documentation</a>
            <a href={LINKS.github}>github.com/colorpulse6/el-form</a>
            <a href={LINKS.npm}>npmjs.com/el-form-react</a>
          </div>
        </div>
      </div>
    </section>
  );
}
