import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    'intro',
    {
      type: 'category',
      label: 'Plugin Development',
      collapsed: false,
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
