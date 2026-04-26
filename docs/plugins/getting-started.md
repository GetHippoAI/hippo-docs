---
sidebar_position: 1
title: Getting Started
---

# Getting Started with Plugin Development

:::note Two plugin systems
This section covers **AI tool plugins** — server-side handlers that expose new tools to the Hippo assistant. If you want to add **UI surfaces** to the dashboard (sidebar pages, widgets, action menus), see the [Frontend Extensions](./ui/overview) section instead.

A single plugin can ship both — they share one `slug` and one `Plugin` record. AI tool authoring is currently restricted to first-party (Hippo Team) developers.
:::

This guide walks you through creating your first Hippo plugin using the official scaffolding tool.

## Prerequisites

Before you begin, make sure you have:

- **Node.js 20+** installed ([download](https://nodejs.org/))
- **npm** (comes with Node.js)
- A code editor (VS Code recommended)

## Create a New Plugin

Run the scaffolding tool:

```bash
npx @gethippoai/create-hippo-plugin
```

The interactive prompts will ask for:

| Prompt | Description | Example |
|--------|-------------|---------|
| Plugin name | Human-readable name | `My Weather Plugin` |
| Plugin slug | Unique identifier (kebab-case) | `my-weather-plugin` |
| Description | Short description | `Get weather forecasts` |
| Category | Plugin category | `utility` |
| Developer | Your name or organization | `Hippo Community` |
| OAuth needed? | Whether you need OAuth | `No` |
| Tool names | Comma-separated tool names | `get_forecast, get_current` |

## Generated File Structure

After running the scaffolding tool, you'll have:

```
hippo-my-weather-plugin/
├── src/
│   ├── manifest.ts        # Plugin definition (tools, config, metadata)
│   ├── handlers.ts        # Tool handler functions
│   └── index.ts           # Entry point exports
├── locales/               # Translations (10 languages)
│   ├── tr.json
│   ├── en.json
│   ├── de.json
│   ├── fr.json
│   ├── es.json
│   ├── pt.json
│   ├── it.json
│   ├── nl.json
│   ├── ru.json
│   └── ar.json
├── package.json           # Dependencies and hippoPlugin metadata
├── tsconfig.json          # TypeScript configuration
└── README.md              # Plugin documentation
```

## Install Dependencies

Navigate to your plugin directory and install dependencies:

```bash
cd hippo-my-weather-plugin
npm install
```

## Build the Plugin

Compile TypeScript to JavaScript:

```bash
npm run build
```

This outputs compiled files to the `dist/` directory.

## Development Workflow

During development, you can use the dev script for quick iteration:

```bash
npm run dev
```

:::tip
The `dev` script uses `tsx` to run TypeScript directly without a build step.
:::

## Test Locally

Before integrating with Hippo, test your handlers:

```typescript
// test.ts
import { handlers } from './src/handlers';

const mockContext = {
  userId: 'test-user',
  locale: 'en',
  currency: 'USD',
  config: {},
};

async function test() {
  const result = await handlers.get_forecast({ city: 'Istanbul' }, mockContext);
  console.log(result);
}

test();
```

Run with:

```bash
npx tsx test.ts
```

## Next Steps

Now that you have a plugin scaffold, learn about:

1. [Plugin Anatomy](/plugins/anatomy) - Understanding the file structure
2. [Defining Tools](/plugins/tools) - How to define AI tools
3. [Writing Handlers](/plugins/handlers) - Implementing tool logic
4. [OAuth Integration](/plugins/oauth) - Connecting to external services
5. [Internationalization](/plugins/i18n) - Supporting multiple languages
6. [Publishing](/plugins/publishing) - Registering your plugin with Hippo
