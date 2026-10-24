# @achoo254/app-switcher

The app switcher of the *-next products: a 9-dot button that opens a list of the other apps the same account
signs in to, then the account page. One sign-in at the IdP covers every app, so a click lands the user in the
other app without signing in again.

- **Static catalog** (`APP_SWITCHER_CATALOG`): Chat, Scribe, Localman, Tunelo, then the account page
  (`auth.<domain>/account`), every host under the one root domain the app passes. Miu World is never listed
  (its players are children). Labels and one-line descriptions in `en`, `vi`
  and `zh-CN`. `locale` takes any BCP 47 tag, matched by language and case-insensitively (`vi-VN` -> `vi`,
  `zh` or `zh-*` -> `zh-CN`); any other language falls back to English.
- **`appSwitcherLinks(options)`**: the list as plain data (no React, no DOM).
- **`<AppSwitcher/>`**: the button and its popover, in React 19.

Nothing is fetched and no image is loaded: the icons are inline SVG and the styles ship as a stylesheet the
app bundles, so it works under Scribe's CSP (`default-src 'self'`, no inline styles either). No Tailwind or
Radix dependency.

## Install

```sh
npm install @achoo254/app-switcher @achoo254/brand react
```

Peer dependencies: `react` 19 and `@achoo254/brand` 0.3 or later 0.x (host names come from its `hostsFor`, so
the domain is checked by the same rule as the brand config).

pnpm 11 refuses versions published less than 24 hours ago (`minimumReleaseAge`, 1440 minutes by default). To
install a release on its first day, list that exact version in `pnpm-workspace.yaml`:

```yaml
minimumReleaseAgeExclude:
  - "@achoo254/app-switcher@0.2.0"
```

## Usage

```tsx
import "@achoo254/app-switcher/app-switcher.css";
import { AppSwitcher } from "@achoo254/app-switcher";

<AppSwitcher
	current="localman" // this app: left out of the list, sent as utm_source
	domain="hoandat.com" // the apps' root domain, no port or path
	locale="vi-VN" // any BCP 47 tag: vi*, zh*, else English
	placement="bottom-end" // or "right-end" beside a side rail (Chat)
	onOpen={native ? openInSystemBrowser : undefined}
/>;
```

Every link is `https://<host>/<path>?utm_source=<current>&utm_medium=app_switcher`. Without `onOpen` it is a
plain `<a href>` the browser follows, with `target="_blank" rel="noopener"` when the page runs as an installed
PWA (`display-mode: standalone`) so the other app does not load inside this app's window; with `onOpen` the
click is cancelled and the URL handed to it (native shells open the system browser). A `domain` that is not a lowercase registrable domain (for instance
`localhost:5173` in development) renders nothing and logs the error with `console.error`; the rest of the app
keeps working.

Plain data, for a custom layout or a test:

```ts
import { appSwitcherLinks } from "@achoo254/app-switcher";

appSwitcherLinks({
	current: "chat",
	domain: "hoandat.com",
	locale: "en",
});
// [{ id: "scribe", label: "Scribe", description: "...", href: "https://scribe.hoandat.com/?utm_source=chat&utm_medium=app_switcher" },
//  ..., { id: "account", label: "Manage your account", href: "https://auth.hoandat.com/account?..." }]
```

It throws when `current` is not a catalog app or `domain` is not a root domain.

## Keyboard and screen readers

- The button has an accessible name ("Switch app" in the app's locale), `aria-haspopup="dialog"`,
  `aria-expanded` and `aria-controls`.
- The list is a non-modal `<dialog>` named "Apps". Opening it moves focus to the first link; Tab and
  Shift+Tab cycle inside it.
- Esc closes it and puts focus back on the button. A press outside closes it without moving focus. Following a
  link closes it; a link handed to `onOpen` also puts focus back on the button.

## Theming

The stylesheet uses classes prefixed `sn-app-switcher` and reads these CSS variables; the fallbacks are system
colours (`Canvas`, `CanvasText`, `GrayText`, `Highlight`), never a brand colour. Map them to the app's tokens on
`.sn-app-switcher` or any ancestor:

| Variable | Used for | Fallback |
|---|---|---|
| `--app-switcher-button-size` | button width and height | `2.25rem` |
| `--app-switcher-button-radius` | button corners | `9999px` |
| `--app-switcher-button-text` | dots colour | `currentColor` |
| `--app-switcher-hover` | button and link hover | `currentColor` at 10% |
| `--app-switcher-focus-ring` | focus outline | `Highlight` |
| `--app-switcher-surface` | panel background | `Canvas` |
| `--app-switcher-text` | panel text | `CanvasText` |
| `--app-switcher-muted` | descriptions | `GrayText` |
| `--app-switcher-border` | panel border, divider before the account page | `CanvasText` at 15% |
| `--app-switcher-shadow` | panel shadow | soft `CanvasText` shadow |
| `--app-switcher-radius`, `--app-switcher-item-radius` | panel and link corners | `0.75rem`, `0.5rem` |
| `--app-switcher-width` | panel width | `18rem` |
| `--app-switcher-z-index` | panel stacking | `50` |
| `--app-switcher-font` | panel font family | `inherit` |
| `--app-switcher-label-size`, `--app-switcher-description-size` | text sizes | `0.875rem`, `0.8125rem` |
| `--app-switcher-icon`, `--app-switcher-icon-stroke` | app icon colour and stroke width | `currentColor`, `1.75` |

`className` adds a class to the root for the app's own layout (for example hiding the button on a narrow rail).

## Changing the catalog

Edit `src/catalog.ts` (and the icon in `src/icons.tsx`), keep it in line with auth-next's
`src/app-directory/apps-catalog.ts`, run the gates in the repository README, commit `src` and `dist` together and
release a new version (repository README, "Phát hành").
