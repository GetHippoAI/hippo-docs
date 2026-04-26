import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    'intro',
    {
      type: 'category',
      label: 'Frontend Extensions',
      collapsed: false,
      items: [
        'plugins/ui/overview',
        'plugins/ui/quickstart',
        'plugins/ui/manifest-schema',
        'plugins/ui/sidebar-pages',
        'plugins/ui/widgets',
        'plugins/ui/action-surfaces',
        'plugins/ui/host-sdk',
        'plugins/ui/permissions',
        'plugins/ui/security-model',
      ],
    },
    {
      type: 'category',
      label: 'AI Tool Plugins',
      collapsed: true,
      items: [
        'plugins/getting-started',
        'plugins/anatomy',
        'plugins/tools',
        'plugins/handlers',
        'plugins/oauth',
        'plugins/i18n',
        'plugins/publishing',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api/overview',
        'api/plugin-context',
        'api/handler-result',
        'api/config-schema',
        'api/rest-endpoints',
      ],
    },
  ],
};

export default sidebars;
