---
sidebar_position: 4
title: Config Schema
---

# Config Schema

The `configSchema` property in your plugin manifest defines how users configure your plugin. Hippo supports two configuration types: **OAuth** for third-party integrations and **Form** for custom settings.

## Schema Types

### OAuth Configuration

Use OAuth configuration when your plugin integrates with external services that support OAuth 2.0.

```typescript
configSchema: {
  type: 'oauth',
  provider: 'google',
  scopes: ['https://www.googleapis.com/auth/calendar']
}
```

**Properties:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | `'oauth'` | Yes | Indicates OAuth configuration |
| `provider` | `string` | Yes | OAuth provider identifier |
| `scopes` | `string[]` | Yes | OAuth scopes to request |

**Supported Providers:**

| Provider | Description |
|----------|-------------|
| `google` | Google OAuth 2.0 (Calendar, Gmail, Drive, etc.) |
| `github` | GitHub OAuth |
| `slack` | Slack OAuth |
| `microsoft` | Microsoft OAuth (Outlook, OneDrive, etc.) |

**Example - Google Calendar:**

```typescript
configSchema: {
  type: 'oauth',
  provider: 'google',
  scopes: [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ]
}
```

**Example - Gmail:**

```typescript
configSchema: {
  type: 'oauth',
  provider: 'google',
  scopes: [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify'
  ]
}
```

### Form Configuration

Use form configuration for plugins that need user-provided settings like API keys, preferences, or custom values.

```typescript
configSchema: {
  type: 'form',
  fields: [
    {
      name: 'apiKey',
      type: 'secret',
      label: 'API Key',
      required: true,
      description: 'Your API key from the service dashboard'
    }
  ]
}
```

**Properties:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | `'form'` | Yes | Indicates form configuration |
| `fields` | `Field[]` | Yes | Array of field definitions |

## Field Types

### Text Field

Basic text input for strings.

```typescript
{
  name: 'username',
  type: 'text',
  label: 'Username',
  required: true,
  placeholder: 'Enter your username',
  description: 'Your account username'
}
```

**Properties:**

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `name` | `string` | Yes | - | Field identifier (used in `ctx.config`) |
| `type` | `'text'` | Yes | - | Field type |
| `label` | `string` | Yes | - | Display label |
| `required` | `boolean` | No | `false` | Whether field is required |
| `placeholder` | `string` | No | - | Input placeholder text |
| `description` | `string` | No | - | Help text below the field |
| `default` | `string` | No | - | Default value |
| `minLength` | `number` | No | - | Minimum character length |
| `maxLength` | `number` | No | - | Maximum character length |
| `pattern` | `string` | No | - | Regex pattern for validation |

### Number Field

Numeric input with optional min/max constraints.

```typescript
{
  name: 'refreshInterval',
  type: 'number',
  label: 'Refresh Interval (minutes)',
  required: false,
  default: 30,
  min: 5,
  max: 1440,
  description: 'How often to check for updates'
}
```

**Properties:**

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `name` | `string` | Yes | - | Field identifier |
| `type` | `'number'` | Yes | - | Field type |
| `label` | `string` | Yes | - | Display label |
| `required` | `boolean` | No | `false` | Whether field is required |
| `default` | `number` | No | - | Default value |
| `min` | `number` | No | - | Minimum value |
| `max` | `number` | No | - | Maximum value |
| `step` | `number` | No | `1` | Step increment |

### Boolean Field

Toggle switch for true/false values.

```typescript
{
  name: 'enableNotifications',
  type: 'boolean',
  label: 'Enable Notifications',
  default: true,
  description: 'Receive WhatsApp messages when prices drop'
}
```

**Properties:**

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `name` | `string` | Yes | - | Field identifier |
| `type` | `'boolean'` | Yes | - | Field type |
| `label` | `string` | Yes | - | Display label |
| `default` | `boolean` | No | `false` | Default value |
| `description` | `string` | No | - | Help text |

### Select Field

Dropdown for predefined options.

```typescript
{
  name: 'temperatureUnit',
  type: 'select',
  label: 'Temperature Unit',
  required: true,
  default: 'celsius',
  options: [
    { value: 'celsius', label: 'Celsius' },
    { value: 'fahrenheit', label: 'Fahrenheit' }
  ]
}
```

**Properties:**

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `name` | `string` | Yes | - | Field identifier |
| `type` | `'select'` | Yes | - | Field type |
| `label` | `string` | Yes | - | Display label |
| `required` | `boolean` | No | `false` | Whether field is required |
| `default` | `string` | No | - | Default selected value |
| `options` | `Option[]` | Yes | - | Available options |

**Option Structure:**

```typescript
interface Option {
  value: string;  // Stored value
  label: string;  // Display text
}
```

### Secret Field

Masked input for sensitive values like API keys and tokens.

```typescript
{
  name: 'apiKey',
  type: 'secret',
  label: 'API Key',
  required: true,
  placeholder: 'sk-...',
  description: 'Get your API key from the dashboard'
}
```

**Properties:**

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `name` | `string` | Yes | - | Field identifier |
| `type` | `'secret'` | Yes | - | Field type |
| `label` | `string` | Yes | - | Display label |
| `required` | `boolean` | No | `false` | Whether field is required |
| `placeholder` | `string` | No | - | Input placeholder |
| `description` | `string` | No | - | Help text |

:::warning Security
Secret fields are encrypted at rest and never exposed in API responses. They are only available to your handler via `ctx.config`.
:::

## Complete Examples

### Weather Plugin (No Config)

```typescript
export const manifest = {
  slug: 'weather',
  name: 'Weather',
  // ... other fields
  configSchema: {}  // No configuration needed
};
```

### Price Tracker (Form Config)

```typescript
export const manifest = {
  slug: 'price-tracker',
  name: 'Price Tracker',
  // ... other fields
  configSchema: {
    type: 'form',
    fields: [
      {
        name: 'notifyOnDrop',
        type: 'boolean',
        label: 'Notify on Price Drop',
        default: true,
        description: 'Send a WhatsApp message when tracked prices decrease'
      },
      {
        name: 'dropThreshold',
        type: 'number',
        label: 'Price Drop Threshold (%)',
        default: 5,
        min: 1,
        max: 50,
        description: 'Minimum percentage drop to trigger notification'
      },
      {
        name: 'checkInterval',
        type: 'select',
        label: 'Check Frequency',
        default: 'daily',
        options: [
          { value: 'hourly', label: 'Every hour' },
          { value: 'daily', label: 'Once a day' },
          { value: 'weekly', label: 'Once a week' }
        ]
      }
    ]
  }
};
```

### Gmail Plugin (OAuth Config)

```typescript
export const manifest = {
  slug: 'gmail',
  name: 'Gmail',
  // ... other fields
  configSchema: {
    type: 'oauth',
    provider: 'google',
    scopes: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.compose'
    ]
  }
};
```

### Custom Integration (OAuth + Form)

For plugins that need both OAuth and additional settings, use OAuth as the primary config and store additional settings in the user's installation config via the API.

```typescript
export const manifest = {
  slug: 'notion-sync',
  name: 'Notion Sync',
  // ... other fields
  configSchema: {
    type: 'oauth',
    provider: 'notion',
    scopes: ['read', 'write']
  }
  // Additional settings can be set via PUT /api/plugins/:slug/config
};
```

## Accessing Config in Handlers

Config values are available in your handler via `ctx.config`:

```typescript
async function handle_check_prices(
  params: Record<string, unknown>,
  ctx: PluginContext
): Promise<HandlerResult> {
  // Access form config values
  const notifyOnDrop = ctx.config.notifyOnDrop as boolean ?? true;
  const threshold = ctx.config.dropThreshold as number ?? 5;
  const interval = ctx.config.checkInterval as string ?? 'daily';

  // Use config values in your logic
  const products = await checkPrices(ctx.userId);

  for (const product of products) {
    const dropPercent = calculateDrop(product);
    if (notifyOnDrop && dropPercent >= threshold) {
      await sendNotification(ctx.userId, product);
    }
  }

  return {
    success: true,
    data: { checked: products.length }
  };
}
```

## Validation

Hippo validates config values against your schema:

- **Required fields** must be provided
- **Number fields** are checked against min/max constraints
- **Select fields** must match one of the defined options
- **Text fields** are validated against minLength/maxLength/pattern if specified

Invalid configurations will be rejected with a descriptive error message.
