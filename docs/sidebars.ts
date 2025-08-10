const sidebars = {
  docs: [
    {
      type: "category",
      label: "Getting Started",
      items: ["intro", "installation", "quick-start", "examples"],
    },
    {
      type: "category",
      label: "Concepts",
      items: [
        "concepts/philosophy",
        "concepts/validation",
        "concepts/form-state",
        "concepts/performance",
        "concepts/component-reusability",
      ],
    },
    {
      type: "category",
      label: "Guides",
      items: [
        "guides/use-form",
        "guides/auto-form",
        "guides/conditional-rendering",
        "guides/error-handling",
        "guides/async-validation",
        "guides/array-fields",
        "guides/custom-components",
        "guides/integration-with-ui-libraries",
      ],
    },
    {
      type: "category",
      label: "API Reference",
      items: [
        "api/overview",
        "api/use-form",
        "api/auto-form",
        "api/form-provider",
        "api/field-components",
      ],
    },
    "faq",
    "changelog",
  ],
};

export default sidebars;
