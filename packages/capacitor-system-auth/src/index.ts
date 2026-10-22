import { registerPlugin } from "@capacitor/core";
import type { SystemAuthPlugin } from "./definitions.js";

export type {
	AuthenticateOptions,
	AuthenticateResult,
	AvailabilityResult,
	SystemAuthCallback,
	SystemAuthErrorCode,
	SystemAuthPlugin,
} from "./definitions.js";

export const SystemAuth = registerPlugin<SystemAuthPlugin>("SystemAuth", {
	web: () => import("./web.js").then((m) => new m.SystemAuthWeb()),
});
