import React from "react";

// Three fixed, full-viewport atmosphere layers behind the content: a mint
// radial glow + cool wash, a fine blueprint grid, and an SVG grain overlay.
export function BgLayers() {
  return (
    <>
      <div className="bg-field" aria-hidden="true" />
      <div className="bg-grid" aria-hidden="true" />
      <div className="bg-grain" aria-hidden="true" />
    </>
  );
}
