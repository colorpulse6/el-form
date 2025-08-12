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
          customCss: ["./src/tailwind.css", "./src/css/custom.css"],
        },
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
    [
      "@easyops-cn/docusaurus-search-local",
      {
        hashed: true,
        language: ["en"],
        highlightSearchTermsOnTargetPage: true,
        docsRouteBasePath: ["docs"],
        indexBlog: false,
        searchContextByPaths: ["docs"],
      },
    ],
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
    // Algolia DocSearch disabled (using local search plugin instead)
    navbar: {
      title: "El Form",
      logo: {
        alt: "El Form Logo",
        src: "img/logo.png",
        href: "/docs/intro",
      },
      hideOnScroll: false,
      style: "dark",
      items: [
        {
          type: "search",
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
              html: '<a href="https://www.buymeacoffee.com/jobtoast" target="_blank" rel="noopener noreferrer" class="bmc-button-footer" aria-label="Buy Me A Coffee"></a>',
            },
          ],
        },
      ],

      copyright: `Copyright © ${new Date().getFullYear()} El Form. Built with Docusaurus.`,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
