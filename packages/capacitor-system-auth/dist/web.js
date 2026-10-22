import { WebPlugin } from "@capacitor/core";
/** Web apps use their normal redirect flow; there is no system browser session to open. */
export class SystemAuthWeb extends WebPlugin {
    async authenticate(_options) {
        throw Object.assign(new Error("SystemAuth is only available in the native app"), { code: "UNSUPPORTED" });
    }
    async isAvailable() {
        return { https: false };
    }
}
