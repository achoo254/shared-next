/**
 * Drawing SVGs into PNGs is injected: a product passes the Chromium it
 * already installs for its e2e tests (`playwright` or `@playwright/test`),
 * so this package depends on neither and needs no image library.
 */
export interface RenderRequest {
    /** Brand-root-relative path of the SVG, for error messages. */
    readonly path: string;
    /** The SVG file's bytes. */
    readonly svg: Uint8Array;
    /** Width and height of the PNG, in pixels. */
    readonly size: number;
}
/** Returns one PNG per request, in order, with a transparent background. */
export type IconRenderer = (requests: readonly RenderRequest[]) => Promise<readonly Uint8Array[]>;
/** The part of Playwright's Page the renderer uses. */
export interface ChromiumPage {
    setViewportSize(size: {
        width: number;
        height: number;
    }): Promise<void>;
    setContent(html: string): Promise<void>;
    locator(selector: string): {
        waitFor(): Promise<void>;
    };
    waitForFunction(expression: string): Promise<unknown>;
    evaluate(expression: string): Promise<unknown>;
    screenshot(options: {
        omitBackground: boolean;
        clip: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
    }): Promise<Uint8Array>;
}
/** The part of Playwright's `chromium` (a BrowserType) the renderer uses. */
export interface ChromiumLauncher {
    launch(): Promise<{
        newPage(options: {
            deviceScaleFactor: number;
        }): Promise<ChromiumPage>;
        close(): Promise<void>;
    }>;
}
/**
 * A renderer drawing each SVG as an <img> in one Chromium page:
 *
 *   import { chromium } from "playwright"; // or "@playwright/test"
 *   const renderer = chromiumRenderer(chromium);
 */
export declare function chromiumRenderer(chromium: ChromiumLauncher): IconRenderer;
