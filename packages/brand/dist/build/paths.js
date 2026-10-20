import path from "node:path";
import { pathToFileURL } from "node:url";
/** A directory as a file URL ending in `/`, so relative URLs resolve inside it. */
export function directoryUrl(dir) {
    if (dir instanceof URL) {
        return dir.href.endsWith("/") ? dir : new URL(`${dir.href}/`);
    }
    const resolved = path.resolve(dir);
    return pathToFileURL(resolved.endsWith(path.sep) ? resolved : resolved + path.sep);
}
