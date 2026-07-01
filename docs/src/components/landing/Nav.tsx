import React from "react";
import clsx from "clsx";
import { ArrowIcon, GithubIcon, CoffeeIcon, BrandMark } from "./Icons";
import { LINKS } from "./links";

// Sticky top nav. Gains a hairline bottom border + denser background once the
// page is scrolled past 8px.
export function Nav() {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={clsx("nav", scrolled && "scrolled")}>
      <div className="wrap nav-inner">
        <a className="brand" href="#top" aria-label="El Form home">
          <BrandMark />
          <span className="name">
            El&nbsp;<b>Form</b>
          </span>
        </a>
        <nav className="nav-links" aria-label="Primary">
          <a className="lnk" href={LINKS.docs} target="_blank" rel="noopener noreferrer">
            Docs
          </a>
          <a className="lnk" href={LINKS.npm} target="_blank" rel="noopener noreferrer">
            npm
          </a>
          <a
            className="lnk gh"
            href={LINKS.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
          >
            <GithubIcon />
            <span>GitHub</span>
          </a>
          <a
            className="lnk coffee"
            href={LINKS.coffee}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Buy me a coffee"
            title="Buy me a coffee"
          >
            <CoffeeIcon />
          </a>
          <a className="nav-cta" href={LINKS.docs}>
            Get Started
            <ArrowIcon />
          </a>
        </nav>
      </div>
    </header>
  );
}
