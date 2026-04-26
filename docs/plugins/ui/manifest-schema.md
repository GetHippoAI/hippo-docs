---
sidebar_position: 3
title: Manifest schema
---

# Manifest schema

`plugin.json` is the single source of truth for what your plugin is, what it can do, and where it shows up. The submit endpoint validates this against a Zod schema and rejects the upload if anything is wrong.

## Top level

```jsonc
{
  "slug": "habit-tracker",            // [a-z0-9][a-z0-9-]{0,63}
  "name": "Habit Tracker",            // 1–120 chars
  "version": "0.3.1",                 // semver: 1.2.3 or 1.2.3-beta.1
  "description": "Track daily habits.", // ≤500 chars, optional
  "icon": "https://...",              // optional URL or emoji
  "category": "productivity",         // integration | productivity | finance | social | utility
  "author": "Your Team",              // optional
  "homepage": "https://...",          // optional URL
  "sourceUrl": "https://github.com/...", // optional URL
  "permissions": ["data:notes:read", "storage:kv", "ui:sidebar"],
  "i18n": { "tr": { "name": "Alışkanlık Takibi" }, "en": { "name": "Habit Tracker" } },
  "ui": { /* see below */ },
  "mobile": { /* future */ }
}
```

`slug` becomes part of every URL (`/dashboard/p/<slug>/...`, `/api/plugins/<slug>/...`) and cannot change once published. Pick carefully.

`version` must be unique per `(slug, version)`. Re-submitting the same version replaces its bundle while still in `pending`; once published, you must bump the version.

## `ui.pages[]` — sidebar / dashboard pages

Each entry is a top-level page in your plugin. Up to 20 entries.

```jsonc
"ui": {
  "pages": [
    {
      "path": "main",                                  // [a-z0-9][a-z0-9-]{0,32}
      "title": { "tr": "Alışkanlıklar", "en": "Habits" },
      "icon": "calendar",                              // optional, lucide icon name or URL
      "sidebar": true                                  // shows in left nav
    },
    {
      "path": "stats",
      "title": { "tr": "İstatistikler", "en": "Stats" },
      "sidebar": false                                 // accessible only via in-plugin nav
    }
  ]
}
```

The route for a page is `/dashboard/p/<slug>/<path>`. Inside your bundle the active page is in the URL: `URLSearchParams(location.search).get("page")`.

## `ui.settings` — custom settings UI

Replaces the default JSON-Schema config form with your own.

```jsonc
"ui": {
  "settings": { "path": "settings" }
}
```

Routes to `/dashboard/plugins/<slug>/settings`. You receive `?page=settings` in the iframe query. Use `host.storage.kv` to persist preferences (the legacy `PluginInstallation.config` JSON column is still available via host call if you opt into it — see [Host SDK](./host-sdk)).

## `ui.widgets[]` — dashboard widgets

```jsonc
"ui": {
  "widgets": [
    {
      "id": "today",                                  // [a-z0-9][a-z0-9-]{0,32}
      "title": { "tr": "Bugün", "en": "Today" },
      "defaultSize": "2x2",                           // grid units (cols x rows), default 2x2
      "minSize": "1x1"
    }
  ]
}
```

Each widget renders as its own `<PluginFrame>` with `?widget=<id>`. The user can drag and resize; layout is persisted in `PluginInstallation.widgetLayout`.

## `ui.actions[]` — context-menu / row-action items

Inject items into host-defined extension surfaces.

```jsonc
"ui": {
  "actions": [
    {
      "id": "save-as-habit",                            // [a-z0-9][a-z0-9-]{0,32}
      "surface": "note.context-menu",                   // see surface table below
      "label": { "tr": "Alışkanlık olarak kaydet", "en": "Save as habit" },
      "mode": "modal"                                   // modal | background
    }
  ]
}
```

| Surface | Where | Payload your iframe receives |
| --- | --- | --- |
| `note.context-menu` | Right-click / "..." menu on a note | `{ noteId, title, content }` |
| `finance.row-action` | Inline action on a transaction row | `{ transactionId, amount, currency, description }` |
| `global.command` | Cmd-K palette | `{ query }` (whatever the user typed) |

`mode: "modal"` opens your bundle in a modal overlay with `?action=<id>&payload=...`. `mode: "background"` runs your bundle invisibly — useful for "save this and notify me", where there's nothing to render. In background mode the host kills the iframe after `host.ui.dismiss()` or a 30-second timeout.

## `permissions[]`

Strings from a fixed namespace. The full list is in [Permissions](./permissions). The user sees a localized description for each one on the consent screen.

Common rules:

- Asking for permissions you don't use will hurt install rates.
- Adding a new permission in a later version flags installations as `pendingReconsent` and the user must re-approve before your bundle loads.
- Removing a permission is silent and never re-prompts.

## `i18n`

Object keyed by BCP-47 locale tag (`tr`, `en`, `de`, `fr-CA`, ...). Hippo uses your `i18n.<locale>.name` for the marketplace card and any place we'd otherwise show `name`. Inside `ui.pages[].title`, `ui.widgets[].title`, `ui.actions[].label` you provide the same `Record<string, string>` shape inline — the host picks the user's locale at render time.

## `mobile` (forward-looking, not yet rendered)

```jsonc
"mobile": {
  "deeplink": "hippo://p/{slug}/{page}",
  "supportedSurfaces": ["page"]
}
```

The mobile app does not yet render plugin UIs (Sprint 1 is web-only). Declaring `mobile` now lets you avoid a manifest bump when the WebView host ships.

## Validation cheatsheet

| Field | Rule |
| --- | --- |
| `slug` | `^[a-z0-9][a-z0-9-]{0,63}$` |
| `version` | semver, optional `-prerelease` suffix |
| `name` | 1–120 chars |
| `description` | ≤500 chars |
| `permissions[]` | ≤32 items, each ≤64 chars |
| `ui.pages[]` | ≤20 |
| `ui.widgets[]` | ≤20 |
| `ui.actions[]` | ≤20 |
| Bundle size | ≤25MB (single `index.html`) |
