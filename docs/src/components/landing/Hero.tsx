import React from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import { ArrowIcon, GithubIcon } from "./Icons";
import { HeroCode } from "./Code";
import { StaticFormCard } from "./StaticFormCard";
import { InstallCommand } from "./InstallCommand";
import { LINKS } from "./links";

export function Hero() {
  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <span className="eyebrow reveal" data-d="1">
            TypeScript-first React forms
          </span>
          <h1 className="reveal" data-d="2">
            Elegant React forms,
            <br />
            <span className="it">with</span> or <span className="ac">without</span> the boilerplate.
          </h1>
          <p className="sub reveal" data-d="3">
            Generate a complete, validated form from a schema with <b>AutoForm</b> — or take full
            control with the <b>useForm</b> hook. Bring Zod, Yup, Valibot, a custom validator, or
            none.
          </p>
          <div className="cta-row reveal" data-d="4">
            <a className="btn btn-primary" href={LINKS.docs}>
              Get Started
              <ArrowIcon />
            </a>
            <a className="btn btn-ghost" href={LINKS.github}>
              <GithubIcon />
              GitHub
            </a>
          </div>
          <div className="reveal" data-d="5">
            <InstallCommand />
          </div>
          <div className="hero-meta reveal" data-d="6">
            <span>
              <span className="dot" />
              React 16.8+
            </span>
            <span>
              <span className="dot" />
              Zero dependencies on a validator
            </span>
            <span>
              <span className="dot" />
              MIT licensed
            </span>
          </div>
        </div>

        <div className="hero-visual reveal" data-d="4">
          <div className="stack">
            <div className="card code-card">
              <div className="code-head">
                <span className="dots">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="file">
                  ContactForm<span className="tsx">.tsx</span>
                </span>
                <span className="badge">AutoForm</span>
              </div>
              <HeroCode />
            </div>

            {/* Live form is client-only (El Form's useForm touches browser
                globals at init); the static card is the SSR/first-paint fallback. */}
            <BrowserOnly fallback={<StaticFormCard />}>
              {() => {
                const { HeroForm } = require("./HeroForm");
                return <HeroForm />;
              }}
            </BrowserOnly>
          </div>
        </div>
      </div>
    </section>
  );
}
