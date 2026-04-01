---
sidebar_position: 7
title: Publishing
---

# Publishing Your Plugin

Once your plugin is ready, you can register it with the Hippo backend to make it available to users.

## Plugin Registration Process

There are two ways to publish a plugin:

1. **Official Plugins** - Maintained by the Hippo team, built into the core
2. **Community Plugins** - Submitted by developers, reviewed before marketplace listing

## Registering as an Official Plugin

Official plugins are bundled with the Hippo backend. This process is for Hippo team members or approved contributors.

### 1. Add to plugin_seed.ts

Edit `hippo-backend/apps/api/src/core/services/plugin_seed.ts`:

```typescript
import { PluginManifest } from './plugin_registry';

const OFFICIAL_PLUGINS: PluginManifest[] = [
  // ... existing plugins ...

  {
    slug: 'your-plugin',
    name: 'Your Plugin',
    description: 'What your plugin does',
    version: '1.0.0',
    icon: '🔌',
    category: 'utility',
    author: 'Hippo',
    isOfficial: true,
    trustLevel: 'official',
    reviewStatus: 'approved',
    permissions: ['permission:read'],
    tools: [
      {
        name: 'your_tool',
        description: 'What this tool does',
        parameters: {
          type: 'object',
          properties: {
            input: { type: 'string', description: 'Input value' },
          },
          required: ['input'],
        },
      },
    ],
    configSchema: {
      // OAuth or custom config
    },
    i18n: {
      en: { name: 'Your Plugin', description: 'What your plugin does' },
      tr: { name: 'Eklentin', description: 'Eklentinin aciklamasi' },
    },
  },
];
```

### 2. Add Handlers to hippo-ai

Copy your handler file to `hippo-ai/src/core/engine/handlers/` and register it in the handler registry.

### 3. Deploy

Push changes to the main branch. Coolify will auto-deploy both `hippo-backend` and `hippo-ai`.

## Submitting a Community Plugin

Community plugins go through a review process before appearing in the marketplace.

### 1. Prepare Your Plugin

Ensure your plugin has:

- Complete `manifest.ts` with all required fields
- Working handlers in `handlers.ts`
- Translations for at least English and Turkish in `locales/`
- A `README.md` with documentation
- Source code hosted on GitHub (public or private)

### 2. Submit for Review

Use the Hippo Developer API to submit your plugin:

```bash
curl -X POST https://api.gethippo.ai/v1/plugins/submit \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "your-plugin",
    "name": "Your Plugin",
    "description": "What your plugin does",
    "version": "1.0.0",
    "icon": "🔌",
    "category": "utility",
    "author": "Your Name",
    "homepage": "https://github.com/yourname/hippo-your-plugin",
    "sourceUrl": "https://github.com/yourname/hippo-your-plugin",
    "tools": [...],
    "configSchema": {...},
    "i18n": {...},
    "permissions": ["permission:read"]
  }'
```

### 3. Review Process

The Hippo team will review your submission for:

| Check | Description |
|-------|-------------|
| Security | No malicious code, safe API usage |
| Quality | Proper error handling, clear descriptions |
| Functionality | Tools work as described |
| Documentation | Clear README, complete translations |
| Compliance | Follows Hippo guidelines |

Review typically takes 3-5 business days.

### 4. Approval

Once approved:
- Plugin status changes to `approved`
- Trust level set to `verified`
- Plugin appears in the public marketplace
- Users can install and use your plugin

### 5. Rejection

If rejected, you'll receive feedback with:
- Reason for rejection
- Specific issues to fix
- Suggestions for improvement

You can resubmit after addressing the feedback.

## Version Management

### Semantic Versioning

Follow [SemVer](https://semver.org/) for version numbers:

- **MAJOR** (1.0.0 -> 2.0.0): Breaking changes
- **MINOR** (1.0.0 -> 1.1.0): New features, backwards compatible
- **PATCH** (1.0.0 -> 1.0.1): Bug fixes

### Updating an Existing Plugin

To update a published plugin:

1. Increment the version number in `manifest.ts`
2. Update the `version` in `package.json`
3. Document changes in a CHANGELOG
4. Submit the update for review

```bash
curl -X PUT https://api.gethippo.ai/v1/plugins/your-plugin \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "version": "1.1.0",
    "description": "Updated description",
    "tools": [...],
    "changelog": "Added new feature X, fixed bug Y"
  }'
```

:::warning Breaking Changes
If you make breaking changes (remove tools, change parameter names), increment the MAJOR version. Existing users may have automations that depend on your current API.
:::

## Plugin Permissions

Declare what your plugin needs access to:

| Permission | Description |
|------------|-------------|
| `calendar:read` | Read calendar events |
| `calendar:write` | Create/update calendar events |
| `email:read` | Read emails |
| `email:write` | Draft emails |
| `email:send` | Send emails |
| `notes:read` | Read user's notes |
| `notes:write` | Create/update notes |
| `tasks:read` | Read tasks |
| `tasks:write` | Create/update tasks |
| `reminders:read` | Read reminders |
| `reminders:write` | Create/update reminders |
| `links:read` | Read saved links |
| `links:write` | Save links |
| `lists:read` | Read lists |
| `lists:write` | Create/update lists |
| `documents:read` | Read documents |
| `documents:write` | Create/update documents |
| `finance:read` | Read financial data |
| `finance:write` | Modify financial data |
| `location:read` | Access user's location |
| `notifications:send` | Send notifications |

Users must grant these permissions when installing your plugin.

## Plugin Guidelines

### Do

- Write clear, accurate tool descriptions
- Handle errors gracefully
- Respect user data and privacy
- Keep dependencies minimal
- Test thoroughly before submitting

### Don't

- Store sensitive data unnecessarily
- Make excessive API calls
- Include tracking or analytics without disclosure
- Copy functionality from official plugins
- Use misleading names or descriptions

## Getting Help

If you have questions about plugin development:

- Check the [documentation](/)
- Join the [Hippo Discord](https://discord.gg/hippo)
- Email developers@gethippo.ai
- Open an issue on [GitHub](https://github.com/GetHippoAI)
