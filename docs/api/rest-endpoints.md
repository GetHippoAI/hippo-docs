---
sidebar_position: 5
title: REST Endpoints
---

# REST Endpoints

Detailed documentation for all Hippo Plugin API endpoints with request/response examples.

## Authentication

All endpoints require a Bearer token in the Authorization header:

```bash
curl -H "Authorization: Bearer <your-token>" \
  https://api.gethippo.ai/api/plugins
```

---

## List Marketplace Plugins

Retrieve all available plugins in the marketplace along with the user's installation status.

```
GET /api/plugins
```

### Response

```json
{
  "plugins": [
    {
      "id": "clx1234567890",
      "slug": "google-calendar",
      "name": "Google Calendar",
      "description": "Sync your reminders and events with Google Calendar.",
      "version": "1.0.0",
      "icon": "📅",
      "category": "integration",
      "author": "Hippo",
      "isOfficial": true,
      "trustLevel": "official",
      "permissions": ["calendar:read", "calendar:write", "reminders:read"],
      "toolSlugs": ["create_calendar_event", "update_calendar_event", "delete_calendar_event", "get_upcoming_events"],
      "installed": true,
      "enabled": true
    },
    {
      "id": "clx0987654321",
      "slug": "weather",
      "name": "Weather",
      "description": "Get current weather and forecasts for any location.",
      "version": "1.0.0",
      "icon": "🌤️",
      "category": "utility",
      "author": "Hippo",
      "isOfficial": true,
      "trustLevel": "official",
      "permissions": ["location:read"],
      "toolSlugs": ["get_weather"],
      "installed": false,
      "enabled": false
    }
  ]
}
```

### cURL Example

```bash
curl -X GET https://api.gethippo.ai/api/plugins \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

## Get Installed Plugins

Retrieve the current user's installed plugins with configuration details.

```
GET /api/plugins/installed
```

### Response

```json
{
  "plugins": [
    {
      "id": "clx1234567890",
      "slug": "google-calendar",
      "name": "Google Calendar",
      "description": "Sync your reminders and events with Google Calendar.",
      "version": "1.0.0",
      "icon": "📅",
      "category": "integration",
      "enabled": true,
      "config": {},
      "hasOAuth": true,
      "installedAt": "2025-03-15T10:30:00.000Z"
    },
    {
      "id": "clx5678901234",
      "slug": "price-tracker",
      "name": "Price Tracker",
      "description": "Track product prices across e-commerce platforms.",
      "version": "1.0.0",
      "icon": "🏷️",
      "category": "finance",
      "enabled": true,
      "config": {
        "notifyOnDrop": true,
        "dropThreshold": 10
      },
      "hasOAuth": false,
      "installedAt": "2025-03-20T14:15:00.000Z"
    }
  ]
}
```

### cURL Example

```bash
curl -X GET https://api.gethippo.ai/api/plugins/installed \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

## Install Plugin

Install a plugin for the current user.

```
POST /api/plugins/:slug/install
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `slug` | string | Plugin slug identifier |

### Request Body

```json
{
  "config": {
    "notifyOnDrop": true,
    "dropThreshold": 5
  },
  "grantedPermissions": ["finance:read", "notifications:send"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `config` | object | No | Initial configuration values |
| `grantedPermissions` | string[] | No | Permissions granted by user |

### Response

```json
{
  "success": true,
  "installation": {
    "id": "clxinst12345",
    "userId": "user_abc123",
    "pluginId": "clx5678901234",
    "enabled": true,
    "config": {
      "notifyOnDrop": true,
      "dropThreshold": 5
    },
    "grantedPermissions": ["finance:read", "notifications:send"],
    "createdAt": "2025-04-01T09:00:00.000Z",
    "plugin": {
      "slug": "price-tracker",
      "name": "Price Tracker"
    }
  }
}
```

### Error Responses

| Status | Error | Description |
|--------|-------|-------------|
| 400 | `Plugin not found: xyz` | Plugin with given slug does not exist |
| 400 | `Plugin is not active: xyz` | Plugin is disabled or pending review |
| 400 | `Missing required permissions: x, y` | User did not grant required permissions |

### cURL Example

```bash
curl -X POST https://api.gethippo.ai/api/plugins/price-tracker/install \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "config": { "notifyOnDrop": true },
    "grantedPermissions": ["finance:read", "notifications:send"]
  }'
```

---

## Uninstall Plugin

Remove a plugin from the current user's installations.

```
DELETE /api/plugins/:slug/uninstall
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `slug` | string | Plugin slug identifier |

### Response

```json
{
  "success": true
}
```

### cURL Example

```bash
curl -X DELETE https://api.gethippo.ai/api/plugins/price-tracker/uninstall \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

## Toggle Plugin

Enable or disable an installed plugin.

```
PUT /api/plugins/:slug/toggle
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `slug` | string | Plugin slug identifier |

### Request Body

```json
{
  "enabled": false
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `enabled` | boolean | Yes | New enabled state |

### Response

```json
{
  "success": true,
  "installation": {
    "id": "clxinst12345",
    "enabled": false,
    "plugin": {
      "slug": "price-tracker",
      "name": "Price Tracker"
    }
  }
}
```

### cURL Example

```bash
curl -X PUT https://api.gethippo.ai/api/plugins/price-tracker/toggle \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{ "enabled": false }'
```

---

## Update Plugin Config

Update configuration values for an installed plugin.

```
PUT /api/plugins/:slug/config
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `slug` | string | Plugin slug identifier |

### Request Body

```json
{
  "config": {
    "notifyOnDrop": true,
    "dropThreshold": 15,
    "checkInterval": "hourly"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `config` | object | Yes | New configuration values |

### Response

```json
{
  "success": true,
  "installation": {
    "id": "clxinst12345",
    "config": {
      "notifyOnDrop": true,
      "dropThreshold": 15,
      "checkInterval": "hourly"
    },
    "plugin": {
      "slug": "price-tracker",
      "name": "Price Tracker"
    }
  }
}
```

### cURL Example

```bash
curl -X PUT https://api.gethippo.ai/api/plugins/price-tracker/config \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{ "config": { "dropThreshold": 15 } }'
```

---

## Get OAuth URL

Get the OAuth authorization URL for plugins that require OAuth authentication.

```
GET /api/plugins/:slug/oauth-url
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `slug` | string | Plugin slug identifier |

### Response (OAuth Required)

```json
{
  "url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...&redirect_uri=...&scope=..."
}
```

### Response (Already Connected)

```json
{
  "alreadyConnected": true,
  "email": "user@example.com",
  "message": "OAuth is already connected for this plugin"
}
```

### Response (OAuth Not Available)

```json
{
  "error": "OAuth not available",
  "message": "This plugin does not require OAuth or OAuth is not configured"
}
```

### cURL Example

```bash
curl -X GET https://api.gethippo.ai/api/plugins/google-calendar/oauth-url \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

## Check OAuth Status

Check the current OAuth connection status for a plugin.

```
GET /api/plugins/:slug/oauth-status
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `slug` | string | Plugin slug identifier |

### Response (Connected)

```json
{
  "connected": true,
  "email": "user@example.com",
  "expiresAt": "2025-04-01T12:00:00.000Z",
  "scopes": ["https://www.googleapis.com/auth/calendar"]
}
```

### Response (Not Connected)

```json
{
  "connected": false,
  "reason": "no_token"
}
```

### Response (Expired)

```json
{
  "connected": false,
  "reason": "token_expired",
  "expiredAt": "2025-03-30T10:00:00.000Z"
}
```

### cURL Example

```bash
curl -X GET https://api.gethippo.ai/api/plugins/google-calendar/oauth-status \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

## Get Active Tools (Internal)

Get the list of active tool slugs for the current user. This endpoint is primarily used internally by the AI service.

```
GET /api/plugins/active-tools
```

### Response

```json
{
  "toolSlugs": [
    "create_calendar_event",
    "update_calendar_event",
    "delete_calendar_event",
    "get_upcoming_events",
    "track_price",
    "get_tracked_prices",
    "stop_tracking_price",
    "get_weather"
  ]
}
```

### cURL Example

```bash
curl -X GET https://api.gethippo.ai/api/plugins/active-tools \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

## Error Handling

All endpoints return errors in a consistent format:

```json
{
  "error": "Human-readable error message"
}
```

### Common Error Codes

| Status | Meaning |
|--------|---------|
| 400 | Bad Request - Invalid input, validation error, or business logic error |
| 401 | Unauthorized - Missing or invalid authentication token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource does not exist |
| 500 | Internal Server Error - Unexpected server error |

### Example Error Response

```json
{
  "error": "Plugin not found: invalid-slug"
}
```

---

## Rate Limiting

API requests are rate limited per user:

| Endpoint Type | Limit |
|---------------|-------|
| Standard endpoints | 100 requests/minute |
| OAuth endpoints | 10 requests/minute |

When rate limited, you will receive a `429 Too Many Requests` response:

```json
{
  "error": "Rate limit exceeded. Please try again in 60 seconds."
}
```
