---
sidebar_position: 2
title: Quickstart
---

# Quickstart — Hello World

Build, submit, and install a minimal plugin in five minutes. This walkthrough produces a sidebar entry that lists the user's notes and round-trips a value through plugin-scoped storage.

## 1. Manifest

Create `plugin.json`:

```json
{
  "slug": "hello-world",
  "name": "Hello World",
  "version": "0.1.0",
  "description": "Minimal demo plugin for the Hippo plugin platform.",
  "category": "utility",
  "author": "You",
  "permissions": ["data:notes:read", "storage:kv", "ui:sidebar"],
  "i18n": {
    "tr": { "name": "Merhaba Dünya" },
    "en": { "name": "Hello World" }
  },
  "ui": {
    "pages": [
      {
        "path": "main",
        "title": { "tr": "Merhaba Dünya", "en": "Hello World" },
        "sidebar": true
      }
    ]
  }
}
```

The `sidebar: true` flag adds a left-nav entry that opens at `/dashboard/p/hello-world/main`.

## 2. Bundle

Create `index.html`. The host hands a `MessagePort` to the iframe in its `hippo.init` message; we use that to call host RPC methods.

```html
<!doctype html>
<html lang="tr">
  <head><meta charset="utf-8" /><title>Hello World</title></head>
  <body>
    <h1>Hello World</h1>
    <button id="list">Notları getir</button>
    <pre id="out">—</pre>

    <script type="module">
      import { connectToHost } from 'https://plugins.hippo.la/_sdk/v1/plugin-sdk.js'

      const host = await connectToHost()
      document.getElementById('list').addEventListener('click', async () => {
        const res = await host.api.notes.list({ limit: 5 })
        document.getElementById('out').textContent = JSON.stringify(res, null, 2)
      })
    </script>
  </body>
</html>
```

For local development you can copy the SDK source from `@hippo/plugin-sdk` and inline it. See the [Host SDK page](./host-sdk) for the full reference.

## 3. Submit

The CLI uploads `plugin.json` + `index.html` as multipart form data to `POST /api/plugin-versions/submit`.

```bash
export HIPPO_API_URL=https://api.gethippo.ai
export HIPPO_API_TOKEN=<your jwt>

npx @hippo/plugin-cli submit ./plugin.json ./index.html
# → { ok: true, pluginId, versionId, status: "pending" }
```

Or directly via curl:

```bash
curl -X POST "$HIPPO_API_URL/api/plugin-versions/submit" \
  -H "Authorization: Bearer $HIPPO_API_TOKEN" \
  -F "manifest=$(cat plugin.json)" \
  -F "bundle=@index.html;type=text/html"
```

## 4. Publish (admin)

Submitted versions land in `pending`. An admin promotes them:

```bash
curl -X POST "$HIPPO_API_URL/api/admin/plugins/versions/$VERSION_ID/publish" \
  -H "Authorization: Bearer $ADMIN_JWT" \
  -H "Content-Type: application/json" \
  -d '{"reviewNotes":"approved"}'
```

`Plugin.latestVersionId` now points at this version; new installs pin to it automatically.

## 5. Install

The user opens `/dashboard/plugins/hello-world/install` to see the consent screen — the requested permissions in human-readable form — and approves. After install:

- A "Merhaba Dünya" entry appears in the sidebar.
- Clicking it opens your bundle inside `<PluginFrame>`.
- The "Notları getir" button calls `host.api.notes.list()`, which becomes a `POST /api/plugin-rpc` with the installation id, runs through the permission check, and returns the user's notes.

That's the whole loop.

## What's happening under the hood

1. `<iframe src="https://hello-world-<installId>.plugins.hippo.la/v/0.1.0/" sandbox="allow-scripts">` is rendered in the dashboard.
2. The host frame posts `{ type: "hippo.init", installationId, locale, theme, ... }` with a transferable `MessagePort`.
3. The SDK inside your bundle resolves `connectToHost()` with that port.
4. Each `host.api.*` call sends `{ id, kind: "rpc", method, input }` over the port.
5. The host frame proxies to `/api/plugin-rpc`, which validates the user owns the installation, checks the required permission, runs the handler, writes an audit log, and returns the result.

Continue with the [manifest schema](./manifest-schema) for every field, or jump to [permissions](./permissions) for the full namespace.
