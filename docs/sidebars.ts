import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    {
      type: 'category',
      label: 'Getting Started',
      items: ['intro', 'quick-start'],
    },
    {
      type: 'category',
      label: 'API',
      items: ['autoform', 'useform', 'nested-arrays'],
    },
    'examples',
    'faq',
  ],
};

export default sidebars;
