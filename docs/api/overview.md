---
sidebar_position: 1
title: API Overview
---

# API Overview

The Hippo Plugin API provides REST endpoints for managing plugin lifecycle operations. All endpoints require authentication via Bearer token.

## Base URL

```
https://api.gethippo.ai
```

## Authentication

All API requests require a valid JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/plugins` | List marketplace plugins |
| GET | `/api/plugins/installed` | Get user's installed plugins |
| POST | `/api/plugins/:slug/install` | Install a plugin |
| DELETE | `/api/plugins/:slug/uninstall` | Uninstall a plugin |
| PUT | `/api/plugins/:slug/toggle` | Enable or disable a plugin |
| PUT | `/api/plugins/:slug/config` | Update plugin configuration |
| GET | `/api/plugins/:slug/oauth-url` | Get OAuth authorization URL |
| GET | `/api/plugins/:slug/oauth-status` | Check OAuth connection status |
| GET | `/api/plugins/active-tools` | Get active tool slugs (internal) |

## Rate Limits

- **Standard endpoints**: 100 requests per minute
- **OAuth endpoints**: 10 requests per minute

## Error Responses

All errors follow a consistent format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

| Status | Description |
|--------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input or validation error |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource does not exist |
| 500 | Internal Server Error |

## Plugin Lifecycle

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Discover   │────▶│   Install   │────▶│   Enable    │
│  (GET /api/ │     │  (POST      │     │  (PUT       │
│   plugins)  │     │   install)  │     │   toggle)   │
└─────────────┘     └─────────────┘     └─────────────┘
                           │                   │
                           ▼                   ▼
                    ┌─────────────┐     ┌─────────────┐
                    │  Configure  │     │  Use via    │
                    │  (PUT       │     │  WhatsApp   │
                    │   config)   │     │  AI Tools   │
                    └─────────────┘     └─────────────┘
```

:::tip OAuth Plugins
For plugins that require OAuth (like Google Calendar or Gmail), users must complete the OAuth flow after installation. Use the `/oauth-url` endpoint to initiate the flow.
:::

## Next Steps

- [PluginContext Reference](/api/plugin-context) - Understand the context passed to handlers
- [HandlerResult Reference](/api/handler-result) - Learn about handler return values
- [REST Endpoints](/api/rest-endpoints) - Detailed endpoint documentation with examples
