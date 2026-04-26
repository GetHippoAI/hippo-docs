---
sidebar_position: 8
title: Permissions
---

# Permissions

Every plugin declares the permissions it needs in its manifest. The user sees a consent screen at install time. At runtime, every host call is checked against the granted set — missing permission → `403 PERMISSION_DENIED`, recorded in the audit log.

## Format

Permission strings are namespaced: `<domain>:<resource>:<action>`.

```
data:notes:read           — read user's notes
data:notes:write          — create or modify notes
ui:sidebar                — add a sidebar entry
storage:kv                — use plugin-scoped key-value storage
```

## Full namespace

### Data — user content

| Permission | What it grants | Used by |
| --- | --- | --- |
| `data:notes:read` | List and read notes (filtered to the user's own) | `notes.list` |
| `data:notes:write` | Create and update notes | `notes.create` (more in Sprint 2) |
| `data:tasks:read` | List tasks | (Sprint 2) `tasks.list` |
| `data:tasks:write` | Create and update tasks | (Sprint 2) `tasks.create` |
| `data:finance:read` | Read transactions, subscriptions, budgets | (Sprint 2) `finance.transactions.list` |
| `data:finance:write` | Create transactions and subscriptions | (Sprint 2) `finance.transactions.create` |

All data methods filter by `userId` server-side. There is no way for a plugin to see another user's data, even with the strongest data permission.

### UI — visible surfaces

| Permission | What it grants |
| --- | --- |
| `ui:sidebar` | Adds entries declared in `ui.pages[]` with `sidebar: true` |
| `ui:widget` | Renders entries declared in `ui.widgets[]` |
| `ui:action.note-context` | Adds items in `ui.actions[]` with `surface: "note.context-menu"` |
| `ui:action.finance-row` | Adds items with `surface: "finance.row-action"` |
| `ui:action.command` | Adds items with `surface: "global.command"` |

Splitting actions per-surface is intentional — a user can grant your sidebar but deny your context-menu items.

### Storage

| Permission | What it grants |
| --- | --- |
| `storage:kv` | Plugin-scoped 1MB key-value store (`host.storage.kv.*`) |

### Notifications

| Permission | What it grants |
| --- | --- |
| `notify:push` | (Sprint 2) Send a push notification via `host.notify.push(...)` |

### OAuth / external connections

| Permission | What it grants |
| --- | --- |
| `oauth:google` | (Sprint 2) Use the user's existing Google OAuth tokens via `host.oauth.tokenFor("google")` |
| `oauth:github` | Same, GitHub |

OAuth permissions don't ask the user to re-authenticate Google — they just authorize *your* plugin to read tokens the user has already linked at the Hippo level.

## Consent screen

When the user opens `/dashboard/plugins/<slug>/install`, they see one card per permission with:

- **Localized title** ("Notlarını okuma")
- **One-line description** of what your plugin can do with it
- **Icon** matching the domain (`FileText` for `data:notes:*`, `Cloud` for `storage:*`, …)

Hippo maintains the localizations. You don't customize the consent text — keeping it consistent across plugins protects users from social-engineering ("hey just click yes, it doesn't really mean read everything").

## Asking only for what you use

The host validates at install time that **every requested permission is in your manifest's `permissions[]`**. A user can in theory deselect items on the consent screen (granting a subset), but in Sprint 1 the dashboard's consent UI grants all-or-nothing. Treat any subset case defensively:

```ts
// Detect which permissions you actually have:
const granted = new Set(host.context.grantedPermissions ?? [])
if (!granted.has('data:notes:write')) {
  hideCreateButton()
}
```

For now `host.context.grantedPermissions` is not surfaced to the iframe — call any host method optimistically and handle `PERMISSION_DENIED`. Sprint 2 will expose the granted list for proactive UI hiding.

## Adding a permission later

If a new bundle version requires a permission not in the previously installed version, the host marks all installations as `pendingReconsent: true`. The user sees a banner ("Hello World needs new permissions to update — review and approve"); your old version keeps loading until they re-consent.

Removing a permission is silent — the host quietly trims the granted set on the next install/update.

## Audit log

Every RPC call is recorded in `plugin_audit_logs`:

```
installation_id | plugin_id | user_id | method        | permission         | status | latency_ms | created_at
ebce8cad-...    | 934a58... | 68bbea  | notes.list    | data:notes:read    | ok     | 14         | 2026-04-26 13:50:01+00
ebce8cad-...    | 934a58... | 68bbea  | notes.create  | data:notes:write   | denied | 2          | 2026-04-26 13:50:14+00
ebce8cad-...    | 934a58... | 68bbea  | storage.kv.set| storage:kv         | ok     | 9          | 2026-04-26 13:50:30+00
```

The user can review their own audit log in `/dashboard/plugins/<slug>/audit` (Sprint 2). Admins see global aggregates for review and rate-limiting telemetry.

## Rate limit

Per-installation: **60 RPC calls per minute**. Bursts are absorbed by a token bucket; sustained rates above the limit return `429`. Storage and `host.ping` count against the same bucket.

If you genuinely need higher throughput (sync use cases, periodic refresh), batch your work:

- Use `notes.list` with `limit: 100` instead of 20 individual fetches.
- Cache last-known-good results in `storage.kv` and only refresh when stale.
