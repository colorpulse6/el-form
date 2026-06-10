import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import path from "path";
import { getElFormVersions } from "./src/sandboxes/versions";

const config: Config = {
  title: "El Form",
  tagline:
    "TypeScript-first React form library: schema-driven AutoForm + a flexible useForm hook (Zod, Yup, Valibot).",
  favicon: "img/favicon.ico",

  customFields: {
    // Pinned to the current workspace versions at build time so sandboxes never
    // go stale. main's package.json == latest published npm (Changesets bumps
    // version and publishes atomically), so this matches `npm install`.
    elFormVersions: getElFormVersions(path.resolve(__dirname, "../packages")),
  },

  // Structured data so search engines and LLMs can classify El Form as a
  // developer tool. Rendered into <head> on every page.
  headTags: [
    {
      tagName: "script",
      attributes: { type: "application/ld+json" },
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "El Form",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web, Node.js",
        description:
          "TypeScript-first React form library with schema-driven AutoForm generation and a flexible useForm hook. Works with Zod, Yup, and Valibot.",
        url: "https://elform.dev",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        license: "https://opensource.org/licenses/MIT",
        programmingLanguage: "TypeScript",
        codeRepository: "https://github.com/colorpulse6/el-form",
      }),
    },
  ],

  // Set the production url of your site here
  url: "https://elform.dev",
  // Set the /<baseUrl>/ pathname under which your site is served
  baseUrl: "/",

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
          customCss: ["./src/tailwind.css", "./src/css/custom.css"],
        },
        // Google Analytics 4. Disabled unless GA_TRACKING_ID is set in the
        // build environment, so dev builds and forks never ship a tracker.
        // To enable: create a GA4 property, then set
        // GA_TRACKING_ID=G-XXXXXXXXXX in the docs deploy workflow
        // (.github/workflows/deploy-docs.yml) before `pnpm docs:build`.
        ...(process.env.GA_TRACKING_ID
          ? {
              gtag: {
                trackingID: process.env.GA_TRACKING_ID,
                anonymizeIP: true,
              },
            }
          : {}),
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    async function tailwindPlugin() {
      return {
        name: "docusaurus-tailwindcss",
        configurePostCss(postcssOptions) {
          postcssOptions.plugins.push(require("@tailwindcss/postcss"));
          return postcssOptions;
        },
      };
    },
    // Custom plugin to handle monorepo Webpack configuration
    async function monorepoWebpack() {
      return {
        name: "docusaurus-monorepo-webpack",
        configureWebpack(_config, _isServer, _utils) {
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
    // Search temporarily disabled for stability during deployment
  ],

  themeConfig: {
    image: "img/docusaurus-social-card.jpg",
    metadata: [
      {
        name: "keywords",
        content:
          "react form library, react hook form alternative, autoform, zod forms, yup, valibot, typescript forms, schema form, react forms, formik alternative, tanstack form, ai agent forms",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
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
    // Algolia DocSearch disabled (using local search plugin instead)
    navbar: {
      title: "El Form",
      logo: {
        alt: "El Form Logo",
        src: "img/logo.png",
        href: "/",
      },
      hideOnScroll: false,
      style: "dark",
      items: [
        // Search disabled for now
        {
          to: "/playground",
          label: "Playground",
          position: "right",
        },
        {
          type: "html",
          position: "right",
          value:
            '<a href="https://github.com/colorpulse6/el-form" class="inline-flex items-center gap-1 px-3 py-2 text-sm font-semibold text-white bg-gradient-to-r from-gray-800 to-black rounded-lg hover:from-gray-700 hover:to-gray-900 hover:-translate-y-0.5 transition-all duration-200 border border-white/10 shadow-md hover:shadow-lg ml-2 no-underline hover:no-underline hover:text-white" target="_blank" rel="noopener noreferrer">⭐ GitHub</a>',
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
            {
              label: "Error Handling",
              to: "/docs/guides/error-handling",
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
        {
          title: "Support",
          items: [
            {
              html: '<a href="https://buymeacoffee.com/nicbarnes" target="_blank" rel="noopener noreferrer" class="bmc-button-footer" aria-label="Buy Me A Coffee"></a>',
            },
          ],
        },
      ],

      copyright: `Copyright © ${new Date().getFullYear()} El Form. Built with Docusaurus.`,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
