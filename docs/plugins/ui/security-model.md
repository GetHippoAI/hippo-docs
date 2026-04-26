---
sidebar_position: 9
title: Security model
---

# Security model

What stops a malicious plugin from doing damage. Every choice below exists for a reason; don't try to work around them.

## Threat model

A plugin bundle is third-party code running inside the Hippo dashboard. We assume:

- The bundle may be **compromised by a supply-chain attack** at any time (a published version was clean, an update is malicious).
- The bundle may be **buggy** (XSS in user-supplied data, leaking sensitive UI state).
- A plugin developer may try to **escalate privileges** or **read other users' data**.

Hippo defends against all three.

## Layer 1 — origin isolation

Plugins are served from a separate subdomain (`plugins.hippo.la`), not from the dashboard origin. The iframe is loaded with:

```html
<iframe sandbox="allow-scripts" src="https://<slug>-<installId>.plugins.hippo.la/v/<version>/">
```

Note what's missing: **`allow-same-origin`**. Without it, the browser treats the iframe's effective origin as `null`. That means the bundle:

- **Cannot read** `document.cookie` of the dashboard origin (or its own; it has no cookie scope).
- **Cannot read** `localStorage` or `sessionStorage` of the dashboard.
- **Cannot access** `window.parent.document`, `window.top`, or any DOM outside its iframe.
- **Cannot send** authenticated requests to `*.gethippo.ai` (cookies don't attach without same-origin).

Each `installationId` lives on its own subdomain (`hello-world-ebce8cad-....plugins.hippo.la`) so two users with the same plugin still don't share an origin — preventing one user's `localStorage` from leaking to another.

## Layer 2 — no tokens in the iframe

The iframe never receives or sees the user's JWT. Every host call:

1. Plugin: `host.api.notes.list({...})` → `MessagePort.postMessage({ id, kind:"rpc", method, input })`.
2. Host frame: receives over the port, calls `apiClient.plugins.rpc({ installationId, method, input })`.
3. Host frame's axios: attaches `Authorization: Bearer <jwt>` from `localStorage`.
4. Backend: validates JWT → resolves user → checks the user owns the installation → checks the granted permissions → executes.
5. Result flows back up the same chain, plain JSON, no tokens.

Even if a plugin pulled `parent.location` (it can't — origin null), there's no token there to extract. The token never crosses the iframe boundary.

## Layer 3 — MessageChannel handshake

The host's init message includes a transferable `MessagePort`. The plugin holds one end; the host holds the other. From that point on, all RPC flows through the port — never `window.postMessage`.

This defeats origin spoofing. An attacker can't open a new window, post fake messages with `targetOrigin: "*"`, and trick the host into running a method on its behalf — there's no global listener for the attacker to reach. The port pair is private to the two frames that hold it.

## Layer 4 — permissions enforced server-side

The frontend permission UI is decoration. The truth is:

```sql
-- granted_permissions[] is a String[] column on plugin_installations.
SELECT granted_permissions
  FROM plugin_installations
 WHERE id = $1 AND user_id = $2 AND enabled = true;
```

The RPC gateway looks up the installation, checks the requested method's `requiredPermission`, and denies anything not in `granted_permissions`. **You cannot bypass this from the iframe.** Tampering with the consent UI in your bundle does nothing.

## Layer 5 — Content Security Policy

Plugin asset responses include:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval';
  style-src  'self' 'unsafe-inline';
  img-src    'self' data: https:;
  font-src   'self' data:;
  connect-src 'self';
  frame-ancestors 'self' https://*.gethippo.ai https://*.hippo.la
```

Important consequences:

- `connect-src 'self'` — your plugin **cannot fetch anything off your own subdomain**. No third-party CDNs, no analytics, no callbacks to your own server. If you need data from outside Hippo, request it via a host RPC method (Sprint 2: scoped outbound proxy with domain allowlist).
- `frame-ancestors` — only the Hippo dashboard can embed your bundle. A malicious site can't embed your plugin in a clickjacking attack.
- `script-src 'unsafe-inline'` is allowed for now to keep single-file bundles ergonomic. The sandbox + origin isolation make it acceptable; this may tighten later.

## Layer 6 — bundle integrity

When you submit, the host stores the SHA-256 hash and size of your bundle. The version's URL embeds the version number, and the asset is served with `Cache-Control: public, max-age=31536000, immutable` — once published, a given URL always returns the exact same bytes.

If you publish version `0.2.0`, version `0.1.0` is unaffected. Users pinned to `0.1.0` keep loading `0.1.0` until they (or auto-update) move to `0.2.0`.

## Layer 7 — audit log

Every RPC call writes a row to `plugin_audit_logs` with `(installation_id, plugin_id, user_id, method, permission, status, error_code, latency_ms, created_at)`. Forensics is possible: if a plugin is later found to have done something bad, we can see exactly which calls it made for which user.

## What plugins still can't do

- **Read other users' data.** All data methods are scoped by `userId` at the SQL level.
- **Read another plugin's data.** Storage is keyed by `installationId`. Two plugins on the same user have disjoint KV stores.
- **Read the dashboard DOM.** Sandbox + null origin block this.
- **Steal the user's session.** Tokens never enter the iframe.
- **Persistently install themselves.** Bundles are pinned to a version; users (or auto-update with consent) opt into upgrades.

## What plugins **can** still do (and you should design for)

- **Render arbitrary HTML.** Including socially-engineered phishing UI ("Hippo wants you to log in again..."). The user has installed your plugin and trusts it; if you abuse that, the audit log catches you and your plugin is delisted, but in the moment the user can be fooled.
- **Use 100% of their permissions in unusual ways.** A plugin with `data:notes:read` can list and exfiltrate every note silently if it's allowed any outbound network — which it is not by default in Sprint 1 (`connect-src 'self'`), but Sprint 2's scoped outbound proxy needs careful permission UX.

If you're a plugin author: design for least privilege. If you're a Hippo user: review what you install. If you're an admin: review submitted bundles before approving — diff the new version against the last published one.

## Reporting a vulnerability

If you find a way around any of the above, email `security@hippo.la`. Please don't open a public issue. We acknowledge within 48 hours and credit you in the changelog if you'd like.
