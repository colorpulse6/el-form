import React from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";

// Inline SVGs lifted from the design reference. All share the `.icon` sizing
// class; feature icons inherit `currentColor` (mint) from their chip.

export function ArrowIcon() {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function GithubIcon() {
  return (
    <svg className="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.5v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0C17 5 18 5.3 18 5.3c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.6.8.5 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5Z" />
    </svg>
  );
}

export function CoffeeIcon() {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
      <line x1="6" y1="1" x2="6" y2="4" />
      <line x1="10" y1="1" x2="10" y2="4" />
      <line x1="14" y1="1" x2="14" y2="4" />
    </svg>
  );
}

export function CopyIcon() {
  return (
    <svg
      className="icon ic-copy"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="11" height="11" rx="2.2" />
      <path d="M5 15V6a2 2 0 0 1 2-2h9" strokeLinecap="round" />
    </svg>
  );
}

// Feature tile line-icons, indexed 0..5 to match the 6 feature tiles.
export const FEATURE_ICONS: React.ReactNode[] = [
  // 01 type-safe inference
  <svg
    key="f1"
    className="icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path d="M4 7l5-3 5 3M4 7v6l5 3 5-3V7M4 7l5 3 5-3" strokeLinejoin="round" />
    <path d="M14 14l3 2 3-2v-4l-3-2-3 2v4Z" strokeLinejoin="round" />
  </svg>,
  // 02 minimal re-renders
  <svg
    key="f2"
    className="icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8Z" strokeLinejoin="round" />
  </svg>,
  // 03 styled out of the box
  <svg
    key="f3"
    className="icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
  </svg>,
  // 04 RHF-compatible API
  <svg
    key="f4"
    className="icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path d="M8 7l-4 5 4 5M16 7l4 5-4 5M13 4l-2 16" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
  // 05 modular packages
  <svg
    key="f5"
    className="icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>,
  // 06 framework-friendly
  <svg
    key="f6"
    className="icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3Z" strokeLinejoin="round" />
    <path d="M12 3v18M4 7.5l8 4.5 8-4.5" strokeLinejoin="round" />
  </svg>,
];

// The brand mark: the El Form logo (a checkmark in a sombrero) from the docs.
// Decorative here since the "El Form" wordmark sits right beside it.
export function BrandMark() {
  const src = useBaseUrl("/img/logo.png");
  return <img className="brand-logo" src={src} alt="" aria-hidden="true" />;
}
