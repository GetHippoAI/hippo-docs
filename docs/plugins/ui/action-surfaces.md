---
sidebar_position: 6
title: Action surfaces
---

# Action surfaces

Action surfaces let you inject menu items into Hippo's existing screens — a "Save as habit" entry on a note's context menu, a "Mark as expense" item on a finance row, a custom command in Cmd-K. The user invokes your action; the host launches your bundle with the relevant payload.

## Declare it

```json
{
  "permissions": ["data:notes:read", "data:tasks:write"],
  "ui": {
    "actions": [
      {
        "id": "save-as-habit",
        "surface": "note.context-menu",
        "label": { "tr": "Alışkanlık olarak kaydet", "en": "Save as habit" },
        "mode": "modal"
      }
    ]
  }
}
```

Each action entry needs an `id` (unique within your manifest), a `surface` (the host-defined slot it plugs into), a localized `label`, and a `mode`.

## Available surfaces

| Surface | Anchor in host UI | Payload sent to your iframe |
| --- | --- | --- |
| `note.context-menu` | Note "..." / right-click menu | `{ noteId, title, content }` |
| `finance.row-action` | Trailing button on a transaction row | `{ transactionId, amount, currency, description, occurredAt }` |
| `global.command` | Cmd-K command palette entry | `{ query }` (current palette text) |

More surfaces will land over time. Submitting an action with an unknown `surface` value fails manifest validation.

## Modes

### `modal`

The host opens your bundle inside a modal overlay (max-width 640px, scrollable body) with:

```
?action=<id>&payload=<json-encoded payload>
```

Read it like this:

```ts
import { readHostQuery, connectToHost } from '@hippo/plugin-sdk'

const { action, payload } = readHostQuery()
const host = await connectToHost()

// payload is already JSON.parsed
console.log(action, payload.noteId)
```

When you're done, call:

```ts
await host.ui.dismiss({ result: 'saved' })  // closes the modal
```

If the user clicks outside or hits Esc, the modal closes without calling your code; treat that as "cancelled".

### `background`

The bundle runs invisibly. Useful for one-shot operations where there's nothing to display:

```ts
const host = await connectToHost()
const { payload } = readHostQuery()
await host.api.tasks.create({ title: `Track: ${payload.title}` })
await host.ui.toast({ kind: 'success', message: 'Created habit' })
await host.ui.dismiss()
```

The host hard-kills the iframe 30 seconds after launch. If you need more time, switch to `mode: "modal"` so the user stays oriented.

## Permission scoping

The required permissions for an action are whatever your handler calls. The action declaration itself doesn't grant anything — it just registers the menu item. If the user installs your plugin without `data:tasks:write` (because consent was partial), the action still appears but every `host.api.tasks.create` call returns `403 PERMISSION_DENIED`. To avoid showing actions you can't fulfill, request the relevant permissions up front and explain why in your description.

## Where actions render

Actions are filtered by surface and shown only on screens that emit that surface. Users don't see a global list of "everything plugins added"; surfaces are pull-based — Hippo's note UI asks "any plugins want to add to this menu?" and the host returns the matching action items.

## Localizing the label

`label` is a `Record<string, string>` keyed by BCP-47 tag, same fallback chain as `ui.pages[].title`:

```jsonc
"label": {
  "tr": "Alışkanlık olarak kaydet",
  "en": "Save as habit",
  "de": "Als Gewohnheit speichern"
}
```

Add at least `tr` and `en`. The host falls back to `en` if the user's locale isn't in the map.
