---
sidebar_position: 4
title: Sidebar pages
---

# Sidebar pages

The most common surface: a top-level page that lives on the left navigation, opened in the dashboard's main area when clicked.

## Declare it

```json
{
  "permissions": ["ui:sidebar"],
  "ui": {
    "pages": [
      {
        "path": "main",
        "title": { "tr": "Alışkanlıklar", "en": "Habits" },
        "icon": "calendar",
        "sidebar": true
      }
    ]
  }
}
```

You need the `ui:sidebar` permission for any page with `sidebar: true`. Pages without `sidebar: true` still mount and have their own URL — they're just only reachable via in-plugin navigation.

## URLs and routing

| URL | What it does |
| --- | --- |
| `/dashboard/p/<slug>/<path>` | Renders your bundle as the dashboard's main view |
| `?page=<path>` (inside iframe) | Active page passed via query string |

When the user navigates to `/dashboard/p/habit-tracker/stats`, the host loads `https://habit-tracker-<installId>.plugins.hippo.la/v/<version>/?page=stats`. Inside your bundle:

```ts
import { readHostQuery } from '@hippo/plugin-sdk'

const { page } = readHostQuery()  // "main" | "stats" | null
```

## Multiple pages, in-plugin navigation

There are two patterns. Pick whichever fits your app.

### A. One bundle, internal router

Best for SPAs. Read `?page=` once on load, then handle navigation client-side:

```ts
const { page } = readHostQuery()
switch (page) {
  case 'stats':    renderStats();    break
  case 'settings': renderSettings(); break
  default:         renderMain()
}

// In-plugin nav: just push state. No reload.
function go(target) {
  history.pushState({}, '', `?page=${target}`)
  /* re-render */
}
```

URL changes inside the iframe don't affect the host's address bar — that's expected. If you also want the host URL to update (so deep links and back-button work), call:

```ts
host.ui.navigateTo({ page: 'stats' })
// Host updates address bar to /dashboard/p/<slug>/stats
```

### B. One bundle, host-driven

Make every page a separate manifest entry with `sidebar: false`, and let the host route between them. Simpler for small admin-style plugins where each page is independent.

## Icons

Three options, in order of preference:

1. **Lucide icon name** (`"calendar"`, `"book-open"`, ...) — matches the host's icon set.
2. **Emoji** (`"🌱"`) — works everywhere, no asset hosting.
3. **URL** to a 1:1 PNG/SVG — keep under 64×64, served over HTTPS.

If `icon` is omitted, the host renders a generic puzzle-piece glyph.

## Localized titles

`title` is a `Record<string, string>` keyed by BCP-47 tag. The host picks `title[user.locale]`, falling back to the language-only tag, then `en`, then `tr`, then the first value:

```jsonc
"title": {
  "tr": "Alışkanlıklar",
  "en": "Habits",
  "de": "Gewohnheiten"
}
```

A user with `locale: "fr-FR"` and no `fr` key falls back to `en` → `"Habits"`.

## Pinned vs collapsible

Sidebar pages always render flat — they don't nest under a parent group. If you have many pages, prefer pattern A (one entry, internal router) so you don't clutter the user's left nav.

## Active state

The host marks your sidebar entry as active when the user is on `/dashboard/p/<slug>/<path>` for that exact `path`. If you push state inside the iframe to switch pages without going through `host.ui.navigateTo`, the sidebar's active state will not update.
