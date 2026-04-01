---
sidebar_position: 2
title: PluginContext
---

# PluginContext

The `PluginContext` interface is passed to every tool handler when it is invoked. It provides essential information about the user and their plugin configuration.

## Interface Definition

```typescript
export interface PluginContext {
  /** Unique identifier for the user */
  userId: string;

  /** User's preferred locale (BCP 47 format) */
  locale: string;

  /** User's preferred currency (ISO 4217 format) */
  currency: string;

  /** Plugin-specific configuration set by the user */
  config: Record<string, unknown>;

  /** OAuth tokens and metadata (if plugin uses OAuth) */
  oauthData?: Record<string, unknown>;
}
```

## Properties

### `userId`

**Type:** `string`

The unique identifier for the user invoking the tool. Use this to scope all data operations to the current user.

```typescript
async function handle_my_tool(params: unknown, ctx: PluginContext) {
  // Always filter by userId for data isolation
  const userNotes = await db.notes.findMany({
    where: { userId: ctx.userId }
  });
}
```

:::warning Security
Always filter database queries by `userId`. Never expose data from other users.
:::

### `locale`

**Type:** `string`

The user's preferred locale in BCP 47 format. Use this for formatting dates, numbers, and selecting translated strings.

**Supported Locales:**

| Locale | Language |
|--------|----------|
| `tr-TR` | Turkish |
| `en-US` | English (US) |
| `en-GB` | English (UK) |
| `de-DE` | German |
| `fr-FR` | French |
| `es-ES` | Spanish |
| `pt-BR` | Portuguese (Brazil) |
| `it-IT` | Italian |
| `nl-NL` | Dutch |
| `ru-RU` | Russian |
| `ar-SA` | Arabic |

**Example:**

```typescript
async function handle_get_weather(
  params: { city: string },
  ctx: PluginContext
) {
  const weather = await fetchWeather(params.city);

  // Format temperature based on locale
  const temp = new Intl.NumberFormat(ctx.locale, {
    style: 'unit',
    unit: 'celsius'
  }).format(weather.temperature);

  return {
    success: true,
    data: { temperature: temp, condition: weather.condition }
  };
}
```

### `currency`

**Type:** `string`

The user's preferred currency in ISO 4217 format. Use this for displaying prices and monetary values.

**Supported Currencies:**

| Code | Currency |
|------|----------|
| `TRY` | Turkish Lira |
| `USD` | US Dollar |
| `EUR` | Euro |
| `GBP` | British Pound |
| `JPY` | Japanese Yen |

**Example:**

```typescript
async function handle_track_price(
  params: { url: string },
  ctx: PluginContext
) {
  const product = await scrapeProduct(params.url);

  // Format price in user's currency
  const formattedPrice = new Intl.NumberFormat(ctx.locale, {
    style: 'currency',
    currency: ctx.currency
  }).format(product.price);

  return {
    success: true,
    data: { name: product.name, price: formattedPrice }
  };
}
```

### `config`

**Type:** `Record<string, unknown>`

Plugin-specific configuration values set by the user during installation or through the dashboard. The structure depends on your plugin's `configSchema`.

**Example with form config:**

```typescript
// If your configSchema defines:
// { type: 'form', fields: [{ name: 'apiKey', type: 'secret' }] }

async function handle_my_tool(params: unknown, ctx: PluginContext) {
  const apiKey = ctx.config.apiKey as string;

  if (!apiKey) {
    return {
      success: false,
      error: 'API key not configured'
    };
  }

  // Use the API key
  const client = new MyAPIClient(apiKey);
  // ...
}
```

### `oauthData`

**Type:** `Record<string, unknown> | undefined`

OAuth tokens and metadata for plugins that use OAuth authentication. This is automatically populated after the user completes the OAuth flow.

**Structure for Google OAuth:**

```typescript
interface GoogleOAuthData {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expiry_date: number;
  scope: string;
  email?: string;
}
```

**Example:**

```typescript
async function handle_get_calendar_events(
  params: { days: number },
  ctx: PluginContext
) {
  if (!ctx.oauthData?.access_token) {
    return {
      success: false,
      error: 'Google Calendar not connected. Please authorize the plugin.'
    };
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: ctx.oauthData.access_token as string,
    refresh_token: ctx.oauthData.refresh_token as string,
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  const events = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    maxResults: 10,
  });

  return {
    success: true,
    data: events.data.items
  };
}
```

## Full Example

Here is a complete example showing all context properties in use:

```typescript
import { PluginContext, HandlerResult } from './types';

export async function handle_create_expense(
  params: { amount: number; category: string; description: string },
  ctx: PluginContext
): Promise<HandlerResult> {
  // Validate OAuth (if needed)
  if (!ctx.oauthData?.access_token) {
    return {
      success: false,
      error: 'Please connect your bank account first.'
    };
  }

  // Check config
  const defaultCategory = ctx.config.defaultCategory as string | undefined;
  const category = params.category || defaultCategory || 'uncategorized';

  // Format currency based on user preferences
  const formattedAmount = new Intl.NumberFormat(ctx.locale, {
    style: 'currency',
    currency: ctx.currency
  }).format(params.amount);

  // Create expense (always scope to user)
  const expense = await db.expenses.create({
    data: {
      userId: ctx.userId,
      amount: params.amount,
      currency: ctx.currency,
      category,
      description: params.description,
    }
  });

  return {
    success: true,
    data: expense,
    message: `Expense of ${formattedAmount} recorded in ${category}.`
  };
}
```

## Best Practices

1. **Always validate `oauthData`** before using OAuth-dependent features
2. **Use `locale` for all user-facing text** including dates, numbers, and currencies
3. **Scope all data by `userId`** to ensure data isolation
4. **Provide sensible defaults** when `config` values are missing
5. **Handle token expiry** gracefully for OAuth plugins
