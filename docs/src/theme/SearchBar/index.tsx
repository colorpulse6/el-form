import BrowserOnly from "@docusaurus/BrowserOnly";

// Wrap the plugin's SearchBar so it only renders on the client.
// This avoids SSR calling hooks that require docs context on pages like 404 or /search.
export default function SearchBarWrapper(props: Record<string, unknown>) {
  return (
    <BrowserOnly fallback={<div />}>
      {() => {
        // Import inside BrowserOnly to prevent SSR from evaluating the original component
        // which internally calls hooks that require docs context providers.

        const OriginalSearchBar = require("@theme-original/SearchBar").default;
        return <OriginalSearchBar {...(props as any)} />;
      }}
    </BrowserOnly>
  );
}
