import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import path from "path";

const config: Config = {
  title: "El Form",
  tagline: "Elegant React forms, powered by Zod",
  favicon: "img/favicon.ico",

  // Set the production url of your site here
  url: "https://colorpulse6.github.io",
  // Set the /<baseUrl>/ pathname under which your site is served
  baseUrl: "/el-form/",

  // GitHub pages deployment config.
  organizationName: "colorpulse6",
  projectName: "el-form",
  deploymentBranch: "gh-pages",
  trailingSlash: false,
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
          editUrl: "https://github.com/colorpulse6/el-form/tree/main/docs/",
        },
        blog: false,
        theme: {
          customCss: "./src/tailwind.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    async function tailwindPlugin(context, options) {
      return {
        name: "docusaurus-tailwindcss",
        configurePostCss(postcssOptions) {
          postcssOptions.plugins.push(require("@tailwindcss/postcss"));
          return postcssOptions;
        },
      };
    },
    // Custom plugin to handle monorepo Webpack configuration
    async function monorepoWebpack(context, options) {
      return {
        name: "docusaurus-monorepo-webpack",
        configureWebpack(config, isServer, utils) {
          return {
            resolve: {
              alias: {
                "el-form-react": path.resolve(
                  __dirname,
                  "../packages/el-form-react/src"
                ),
                "el-form": path.resolve(
                  __dirname,
                  "../packages/el-form-core/src"
                ),
              },
            },
          };
        },
      };
    },
  ],

  themeConfig: {
    image: "img/docusaurus-social-card.jpg",
    colorMode: {
      defaultMode: "light",
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    prism: {
      theme: require("prism-react-renderer").themes.github,
      darkTheme: require("prism-react-renderer").themes.vsDark,
      additionalLanguages: ["typescript", "jsx", "tsx"],
    },
    navbar: {
      title: "El Form",
      logo: {
        alt: "El Form Logo",
        src: "img/logo.svg",
      },
      items: [
        {
          to: "/docs/intro",
          position: "left",
          label: "Documentation",
        },
        {
          to: "/docs/quick-start",
          position: "left",
          label: "Quick Start",
        },
        {
          href: "https://github.com/colorpulse6/el-form",
          label: "GitHub",
          position: "right",
          className: "navbar__item--github",
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
              href: "https://github.com/colorpulse6/el-form",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} El Form. Built with Docusaurus.`,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
