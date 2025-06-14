import React from "react";
import { useColorMode } from "@docusaurus/theme-common";

// Custom theme toggle button with simple icons
export default function ThemeToggle(): JSX.Element {
  const { colorMode, setColorMode } = useColorMode();

  const toggleTheme = () => {
    setColorMode(colorMode === "dark" ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="navbar__toggle clean-btn"
      type="button"
      title={`Switch to ${colorMode === "dark" ? "light" : "dark"} mode`}
      aria-label={`Switch to ${colorMode === "dark" ? "light" : "dark"} mode`}
      style={{
        padding: "0.5rem",
        marginLeft: "0.5rem",
        borderRadius: "0.375rem",
        border: "1px solid var(--ifm-color-emphasis-300)",
        background: "var(--ifm-navbar-background-color)",
        transition: "all 0.2s ease-in-out",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "2.25rem",
        height: "2.25rem",
        fontSize: "1rem",
      }}
    >
      {colorMode === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
