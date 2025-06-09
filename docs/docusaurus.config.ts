import { Config } from '@docusaurus/types';

const config: Config = {
  title: 'El Form',
  tagline: 'Elegant React forms, powered by Zod',
  url: 'https://your-username.github.io',
  baseUrl: '/el-form/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'your-username',
  projectName: 'el-form',
  deploymentBranch: 'gh-pages',
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.ts'),
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};

export default config;
