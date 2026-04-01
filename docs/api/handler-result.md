---
sidebar_position: 3
title: HandlerResult
---

# HandlerResult

The `HandlerResult` interface defines the structure that every tool handler must return. It provides a consistent way to communicate success, data, messages, and errors back to the Hippo AI engine.

## Interface Definition

```typescript
export interface HandlerResult {
  /** Whether the operation succeeded */
  success: boolean;

  /** Data to return to the AI for response generation */
  data?: unknown;

  /** Human-readable message shown to the user */
  message?: string;

  /** Error message when success is false */
  error?: string;
}
```

## Properties

### `success`

**Type:** `boolean`

Indicates whether the tool operation completed successfully. The AI uses this to determine how to respond to the user.

- `true` - Operation succeeded, AI will use `data` and `message` to formulate response
- `false` - Operation failed, AI will use `error` to explain what went wrong

### `data`

**Type:** `unknown` (optional)

Structured data returned to the AI for response generation. This can be any JSON-serializable value. The AI will interpret this data and present it to the user in a natural way.

:::tip Data Structure
Return data in a structured format that the AI can easily interpret. Use clear property names and include relevant context.
:::

**Examples:**

```typescript
// Single object
data: {
  event: {
    title: "Team Meeting",
    date: "2025-04-15",
    time: "14:00",
    location: "Conference Room A"
  }
}

// Array of items
data: {
  products: [
    { name: "iPhone 15", price: 42999, store: "Trendyol" },
    { name: "iPhone 15", price: 43499, store: "Hepsiburada" }
  ],
  lowestPrice: { store: "Trendyol", price: 42999 }
}

// Simple value
data: {
  temperature: 24,
  condition: "Sunny",
  humidity: 45
}
```

### `message`

**Type:** `string` (optional)

A human-readable message that will be shown directly to the user. Use this for confirmation messages, status updates, or supplementary information.

**Examples:**

```typescript
message: "Calendar event created successfully."
message: "3 emails found matching your search."
message: "Price tracking started. You'll be notified when the price drops."
```

:::note AI Integration
The AI may rephrase or incorporate this message into its response. Keep messages concise and informative.
:::

### `error`

**Type:** `string` (optional)

Error message to display when `success` is `false`. Be specific about what went wrong and, when possible, suggest how to fix it.

**Examples:**

```typescript
error: "Google Calendar not connected. Please authorize the plugin first."
error: "Invalid product URL. Supported stores: Trendyol, Hepsiburada, N11."
error: "Event not found. It may have been deleted."
```

## Usage Patterns

### Success with Data

Return structured data for the AI to interpret:

```typescript
async function handle_get_weather(
  params: { city: string },
  ctx: PluginContext
): Promise<HandlerResult> {
  const weather = await weatherAPI.getCurrent(params.city);

  return {
    success: true,
    data: {
      city: params.city,
      temperature: weather.temp,
      condition: weather.description,
      humidity: weather.humidity,
      wind: weather.windSpeed
    }
  };
}
```

### Success with Message

Return a simple confirmation:

```typescript
async function handle_delete_event(
  params: { eventId: string },
  ctx: PluginContext
): Promise<HandlerResult> {
  await calendarAPI.deleteEvent(params.eventId);

  return {
    success: true,
    message: "Event deleted successfully."
  };
}
```

### Success with Data and Message

Combine both for rich responses:

```typescript
async function handle_create_event(
  params: { title: string; date: string; time: string },
  ctx: PluginContext
): Promise<HandlerResult> {
  const event = await calendarAPI.createEvent({
    summary: params.title,
    start: `${params.date}T${params.time}:00`,
  });

  return {
    success: true,
    data: {
      id: event.id,
      title: event.summary,
      start: event.start.dateTime,
      link: event.htmlLink
    },
    message: `Event "${params.title}" created for ${params.date} at ${params.time}.`
  };
}
```

### Failure with Error

Return a descriptive error:

```typescript
async function handle_search_emails(
  params: { query: string },
  ctx: PluginContext
): Promise<HandlerResult> {
  if (!ctx.oauthData?.access_token) {
    return {
      success: false,
      error: "Gmail not connected. Please authorize the Gmail plugin to search your emails."
    };
  }

  try {
    const emails = await gmailAPI.search(params.query);
    return {
      success: true,
      data: { emails, count: emails.length }
    };
  } catch (err) {
    return {
      success: false,
      error: `Failed to search emails: ${err.message}`
    };
  }
}
```

### Partial Success

Handle cases where some operations succeed and others fail:

```typescript
async function handle_bulk_delete(
  params: { ids: string[] },
  ctx: PluginContext
): Promise<HandlerResult> {
  const results = await Promise.allSettled(
    params.ids.map(id => deleteItem(id))
  );

  const succeeded = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  if (failed === 0) {
    return {
      success: true,
      message: `Successfully deleted ${succeeded} items.`
    };
  }

  if (succeeded === 0) {
    return {
      success: false,
      error: `Failed to delete all ${failed} items.`
    };
  }

  return {
    success: true,
    data: { succeeded, failed },
    message: `Deleted ${succeeded} items. ${failed} items could not be deleted.`
  };
}
```

## Best Practices

### 1. Be Specific in Error Messages

```typescript
// Bad
error: "Error"

// Good
error: "Product URL not supported. Please provide a link from Trendyol, Hepsiburada, or N11."
```

### 2. Return Actionable Data

```typescript
// Bad - Raw API response
data: apiResponse

// Good - Processed, relevant data
data: {
  events: apiResponse.items.map(e => ({
    id: e.id,
    title: e.summary,
    date: e.start.date,
    time: e.start.dateTime?.split('T')[1]?.slice(0, 5)
  }))
}
```

### 3. Use Messages for Confirmations

```typescript
// Good - Clear confirmation
return {
  success: true,
  data: { trackingId: newTracking.id },
  message: "Price tracking started for iPhone 15. Current price: 42,999 TL."
};
```

### 4. Handle Edge Cases

```typescript
async function handle_get_events(
  params: { days: number },
  ctx: PluginContext
): Promise<HandlerResult> {
  const events = await getEvents(ctx.userId, params.days);

  if (events.length === 0) {
    return {
      success: true,
      data: { events: [] },
      message: `No events found in the next ${params.days} days.`
    };
  }

  return {
    success: true,
    data: { events, count: events.length }
  };
}
```

### 5. Include Context in Data

```typescript
// Include metadata that helps the AI respond better
return {
  success: true,
  data: {
    products: trackedProducts,
    count: trackedProducts.length,
    currency: ctx.currency,
    lastUpdated: new Date().toISOString()
  }
};
```

## TypeScript Type Guard

You can use a type guard to ensure your handler returns a valid result:

```typescript
function isValidHandlerResult(result: unknown): result is HandlerResult {
  if (typeof result !== 'object' || result === null) return false;
  const r = result as Record<string, unknown>;
  if (typeof r.success !== 'boolean') return false;
  if (r.error !== undefined && typeof r.error !== 'string') return false;
  if (r.message !== undefined && typeof r.message !== 'string') return false;
  return true;
}
```
