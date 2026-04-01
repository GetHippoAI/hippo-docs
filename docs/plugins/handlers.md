---
sidebar_position: 4
title: Writing Handlers
---

# Writing Handlers

Handlers are the functions that execute when the AI calls your tools. They receive parameters from the AI and return results that get sent back to the user.

## Handler Function Signature

Every handler follows this signature:

```typescript
async function handler(
  params: Record<string, unknown>,
  ctx: PluginContext,
): Promise<HandlerResult>
```

## PluginContext Object

The context object provides information about the current user and their settings:

```typescript
interface PluginContext {
  userId: string;                      // Unique user identifier
  locale: string;                      // User's language code (e.g., 'en', 'tr')
  currency: string;                    // User's preferred currency (e.g., 'USD', 'TRY')
  config: Record<string, unknown>;     // Plugin-specific user configuration
  oauthData?: Record<string, unknown>; // OAuth tokens (access_token, refresh_token, etc.)
}
```

### Context Fields

| Field | Description | Example |
|-------|-------------|---------|
| `userId` | Unique identifier for the user | `clk123abc...` |
| `locale` | ISO 639-1 language code | `en`, `tr`, `de` |
| `currency` | ISO 4217 currency code | `USD`, `EUR`, `TRY` |
| `config` | User's plugin settings | `{ apiKey: '...' }` |
| `oauthData` | OAuth credentials (if applicable) | `{ access_token: '...' }` |

## HandlerResult Object

Handlers return a result object:

```typescript
interface HandlerResult {
  success: boolean;          // Whether the operation succeeded
  data?: unknown;            // Result data (sent to AI)
  message?: string;          // Human-readable success message
  error?: string;            // Error message (when success is false)
}
```

### Success Response

```typescript
return {
  success: true,
  data: {
    events: [
      { id: '1', title: 'Meeting', date: '2025-01-15T14:00:00Z' },
      { id: '2', title: 'Lunch', date: '2025-01-15T12:00:00Z' },
    ],
    count: 2,
  },
  message: 'Found 2 events for today',
};
```

### Error Response

```typescript
return {
  success: false,
  error: 'Failed to connect to Google Calendar. Please reconnect your account.',
};
```

## Error Handling Best Practices

### 1. Catch and Transform Errors

```typescript
export async function handle_get_weather(
  params: Record<string, unknown>,
  ctx: PluginContext,
): Promise<HandlerResult> {
  const city = params.city as string;

  try {
    const weather = await weatherApi.getCurrent(city);
    return {
      success: true,
      data: weather,
      message: `Current weather in ${city}: ${weather.temp}C, ${weather.condition}`,
    };
  } catch (error) {
    // Log the full error internally
    console.error('Weather API error:', error);

    // Return a user-friendly message
    if (error instanceof NotFoundError) {
      return {
        success: false,
        error: `Could not find weather data for "${city}". Please check the city name.`,
      };
    }

    return {
      success: false,
      error: 'Failed to fetch weather data. Please try again later.',
    };
  }
}
```

### 2. Validate Parameters

```typescript
export async function handle_track_price(
  params: Record<string, unknown>,
  ctx: PluginContext,
): Promise<HandlerResult> {
  const url = params.url as string;

  // Validate URL format
  if (!url || !isValidUrl(url)) {
    return {
      success: false,
      error: 'Please provide a valid product URL.',
    };
  }

  // Validate supported domains
  const supportedDomains = ['amazon.com', 'trendyol.com', 'hepsiburada.com'];
  const domain = new URL(url).hostname;
  if (!supportedDomains.some(d => domain.includes(d))) {
    return {
      success: false,
      error: `Unsupported website. Supported: ${supportedDomains.join(', ')}`,
    };
  }

  // Continue with tracking...
}
```

### 3. Handle Missing OAuth

```typescript
export async function handle_create_event(
  params: Record<string, unknown>,
  ctx: PluginContext,
): Promise<HandlerResult> {
  if (!ctx.oauthData?.access_token) {
    return {
      success: false,
      error: 'Google Calendar is not connected. Please connect your account in the Hippo dashboard.',
    };
  }

  // Continue with API call...
}
```

## Accessing External APIs

### Using fetch

```typescript
export async function handle_get_stock_price(
  params: Record<string, unknown>,
  ctx: PluginContext,
): Promise<HandlerResult> {
  const symbol = params.symbol as string;
  const apiKey = ctx.config.apiKey as string;

  const response = await fetch(
    `https://api.stockdata.com/v1/quote?symbol=${symbol}`,
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    },
  );

  if (!response.ok) {
    return {
      success: false,
      error: 'Failed to fetch stock price.',
    };
  }

  const data = await response.json();
  return {
    success: true,
    data: {
      symbol: data.symbol,
      price: data.price,
      change: data.change,
    },
    message: `${data.symbol}: $${data.price} (${data.change > 0 ? '+' : ''}${data.change}%)`,
  };
}
```

### Using OAuth Tokens

```typescript
export async function handle_search_emails(
  params: Record<string, unknown>,
  ctx: PluginContext,
): Promise<HandlerResult> {
  const query = params.query as string;
  const accessToken = ctx.oauthData?.access_token as string;

  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    },
  );

  if (response.status === 401) {
    return {
      success: false,
      error: 'Gmail access token expired. Please reconnect your account.',
    };
  }

  const data = await response.json();
  return {
    success: true,
    data: data.messages,
    message: `Found ${data.messages?.length || 0} emails matching "${query}"`,
  };
}
```

## Using Plugin Config

User-specific configuration is available in `ctx.config`:

```typescript
export async function handle_send_notification(
  params: Record<string, unknown>,
  ctx: PluginContext,
): Promise<HandlerResult> {
  const message = params.message as string;

  // Get user's configured webhook URL
  const webhookUrl = ctx.config.webhookUrl as string;
  if (!webhookUrl) {
    return {
      success: false,
      error: 'Webhook URL not configured. Please set it in plugin settings.',
    };
  }

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });

  return {
    success: true,
    message: 'Notification sent successfully',
  };
}
```

## Complete Handler Example

Here's a complete handler file for a weather plugin:

```typescript
/**
 * Weather Plugin Handlers
 */

export interface PluginContext {
  userId: string;
  locale: string;
  currency: string;
  config: Record<string, unknown>;
  oauthData?: Record<string, unknown>;
}

export interface HandlerResult {
  success: boolean;
  data?: unknown;
  message?: string;
  error?: string;
}

const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5';

export async function handle_get_weather(
  params: Record<string, unknown>,
  ctx: PluginContext,
): Promise<HandlerResult> {
  const city = params.city as string;
  const apiKey = ctx.config.apiKey as string || process.env.WEATHER_API_KEY;

  if (!city) {
    return {
      success: false,
      error: 'Please specify a city name.',
    };
  }

  try {
    const units = ctx.locale === 'en' ? 'imperial' : 'metric';
    const response = await fetch(
      `${WEATHER_API_URL}/weather?q=${encodeURIComponent(city)}&units=${units}&appid=${apiKey}`,
    );

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: false,
          error: `City "${city}" not found. Please check the spelling.`,
        };
      }
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    const tempUnit = units === 'metric' ? 'C' : 'F';

    return {
      success: true,
      data: {
        city: data.name,
        country: data.sys.country,
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        condition: data.weather[0].description,
        icon: data.weather[0].icon,
      },
      message: `${data.name}: ${Math.round(data.main.temp)}${tempUnit}, ${data.weather[0].description}`,
    };
  } catch (error) {
    console.error('Weather API error:', error);
    return {
      success: false,
      error: 'Failed to fetch weather data. Please try again.',
    };
  }
}

export async function handle_get_forecast(
  params: Record<string, unknown>,
  ctx: PluginContext,
): Promise<HandlerResult> {
  const city = params.city as string;
  const days = (params.days as number) || 5;
  const apiKey = ctx.config.apiKey as string || process.env.WEATHER_API_KEY;

  if (!city) {
    return {
      success: false,
      error: 'Please specify a city name.',
    };
  }

  try {
    const units = ctx.locale === 'en' ? 'imperial' : 'metric';
    const response = await fetch(
      `${WEATHER_API_URL}/forecast?q=${encodeURIComponent(city)}&units=${units}&cnt=${days * 8}&appid=${apiKey}`,
    );

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    const tempUnit = units === 'metric' ? 'C' : 'F';

    // Group by day
    const dailyForecasts = data.list
      .filter((_: unknown, i: number) => i % 8 === 0)
      .slice(0, days)
      .map((item: any) => ({
        date: item.dt_txt.split(' ')[0],
        temp: Math.round(item.main.temp),
        condition: item.weather[0].description,
      }));

    return {
      success: true,
      data: {
        city: data.city.name,
        forecasts: dailyForecasts,
      },
      message: `${days}-day forecast for ${data.city.name}`,
    };
  } catch (error) {
    console.error('Forecast API error:', error);
    return {
      success: false,
      error: 'Failed to fetch forecast. Please try again.',
    };
  }
}

export const handlers: Record<
  string,
  (params: Record<string, unknown>, ctx: PluginContext) => Promise<HandlerResult>
> = {
  'get_weather': handle_get_weather,
  'get_forecast': handle_get_forecast,
};
```
