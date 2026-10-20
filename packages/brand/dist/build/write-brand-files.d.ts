import type { BrandConfig } from "../types.js";
import { type GenerateManifestsOptions, type JsonIndent } from "./manifests.js";
import type { IconRenderer } from "./rasterize.js";
export interface WriteBrandFilesOptions {
    readonly brand: BrandConfig;
    /** Directory the brand config's icon paths are relative to. */
    readonly root: string | URL;
    /** Where the manifests go; the icons go to its icons/. */
    readonly generatedDir: string | URL;
    readonly manifests: GenerateManifestsOptions;
    /** JSON indentation of the generated files; default 2 spaces. */
    readonly indent?: JsonIndent;
    /**
     * Draws the PNG/ICO icons from the brand SVGs. Leave it out when the
     * product ships pre-rendered icons: then only manifests are written.
     */
    readonly renderer?: IconRenderer;
}
/**
 * Writes what the platforms derive from the brand: the platform manifests,
 * and with a renderer the PNG icons, favicon.ico and icons-source.json.
 * Everything is generated (and drawn) in memory first, so a failing
 * renderer leaves the directory as it was. Returns the written paths,
 * relative to `generatedDir`.
 */
export declare function writeBrandFiles(options: WriteBrandFilesOptions): Promise<string[]>;
