import { registerPlugin } from "@capacitor/core";
export const SystemAuth = registerPlugin("SystemAuth", {
    web: () => import("./web.js").then((m) => new m.SystemAuthWeb()),
});
