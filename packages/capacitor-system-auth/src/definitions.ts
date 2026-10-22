/** Where the authorization server sends the browser back to the app. */
export type SystemAuthCallback =
	/** Custom URL scheme (RFC 8252 §7.1), e.g. `com.hoandat.chat` for `com.hoandat.chat:/auth/callback`. */
	| { scheme: string }
	/**
	 * Verified https link (iOS Universal Link with `webcredentials`, Android App Link),
	 * e.g. `{ host: "localman.hoandat.com", path: "/m/auth/callback" }`.
	 */
	| { https: { host: string; path: string } };

export interface AuthenticateOptions {
	/** Authorization URL (http or https) opened in the system browser session. */
	url: string;
	callback: SystemAuthCallback;
	/**
	 * Ask for a private browser session that shares no cookies with the
	 * browser. Default `false`, so a user already signed in at the IdP taps once.
	 */
	preferEphemeral?: boolean;
}

export interface AuthenticateResult {
	/** Full callback URL, query and fragment included. */
	url: string;
}

export interface AvailabilityResult {
	/** Whether `callback: { https }` works on this device. */
	https: boolean;
}

/**
 * `code` of a rejected call:
 * - `CANCELLED`: the user closed the browser before the callback.
 * - `UNSUPPORTED`: not possible here (web, or an https callback on iOS < 17.4).
 * - `FAILED`: anything else (invalid options, no browser, link verification failed).
 */
export type SystemAuthErrorCode = "CANCELLED" | "UNSUPPORTED" | "FAILED";

export interface SystemAuthPlugin {
	/** Opens `url` and resolves with the callback URL. PKCE and `state` checks stay with the caller. */
	authenticate(options: AuthenticateOptions): Promise<AuthenticateResult>;
	isAvailable(): Promise<AvailabilityResult>;
}
