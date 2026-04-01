---
sidebar_position: 1
title: Google Calendar
---

# Google Calendar Plugin

Sync your reminders and events with Google Calendar. Create, update, delete, and view calendar events directly through WhatsApp.

## Overview

| Property | Value |
|----------|-------|
| **Slug** | `google-calendar` |
| **Category** | Integration |
| **Author** | Hippo |
| **OAuth Required** | Yes (Google) |
| **Permissions** | `calendar:read`, `calendar:write`, `reminders:read` |

## Features

- Create calendar events with title, date, time, and location
- Update existing events
- Delete events
- View upcoming events for any time range
- Automatic sync with Hippo reminders
- Multi-calendar support

## Tools

### `create_calendar_event`

Create a new event in Google Calendar.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | string | Yes | Event title |
| `date` | string | Yes | Event date (YYYY-MM-DD) |
| `time` | string | No | Start time (HH:mm) |
| `duration` | number | No | Duration in minutes (default: 60) |
| `location` | string | No | Event location |
| `description` | string | No | Event description |
| `attendees` | string[] | No | Email addresses of attendees |

**Example Usage via WhatsApp:**

> "Create a meeting with John tomorrow at 2pm for 30 minutes"

> "Add a dentist appointment on April 15th at 10:00"

> "Schedule team standup every Monday at 9am"

---

### `update_calendar_event`

Update an existing calendar event.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `eventId` | string | Yes | Google Calendar event ID |
| `title` | string | No | New event title |
| `date` | string | No | New date (YYYY-MM-DD) |
| `time` | string | No | New start time (HH:mm) |
| `duration` | number | No | New duration in minutes |
| `location` | string | No | New location |
| `description` | string | No | New description |

**Example Usage via WhatsApp:**

> "Move my dentist appointment to 3pm"

> "Change tomorrow's meeting location to Conference Room B"

---

### `delete_calendar_event`

Delete a calendar event.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `eventId` | string | Yes | Google Calendar event ID |

**Example Usage via WhatsApp:**

> "Cancel my meeting with John"

> "Delete the dentist appointment"

---

### `get_upcoming_events`

Retrieve upcoming calendar events.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `days` | number | No | Number of days to look ahead (default: 7) |
| `maxResults` | number | No | Maximum events to return (default: 10) |
| `calendarId` | string | No | Specific calendar ID (default: primary) |

**Example Usage via WhatsApp:**

> "What's on my calendar today?"

> "Show me my schedule for next week"

> "Do I have any meetings tomorrow?"

## Setup

### Step 1: Install the Plugin

Install the Google Calendar plugin from the Hippo marketplace or via API:

```bash
curl -X POST https://api.gethippo.ai/api/plugins/google-calendar/install \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "grantedPermissions": ["calendar:read", "calendar:write", "reminders:read"]
  }'
```

### Step 2: Connect Google Account

Get the OAuth authorization URL:

```bash
curl -X GET https://api.gethippo.ai/api/plugins/google-calendar/oauth-url \
  -H "Authorization: Bearer <token>"
```

Response:

```json
{
  "url": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

Open the URL in a browser and authorize Hippo to access your Google Calendar.

### Step 3: Verify Connection

Check that OAuth is connected:

```bash
curl -X GET https://api.gethippo.ai/api/plugins/google-calendar/oauth-status \
  -H "Authorization: Bearer <token>"
```

Response:

```json
{
  "connected": true,
  "email": "user@gmail.com",
  "scopes": ["https://www.googleapis.com/auth/calendar"]
}
```

## Usage Examples

### Creating Events

**Simple event:**
> User: "Add lunch with Sarah on Friday at 12:30"
>
> Hippo: "I've created a calendar event 'Lunch with Sarah' for Friday, April 4th at 12:30."

**Event with location:**
> User: "Schedule a doctor appointment next Monday at 3pm at City Hospital"
>
> Hippo: "Done! Your doctor appointment is scheduled for Monday, April 7th at 3:00 PM at City Hospital."

### Viewing Schedule

> User: "What do I have today?"
>
> Hippo: "Here's your schedule for today:
> - 09:00 - Team Standup (30 min)
> - 11:00 - Client Call (1 hour)
> - 14:00 - Lunch with Sarah (1 hour)
> - 16:00 - Project Review (1 hour)"

### Modifying Events

> User: "Move the client call to 2pm"
>
> Hippo: "I've rescheduled your Client Call to 2:00 PM today."

### Canceling Events

> User: "Cancel the project review"
>
> Hippo: "I've removed 'Project Review' from your calendar."

## OAuth Scopes

The Google Calendar plugin requests the following OAuth scopes:

| Scope | Purpose |
|-------|---------|
| `https://www.googleapis.com/auth/calendar` | Full access to read and write calendar events |

:::info Privacy
Hippo only accesses calendar data when you explicitly request it through conversation. Your calendar data is never stored on Hippo servers beyond the necessary caching for the current conversation.
:::

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| "Google Calendar not connected" | OAuth not completed | Complete the OAuth flow via dashboard |
| "Event not found" | Event was deleted or ID is invalid | Check the event exists in Google Calendar |
| "Permission denied" | Insufficient OAuth scopes | Reconnect with required permissions |
| "Rate limit exceeded" | Too many API calls | Wait a few minutes and try again |

## Troubleshooting

### Calendar not syncing

1. Check OAuth status via `/api/plugins/google-calendar/oauth-status`
2. If disconnected, get a new OAuth URL and reconnect
3. Ensure the correct Google account is connected

### Events not appearing

1. Verify the event was created in Google Calendar web interface
2. Check if the event is on a different calendar
3. Ensure the date range in your query includes the event

### Multiple Google accounts

The plugin connects to one Google account at a time. To switch accounts:

1. Uninstall the plugin
2. Reinstall the plugin
3. Connect with the desired Google account

## Related Plugins

- [Gmail](/official-plugins/gmail) - Email integration with the same Google account
