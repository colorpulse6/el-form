import BrowserOnly from "@docusaurus/BrowserOnly";

export default function SearchPageWrapper() {
  return (
    <BrowserOnly fallback={<div />}>
      {() => {
        const Original = require("@theme-original/SearchPage").default;
        return <Original />;
      }}
    </BrowserOnly>
  );
}
