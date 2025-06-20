import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  docs: [
    "intro",
    "quick-start",
    {
      type: "category",
      label: "AutoForm",
      items: ["autoform", "autoform-arrays", "custom-components"],
    },
    {
      type: "category",
      label: "useForm",
      items: ["useform", "field-types", "useform-arrays"],
    },
    "examples",
    "faq",
  ],
};

export default sidebars;
