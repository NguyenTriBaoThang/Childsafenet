import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/Childsafenet/__docusaurus/debug',
    component: ComponentCreator('/Childsafenet/__docusaurus/debug', '1a7'),
    exact: true
  },
  {
    path: '/Childsafenet/__docusaurus/debug/config',
    component: ComponentCreator('/Childsafenet/__docusaurus/debug/config', '9aa'),
    exact: true
  },
  {
    path: '/Childsafenet/__docusaurus/debug/content',
    component: ComponentCreator('/Childsafenet/__docusaurus/debug/content', 'a64'),
    exact: true
  },
  {
    path: '/Childsafenet/__docusaurus/debug/globalData',
    component: ComponentCreator('/Childsafenet/__docusaurus/debug/globalData', 'd24'),
    exact: true
  },
  {
    path: '/Childsafenet/__docusaurus/debug/metadata',
    component: ComponentCreator('/Childsafenet/__docusaurus/debug/metadata', '919'),
    exact: true
  },
  {
    path: '/Childsafenet/__docusaurus/debug/registry',
    component: ComponentCreator('/Childsafenet/__docusaurus/debug/registry', 'e05'),
    exact: true
  },
  {
    path: '/Childsafenet/__docusaurus/debug/routes',
    component: ComponentCreator('/Childsafenet/__docusaurus/debug/routes', 'd5f'),
    exact: true
  },
  {
    path: '/Childsafenet/docs',
    component: ComponentCreator('/Childsafenet/docs', '2c8'),
    routes: [
      {
        path: '/Childsafenet/docs',
        component: ComponentCreator('/Childsafenet/docs', 'ea4'),
        routes: [
          {
            path: '/Childsafenet/docs',
            component: ComponentCreator('/Childsafenet/docs', '5b0'),
            routes: [
              {
                path: '/Childsafenet/docs/',
                component: ComponentCreator('/Childsafenet/docs/', 'a19'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/Childsafenet/docs/ai-training-option-b',
                component: ComponentCreator('/Childsafenet/docs/ai-training-option-b', '9e1'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/Childsafenet/docs/api-reference',
                component: ComponentCreator('/Childsafenet/docs/api-reference', '95e'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/Childsafenet/docs/architecture',
                component: ComponentCreator('/Childsafenet/docs/architecture', '19d'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/Childsafenet/docs/backlog',
                component: ComponentCreator('/Childsafenet/docs/backlog', '72e'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/Childsafenet/docs/contributing',
                component: ComponentCreator('/Childsafenet/docs/contributing', '225'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/Childsafenet/docs/extension',
                component: ComponentCreator('/Childsafenet/docs/extension', 'b2a'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/Childsafenet/docs/faq',
                component: ComponentCreator('/Childsafenet/docs/faq', '93d'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/Childsafenet/docs/getting-started',
                component: ComponentCreator('/Childsafenet/docs/getting-started', 'd10'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/Childsafenet/docs/ml-evaluation-metrics',
                component: ComponentCreator('/Childsafenet/docs/ml-evaluation-metrics', '40a'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/Childsafenet/docs/roadmap',
                component: ComponentCreator('/Childsafenet/docs/roadmap', 'd61'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/Childsafenet/docs/security',
                component: ComponentCreator('/Childsafenet/docs/security', '68f'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/Childsafenet/docs/user-guide-admin',
                component: ComponentCreator('/Childsafenet/docs/user-guide-admin', 'd72'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/Childsafenet/docs/user-guide-parent',
                component: ComponentCreator('/Childsafenet/docs/user-guide-parent', 'd1d'),
                exact: true,
                sidebar: "docsSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/Childsafenet/',
    component: ComponentCreator('/Childsafenet/', 'f48'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
