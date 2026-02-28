import {themes as prismThemes} from 'prism-react-renderer';

const repoName = 'Childsafenet';
const orgName = 'NguyenTriBaoThang';

export default {
  title: 'ChildSafeNet Docs',
  tagline: 'AI Internet Safety System for Children',
  favicon: 'img/logo.svg',

  url: `https://${orgName}.github.io`,
  baseUrl: `/${repoName}/`,
  organizationName: orgName,
  projectName: repoName,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      ({
        docs: {
          sidebarPath: './sidebars.js',
          routeBasePath: '/docs',
          editUrl: `https://github.com/${orgName}/${repoName}/edit/main/docs-site/`,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    ({
      image: 'img/banner.gif',
      navbar: {
        title: 'ChildSafeNet',
        logo: {
          alt: 'ChildSafeNet Logo',
          src: 'img/logo.svg',
        },
        items: [
          {to: '/docs', label: 'Docs', position: 'left'},
          {to: '/docs/roadmap', label: 'Roadmap', position: 'left'},
          {href: 'https://github.com/NguyenTriBaoThang/Childsafenet/wiki', label: 'Wiki', position: 'left'},
          {href: 'https://t.me/childsafenet', label: 'Telegram', position: 'left'},
          {href: `https://github.com/${orgName}/${repoName}`, label: 'GitHub', position: 'right'},
        ],
      },
      footer: {
        style: 'light',
        links: [
          {
            title: 'Docs',
            items: [
              {label: 'Getting Started', to: '/docs/getting-started'},
              {label: 'Architecture', to: '/docs/architecture'},
              {label: 'Extension', to: '/docs/extension'},
            ],
          },
          {
            title: 'Community',
            items: [
              {label: 'Issues', href: `https://github.com/${orgName}/${repoName}/issues`},
              {label: 'Wiki', href: `https://github.com/${orgName}/${repoName}/wiki`},
              {label: 'Telegram', href: 'https://t.me/childsafenet'},
            ],
          },
          {
            title: 'More',
            items: [
              {label: 'Backlog', to: '/docs/backlog'},
              {label: 'Security', to: '/docs/security'},
              {label: 'Contributing', to: '/docs/contributing'},
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} ChildSafeNet ● TKT TEAM ● HUTECH`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
    }),
};
