---
sidebar_position: 2
title: Gmail
---

# Gmail Plugin

Read, search, and draft emails from Gmail directly through WhatsApp. Get email statistics and stay on top of your inbox without opening Gmail.

## Overview

| Property | Value |
|----------|-------|
| **Slug** | `gmail` |
| **Category** | Integration |
| **Author** | Hippo |
| **OAuth Required** | Yes (Google) |
| **Permissions** | `email:read`, `email:write`, `email:send` |

## Features

- Search emails by sender, subject, date, or keywords
- Read email content and attachments info
- Draft new emails
- Get inbox statistics (unread count, top senders)
- Label-based filtering

## Tools

### `search_emails`

Search through Gmail messages using various filters.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Search query (Gmail search syntax supported) |
| `maxResults` | number | No | Maximum emails to return (default: 10) |
| `labelIds` | string[] | No | Filter by label IDs (e.g., INBOX, SENT) |

**Gmail Search Syntax Examples:**

| Query | Description |
|-------|-------------|
| `from:john@example.com` | Emails from John |
| `subject:invoice` | Emails with "invoice" in subject |
| `is:unread` | Unread emails |
| `after:2025/03/01` | Emails after March 1, 2025 |
| `has:attachment` | Emails with attachments |
| `label:important` | Emails labeled important |

**Example Usage via WhatsApp:**

> "Show me emails from Amazon"

> "Find unread emails from last week"

> "Search for emails about the project proposal"

---

### `search_emails_gmail`

Alternative search endpoint with enhanced Gmail-specific features.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Search query |
| `from` | string | No | Filter by sender email |
| `to` | string | No | Filter by recipient |
| `subject` | string | No | Filter by subject keywords |
| `after` | string | No | Emails after date (YYYY-MM-DD) |
| `before` | string | No | Emails before date (YYYY-MM-DD) |
| `hasAttachment` | boolean | No | Only emails with attachments |
| `isUnread` | boolean | No | Only unread emails |

---

### `draft_email`

Create a new email draft.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `to` | string | Yes | Recipient email address |
| `subject` | string | Yes | Email subject |
| `body` | string | Yes | Email body (plain text or HTML) |
| `cc` | string | No | CC recipients (comma-separated) |
| `bcc` | string | No | BCC recipients (comma-separated) |

**Example Usage via WhatsApp:**

> "Draft an email to john@example.com about the meeting tomorrow"

> "Write an email to the team summarizing today's discussion"

:::note Draft Mode
Emails are created as drafts for your review. You can send them from the Gmail app or web interface.
:::

---

### `get_email`

Retrieve the full content of a specific email.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `messageId` | string | Yes | Gmail message ID |
| `format` | string | No | Response format: `full`, `metadata`, `minimal` |

**Example Usage via WhatsApp:**

> "Read the email from John about the invoice"

> "Show me the full content of that Amazon email"

---

### `email_stats`

Get inbox statistics and insights.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `period` | string | No | Time period: `today`, `week`, `month` |

**Returns:**

- Unread email count
- Total emails in period
- Top senders
- Most common subjects
- Emails by label

**Example Usage via WhatsApp:**

> "How many unread emails do I have?"

> "Give me a summary of my inbox this week"

> "Who sends me the most emails?"

## Setup

### Step 1: Install the Plugin

```bash
curl -X POST https://api.gethippo.ai/api/plugins/gmail/install \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "grantedPermissions": ["email:read", "email:write", "email:send"]
  }'
```

### Step 2: Connect Google Account

Get the OAuth URL and authorize:

```bash
curl -X GET https://api.gethippo.ai/api/plugins/gmail/oauth-url \
  -H "Authorization: Bearer <token>"
```

### Step 3: Verify Connection

```bash
curl -X GET https://api.gethippo.ai/api/plugins/gmail/oauth-status \
  -H "Authorization: Bearer <token>"
```

## OAuth Scopes

The Gmail plugin requests the following OAuth scopes:

| Scope | Purpose |
|-------|---------|
| `https://www.googleapis.com/auth/gmail.readonly` | Read email messages and metadata |
| `https://www.googleapis.com/auth/gmail.modify` | Modify labels and mark as read |
| `https://www.googleapis.com/auth/gmail.compose` | Create drafts |

## Usage Examples

### Searching Emails

**Find specific emails:**
> User: "Find emails from my bank"
>
> Hippo: "I found 5 emails from your bank:
> 1. Statement Available - March 2025 (2 days ago)
> 2. Security Alert: New login detected (1 week ago)
> 3. Your payment was processed (2 weeks ago)
> ..."

**Check unread:**
> User: "Do I have any unread emails?"
>
> Hippo: "You have 12 unread emails. The most recent ones are:
> - Amazon: Your order has shipped (10 min ago)
> - John Smith: Meeting tomorrow (1 hour ago)
> - Newsletter: Weekly digest (3 hours ago)"

### Reading Emails

> User: "Read the email from Amazon"
>
> Hippo: "Here's the email from Amazon:
>
> **Subject:** Your order has shipped
> **From:** shipment-tracking@amazon.com
> **Date:** April 1, 2025 at 10:30 AM
>
> Your order #123-456-789 has shipped and is on its way! Expected delivery: April 3, 2025.
>
> Track your package: [link]"

### Drafting Emails

> User: "Write an email to john@example.com thanking him for the meeting"
>
> Hippo: "I've drafted the email:
>
> **To:** john@example.com
> **Subject:** Thank you for the meeting
>
> Hi John,
>
> Thank you for taking the time to meet with me today. I appreciated the opportunity to discuss the project and look forward to our collaboration.
>
> Best regards
>
> *The draft has been saved to your Gmail. You can review and send it from there.*"

### Inbox Statistics

> User: "Give me a summary of my inbox"
>
> Hippo: "Here's your inbox summary for this week:
> - **Unread emails:** 12
> - **Total received:** 87
> - **Top senders:**
>   1. Amazon (15 emails)
>   2. LinkedIn (8 emails)
>   3. john@example.com (5 emails)
> - **Categories:**
>   - Primary: 45
>   - Social: 22
>   - Promotions: 20"

## PubSub Setup (Real-time Notifications)

For real-time email notifications, Hippo uses Google Cloud PubSub. This is handled automatically by the Hippo infrastructure, but for self-hosted deployments:

### 1. Create PubSub Topic

```bash
gcloud pubsub topics create gmail-notifications
```

### 2. Create Subscription

```bash
gcloud pubsub subscriptions create gmail-sub \
  --topic=gmail-notifications \
  --push-endpoint=https://api.gethippo.ai/webhooks/gmail
```

### 3. Grant Gmail Publish Permission

```bash
gcloud pubsub topics add-iam-policy-binding gmail-notifications \
  --member=serviceAccount:gmail-api-push@system.gserviceaccount.com \
  --role=roles/pubsub.publisher
```

### 4. Watch User's Inbox

```typescript
await gmail.users.watch({
  userId: 'me',
  requestBody: {
    topicName: 'projects/your-project/topics/gmail-notifications',
    labelIds: ['INBOX'],
  },
});
```

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| "Gmail not connected" | OAuth not completed | Complete OAuth flow |
| "Message not found" | Email was deleted | Email no longer exists |
| "Rate limit exceeded" | Too many API calls | Wait before retrying |
| "Insufficient permission" | Missing OAuth scope | Reconnect with all scopes |

## Privacy and Security

:::info Data Handling
- Hippo reads emails only when you explicitly request it
- Email content is not stored on Hippo servers
- Drafts are saved directly to your Gmail account
- OAuth tokens are encrypted at rest
:::

## Related Plugins

- [Google Calendar](/official-plugins/google-calendar) - Calendar integration with the same Google account
