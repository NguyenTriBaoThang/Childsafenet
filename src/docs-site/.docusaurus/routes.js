import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/Childsafenet/docs',
    component: ComponentCreator('/Childsafenet/docs', 'f10'),
    routes: [
      {
        path: '/Childsafenet/docs',
        component: ComponentCreator('/Childsafenet/docs', '355'),
        routes: [
          {
            path: '/Childsafenet/docs',
            component: ComponentCreator('/Childsafenet/docs', '652'),
            routes: [
              {
                path: '/Childsafenet/docs/',
                component: ComponentCreator('/Childsafenet/docs/', '82c'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/Childsafenet/docs/ai-training-option-periodic',
                component: ComponentCreator('/Childsafenet/docs/ai-training-option-periodic', '559'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/Childsafenet/docs/api-reference',
                component: ComponentCreator('/Childsafenet/docs/api-reference', '234'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/Childsafenet/docs/architecture',
                component: ComponentCreator('/Childsafenet/docs/architecture', 'c72'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/Childsafenet/docs/backlog',
                component: ComponentCreator('/Childsafenet/docs/backlog', 'aa0'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/Childsafenet/docs/contributing',
                component: ComponentCreator('/Childsafenet/docs/contributing', '773'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/Childsafenet/docs/extension',
                component: ComponentCreator('/Childsafenet/docs/extension', 'c15'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/Childsafenet/docs/faq',
                component: ComponentCreator('/Childsafenet/docs/faq', '4c6'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/Childsafenet/docs/getting-started',
                component: ComponentCreator('/Childsafenet/docs/getting-started', '39b'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/Childsafenet/docs/ml-evaluation-metrics',
                component: ComponentCreator('/Childsafenet/docs/ml-evaluation-metrics', '70b'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/Childsafenet/docs/roadmap',
                component: ComponentCreator('/Childsafenet/docs/roadmap', '86f'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/Childsafenet/docs/security',
                component: ComponentCreator('/Childsafenet/docs/security', '422'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/Childsafenet/docs/sponsor',
                component: ComponentCreator('/Childsafenet/docs/sponsor', 'da6'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/Childsafenet/docs/user-guide-admin',
                component: ComponentCreator('/Childsafenet/docs/user-guide-admin', '697'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/Childsafenet/docs/user-guide-parent',
                component: ComponentCreator('/Childsafenet/docs/user-guide-parent', '792'),
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
