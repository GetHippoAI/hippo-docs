---
sidebar_position: 7
title: Host SDK
---

# Host SDK — `@hippo/plugin-sdk`

The SDK is the iframe-side bridge to the host. It hides the `MessageChannel` plumbing and gives you typed methods for every host RPC.

## Install

For local development, npm install:

```bash
npm install @hippo/plugin-sdk
```

For production bundles, prefer importing from the CDN so updates flow without re-bundling:

```html
<script type="module">
  import { connectToHost } from 'https://plugins.hippo.la/_sdk/v1/plugin-sdk.js'
</script>
```

## Connect

Call `connectToHost()` once at startup and resolve the promise before doing anything else.

```ts
import { connectToHost } from '@hippo/plugin-sdk'

const host = await connectToHost()
console.log(host.context)
// {
//   installationId: "ebce8cad-...",
//   pluginSlug: "hello-world",
//   version: "0.1.0",
//   locale: "tr",
//   theme: "light",
//   hostOrigin: "https://app.hippo.la"
// }
```

The promise rejects with `Error("hippo init timeout")` if no `hippo.init` message arrives within 10 seconds — usually means your bundle isn't loaded inside `<PluginFrame>`.

## `host.context`

| Field | Notes |
| --- | --- |
| `installationId` | UUID, stable per (user, plugin). Use this as the cache key for any local state. |
| `pluginSlug` | Your slug from the manifest. |
| `version` | Bundle version the user is pinned to. |
| `locale` | BCP-47 (`tr`, `en-US`, ...). Use this to pick translations. |
| `theme` | `"light"` or `"dark"`. Match it for native feel. |
| `hostOrigin` | Where the dashboard is served (`https://app.hippo.la`, `https://staging.gethippo.ai`, `http://localhost:3000`, ...). |

Context is captured at init time. If the user toggles theme later, listen for `'context'` messages on the SDK to react (TBD in v2).

## `host.api.notes`

```ts
await host.api.notes.list({ limit: 20, cursor?, query? })
// → { items: NoteSummary[], nextCursor: string | null }

await host.api.notes.create({ title?, content, tags? })
// → { note: { id, title, content, tags, createdAt } }
```

| Method | Permission |
| --- | --- |
| `notes.list` | `data:notes:read` |
| `notes.create` | `data:notes:write` |

`NoteSummary` shape:

```ts
{
  id: string
  title: string | null
  content: string
  tags: string[]
  icon: string | null
  isFavorite: boolean
  updatedAt: string  // ISO
  createdAt: string
}
```

## `host.storage.kv`

Plugin-scoped key-value store, isolated per `installationId`. Cap: **1MB total per installation, 64KB per value**. Persists across sessions and devices.

```ts
await host.storage.kv.set('counter', 42)
await host.storage.kv.set('lastSync', { at: Date.now(), n: 17 })

const counter = await host.storage.kv.get<number>('counter')   // 42
const sync = await host.storage.kv.get<{at:number,n:number}>('lastSync')

await host.storage.kv.delete('counter')
```

| Method | Permission |
| --- | --- |
| `storage.kv.get` | `storage:kv` |
| `storage.kv.set` | `storage:kv` |
| `storage.kv.delete` | `storage:kv` |

Errors:

- `QUOTA_EXCEEDED` — value exceeds 64KB or total exceeds 1MB.
- `BAD_INPUT` — key empty / >256 chars.

## `host.ui` (forthcoming)

Surface-related controls — these are stubs in Sprint 1 and ship in Sprint 2:

```ts
await host.ui.toast({ kind: 'success' | 'error' | 'info', message: string })
await host.ui.openLink(url: string)            // opens in new tab via host
await host.ui.navigateTo({ page?: string })    // updates host address bar
await host.ui.dismiss({ result?: any })        // closes modal action
```

## `host.ping`

Health check that round-trips through the channel without hitting the backend. Useful in the SDK's first paint to confirm the host is alive:

```ts
const r = await host.ping()  // { ok: true, ts: 1700000000000 }
```

No permission required.

## `host.call(method, input)`

Escape hatch for raw RPC. Always typed-as-unknown; use only when there's no typed wrapper.

```ts
const data = await host.call<MySchema>('some.future.method', { foo: 'bar' })
```

## Error handling

Every method throws `HippoRpcError` (a subclass of `Error`) with a `code` property:

```ts
try {
  await host.api.notes.create({ content: 'hi' })
} catch (err) {
  if (err.code === 'PERMISSION_DENIED') {
    // user didn't grant data:notes:write — prompt them or hide the action
  } else if (err.code === 'BAD_INPUT') {
    // schema validation failed — fix your call
  } else if (err.code === 'TIMEOUT') {
    // 15s timeout — host or network issue
  } else {
    // QUOTA_EXCEEDED, NOT_FOUND, INTERNAL, ...
  }
}
```

Codes you might see: `PERMISSION_DENIED`, `BAD_INPUT`, `NOT_FOUND`, `QUOTA_EXCEEDED`, `UNKNOWN_METHOD`, `TIMEOUT`, `INTERNAL`.

## Helper: `readHostQuery()`

```ts
import { readHostQuery } from '@hippo/plugin-sdk'

const { page, widget, action, payload } = readHostQuery()
// page:    "main" | "stats" | null     (when rendered as a sidebar page)
// widget:  "today" | null              (when rendered as a widget)
// action:  "save-as-habit" | null      (when rendered as an action surface)
// payload: <json-decoded action payload> | null
```

Use this once at startup to decide what to render.

## React hooks (planned)

```ts
import { useHostContext, useHippoQuery } from '@hippo/plugin-sdk/react'

function NotesList() {
  const ctx = useHostContext()
  const { data, error, isLoading } = useHippoQuery('notes.list', { limit: 5 })
  // ...
}
```

Not yet shipped. The plain `host` object works in any framework today.
