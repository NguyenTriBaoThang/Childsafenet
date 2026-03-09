import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/Childsafenet/docs',
    component: ComponentCreator('/Childsafenet/docs', 'a1a'),
    routes: [
      {
        path: '/Childsafenet/docs',
        component: ComponentCreator('/Childsafenet/docs', '4d5'),
        routes: [
          {
            path: '/Childsafenet/docs',
            component: ComponentCreator('/Childsafenet/docs', 'af2'),
            routes: [
              {
                path: '/Childsafenet/docs/',
                component: ComponentCreator('/Childsafenet/docs/', '75e'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/Childsafenet/docs/ai-training-option-periodic',
                component: ComponentCreator('/Childsafenet/docs/ai-training-option-periodic', '17d'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/Childsafenet/docs/api-reference',
                component: ComponentCreator('/Childsafenet/docs/api-reference', '832'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/Childsafenet/docs/architecture',
                component: ComponentCreator('/Childsafenet/docs/architecture', '108'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/Childsafenet/docs/backlog',
                component: ComponentCreator('/Childsafenet/docs/backlog', '537'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/Childsafenet/docs/contributing',
                component: ComponentCreator('/Childsafenet/docs/contributing', '4a9'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/Childsafenet/docs/extension',
                component: ComponentCreator('/Childsafenet/docs/extension', '0b6'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/Childsafenet/docs/faq',
                component: ComponentCreator('/Childsafenet/docs/faq', '5ba'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/Childsafenet/docs/getting-started',
                component: ComponentCreator('/Childsafenet/docs/getting-started', '839'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/Childsafenet/docs/ml-evaluation-metrics',
                component: ComponentCreator('/Childsafenet/docs/ml-evaluation-metrics', 'e48'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/Childsafenet/docs/roadmap',
                component: ComponentCreator('/Childsafenet/docs/roadmap', '3ac'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/Childsafenet/docs/security',
                component: ComponentCreator('/Childsafenet/docs/security', '891'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/Childsafenet/docs/sponsor',
                component: ComponentCreator('/Childsafenet/docs/sponsor', '6f9'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/Childsafenet/docs/user-guide-admin',
                component: ComponentCreator('/Childsafenet/docs/user-guide-admin', '467'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/Childsafenet/docs/user-guide-parent',
                component: ComponentCreator('/Childsafenet/docs/user-guide-parent', '3d0'),
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
