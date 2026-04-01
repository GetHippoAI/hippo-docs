---
sidebar_position: 3
title: Defining Tools
---

# Defining Tools

Tools are the core of your plugin. They define what capabilities your plugin provides to the AI assistant.

## Tool Definition Structure

Each tool is an object with three required fields:

```typescript
{
  name: 'create_event',
  description: 'Create a new calendar event with a title, date, and optional description',
  parameters: {
    type: 'object',
    properties: {
      title: { type: 'string', description: 'Event title' },
      date: { type: 'string', description: 'Event date in ISO 8601 format' },
      description: { type: 'string', description: 'Optional event description' },
    },
    required: ['title', 'date'],
  },
}
```

## How the AI Decides When to Use Your Tool

The AI reads the `description` field to understand what the tool does. When a user sends a message, the AI:

1. Analyzes the user's intent
2. Reviews available tools and their descriptions
3. Selects the best matching tool(s)
4. Extracts parameters from the user's message
5. Calls the tool with those parameters

:::warning Description is Critical
The tool description is the most important field. A vague description leads to the AI using your tool incorrectly or not at all.
:::

### Good vs Bad Descriptions

| Bad | Good |
|-----|------|
| `Get weather` | `Get current weather conditions and 5-day forecast for a specific city` |
| `Track price` | `Start tracking the price of a product from an e-commerce URL and notify when price drops` |
| `Send email` | `Draft and send an email to a recipient with subject and body content` |

## Parameter Types

Tools use JSON Schema to define parameters. Supported types:

### String

```typescript
{
  type: 'string',
  description: 'User email address',
}
```

### Number

```typescript
{
  type: 'number',
  description: 'Temperature in Celsius',
}
```

### Integer

```typescript
{
  type: 'integer',
  description: 'Number of items (whole number)',
}
```

### Boolean

```typescript
{
  type: 'boolean',
  description: 'Whether to include archived items',
}
```

### Array

```typescript
{
  type: 'array',
  items: { type: 'string' },
  description: 'List of tags',
}
```

### Object

```typescript
{
  type: 'object',
  properties: {
    street: { type: 'string' },
    city: { type: 'string' },
    zip: { type: 'string' },
  },
  description: 'Shipping address',
}
```

### Enum (String with Options)

```typescript
{
  type: 'string',
  enum: ['low', 'medium', 'high'],
  description: 'Priority level',
}
```

## Required vs Optional Parameters

Use the `required` array to specify which parameters are mandatory:

```typescript
parameters: {
  type: 'object',
  properties: {
    city: { type: 'string', description: 'City name (required)' },
    units: { type: 'string', enum: ['celsius', 'fahrenheit'], description: 'Temperature units (optional, defaults to celsius)' },
  },
  required: ['city'],  // Only city is required
}
```

:::tip
Keep required parameters to a minimum. The AI can provide reasonable defaults for optional parameters, making the user experience smoother.
:::

## Best Practices

### 1. Use Clear, Action-Oriented Names

Tool names should be verbs that describe the action:

```typescript
// Good
'create_reminder', 'get_weather', 'search_emails', 'track_price'

// Bad
'reminder', 'weather_tool', 'email', 'price'
```

### 2. Write Detailed Descriptions

Include:
- What the tool does
- When to use it
- What it returns

```typescript
description: 'Search for emails in the user\'s Gmail inbox by sender, subject, or content. Returns a list of matching emails with sender, subject, date, and snippet. Use this when the user wants to find specific emails.'
```

### 3. Document Parameter Formats

Be explicit about expected formats:

```typescript
{
  date: {
    type: 'string',
    description: 'Date in ISO 8601 format (e.g., 2025-01-15T14:30:00Z)',
  },
  phone: {
    type: 'string',
    description: 'Phone number in E.164 format (e.g., +905551234567)',
  },
}
```

### 4. Provide Default Values in Descriptions

```typescript
{
  limit: {
    type: 'integer',
    description: 'Maximum number of results to return (default: 10, max: 100)',
  },
}
```

## Complete Example

Here's a complete tool definition for a price tracking plugin:

```typescript
export const manifest = {
  slug: 'price-tracker',
  name: 'Price Tracker',
  description: 'Track product prices and get notified on price drops',
  version: '1.0.0',
  icon: '🏷️',
  category: 'finance',
  author: 'Hippo',

  tools: [
    {
      name: 'track_price',
      description: 'Start tracking the price of a product. Provide the product URL from supported e-commerce sites (Amazon, Trendyol, Hepsiburada). The system will check prices daily and notify the user when the price drops below the target.',
      parameters: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description: 'Full product URL from an e-commerce website',
          },
          targetPrice: {
            type: 'number',
            description: 'Target price to trigger notification (optional). If not provided, notifies on any price drop.',
          },
        },
        required: ['url'],
      },
    },
    {
      name: 'get_tracked_prices',
      description: 'Get a list of all products the user is currently tracking, including current prices and price history.',
      parameters: {
        type: 'object',
        properties: {
          includeHistory: {
            type: 'boolean',
            description: 'Whether to include price history (default: false)',
          },
        },
      },
    },
    {
      name: 'stop_tracking_price',
      description: 'Stop tracking a product price. Use this when the user no longer wants to monitor a product.',
      parameters: {
        type: 'object',
        properties: {
          productId: {
            type: 'string',
            description: 'The ID of the tracked product (from get_tracked_prices)',
          },
        },
        required: ['productId'],
      },
    },
  ],
};
```
