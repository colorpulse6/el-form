import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "El Form",
  tagline: "Elegant React forms, powered by Zod",
  favicon: "img/favicon.ico",

  // Set the production url of your site here
  url: "https://your-username.github.io",
  // Set the /<baseUrl>/ pathname under which your site is served
  baseUrl: "/el-form/",

  // GitHub pages deployment config.
  organizationName: "Nic Barnes",
  projectName: "el-form",
  deploymentBranch: "gh-pages",

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          // Please change this to your repo.
          editUrl: "https://github.com/your-username/el-form/tree/main/docs/",
        },
        blog: false,
        theme: {
          customCss: "./src/tailwind.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    // image: "img/docusaurus-social-card.jpg",
    navbar: {
      title: "El Form",
      logo: {
        alt: "El Form Logo",
        src: "img/logo.svg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "docs",
          position: "left",
          label: "Documentation",
        },
        {
          href: "https://github.com/your-username/el-form",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Introduction",
              to: "/docs/intro",
            },
            {
              label: "Quick Start",
              to: "/docs/quick-start",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/your-username/el-form",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} El Form. Built with Docusaurus.`,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
