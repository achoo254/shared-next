# @achoo254/capacitor-system-auth

Capacitor 8 plugin that opens an authorization URL in the **system browser session** and returns the callback
URL. The *-next apps use it to sign in, never in a WebView (Google rejects WebView OAuth with
`disallowed_useragent`).

- iOS: `ASWebAuthenticationSession`.
- Android: **Auth Tab** (`androidx.browser`) when the default browser supports it, otherwise a **Custom Tab**.
- Web: rejects with `UNSUPPORTED`; web apps use their normal redirect flow.

The plugin only runs the browser part. PKCE, `state`/`nonce` checks and the code exchange stay in the app's JS.

## Install

Not published to npm: install it as a git dependency on a release tag of this repository,
as the repository README describes ("Cách dùng trong một sản phẩm"), then run `npx cap sync`.

The Capacitor CLI names the Swift package after the package name: `Achoo254CapacitorSystemAuth` (`Package.swift`
must keep that name). The package ships built JS (`dist/`) plus the native
sources the Capacitor CLI links: `Package.swift` + `ios/Sources` (Swift Package Manager) and the Gradle module
in `android/`. Requires `@capacitor/core` 8.

## Usage

```ts
import { SystemAuth } from "@achoo254/capacitor-system-auth";

// Custom scheme (Scribe, Chat): redirect_uri = com.hoandat.chat:/auth/callback
const { url } = await SystemAuth.authenticate({
	url: authorizationUrl, // built by the app: client_id, redirect_uri, code_challenge, state, ...
	callback: { scheme: "com.hoandat.chat" },
});

// Verified https link (Localman): redirect_uri = https://localman.hoandat.com/m/auth/callback
const { https } = await SystemAuth.isAvailable(); // false on iOS < 17.4 and on web
if (https) {
	const { url } = await SystemAuth.authenticate({
		url: authorizationUrl,
		callback: {
			https: { host: "localman.hoandat.com", path: "/m/auth/callback" },
		},
	});
}

// Then, in the app: parse `url`, check `state`, handle `error`, exchange `code` with the PKCE verifier.
```

`preferEphemeral: true` asks for a private session that shares no cookies with the browser (default `false`, so
a user already signed in at the IdP taps once). On Android it applies only when the browser supports ephemeral
browsing.

Rejections carry a `code`:

| Code | When |
|---|---|
| `CANCELLED` | The user closed the sheet / tab, or came back to the app without finishing. |
| `UNSUPPORTED` | Web, or an https callback on iOS < 17.4. |
| `FAILED` | Invalid options, a session already in progress, no browser, Digital Asset Links verification failed. |

```ts
try {
	await SystemAuth.authenticate(options);
} catch (error) {
	const code = (error as { code?: string }).code; // "CANCELLED" | "UNSUPPORTED" | "FAILED"
}
```

## App setup

### iOS (minimum iOS 15, as Capacitor 8)

- **Custom scheme:** nothing to configure; the session catches the redirect itself.
- **https callback (iOS 17.4+):** the app needs the Associated Domains entitlement `webcredentials:<host>`
  (e.g. `webcredentials:localman.hoandat.com`) and the host serves
  `https://<host>/.well-known/apple-app-site-association` with
  `{ "webcredentials": { "apps": ["<TEAM_ID>.<bundle id>"] } }`. Keep a fallback for older iOS (check
  `isAvailable()`), for example a custom-scheme redirect.

### Android

1. **Always** set the redirect scheme placeholder in `android/app/build.gradle`. The plugin's manifest uses it,
   so the build fails without it, even for an https-only app (then use the app's own scheme, e.g.
   `com.hoandat.localman`):

   ```groovy
   android {
       defaultConfig {
           manifestPlaceholders += [systemAuthRedirectScheme: "com.hoandat.chat"]
       }
   }
   ```

   The plugin's `RedirectActivity` receives that scheme when a Custom Tab is used. Do not declare the same
   scheme in another intent filter of the app, or Android shows a chooser.
2. **https callback:**
   - Auth Tab verifies the redirect with Digital Asset Links: the host serves
     `https://<host>/.well-known/assetlinks.json` granting `delegate_permission/common.handle_all_urls` to the
     app's package and signing certificate (SHA-256).
   - The Custom Tab fallback receives the redirect as an App Link: the app declares an
     `android:autoVerify="true"` intent filter for `https://<host><path>`. On `MainActivity` (a Capacitor
     `BridgeActivity`, `launchMode="singleTask"` as in the Capacitor template) nothing else is needed, the
     plugin reads the new intent. On any other activity, forward it on the main thread:

     ```kotlin
     override fun onNewIntent(intent: Intent) {
         super.onNewIntent(intent)
         if (SystemAuthPlugin.handleRedirect(intent)) return // com.hoandat.capacitor.systemauth
         // ... the app's own deep links
     }
     ```

     `@capacitor/app` also emits `appUrlOpen` for that URL; the app's deep-link handler ignores the callback path.
3. `androidx.browser` 1.9.0 or later (Auth Tab). The module uses `rootProject.ext.androidxBrowserVersion` when the
   app defines it, else 1.10.0.

How the Android flow ends: Auth Tab returns its result directly (closing it is `CANCELLED`). With a Custom Tab,
the redirect arrives through `RedirectActivity` or the App Link, and returning to the app without a redirect is
`CANCELLED`. If Android kills the app while the browser is open, the pending call is lost; the user signs in
again.

## Development

```sh
pnpm --filter @achoo254/capacitor-system-auth typecheck
pnpm --filter @achoo254/capacitor-system-auth test
pnpm --filter @achoo254/capacitor-system-auth build      # tsc -> dist/ (commit it)
pnpm --filter @achoo254/capacitor-system-auth verify:ios # xcodebuild for the iOS Simulator (needs Xcode)
```

The Android module has no Gradle wrapper of its own; it compiles inside the consuming app
(`npx cap sync android`, then the app's Gradle build).

Native naming the Capacitor CLI depends on:

- SPM package and product are `Achoo254CapacitorSystemAuth`, the name the CLI derives from the package name.
- `SystemAuthPlugin.swift` must stay the only Swift file with an `@objc(...)` class name; the CLI registers the
  first one of each file.
- The Android plugin class is `com.hoandat.capacitor.systemauth.SystemAuthPlugin` (JS name `SystemAuth`).
