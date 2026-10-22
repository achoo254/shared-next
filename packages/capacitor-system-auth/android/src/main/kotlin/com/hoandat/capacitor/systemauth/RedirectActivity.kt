package com.hoandat.capacitor.systemauth

import android.app.Activity
import android.content.Intent
import android.os.Bundle

/**
 * Target of the custom-scheme redirect when the browser has no Auth Tab.
 * Hands the URL to the plugin, then brings the app back to the front, which
 * also closes the Custom Tab sitting above it.
 */
class RedirectActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        SystemAuthPlugin.handleRedirect(intent)
        packageManager.getLaunchIntentForPackage(packageName)?.let { launch ->
            launch.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
            startActivity(launch)
        }
        finish()
    }
}
