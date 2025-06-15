import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/el-form/__docusaurus/debug',
    component: ComponentCreator('/el-form/__docusaurus/debug', '9fa'),
    exact: true
  },
  {
    path: '/el-form/__docusaurus/debug/config',
    component: ComponentCreator('/el-form/__docusaurus/debug/config', 'e95'),
    exact: true
  },
  {
    path: '/el-form/__docusaurus/debug/content',
    component: ComponentCreator('/el-form/__docusaurus/debug/content', '9f0'),
    exact: true
  },
  {
    path: '/el-form/__docusaurus/debug/globalData',
    component: ComponentCreator('/el-form/__docusaurus/debug/globalData', 'a15'),
    exact: true
  },
  {
    path: '/el-form/__docusaurus/debug/metadata',
    component: ComponentCreator('/el-form/__docusaurus/debug/metadata', '666'),
    exact: true
  },
  {
    path: '/el-form/__docusaurus/debug/registry',
    component: ComponentCreator('/el-form/__docusaurus/debug/registry', '5ba'),
    exact: true
  },
  {
    path: '/el-form/__docusaurus/debug/routes',
    component: ComponentCreator('/el-form/__docusaurus/debug/routes', '83e'),
    exact: true
  },
  {
    path: '/el-form/docs',
    component: ComponentCreator('/el-form/docs', '8db'),
    routes: [
      {
        path: '/el-form/docs',
        component: ComponentCreator('/el-form/docs', '17e'),
        routes: [
          {
            path: '/el-form/docs',
            component: ComponentCreator('/el-form/docs', '003'),
            routes: [
              {
                path: '/el-form/docs/advanced',
                component: ComponentCreator('/el-form/docs/advanced', '9d9'),
                exact: true
              },
              {
                path: '/el-form/docs/arrays',
                component: ComponentCreator('/el-form/docs/arrays', 'a94'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/el-form/docs/autoform',
                component: ComponentCreator('/el-form/docs/autoform', 'af4'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/el-form/docs/error-handling',
                component: ComponentCreator('/el-form/docs/error-handling', '4ab'),
                exact: true
              },
              {
                path: '/el-form/docs/examples',
                component: ComponentCreator('/el-form/docs/examples', '4aa'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/el-form/docs/faq',
                component: ComponentCreator('/el-form/docs/faq', 'a3a'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/el-form/docs/intro',
                component: ComponentCreator('/el-form/docs/intro', '30a'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/el-form/docs/quick-start',
                component: ComponentCreator('/el-form/docs/quick-start', 'ece'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/el-form/docs/useform',
                component: ComponentCreator('/el-form/docs/useform', 'f41'),
                exact: true,
                sidebar: "docs"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/el-form/',
    component: ComponentCreator('/el-form/', '954'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
