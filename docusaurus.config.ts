import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Hippo Developer Docs',
  tagline: 'Build plugins for the Hippo AI assistant platform',
  favicon: 'img/favicon.svg',

  future: {
    v4: true,
  },

  url: 'https://docs.gethippo.ai',
  baseUrl: '/',

  organizationName: 'GetHippoAI',
  projectName: 'hippo-docs',

  onBrokenLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'tr'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/GetHippoAI/hippo-docs/tree/main/',
          routeBasePath: '/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'Hippo Docs',
      logo: {
        alt: 'Hippo Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docs',
          position: 'left',
          label: 'Documentation',
        },
        {
          href: 'https://github.com/GetHippoAI',
          label: 'GitHub',
          position: 'right',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            { label: 'Getting Started', to: '/' },
            { label: 'Plugin Development', to: '/plugins/getting-started' },
            { label: 'API Reference', to: '/api/overview' },
          ],
        },
        {
          title: 'Community',
          items: [
            { label: 'GitHub', href: 'https://github.com/GetHippoAI' },
            { label: 'npm', href: 'https://www.npmjs.com/org/gethippoai' },
          ],
        },
        {
          title: 'Product',
          items: [
            { label: 'Hippo Website', href: 'https://gethippo.ai' },
            { label: 'Dashboard', href: 'https://app.gethippo.ai' },
          ],
        },
      ],
      copyright: `Copyright ${new Date().getFullYear()} GetHippoAI`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'typescript'],
    },
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
