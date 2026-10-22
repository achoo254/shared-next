import { WebPlugin } from "@capacitor/core";
import type { AuthenticateOptions, AuthenticateResult, AvailabilityResult, SystemAuthPlugin } from "./definitions.js";
/** Web apps use their normal redirect flow; there is no system browser session to open. */
export declare class SystemAuthWeb extends WebPlugin implements SystemAuthPlugin {
    authenticate(_options: AuthenticateOptions): Promise<AuthenticateResult>;
    isAvailable(): Promise<AvailabilityResult>;
}
