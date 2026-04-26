---
sidebar_position: 5
title: Dashboard widgets
---

# Dashboard widgets

Widgets are small cards on the user's home dashboard. Each one is its own `<PluginFrame>` instance — sandboxed identically to a full page, just smaller.

## Declare it

```json
{
  "permissions": ["ui:widget", "data:notes:read"],
  "ui": {
    "widgets": [
      {
        "id": "today",
        "title": { "tr": "Bugün", "en": "Today" },
        "defaultSize": "2x2",
        "minSize": "1x1"
      }
    ]
  }
}
```

You need `ui:widget` to register any widget. Other permissions cover whatever data you read inside.

## Sizing

The dashboard grid is **6 columns wide on desktop**, **2 columns on mobile**, with each cell at roughly 160px square. Sizes are written as `<cols>x<rows>`:

| Size | Pixel target (desktop) | Use for |
| --- | --- | --- |
| `1x1` | ~160×160 | Single number, gauge, status pill |
| `2x1` | ~340×160 | Single line chart, day-summary row |
| `2x2` | ~340×340 | List of 5–8 items, calendar mini |
| `3x2` | ~520×340 | Bar chart with axes, week heatmap |
| `4x3` | ~700×520 | Two-column dashboard area |

`defaultSize` is what new installs get. `minSize` is a hard lower bound — the user can't shrink below it. Pick `minSize` based on the smallest size your content remains usable at.

The user can drag and resize; layout is persisted per-installation in `PluginInstallation.widgetLayout` and survives reload.

## Detecting widget mode

The host loads your bundle with `?widget=<id>`. Your bundle should branch on this:

```ts
import { connectToHost, readHostQuery } from '@hippo/plugin-sdk'

const { widget } = readHostQuery()
const host = await connectToHost()

if (widget === 'today') {
  renderTodayWidget(host)
} else {
  renderFullPage(host)
}
```

Same bundle, two render paths. The widget render should be **fast and read-only by default** — users see widgets at a glance and don't expect heavy interaction.

## Resize handling

The host doesn't tell you the current widget size — listen to `window.resize` if you need to react:

```ts
const ro = new ResizeObserver(() => relayout())
ro.observe(document.body)
```

For most widgets a CSS-only responsive layout (flexbox, container queries) is enough.

## Widget UX guidelines

- **No scroll.** If your data exceeds the widget, truncate and link to the full page (`host.ui.navigateTo({ page: 'main' })`).
- **No modals or popovers** that escape the widget bounds — they get clipped by the grid.
- **Skeleton on load.** The first paint should happen within ~150ms; render a skeleton from cached `host.storage.kv.get` and update when the live RPC returns.
- **One title, one body.** Don't put a header bar with controls; the host already shows the widget title.

## Removing a widget

If you delete a widget id in a new manifest version, the host quietly drops it from layouts on next install/update. Existing pinned positions for the removed widget are cleaned up automatically.
