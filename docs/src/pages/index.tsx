import React from "react";
import Head from "@docusaurus/Head";

import { BgLayers } from "../components/landing/BgLayers";
import { Nav } from "../components/landing/Nav";
import { Hero } from "../components/landing/Hero";
import { ApiCompare } from "../components/landing/ApiCompare";
import { ValidationRow } from "../components/landing/ValidationRow";
import { FeatureGrid } from "../components/landing/FeatureGrid";
import { FinalCta } from "../components/landing/FinalCta";
import { LandingFooter } from "../components/landing/LandingFooter";

import "../components/landing/landing.css";

const TITLE = "El Form — Elegant React forms, with or without the boilerplate";
const DESCRIPTION =
  "A TypeScript-first React form library. Generate a complete, validated form from a schema with AutoForm — or take full control with the useForm hook. Bring Zod, Yup, Valibot, a custom validator, or none.";

// Structured data so search engines treat elform.dev/ as the canonical site +
// the El Form software entity (helps the homepage rank for "el form" over the
// deep docs page, and can enable rich/sitelink results).
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://elform.dev/#website",
      url: "https://elform.dev/",
      name: "El Form",
      description: DESCRIPTION,
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://elform.dev/#software",
      name: "El Form",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web, Node.js",
      description: DESCRIPTION,
      url: "https://elform.dev/",
      downloadUrl: "https://www.npmjs.com/package/el-form-react",
      softwareHelp: "https://elform.dev/docs/intro",
      license: "https://opensource.org/licenses/MIT",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      author: {
        "@type": "Person",
        name: "Nichalas Barnes",
        url: "https://nichalasbarnes.com",
      },
    },
  ],
};

// Standalone, full-bleed marketing page rendered WITHOUT Docusaurus <Layout>,
// so the design's own sticky nav and footer are used instead of the docs chrome.
// Every style is scoped under `.elform-landing` so the dark theme never leaks
// into the light-themed docs.
export default function Home(): React.JSX.Element {
  const rootRef = React.useRef<HTMLDivElement>(null);

  // Belt-and-suspenders: after the staggered load-in, lock every reveal to its
  // resting visible state so nothing can be stranded if the timeline throttles.
  // (The CSS already defaults `.reveal` to visible, so no-JS users are fine.)
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const id = window.setTimeout(() => {
      root.querySelectorAll(".reveal").forEach((el) => el.classList.add("revealed"));
    }, 1500);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <>
      <Head>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <link rel="canonical" href="https://elform.dev/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:url" content="https://elform.dev/" />
        <meta property="og:image" content="https://elform.dev/img/docusaurus-social-card.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300..600;1,6..72,300..500&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
        />
        <script type="application/ld+json">{JSON.stringify(JSON_LD)}</script>
      </Head>

      <div className="elform-landing" ref={rootRef}>
        <BgLayers />
        <Nav />
        <main id="top">
          <Hero />
          <ApiCompare />
          <ValidationRow />
          <FeatureGrid />
          <FinalCta />
        </main>
        <LandingFooter />
      </div>
    </>
  );
}
