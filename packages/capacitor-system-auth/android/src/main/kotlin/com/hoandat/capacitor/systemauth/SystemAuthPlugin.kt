package com.hoandat.capacitor.systemauth

import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import androidx.activity.result.ActivityResultLauncher
import androidx.browser.auth.AuthTabIntent
import androidx.browser.customtabs.CustomTabsClient
import androidx.browser.customtabs.CustomTabsIntent
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import java.lang.ref.WeakReference

/*
 * Opens an authorization URL in the system browser and returns the callback URL.
 * PKCE, state and the code exchange stay in the app's JS.
 *
 * Auth Tab when the default browser supports it (result comes back through an
 * activity result); otherwise a Custom Tab, with the redirect arriving through
 * RedirectActivity (custom scheme) or the app's App Links activity (https), and
 * a return to the app without a redirect meaning the user cancelled.
 * Every state change runs on the main thread.
 */
@CapacitorPlugin(name = "SystemAuth")
class SystemAuthPlugin : Plugin() {

    private sealed interface Callback {
        fun matches(uri: Uri): Boolean

        data class Scheme(val scheme: String) : Callback {
            override fun matches(uri: Uri) = uri.scheme.equals(scheme, ignoreCase = true)
        }

        data class Https(val host: String, val path: String) : Callback {
            override fun matches(uri: Uri) =
                uri.scheme == "https" && uri.host.equals(host, ignoreCase = true) && uri.path == path
        }
    }

    private class Pending(val call: PluginCall, val callback: Callback, val viaCustomTabs: Boolean) {
        /** Set once the app is paused behind the Custom Tab; the next resume without a redirect is a cancel. */
        var leftApp = false
    }

    private var pending: Pending? = null
    private var authTabLauncher: ActivityResultLauncher<Intent>? = null

    override fun load() {
        active = WeakReference(this)
        // Must be registered before the activity is STARTED; plugins load in BridgeActivity.onCreate.
        authTabLauncher = try {
            AuthTabIntent.registerActivityResultLauncher(activity) { result -> onAuthTabResult(result) }
        } catch (e: IllegalStateException) {
            null // Too late to register: Custom Tabs only.
        }
    }

    @PluginMethod
    fun isAvailable(call: PluginCall) {
        // Auth Tab verifies https redirects with Digital Asset Links; the fallback uses App Links (API 23+).
        call.resolve(JSObject().put("https", true))
    }

    @PluginMethod
    fun authenticate(call: PluginCall) {
        val url = call.getString("url")?.let(Uri::parse)
        val urlScheme = url?.scheme?.lowercase()
        if (url == null || (urlScheme != "https" && urlScheme != "http") || url.host.isNullOrEmpty()) {
            call.reject("`url` must be an absolute http(s) URL", FAILED)
            return
        }
        val callback = try {
            parseCallback(call.getObject("callback"))
        } catch (e: IllegalArgumentException) {
            call.reject(e.message ?: "Invalid `callback`", FAILED)
            return
        }
        val preferEphemeral = call.getBoolean("preferEphemeral", false) ?: false
        activity.runOnUiThread { start(call, url, callback, preferEphemeral) }
    }

    private fun start(call: PluginCall, url: Uri, callback: Callback, preferEphemeral: Boolean) {
        if (pending != null) {
            call.reject("An authentication session is already in progress", FAILED)
            return
        }
        val browser = CustomTabsClient.getPackageName(context, emptyList())
        val ephemeral = preferEphemeral && browser != null &&
            CustomTabsClient.isEphemeralBrowsingSupported(context, browser)
        val launcher = authTabLauncher
        try {
            if (launcher != null && browser != null && CustomTabsClient.isAuthTabSupported(context, browser)) {
                pending = Pending(call, callback, viaCustomTabs = false)
                val intent = AuthTabIntent.Builder().setEphemeralBrowsingEnabled(ephemeral).build()
                intent.intent.setPackage(browser)
                when (callback) {
                    is Callback.Scheme -> intent.launch(launcher, url, callback.scheme)
                    is Callback.Https -> intent.launch(launcher, url, callback.host, callback.path)
                }
            } else {
                pending = Pending(call, callback, viaCustomTabs = true)
                val intent = CustomTabsIntent.Builder().setEphemeralBrowsingEnabled(ephemeral).build()
                // No Custom Tabs browser: launchUrl falls back to a plain ACTION_VIEW.
                browser?.let { intent.intent.setPackage(it) }
                intent.launchUrl(activity, url)
            }
        } catch (e: ActivityNotFoundException) {
            pending = null
            call.reject("No browser can open the sign-in page", FAILED, e)
        }
    }

    private fun onAuthTabResult(result: AuthTabIntent.AuthResult) {
        val current = pending?.takeIf { !it.viaCustomTabs } ?: return
        pending = null
        val uri = result.resultUri
        when (result.resultCode) {
            AuthTabIntent.RESULT_OK ->
                if (uri != null) {
                    current.call.resolve(JSObject().put("url", uri.toString()))
                } else {
                    current.call.reject("The browser returned no URL", FAILED)
                }
            AuthTabIntent.RESULT_CANCELED -> current.call.reject("The user closed the sign-in page", CANCELLED)
            AuthTabIntent.RESULT_VERIFICATION_FAILED ->
                current.call.reject("The https callback failed Digital Asset Links verification", FAILED)
            AuthTabIntent.RESULT_VERIFICATION_TIMED_OUT ->
                current.call.reject("Digital Asset Links verification timed out", FAILED)
            else -> current.call.reject("Unexpected Auth Tab result ${result.resultCode}", FAILED)
        }
    }

    /** Resolves the pending call when [uri] is its callback. Main thread. */
    private fun consumeRedirect(uri: Uri): Boolean {
        val current = pending?.takeIf { it.callback.matches(uri) } ?: return false
        pending = null
        current.call.resolve(JSObject().put("url", uri.toString()))
        return true
    }

    // A BridgeActivity forwards new intents to plugins, so an App Link on MainActivity needs no app code.
    override fun handleOnNewIntent(intent: Intent) {
        handleRedirect(intent)
    }

    override fun handleOnPause() {
        pending?.takeIf { it.viaCustomTabs }?.leftApp = true
    }

    override fun handleOnResume() {
        val current = pending?.takeIf { it.viaCustomTabs && it.leftApp } ?: return
        pending = null
        current.call.reject("The user closed the sign-in page", CANCELLED)
    }

    override fun handleOnDestroy() {
        pending?.let { it.call.reject("The app was closed during sign-in", FAILED) }
        pending = null
        if (active?.get() === this) active = null
    }

    private fun parseCallback(callback: JSObject?): Callback {
        requireNotNull(callback) { "`callback` is required" }
        callback.getString("scheme")?.let { scheme ->
            require(SCHEME.matches(scheme) && scheme.lowercase() !in setOf("http", "https")) {
                "`callback.scheme` must be a custom URL scheme"
            }
            return Callback.Scheme(scheme)
        }
        callback.getJSObject("https")?.let { https ->
            val host = https.getString("host")
            val path = https.getString("path")
            if (host.isNullOrEmpty() || host.contains('/') || path == null || !path.startsWith("/")) {
                throw IllegalArgumentException("`callback.https` needs a `host` and a `path` starting with /")
            }
            return Callback.Https(host, path)
        }
        throw IllegalArgumentException("`callback` must have `scheme` or `https`")
    }

    companion object {
        private const val CANCELLED = "CANCELLED"
        private const val FAILED = "FAILED"

        /** RFC 3986 scheme: ALPHA *( ALPHA / DIGIT / "+" / "-" / "." ). */
        private val SCHEME = Regex("^[A-Za-z][A-Za-z0-9+.-]*$")

        @Volatile
        private var active: WeakReference<SystemAuthPlugin>? = null

        /**
         * Hands a redirect to the plugin; call it on the main thread from an activity
         * that receives the https App Link and is not the Capacitor BridgeActivity.
         * Returns true when the intent was the callback of the pending sign-in.
         */
        @JvmStatic
        fun handleRedirect(intent: Intent?): Boolean {
            val uri = intent?.takeIf { it.action == Intent.ACTION_VIEW }?.data ?: return false
            return active?.get()?.consumeRedirect(uri) ?: false
        }
    }
}
