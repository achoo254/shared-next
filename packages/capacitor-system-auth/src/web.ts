import { WebPlugin } from "@capacitor/core";
import type {
	AuthenticateOptions,
	AuthenticateResult,
	AvailabilityResult,
	SystemAuthErrorCode,
	SystemAuthPlugin,
} from "./definitions.js";

/** Web apps use their normal redirect flow; there is no system browser session to open. */
export class SystemAuthWeb extends WebPlugin implements SystemAuthPlugin {
	async authenticate(
		_options: AuthenticateOptions,
	): Promise<AuthenticateResult> {
		throw Object.assign(
			new Error("SystemAuth is only available in the native app"),
			{ code: "UNSUPPORTED" satisfies SystemAuthErrorCode },
		);
	}

	async isAvailable(): Promise<AvailabilityResult> {
		return { https: false };
	}
}
