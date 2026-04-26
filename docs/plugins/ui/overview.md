---
sidebar_position: 1
title: Overview
---

# Frontend Extensions

Hippo's plugin platform lets you ship a **full UI** that lives inside the Hippo dashboard — your own pages on the left sidebar, widgets on the home dashboard, action items in note/finance context menus, and a custom settings screen — all without ever touching Hippo's source code.

This is a separate system from the legacy "AI tool plugin" (the handler-based plugins documented under [Plugin Development](../getting-started)). Those run server-side inside Hippo AI to expose new tools to the assistant. Frontend extensions are about visible UI and direct user interaction; the two can coexist on the same plugin.

## Architecture in one minute

```
┌────────────────────────────────────────────────────────────────────┐
│  Hippo Dashboard (app.hippo.la)                                    │
│  ┌─────────────────┐   ┌──────────────────────────────────────────┐│
│  │ Native sidebar  │   │ <PluginFrame> — sandbox=allow-scripts    ││
│  │  + dynamic items│   │   ┌────────────────────────────────────┐ ││
│  │   from your     │   │   │  your bundle (index.html)          │ ││
│  │   manifest      │ ──┼──▶│  origin: "null"                    │ ││
│  └─────────────────┘   │   │   ↕ MessageChannel (transferable   │ ││
│                        │   │     port handed in init message)   │ ││
│                        │   └────────────────────────────────────┘ ││
│                        └─────────────┬────────────────────────────┘│
│                                      │ host.api.notes.list(...)    │
│                                      ▼ (proxied to backend)        │
│                          POST /api/plugin-rpc                      │
│                          + permission check + audit log            │
└────────────────────────────────────────────────────────────────────┘
```

Three properties make this safe:

1. **Different origin.** Plugin bundles are served from a separate subdomain (`plugins.hippo.la`). The iframe is loaded with `sandbox="allow-scripts"` only — no `allow-same-origin` — which forces the plugin's effective origin to `null`. It cannot read parent cookies, localStorage, or DOM.
2. **No tokens in the iframe.** The plugin never holds the user's auth token. Every host call goes through a `MessagePort` to the parent frame, which proxies it to `/api/plugin-rpc` with the user's `Authorization` header.
3. **Explicit, scoped permissions.** Your manifest declares which permissions you need (`data:notes:read`, `storage:kv`, …). At install time the user sees a consent screen. At runtime the host enforces every method against the granted set; missing permission → `403 PERMISSION_DENIED`, recorded in the audit log.

## What you can extend

| Surface | Manifest field | What it does |
| --- | --- | --- |
| **Sidebar pages** | `ui.pages[]` with `sidebar: true` | Adds an item to the left navigation. Clicking opens your bundle in the main area at `/dashboard/p/<slug>/<page>`. |
| **Settings page** | `ui.settings.path` | Replaces the default JSON-Schema config form with your own UI under `/dashboard/plugins/<slug>/settings`. |
| **Dashboard widgets** | `ui.widgets[]` | Adds resizable cards to the home dashboard grid. Layout is persisted per user. |
| **Action surfaces** | `ui.actions[]` | Adds menu items to host-defined extension points: `note.context-menu`, `finance.row-action`, `global.command`. |

You can extend any combination of these in a single plugin.

## Bundle format (MVP)

A plugin bundle is currently a **single self-contained `index.html`** — the recommended way to produce one is Vite + `vite-plugin-singlefile`. Maximum 25MB. Multi-file zip support is on the roadmap.

## Read next

- [**Quickstart**](./quickstart) — submit and install a hello-world plugin in under five minutes.
- [**Manifest schema**](./manifest-schema) — every field, with examples.
- [**Host SDK**](./host-sdk) — `connectToHost()`, `host.api.*`, `host.storage.kv`.
- [**Security model**](./security-model) — sandbox, RPC, CSP, audit log.
