---
sidebar_position: 5
title: OAuth Integration
---

# OAuth Integration

Many plugins need to connect to external services on behalf of the user. Hippo provides built-in OAuth support for common providers.

## When to Use OAuth

Use OAuth when your plugin needs to:

- Access user data from Google (Gmail, Calendar, Drive)
- Post to social media (Twitter, LinkedIn)
- Integrate with productivity tools (Slack, Notion, GitHub)
- Connect to any service that uses OAuth 2.0

## Configuring OAuth in Your Plugin

Set `configSchema` with `type: 'oauth'` in your manifest:

```typescript
export const manifest = {
  slug: 'google-calendar',
  name: 'Google Calendar',
  description: 'Sync reminders and events with Google Calendar',
  version: '1.0.0',
  category: 'integration',

  tools: [
    // ... tool definitions
  ],

  configSchema: {
    type: 'oauth',
    provider: 'google',
    scopes: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ],
  },
};
```

### OAuth Schema Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | Must be `'oauth'` |
| `provider` | string | Yes | OAuth provider name |
| `scopes` | string[] | Yes | OAuth scopes to request |

## Supported Providers

| Provider | Value | Common Scopes |
|----------|-------|---------------|
| Google | `google` | `calendar`, `gmail.modify`, `drive.readonly` |
| GitHub | `github` | `repo`, `user`, `gist` |
| Slack | `slack` | `chat:write`, `channels:read` |
| Twitter | `twitter` | `tweet.read`, `tweet.write`, `users.read` |
| LinkedIn | `linkedin` | `r_liteprofile`, `w_member_social` |
| Microsoft | `microsoft` | `Mail.Read`, `Calendars.ReadWrite` |
| Notion | `notion` | (uses integration tokens) |
| Spotify | `spotify` | `user-read-private`, `playlist-modify-public` |

:::info Adding New Providers
If you need a provider that's not listed, contact the Hippo team to request support.
:::

## OAuth Flow

When a user installs a plugin with OAuth:

```
1. User installs plugin in Hippo dashboard
         ↓
2. Dashboard shows "Connect" button
         ↓
3. User clicks Connect → redirected to provider's consent screen
         ↓
4. User grants permissions
         ↓
5. Provider redirects back to Hippo with auth code
         ↓
6. Hippo exchanges code for access/refresh tokens
         ↓
7. Tokens stored in PluginInstallation.oauthData
         ↓
8. Plugin can now make API calls on user's behalf
```

## Accessing OAuth Tokens in Handlers

Tokens are available in `ctx.oauthData`:

```typescript
export async function handle_get_calendar_events(
  params: Record<string, unknown>,
  ctx: PluginContext,
): Promise<HandlerResult> {
  const accessToken = ctx.oauthData?.access_token as string;

  if (!accessToken) {
    return {
      success: false,
      error: 'Google Calendar not connected. Please connect your account in settings.',
    };
  }

  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    },
  );

  if (response.status === 401) {
    return {
      success: false,
      error: 'Calendar access expired. Please reconnect your Google account.',
    };
  }

  const data = await response.json();
  return {
    success: true,
    data: data.items,
    message: `Found ${data.items.length} events`,
  };
}
```

### oauthData Structure

```typescript
interface OAuthData {
  access_token: string;          // Current access token
  refresh_token?: string;        // Refresh token (for token renewal)
  token_type: string;            // Usually "Bearer"
  expires_in?: number;           // Token lifetime in seconds
  expires_at?: number;           // Unix timestamp when token expires
  scope?: string;                // Granted scopes
}
```

## Token Refresh Handling

Hippo automatically refreshes expired tokens when possible. However, you should still handle token expiration gracefully:

```typescript
export async function handle_send_message(
  params: Record<string, unknown>,
  ctx: PluginContext,
): Promise<HandlerResult> {
  const accessToken = ctx.oauthData?.access_token as string;

  try {
    const response = await fetch('https://api.example.com/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: params.message }),
    });

    if (response.status === 401) {
      // Token expired and couldn't be refreshed
      return {
        success: false,
        error: 'Your session has expired. Please reconnect your account.',
      };
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return {
      success: true,
      message: 'Message sent successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to send message. Please try again.',
    };
  }
}
```

## Multiple OAuth Providers

If your plugin needs multiple OAuth connections, you can use a more complex config:

```typescript
configSchema: {
  type: 'object',
  properties: {
    google: {
      type: 'oauth',
      provider: 'google',
      scopes: ['https://www.googleapis.com/auth/calendar'],
    },
    slack: {
      type: 'oauth',
      provider: 'slack',
      scopes: ['chat:write'],
    },
  },
},
```

Access tokens:

```typescript
const googleToken = ctx.oauthData?.google?.access_token;
const slackToken = ctx.oauthData?.slack?.access_token;
```

## Complete OAuth Plugin Example

```typescript
// manifest.ts
export const manifest = {
  slug: 'gmail',
  name: 'Gmail',
  description: 'Read, search, and draft emails from Gmail',
  version: '1.0.0',
  icon: '📧',
  category: 'integration',
  author: 'Hippo',

  tools: [
    {
      name: 'search_emails',
      description: 'Search emails in Gmail by sender, subject, or content',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query (e.g., "from:boss@company.com")',
          },
          maxResults: {
            type: 'integer',
            description: 'Maximum results to return (default: 10)',
          },
        },
        required: ['query'],
      },
    },
    {
      name: 'draft_email',
      description: 'Create an email draft',
      parameters: {
        type: 'object',
        properties: {
          to: { type: 'string', description: 'Recipient email address' },
          subject: { type: 'string', description: 'Email subject' },
          body: { type: 'string', description: 'Email body content' },
        },
        required: ['to', 'subject', 'body'],
      },
    },
  ],

  configSchema: {
    type: 'oauth',
    provider: 'google',
    scopes: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.compose',
    ],
  },

  i18n: {
    en: { name: 'Gmail', description: 'Read, search, and draft emails from Gmail' },
    tr: { name: 'Gmail', description: 'Gmail ile e-posta oku, ara ve taslak olustur' },
  },
};
```

```typescript
// handlers.ts
const GMAIL_API = 'https://gmail.googleapis.com/gmail/v1';

export async function handle_search_emails(
  params: Record<string, unknown>,
  ctx: PluginContext,
): Promise<HandlerResult> {
  const accessToken = ctx.oauthData?.access_token as string;
  if (!accessToken) {
    return { success: false, error: 'Gmail not connected.' };
  }

  const query = params.query as string;
  const maxResults = (params.maxResults as number) || 10;

  const response = await fetch(
    `${GMAIL_API}/users/me/messages?q=${encodeURIComponent(query)}&maxResults=${maxResults}`,
    { headers: { 'Authorization': `Bearer ${accessToken}` } },
  );

  if (!response.ok) {
    return { success: false, error: 'Failed to search emails.' };
  }

  const data = await response.json();
  return {
    success: true,
    data: data.messages || [],
    message: `Found ${data.messages?.length || 0} emails`,
  };
}

export async function handle_draft_email(
  params: Record<string, unknown>,
  ctx: PluginContext,
): Promise<HandlerResult> {
  const accessToken = ctx.oauthData?.access_token as string;
  if (!accessToken) {
    return { success: false, error: 'Gmail not connected.' };
  }

  const { to, subject, body } = params as { to: string; subject: string; body: string };

  const email = [
    `To: ${to}`,
    `Subject: ${subject}`,
    '',
    body,
  ].join('\n');

  const encodedEmail = Buffer.from(email).toString('base64url');

  const response = await fetch(`${GMAIL_API}/users/me/drafts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: { raw: encodedEmail } }),
  });

  if (!response.ok) {
    return { success: false, error: 'Failed to create draft.' };
  }

  return {
    success: true,
    message: `Draft created: "${subject}" to ${to}`,
  };
}

export const handlers = {
  'search_emails': handle_search_emails,
  'draft_email': handle_draft_email,
};
```
