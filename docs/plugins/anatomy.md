---
sidebar_position: 2
title: Plugin Anatomy
---

# Plugin Anatomy

This page explains each file in a Hippo plugin and how they work together.

## File Structure Overview

```
hippo-your-plugin/
├── src/
│   ├── manifest.ts        # Plugin metadata and tool definitions
│   ├── handlers.ts        # Handler functions for each tool
│   └── index.ts           # Entry point that exports everything
├── locales/               # Translation files
│   ├── tr.json
│   ├── en.json
│   └── ... (8 more languages)
├── package.json           # npm package configuration
├── tsconfig.json          # TypeScript settings
└── README.md              # Documentation
```

## manifest.ts

The manifest defines your plugin's identity, tools, configuration, and translations.

```typescript
export const manifest = {
  // Required fields
  slug: 'my-plugin',              // Unique identifier (kebab-case)
  name: 'My Plugin',              // Human-readable name
  description: 'What it does',    // Short description
  version: '1.0.0',               // Semantic version
  category: 'utility',            // One of: integration, productivity, finance, social, utility

  // Optional fields
  icon: '🔌',                     // Emoji or icon URL
  author: 'Your Name',            // Developer name
  isOfficial: false,              // Reserved for Hippo-maintained plugins

  // Tool definitions
  tools: [
    {
      name: 'do_something',
      description: 'Does something useful',
      parameters: {
        type: 'object',
        properties: {
          input: { type: 'string', description: 'The input value' },
        },
        required: ['input'],
      },
    },
  ],

  // User configuration schema
  configSchema: {
    type: 'object',
    properties: {
      apiKey: { type: 'string', description: 'API key for the service' },
    },
  },

  // OR for OAuth-based plugins:
  // configSchema: {
  //   type: 'oauth',
  //   provider: 'google',
  //   scopes: ['https://www.googleapis.com/auth/calendar'],
  // },

  // Localized strings
  i18n: {
    en: { name: 'My Plugin', description: 'What it does' },
    tr: { name: 'Eklentim', description: 'Ne yapar' },
  },
};
```

### Manifest Fields Reference

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `slug` | string | Yes | Unique plugin identifier (kebab-case) |
| `name` | string | Yes | Display name |
| `description` | string | Yes | Short description (max 200 chars) |
| `version` | string | Yes | Semantic version (e.g., `1.0.0`) |
| `category` | string | Yes | Plugin category |
| `icon` | string | No | Emoji or icon URL |
| `author` | string | No | Developer name |
| `tools` | array | Yes | List of tool definitions |
| `configSchema` | object | No | User configuration schema |
| `i18n` | object | No | Localized strings |

## handlers.ts

Handlers contain the actual logic that runs when the AI calls a tool.

```typescript
export interface PluginContext {
  userId: string;                      // Current user's ID
  locale: string;                      // User's language (e.g., 'en', 'tr')
  currency: string;                    // User's currency (e.g., 'USD', 'TRY')
  config: Record<string, unknown>;     // Plugin-specific user settings
  oauthData?: Record<string, unknown>; // OAuth tokens (if applicable)
}

export interface HandlerResult {
  success: boolean;          // Whether the operation succeeded
  data?: unknown;            // Result data (returned to AI)
  message?: string;          // Human-readable message
  error?: string;            // Error message (if success is false)
}

// Handler for the 'do_something' tool
export async function handle_do_something(
  params: Record<string, unknown>,
  ctx: PluginContext,
): Promise<HandlerResult> {
  const input = params.input as string;

  // Your logic here
  const result = await processInput(input);

  return {
    success: true,
    data: result,
    message: 'Operation completed successfully',
  };
}

// Registry mapping tool names to handlers
export const handlers: Record<
  string,
  (params: Record<string, unknown>, ctx: PluginContext) => Promise<HandlerResult>
> = {
  'do_something': handle_do_something,
};
```

## index.ts

The entry point exports everything needed to use the plugin:

```typescript
export { manifest } from './manifest';
export { handlers } from './handlers';
export type { PluginContext, HandlerResult } from './handlers';
```

## locales/

Translation files for each supported language. Each file is a JSON object:

```json
{
  "name": "My Plugin",
  "description": "What it does",
  "tools": {
    "do_something": {
      "description": "Does something useful"
    }
  },
  "errors": {
    "invalid_input": "Invalid input provided"
  }
}
```

:::info Supported Languages
Hippo supports 10 languages: Turkish (tr), English (en), German (de), French (fr), Spanish (es), Portuguese (pt), Italian (it), Dutch (nl), Russian (ru), and Arabic (ar).
:::

## package.json

The `hippoPlugin` field in package.json provides metadata for the plugin system:

```json
{
  "name": "hippo-my-plugin",
  "version": "1.0.0",
  "description": "What it does",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsx src/index.ts"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "tsx": "^4.19.0"
  },
  "hippoPlugin": {
    "slug": "my-plugin",
    "category": "utility"
  }
}
```

The `hippoPlugin` field helps tools and IDEs identify this package as a Hippo plugin.
